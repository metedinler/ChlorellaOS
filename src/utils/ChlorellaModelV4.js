// ChlorellaModelV4.js - TAM KAPSAMLI HESAPLAMA MODELİ
// Tüm alt modellerin entegrasyonu

import { WaterChemistry } from '../models/waterChemistry.js';
import { NutrientChemistry } from '../models/nutrientChemistry.js';
import { RiskModel, CRIModel } from '../models/riskModel.js';
import { LightModel } from '../models/lightModel.js';
import { GasTransferModel } from '../models/gasTransferModel.js';
import { LearningEngine } from '../models/learningEngine.js';
import { solveRK4, solveRKF45 } from '../models/odeSolver.js';

export class ChlorellaModelV4 {
  constructor(config = {}) {
    // Konfigürasyon
    this.tankVolume = config.tankVolume || 1.0; // L
    this.tankDepth = config.tankDepth || 10; // cm
    this.dt = config.dt || 0.1; // Zaman adımı (h)
    
    // Alt modeller
    this.waterChem = new WaterChemistry(this.tankVolume);
    this.nutrientChem = new NutrientChemistry(this.tankVolume);
    this.riskModel = new RiskModel();
    this.criModel = new CRIModel(this.riskModel);
    this.lightModel = new LightModel();
    this.gasModel = new GasTransferModel();
    this.learningEngine = new LearningEngine();
    
    // Sistem durumu
    this.state = {
      // Biyolojik
      biomass: 0.1,          // g/L (kuru ağırlık)
      cellDensity: 1e6,      // cells/mL
      
      // Çevresel
      temperature: 25,        // °C
      lightIntensity: 5000,  // lux
      aeration: 0.5,         // vvm
      
      // Zamansal
      time: 0,               // h
      hourOfDay: 12,         // 0-24
      cultureDays: 0,        // gün
      
      // Diğer
      cleaningFrequency: 14, // gün
      shearRate: 100,        // s^-1
      temp_change: 0,        // °C/h
      OD_discrepancy: 0      // OD uyumsuzluğu
    };
    
    // Geçmiş (son 100 kayıt)
    this.history = [];
    this.maxHistorySize = 100;
    
    // Simülasyon kontrolü
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * Sistemi başlat (initial conditions)
   */
  initialize(initialState = {}) {
    // Durum güncelle
    Object.assign(this.state, initialState);
    
    // Su kimyası başlat
    if (initialState.pH) this.waterChem.pH = initialState.pH;
    if (initialState.alkalinity) this.waterChem.alkalinity = initialState.alkalinity;
    if (initialState.TDS) this.waterChem.TDS = initialState.TDS;
    if (initialState.TAN) this.waterChem.TAN = initialState.TAN;
    
    // Besin kimyası başlat
    if (initialState.NO3) this.nutrientChem.NO3 = initialState.NO3;
    if (initialState.PO4) this.nutrientChem.PO4 = initialState.PO4;
    if (initialState.Fe) this.nutrientChem.Fe = initialState.Fe;
    
    // Geçmişi temizle
    this.history = [];
    
    // İlk kaydı ekle
    this.recordState();
  }

  /**
   * ODE sistemi: dx/dt = f(x, t)
   */
  deriv(state_vector, t) {
    // State vector: [biomass, NO3, PO4, O2, CO2, ...]
    const [biomass, NO3, PO4, O2, CO2] = state_vector;
    
    // Mevcut durumu güncelle
    const currentState = {
      ...this.state,
      biomass,
      NO3,
      PO4,
      O2_current: O2,
      CO2_current: CO2
    };
    
    // Besin limitasyonları
    const nutrientLimits = this.nutrientChem.calculateNutrientLimitations();
    const f_nutrient = nutrientLimits.overall;
    
    // Işık limitasyonu
    const PAR = this.lightModel.convertLuxToPAR(currentState.lightIntensity);
    const avgLight = this.lightModel.calculateAverageLight(PAR, biomass, this.tankDepth, 'red');
    const f_light = this.lightModel.calculateLightLimitation(avgLight.avgLight);
    
    // Büyüme hızı (Monod kinetik)
    const mu_max = this.learningEngine.params.mu_max;
    const k_d = this.learningEngine.params.k_d;
    const mu_net = mu_max * Math.min(f_nutrient, f_light) - k_d;
    
    // dX/dt = μ_net * X
    const dX_dt = mu_net * biomass;
    
    // Besin tüketimi
    const uptake = this.nutrientChem.uptakeNutrients(dX_dt * this.dt, this.waterChem);
    const dNO3_dt = -uptake.NO3_consumed / this.dt;
    const dPO4_dt = -uptake.PO4_consumed / this.dt;
    
    // O2/CO2 dengesi
    const O2_balance = this.gasModel.calculateO2Balance(currentState);
    const CO2_balance = this.gasModel.calculateCO2Balance(currentState);
    
    const dO2_dt = O2_balance.dO2_dt;
    const dCO2_dt = CO2_balance.dCO2_dt;
    
    return [dX_dt, dNO3_dt, dPO4_dt, dO2_dt, dCO2_dt];
  }

  /**
   * Tek simülasyon adımı
   */
  step(dt = this.dt) {
    // Mevcut state vector
    const stateVector = [
      this.state.biomass,
      this.nutrientChem.NO3,
      this.nutrientChem.PO4,
      this.state.O2_current || 8.0,
      this.state.CO2_current || 10.0
    ];
    
    // ODE çözücü (RK4)
    const newStateVector = solveRK4(
      stateVector,
      this.state.time,
      dt,
      (y, t) => this.deriv(y, t)
    );
    
    // Durumu güncelle
    this.state.biomass = Math.max(0, newStateVector[0]);
    this.nutrientChem.NO3 = Math.max(0, newStateVector[1]);
    this.nutrientChem.PO4 = Math.max(0, newStateVector[2]);
    this.state.O2_current = Math.max(0, newStateVector[3]);
    this.state.CO2_current = Math.max(0, newStateVector[4]);
    
    // Zaman güncelle
    this.state.time += dt;
    this.state.hourOfDay = (this.state.hourOfDay + dt) % 24;
    this.state.cultureDays = this.state.time / 24;
    
    // Hücre sayısı tahmini (1 g/L ≈ 5e7 cells/mL)
    this.state.cellDensity = this.state.biomass * 5e7;
    
    // Su kimyası güncelle (NH3/NH4 dengesi)
    this.waterChem.calculateNH3NH4(this.waterChem.TAN, this.state.temperature);
    
    // Geçmişe kaydet
    this.recordState();
  }

  /**
   * Simülasyon döngüsü (belirli süre)
   */
  async simulate(duration_h, callback = null) {
    this.isRunning = true;
    const steps = Math.ceil(duration_h / this.dt);
    
    for (let i = 0; i < steps; i++) {
      if (!this.isRunning || this.isPaused) break;
      
      // Adım
      this.step(this.dt);
      
      // Callback (ilerleme raporu)
      if (callback && i % 10 === 0) {
        callback({
          progress: (i / steps) * 100,
          state: this.getSnapshot()
        });
      }
      
      // Asenkron (UI responsive kalsın)
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    this.isRunning = false;
    return this.getSnapshot();
  }

  /**
   * Risk değerlendirmesi
   */
  assessRisks() {
    // Su kimyası durumu
    const waterStatus = this.waterChem.getStatus();
    
    // Risk hesaplama için tam state
    const riskState = {
      ...this.state,
      NH3: this.waterChem.NH3,
      pH: this.waterChem.pH,
      NO3: this.nutrientChem.NO3,
      PO4: this.nutrientChem.PO4,
      Cu: this.nutrientChem.Cu,
      Zn: this.nutrientChem.Zn,
      EC: this.waterChem.TDS * 0.5, // TDS → EC dönüşümü
      TDS: this.waterChem.TDS,
      depth: this.tankDepth,
      OD750: this.state.biomass * 0.5 // Yaklaşık OD
    };
    
    // Tüm riskleri hesapla
    const risks = this.riskModel.calculateAllRisks(riskState);
    
    // CRI (Composite Risk Index)
    const CRI = this.criModel.calculateCRI(risks);
    const riskLevel = this.criModel.getRiskLevel(CRI);
    
    return {
      risks,
      CRI,
      level: riskLevel
    };
  }

  /**
   * Model kalibrasyon (gerçek verilerle)
   */
  calibrate(observations) {
    const result = this.learningEngine.optimizeParameters(observations, 'biomass');
    
    return {
      success: result.convergence,
      newParams: result.newParams,
      error: result.error
    };
  }

  /**
   * Online öğrenme (yeni ölçüm geldiğinde)
   */
  updateWithMeasurement(measurement) {
    // Learning engine güncelle
    this.learningEngine.onlineUpdate(measurement, 'biomass');
    
    // Sistem durumunu güncelle
    if (measurement.biomass !== undefined) {
      this.state.biomass = measurement.biomass;
    }
    
    if (measurement.NO3 !== undefined) {
      this.nutrientChem.NO3 = measurement.NO3;
    }
    
    if (measurement.pH !== undefined) {
      this.waterChem.pH = measurement.pH;
    }
    
    // Risk yeniden değerlendir
    const riskAssessment = this.assessRisks();
    
    return {
      updated: true,
      risks: riskAssessment
    };
  }

  /**
   * Durum kaydı (geçmiş)
   */
  recordState() {
    const snapshot = this.getSnapshot();
    
    this.history.push(snapshot);
    
    // Geçmiş boyutu kontrolü
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Anlık durum snapshot
   */
  getSnapshot() {
    const waterStatus = this.waterChem.getStatus();
    const nutrientStatus = this.nutrientChem.getStatus();
    const riskAssessment = this.assessRisks();
    const gasStatus = this.gasModel.getStatus(this.state);
    
    return {
      time: this.state.time,
      hourOfDay: this.state.hourOfDay,
      cultureDays: this.state.cultureDays,
      
      biology: {
        biomass: this.state.biomass,
        cellDensity: this.state.cellDensity,
        growthRate: this.calculateInstantaneousGrowthRate()
      },
      
      water: waterStatus,
      nutrients: nutrientStatus,
      gas: gasStatus,
      risks: riskAssessment,
      
      environment: {
        temperature: this.state.temperature,
        lightIntensity: this.state.lightIntensity,
        aeration: this.state.aeration
      },
      
      model: {
        params: this.learningEngine.params,
        convergence: this.learningEngine.checkConvergence()
      }
    };
  }

  /**
   * Anlık büyüme hızı
   */
  calculateInstantaneousGrowthRate() {
    if (this.history.length < 2) return 0;
    
    const current = this.history[this.history.length - 1];
    const previous = this.history[this.history.length - 2];
    
    const dt = current.time - previous.time;
    if (dt === 0) return 0;
    
    const mu = (Math.log(current.biology.biomass) - Math.log(previous.biology.biomass)) / dt;
    
    return mu;
  }

  /**
   * Model performans raporu
   */
  getPerformanceReport() {
    if (this.history.length < 10) {
      return {
        status: 'INSUFFICIENT_DATA',
        message: 'En az 10 ölçüm gerekli'
      };
    }
    
    const observations = this.history.map(h => ({
      biomass: h.biology.biomass,
      NO3: h.nutrients.NO3,
      PO4: h.nutrients.PO4,
      time: h.time
    }));
    
    return this.learningEngine.getPerformanceReport(observations, 'biomass');
  }

  /**
   * Sistemi durdur
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Sistemi duraklat/devam ettir
   */
  togglePause() {
    this.isPaused = !this.isPaused;
  }

  /**
   * Sistemi sıfırla
   */
  reset() {
    this.state = {
      biomass: 0.1,
      cellDensity: 1e6,
      temperature: 25,
      lightIntensity: 5000,
      aeration: 0.5,
      time: 0,
      hourOfDay: 12,
      cultureDays: 0,
      cleaningFrequency: 14,
      shearRate: 100,
      temp_change: 0,
      OD_discrepancy: 0
    };
    
    this.waterChem = new WaterChemistry(this.tankVolume);
    this.nutrientChem = new NutrientChemistry(this.tankVolume);
    this.learningEngine.reset();
    this.history = [];
  }

  /**
   * Export/Import (JSON)
   */
  export() {
    return {
      config: {
        tankVolume: this.tankVolume,
        tankDepth: this.tankDepth,
        dt: this.dt
      },
      state: this.state,
      waterChem: {
        pH: this.waterChem.pH,
        alkalinity: this.waterChem.alkalinity,
        TDS: this.waterChem.TDS,
        TAN: this.waterChem.TAN
      },
      nutrientChem: {
        NO3: this.nutrientChem.NO3,
        PO4: this.nutrientChem.PO4,
        Fe: this.nutrientChem.Fe
      },
      learningEngine: {
        params: this.learningEngine.params
      },
      history: this.history
    };
  }

  import(data) {
    // Konfigürasyon
    if (data.config) {
      this.tankVolume = data.config.tankVolume;
      this.tankDepth = data.config.tankDepth;
      this.dt = data.config.dt;
    }
    
    // Durum
    if (data.state) {
      this.state = data.state;
    }
    
    // Su kimyası
    if (data.waterChem) {
      this.waterChem.pH = data.waterChem.pH;
      this.waterChem.alkalinity = data.waterChem.alkalinity;
      this.waterChem.TDS = data.waterChem.TDS;
      this.waterChem.TAN = data.waterChem.TAN;
    }
    
    // Besin kimyası
    if (data.nutrientChem) {
      this.nutrientChem.NO3 = data.nutrientChem.NO3;
      this.nutrientChem.PO4 = data.nutrientChem.PO4;
      this.nutrientChem.Fe = data.nutrientChem.Fe;
    }
    
    // Learning engine
    if (data.learningEngine) {
      this.learningEngine.params = data.learningEngine.params;
    }
    
    // Geçmiş
    if (data.history) {
      this.history = data.history;
    }
  }
}

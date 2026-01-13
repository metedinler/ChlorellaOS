/**
 * ModelManager - Singleton Pattern
 * 
 * Tüm tank simülasyonlarını merkezden yöneten singleton servis.
 * Her tank için ayrı model state tutar, localStorage ile persist eder.
 * 
 * Özellikler:
 * - Tek bir ChlorellaGrowthModel instance (memory optimizasyonu)
 * - Tank bazlı state yönetimi (tankId → state mapping)
 * - Besin ortamından otomatik stokiyometri hesabı
 * - Gerçek ölçümlerle model kalibrasyonu (LearningEngine)
 * - localStorage persistence (tank_${id}.json formatında)
 * - Risk izleme ve CRI hesaplama
 * - Cross-tank learning
 */

import { MEDIA_DATABASE } from '../data/mediaDatabase.js';
import learningEngine from './LearningEngine.js';

class ModelManager {
  constructor() {
    if (ModelManager.instance) {
      return ModelManager.instance;
    }

    // Tank states: tankId → state object
    this.tankStates = new Map();
    
    // Active simulations tracking
    this.activeSimulations = new Set();
    
    // Shared parameters (will be updated by LearningEngine later)
    this.sharedParams = {
      μmax: 0.09,           // Maksimum spesifik büyüme hızı (h⁻¹)
      Ks_N: 5.0,            // Yarı doyum sabiti - Azot (mg/L)
      Ks_P: 0.5,            // Yarı doyum sabiti - Fosfor (mg/L)
      Ks_CO2: 2.0,          // Yarı doyum sabiti - CO₂ (mg/L)
      Y_N: 0.07,            // Verim katsayısı - Azot (g biomass/g N)
      Y_P: 0.50,            // Verim katsayısı - Fosfor (g biomass/g P)
      Y_CO2: 1.83,          // Verim katsayısı - CO₂ (g biomass/g CO₂)
      K_light: 150.0,       // Yarı doyum sabiti - Işık (μmol/m²/s)
      T_opt: 28.0,          // Optimal sıcaklık (°C)
      pH_opt: 7.2,          // Optimal pH
      sigma_T: 5.0,         // Sıcaklık toleransı (°C)
      sigma_pH: 0.8         // pH toleransı
    };

    // Model instance (shared across all tanks)
    this.modelInstance = null;

    // 🎓 Event Listener: Gerçek veri girişlerini yakala
    this.setupEventListeners();

    ModelManager.instance = this;
  }

  /**
   * 🎓 Event listener kurulumu - Gerçek veri girişlerini yakala
   */
  setupEventListeners() {
    // CellCountingV2 ve TankDetails'den gelen veri güncellemelerini dinle
    window.addEventListener('tankDataUpdate', async (event) => {
      const { tankId, type, data } = event.detail;
      
      console.log(`📡 Gerçek veri alındı - Tank: ${tankId}, Tip: ${type}`, data);

      // Hücre sayımı verisi
      if (type === 'cellCount') {
        await this.assimilateRealData(tankId, {
          biomass: data.biomass,
          day: data.day,
          viability: data.viability
        });
      }

      // Su kalitesi parametreleri
      if (type === 'qualityParam') {
        await this.assimilateRealData(tankId, {
          pH: data.ph,
          temperature: data.temp,
          DO: data.do
        });
      }

      // Besin seviyesi ölçümü
      if (type === 'nutrientMeasurement') {
        await this.assimilateRealData(tankId, {
          N: data.N,
          P: data.P
        });
      }
    });

    console.log('🎓 ModelManager event listeners aktif');
  }

  /**
   * Tank aktivasyonu - Besin ortamından stokiyometri hesaplayıp tank state oluşturur
   */
  registerTank(tankId, activationParams) {
    const {
      formulationId,
      volume,            // Litre
      initialBiomass,    // g/L
      temperature,       // °C
      pH,
      lightIntensity,    // μmol/m²/s
      activationDate
    } = activationParams;

    // Besin ortamı bilgilerini al
    let media = MEDIA_DATABASE[formulationId];
    
    // Eğer MEDIA_DATABASE'de yoksa, localStorage'dan custom formülasyonu çek
    if (!media && formulationId) {
      const customFormulations = JSON.parse(localStorage.getItem('customFormulations') || '[]');
      const customFormulation = customFormulations.find(f => f.id === formulationId);
      
      if (customFormulation) {
        // Custom formülasyonu MEDIA_DATABASE formatına çevir
        media = {
          name: customFormulation.name,
          type: 'custom',
          description: customFormulation.description || 'Özel formülasyon',
          stocks: customFormulation.stocks || []
        };
      }
    }
    
    if (!media) {
      throw new Error(`Besin ortamı bulunamadı: ${formulationId}. Lütfen geçerli bir besin ortamı seçin.`);
    }

    // Stokiyometri hesabı
    const nutrients = this.calculateNutrientsFromFormulation(media, volume);

    // 🧪 STOK DÜŞÜRME: Besin yeri hazırlama maliyetini hesapla ve stoktan düş
    try {
      const recommendationEngine = window.recommendationEngine;
      if (recommendationEngine && media.stocks && media.stocks.length > 0) {
        const deductions = recommendationEngine.deductMediaPreparation(media, volume);
        console.log('🧪 Besin yeri hazırlama maliyeti:', deductions);
      }
    } catch (error) {
      console.warn('⚠️ Stok düşürme hatası (devam ediliyor):', error);
    }

    // Tank state oluştur
    const tankState = {
      tankId,
      formulationId,
      activationDate,
      
      // Sistem parametreleri
      volume,
      temperature,
      pH,
      lightIntensity,
      
      // Biyokütle ve besin elementleri
      currentBiomass: initialBiomass,  // g/L
      currentN: nutrients.N,            // mg/L
      currentP: nutrients.P,            // mg/L
      currentCO2: 2.0,                  // mg/L (atmosferden dengeli)
      currentTAN: nutrients.TAN,        // mg/L (Total Ammonia Nitrogen)
      currentNO3: nutrients.NO3,        // mg/L
      currentO2: 8.0,                   // mg/L (başlangıç değeri)
      
      // Su kimyası
      alkalinity: nutrients.alkalinity || 50.0,  // mg/L as CaCO₃
      EC: nutrients.EC || 64.0,                  // μS/cm
      
      // Simülasyon zamanı
      currentDay: 0,
      currentHour: 0,
      
      // Risk tracking
      riskHistory: [],
      CRIHistory: [0],
      
      // Ölçüm verileri (gerçek lab ölçümleri)
      measurements: [],
      
      // Müdahale kayıtları
      interventions: [],
      
      // Model durumu
      lastSimulationTime: Date.now(),
      isActive: true
    };

    // Map'e kaydet
    this.tankStates.set(tankId, tankState);

    // localStorage'a persist et
    this.saveTankState(tankId);

    console.log(`✅ Tank ${tankId} aktivasyonu tamamlandı:`, {
      formulation: media.name,
      nutrients: {
        N: nutrients.N.toFixed(1),
        P: nutrients.P.toFixed(2),
        TAN: nutrients.TAN.toFixed(1),
        NO3: nutrients.NO3.toFixed(1)
      },
      initialBiomass: initialBiomass.toFixed(3)
    });

    return tankState;
  }

  /**
   * Besin ortamından stokiyometrik hesaplama
   * 
   * Her kimyasal bileşenin elementel katkısını hesaplar:
   * - Azot (N): NaNO₃, KNO₃, NH₄NO₃, (NH₄)₂SO₄, Ca(NO₃)₂ vb.
   * - Fosfor (P): K₂HPO₄, KH₂PO₄, NaH₂PO₄ vb.
   * - Potasyum (K), Magnezyum (Mg), Kalsiyum (Ca), vb.
   */
  calculateNutrientsFromFormulation(media, volumeL) {
    const composition = media.composition;
    
    if (!composition || !composition.hasFullStoichiometry) {
      console.warn(`⚠️ ${media.name} için tam stokiyometri yok, varsayılan değerler kullanılıyor`);
      return {
        N: 100.0,   // mg/L
        P: 10.0,    // mg/L
        TAN: 0.0,   // mg/L
        NO3: 100.0, // mg/L
        alkalinity: 50.0,
        EC: 64.0
      };
    }

    const macros = composition.macronutrients;
    
    let totalN = 0;
    let totalP = 0;
    let totalTAN = 0;  // NH₃ + NH₄⁺
    let totalNO3 = 0;
    
    // Azot kaynakları
    if (macros['NaNO3']) {
      totalN += macros['NaNO3'].provides;
      totalNO3 += macros['NaNO3'].provides;
    }
    if (macros['KNO3']) {
      totalN += macros['KNO3'].provides;
      totalNO3 += macros['KNO3'].provides;
    }
    if (macros['Ca(NO3)2·4H2O']) {
      totalN += macros['Ca(NO3)2·4H2O'].provides;
      totalNO3 += macros['Ca(NO3)2·4H2O'].provides;
    }
    if (macros['NH4NO3']) {
      const compound = macros['NH4NO3'];
      totalN += compound.provides;
      totalNO3 += compound.provides * 0.5;  // NO₃ kısmı
      totalTAN += compound.provides * 0.5;  // NH₄ kısmı
    }
    if (macros['(NH4)2SO4']) {
      totalN += macros['(NH4)2SO4'].provides;
      totalTAN += macros['(NH4)2SO4'].provides;
    }

    // Fosfor kaynakları
    if (macros['K2HPO4']) {
      totalP += macros['K2HPO4'].provides;
    }
    if (macros['KH2PO4']) {
      totalP += macros['KH2PO4'].provides;
    }
    if (macros['NaH2PO4']) {
      totalP += macros['NaH2PO4'].provides;
    }
    if (macros['Na2HPO4·7H2O']) {
      totalP += macros['Na2HPO4·7H2O'].provides;
    }

    // Alkalinity ve EC tahmini
    const alkalinity = composition.alkalinity || 50.0;
    const EC = composition.EC || 64.0;

    return {
      N: totalN,
      P: totalP,
      TAN: totalTAN,
      NO3: totalNO3,
      alkalinity,
      EC
    };
  }

  /**
   * 1 saatlik simülasyon çalıştır (Background Worker tarafından çağrılacak)
   */
  async simulateOneHour(tankId) {
    const state = this.tankStates.get(tankId);
    
    if (!state || !state.isActive) {
      console.warn(`Tank ${tankId} aktif değil, simülasyon atlanıyor`);
      return null;
    }

    // Dinamik import (lazy loading)
    if (!this.ChlorellaGrowthModel) {
      const module = await import('../utils/ChlorellaModel.js');
      this.ChlorellaGrowthModel = module.default;
    }

    // Model instance oluştur veya mevcut state'i yükle
    let model = state.model;
    
    if (!model) {
      // İlk çalıştırma: yeni model oluştur
      const modelParams = {
        ...this.sharedParams,
        initialBiomass: state.currentBiomass,
        initialN: state.currentN,
        initialP: state.currentP,
        initialCO2: state.currentCO2,
        temperature: state.temperature,
        pH: state.pH,
        lightIntensity: state.lightIntensity,
        volume: state.volume
      };
      
      model = new this.ChlorellaGrowthModel(modelParams);
      state.model = model; // Cache model instance
    }

    // 🕐 1 SAAT simülasyon (simulateOneHour metodunu kullan)
    model.simulateOneHour();

    // Tank state güncelle
    state.currentBiomass = model.currentBiomass;
    state.currentN = model.currentN;
    state.currentP = model.currentP;
    state.currentCO2 = model.currentCO2;
    state.currentO2 = model.currentO2 || 8.0;
    state.currentDay = model.currentDay;
    state.currentHour = model.currentHour;

    // Risk analizi
    const risks = model.assessRisks();
    const CRI = model.getComprehensiveRiskIndex();

    state.riskHistory.push({
      timestamp: Date.now(),
      day: state.currentDay,
      hour: state.currentHour,
      risks,
      CRI
    });

    state.CRIHistory.push(CRI);

    // Keep last 7 days of risk history
    if (state.riskHistory.length > 168) { // 7 * 24
      state.riskHistory = state.riskHistory.slice(-168);
      state.CRIHistory = state.CRIHistory.slice(-168);
    }

    state.lastSimulationTime = Date.now();

    // localStorage'a kaydet
    this.saveTankState(tankId);

    console.log(`🔄 Tank ${tankId} - Gün ${state.currentDay} Saat ${state.currentHour}: Biomass=${state.currentBiomass.toFixed(3)} g/L, CRI=${(CRI * 100).toFixed(1)}%`);

    return {
      tankId,
      day: state.currentDay,
      hour: state.currentHour,
      biomass: state.currentBiomass,
      CRI,
      risks
    };
  }

  /**
   * 🔮 24 saat öngörü (non-destructive forecasting)
   */
  async forecastNext24Hours(tankId) {
    const state = this.tankStates.get(tankId);
    
    if (!state || !state.isActive) {
      console.warn(`Tank ${tankId} aktif değil, öngörü atlanıyor`);
      return null;
    }

    // Dinamik import
    if (!this.ChlorellaGrowthModel) {
      const module = await import('../utils/ChlorellaModel.js');
      this.ChlorellaGrowthModel = module.default;
    }

    // Mevcut modeli klonla (orijinal state'i korumak için)
    const model = state.model;
    
    if (!model) {
      console.warn(`Tank ${tankId} model instance yok, öngörü yapılamıyor`);
      return null;
    }

    const clonedModel = model.clone();

    const forecast = [];
    let firstCO2Warning = null;
    let firstNWarning = null;
    let firstPWarning = null;

    // 24 saat simüle et
    for (let hour = 1; hour <= 24; hour++) {
      clonedModel.simulateOneHour();

      const risks = clonedModel.assessRisks();
      const cri = clonedModel.getComprehensiveRiskIndex();

      // Kritik eşik tespiti
      const N_critical = clonedModel.currentN < 5.0;
      const P_critical = clonedModel.currentP < 1.0;
      const CO2_critical = clonedModel.currentCO2 < 2.0;
      const pH_unstable = Math.abs(clonedModel.pH - 7.2) > 0.5;

      // İlk uyarı zamanlarını kaydet
      if (CO2_critical && !firstCO2Warning) {
        firstCO2Warning = hour;
      }
      if (N_critical && !firstNWarning) {
        firstNWarning = hour;
      }
      if (P_critical && !firstPWarning) {
        firstPWarning = hour;
      }

      forecast.push({
        hour,
        day: clonedModel.currentDay,
        biomass: parseFloat(clonedModel.currentBiomass.toFixed(3)),
        N: parseFloat(clonedModel.currentN.toFixed(2)),
        P: parseFloat(clonedModel.currentP.toFixed(2)),
        CO2: parseFloat(clonedModel.currentCO2.toFixed(2)),
        pH: parseFloat(clonedModel.pH.toFixed(2)),
        O2: parseFloat((clonedModel.currentO2 || 8.0).toFixed(2)),
        CRI: parseFloat((cri * 100).toFixed(1)),
        N_critical,
        P_critical,
        CO2_critical,
        pH_unstable
      });
    }

    // Uyarı mesajları oluştur
    const warnings = {
      CO2: firstCO2Warning ? `⚠️ CO2 ${firstCO2Warning} saat sonra kritik seviyeye düşecek` : null,
      N: firstNWarning ? `⚠️ Azot ${firstNWarning} saat sonra kritik seviyeye düşecek` : null,
      P: firstPWarning ? `⚠️ Fosfor ${firstPWarning} saat sonra kritik seviyeye düşecek` : null
    };

    console.log(`🔮 Tank ${tankId} - 24 saat öngörüsü tamamlandı`, warnings);

    return {
      tankId,
      startDay: state.currentDay,
      startHour: state.currentHour,
      forecast,
      warnings
    };
  }

  /**
   * Backward compatibility: simulateHour() calls simulateOneHour()
   */
  async simulateHour(tankId) {
    return this.simulateOneHour(tankId);
  }

  /**
   * Gerçek ölçüm ekle (lab verisi)
   */
  addMeasurement(tankId, measurement) {
    const state = this.tankStates.get(tankId);
    
    if (!state) {
      throw new Error(`Tank ${tankId} bulunamadı`);
    }

    const measurementRecord = {
      timestamp: Date.now(),
      date: measurement.date,
      type: measurement.type, // 'daily' | 'weekly' | 'manual'
      
      // Ölçüm verileri
      pH: measurement.pH,
      temperature: measurement.temperature,
      OD750: measurement.OD750,
      cellDensity: measurement.cellDensity, // Thoma sayımı
      
      // Opsiyonel (haftalık ölçümler)
      alkalinity: measurement.alkalinity,
      TAN: measurement.TAN,
      NO3: measurement.NO3,
      NO2: measurement.NO2,
      DO: measurement.DO,
      
      // Notlar
      notes: measurement.notes
    };

    state.measurements.push(measurementRecord);

    // 🧠 LearningEngine ile model kalibrasyonu
    if (measurement.cellDensity && state.currentBiomass) {
      // OD750'den biyokütle tahmini (1.5 g/L per OD birim)
      const estimatedBiomass = measurement.OD750 * 1.5;
      
      // Model tahmini ile gerçek ölçüm arasındaki farkı hesapla
      const theoreticalBiomass = state.currentBiomass;
      const actualBiomass = estimatedBiomass;

      // Parametreleri güncelle
      const updatedParams = learningEngine.updateGrowthParameters(
        theoreticalBiomass,
        actualBiomass,
        this.sharedParams
      );

      // Güncellenmiş parametreleri kaydet
      this.sharedParams = updatedParams;

      console.log(`🧠 Model parametreleri güncellendi (Tank ${tankId})`);
      
      // LearningEngine'e tank verisini kaydet (cross-tank learning için)
      learningEngine.registerTankData(tankId, {
        biomass: actualBiomass,
        pH: measurement.pH,
        temperature: measurement.temperature,
        day: state.currentDay
      });
    }

    this.saveTankState(tankId);

    console.log(`📊 Tank ${tankId} ölçüm eklendi:`, {
      date: measurement.date,
      pH: measurement.pH,
      OD750: measurement.OD750,
      cellDensity: measurement.cellDensity
    });
  }

  /**
   * 🧠 Gerçek veri ile model öğrenmesi (unified method)
   * TankDetails, FedBatch, vs. tüm veri girişlerinden çağrılır
   */
  async assimilateRealData(tankId, realData) {
    const state = this.tankStates.get(tankId);
    
    if (!state) {
      console.warn(`Tank ${tankId} bulunamadı`);
      return null;
    }

    console.log(`🧠 Tank ${tankId} - Gerçek veri asimilasyonu başlıyor...`, realData);

    const result = {
      tankId,
      timestamp: Date.now(),
      learningApplied: false,
      parameterUpdates: null,
      fedbatchAnalysis: null,
      recommendations: []
    };

    // 1. BIYOKÜTLE ÖĞRENMESI
    if (realData.biomass || realData.OD750) {
      const actualBiomass = realData.biomass || (realData.OD750 * 1.5);
      const theoreticalBiomass = state.currentBiomass;
      
      const errorPercent = ((actualBiomass - theoreticalBiomass) / theoreticalBiomass) * 100;
      
      console.log(`📊 Biomass karşılaştırma:`, {
        theoretical: theoreticalBiomass.toFixed(3),
        actual: actualBiomass.toFixed(3),
        error: `${errorPercent.toFixed(1)}%`
      });

      // %10'dan fazla hata varsa parametreleri güncelle
      if (Math.abs(errorPercent) > 10) {
        const updatedParams = learningEngine.updateGrowthParameters(
          theoreticalBiomass,
          actualBiomass,
          this.sharedParams
        );

        this.sharedParams = updatedParams;
        result.learningApplied = true;
        result.parameterUpdates = {
          μmax_old: this.sharedParams.μmax,
          μmax_new: updatedParams.μmax,
          errorPercent
        };

        console.log(`✅ Parametreler güncellendi:`, {
          μmax: `${this.sharedParams.μmax.toFixed(4)} → ${updatedParams.μmax.toFixed(4)}`
        });

        result.recommendations.push(
          `✅ Model ${Math.abs(errorPercent).toFixed(1)}% hata ile yeniden kalibre edildi`
        );
      } else {
        result.recommendations.push(
          `✓ Model doğruluk içinde (${Math.abs(errorPercent).toFixed(1)}% hata)`
        );
      }

      // State'i gerçek değere senkronize et
      state.currentBiomass = actualBiomass;
    }

    // 2. BESIN ELEMENTLERİ SENKRONIZASYONU
    if (realData.N !== undefined) {
      state.currentN = realData.N;
      console.log(`🔄 Azot senkronize edildi: ${realData.N.toFixed(1)} mg/L`);
    }
    
    if (realData.P !== undefined) {
      state.currentP = realData.P;
      console.log(`🔄 Fosfor senkronize edildi: ${realData.P.toFixed(1)} mg/L`);
    }

    // 3. FED-BATCH ANALİZİ
    if (realData.fedbatch) {
      result.fedbatchAnalysis = await this.analyzeStockAddition(
        tankId, 
        realData.fedbatch
      );
    }

    // 4. pH ÖĞRENMESİ
    if (realData.pH) {
      const pHDrift = realData.pH - state.pH;
      
      if (Math.abs(pHDrift) > 0.5) {
        result.recommendations.push(
          `⚠️ pH sapması tespit edildi: ${pHDrift > 0 ? '+' : ''}${pHDrift.toFixed(2)}`
        );
      }
      
      state.pH = realData.pH;
    }

    // 5. 24 SAAT ÖNGÖRÜsÜ (güncellenmiş parametrelerle)
    if (result.learningApplied) {
      const forecast = await this.forecastNext24Hours(tankId);
      result.forecast = forecast;
      
      if (forecast && forecast.warnings) {
        Object.values(forecast.warnings).forEach(warning => {
          if (warning) result.recommendations.push(warning);
        });
      }
    }

    // State kaydet
    this.saveTankState(tankId);

    console.log(`🎓 Öğrenme sonucu:`, result);

    return result;
  }

  /**
   * 💉 Fed-Batch stok çözelti analizi ve öneri sistemi
   */
  async analyzeStockAddition(tankId, fedbatch) {
    const state = this.tankStates.get(tankId);
    
    if (!state) {
      console.warn(`Tank ${tankId} bulunamadı`);
      return null;
    }

    console.log(`💉 Fed-Batch analizi başlıyor...`, fedbatch);

    // Eklenen besin miktarını hesapla
    const concentration = fedbatch.concentration || 100; // mg/ml varsayılan
    const amountAdded_mg = fedbatch.amount_ml * concentration;
    const nutrientType = fedbatch.nutrient; // 'N' | 'P' | 'Mg' | 'Fe'

    // Saatlik tüketim oranını hesapla
    const model = state.model;
    
    if (!model) {
      console.warn(`Tank ${tankId} model instance yok`);
      return null;
    }

    // Growth rate'ten tüketim oranını hesapla
    const { μ } = model.calculateGrowthRate();
    const μ_hourly = μ / 24;
    const biomassGrowthRate = μ_hourly * state.currentBiomass; // g/L/hour

    let hourlyConsumption = 0;
    let currentLevel = 0;
    let criticalLevel = 0;

    if (nutrientType === 'N') {
      hourlyConsumption = biomassGrowthRate / model.Y_N; // mg/L/hour
      currentLevel = state.currentN;
      criticalLevel = 5.0;
    } else if (nutrientType === 'P') {
      hourlyConsumption = biomassGrowthRate / model.Y_P;
      currentLevel = state.currentP;
      criticalLevel = 1.0;
    } else {
      // Diğer elementler için genel yaklaşım
      hourlyConsumption = biomassGrowthRate * 0.01; // %1 biomass için
      criticalLevel = 1.0;
    }

    // Ekleme sonrası seviye
    const newLevel = currentLevel + (amountAdded_mg / state.volume);

    // Tükenme süresi (saat)
    const hoursUntilDepletion = (newLevel - criticalLevel) / hourlyConsumption;

    // 24 saat hedefi için gereken ek miktar
    const targetHours = 24;
    let additionalNeeded_ml = 0;
    let recommendation = '';

    if (hoursUntilDepletion < targetHours) {
      const additionalNeeded_mg = (targetHours - hoursUntilDepletion) * hourlyConsumption * state.volume;
      additionalNeeded_ml = additionalNeeded_mg / concentration;

      recommendation = `⚠️ ${fedbatch.amount_ml} ml sadece ${hoursUntilDepletion.toFixed(1)} saat yeter. ` +
                      `24 saat için ${additionalNeeded_ml.toFixed(1)} ml daha ekleyin.`;
    } else {
      recommendation = `✅ Yeterli! ${hoursUntilDepletion.toFixed(1)} saat boyunca ${nutrientType} düzeyi kritik seviyenin üzerinde kalacak.`;
    }

    // State'i güncelle
    if (nutrientType === 'N') {
      state.currentN = newLevel;
    } else if (nutrientType === 'P') {
      state.currentP = newLevel;
    }

    this.saveTankState(tankId);

    const analysis = {
      tankId,
      nutrient: nutrientType,
      amountAdded_ml: fedbatch.amount_ml,
      amountAdded_mg: amountAdded_mg,
      concentration,
      currentLevel: currentLevel.toFixed(2),
      newLevel: newLevel.toFixed(2),
      hourlyConsumption: hourlyConsumption.toFixed(2),
      hoursUntilDepletion: hoursUntilDepletion.toFixed(1),
      criticalLevel,
      additionalNeeded_ml: additionalNeeded_ml.toFixed(1),
      recommendation
    };

    console.log(`💉 Fed-Batch analiz sonucu:`, analysis);

    return analysis;
  }

  /**
   * Müdahale kaydet (kimyasal ekleme, pH ayarı, vb.)
   */
  addIntervention(tankId, intervention) {
    const state = this.tankStates.get(tankId);
    
    if (!state) {
      throw new Error(`Tank ${tankId} bulunamadı`);
    }

    const interventionRecord = {
      timestamp: Date.now(),
      date: intervention.date,
      type: intervention.type, // 'chemical' | 'pH_adjustment' | 'harvest' | 'dilution'
      
      // Detaylar
      chemicalName: intervention.chemicalName,
      amount: intervention.amount,
      unit: intervention.unit,
      reason: intervention.reason,
      targetParameter: intervention.targetParameter,
      
      // Etki (model state'i güncelle)
      impact: intervention.impact,
      
      notes: intervention.notes
    };

    state.interventions.push(interventionRecord);

    // Model state'ini güncelle (eğer müdahale besin elementi ekleme ise)
    if (intervention.type === 'chemical' && intervention.impact) {
      if (intervention.impact.N) state.currentN += intervention.impact.N;
      if (intervention.impact.P) state.currentP += intervention.impact.P;
      if (intervention.impact.pH) state.pH = intervention.impact.pH;
    }

    this.saveTankState(tankId);

    console.log(`💉 Tank ${tankId} müdahale kaydedildi:`, {
      type: intervention.type,
      chemical: intervention.chemicalName,
      amount: `${intervention.amount} ${intervention.unit}`
    });
  }

  /**
   * Tank state'ini localStorage'a kaydet
   */
  saveTankState(tankId) {
    const state = this.tankStates.get(tankId);
    
    if (!state) return;

    const key = `tank_${tankId}`;
    
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`❌ Tank ${tankId} localStorage'a kaydedilemedi:`, error);
    }
  }

  /**
   * localStorage'dan tank state'ini yükle
   */
  loadTankState(tankId) {
    const key = `tank_${tankId}`;
    
    try {
      const data = localStorage.getItem(key);
      
      if (data) {
        const state = JSON.parse(data);
        this.tankStates.set(tankId, state);
        console.log(`✅ Tank ${tankId} localStorage'dan yüklendi`);
        return state;
      }
    } catch (error) {
      console.error(`❌ Tank ${tankId} localStorage'dan yüklenemedi:`, error);
    }
    
    return null;
  }

  /**
   * Tüm aktif tankları yükle
   */
  loadAllTanks() {
    const keys = Object.keys(localStorage);
    const tankKeys = keys.filter(k => k.startsWith('tank_'));
    
    tankKeys.forEach(key => {
      const tankId = key.replace('tank_', '');
      this.loadTankState(tankId);
    });

    console.log(`✅ ${tankKeys.length} tank localStorage'dan yüklendi`);
  }

  /**
   * Tank state'ini getir
   */
  getTankState(tankId) {
    return this.tankStates.get(tankId);
  }

  /**
   * Tüm tank state'lerini getir
   */
  getAllTankStates() {
    return Array.from(this.tankStates.values());
  }

  /**
   * Tank simülasyonunu durdur
   */
  deactivateTank(tankId) {
    const state = this.tankStates.get(tankId);
    
    if (state) {
      state.isActive = false;
      this.saveTankState(tankId);
      console.log(`⏸️ Tank ${tankId} deaktive edildi`);
    }
  }

  /**
   * Tank simülasyonunu tekrar başlat
   */
  reactivateTank(tankId) {
    const state = this.tankStates.get(tankId);
    
    if (state) {
      state.isActive = true;
      this.saveTankState(tankId);
      console.log(`▶️ Tank ${tankId} reaktive edildi`);
    }
  }

  /**
   * Tank verilerini temizle (reset)
   */
  resetTank(tankId) {
    this.tankStates.delete(tankId);
    localStorage.removeItem(`tank_${tankId}`);
    console.log(`🗑️ Tank ${tankId} verileri silindi`);
  }

  /**
   * Kaçırılan saatleri telafi et (Background Worker kapalıyken)
   * 
   * Örnek: Son simülasyon 10 saat önce yapıldıysa, 10 saatlik catch-up çalıştır
   */
  async catchUpSimulation(tankId) {
    const state = this.tankStates.get(tankId);
    
    if (!state || !state.isActive) return;

    const now = Date.now();
    const lastSim = state.lastSimulationTime;
    const missedHours = Math.floor((now - lastSim) / (1000 * 60 * 60));

    if (missedHours > 0) {
      console.log(`🕐 Tank ${tankId}: ${missedHours} saat telafi ediliyor...`);

      for (let i = 0; i < missedHours; i++) {
        await this.simulateHour(tankId);
      }

      console.log(`✅ Tank ${tankId} catch-up tamamlandı`);
    }
  }

  /**
   * Tüm aktif tanklar için catch-up
   */
  async catchUpAllTanks() {
    const activeTanks = this.getAllTankStates().filter(s => s.isActive);
    
    console.log(`🔄 ${activeTanks.length} aktif tank için catch-up başlıyor...`);

    for (const state of activeTanks) {
      await this.catchUpSimulation(state.tankId);
    }

    console.log(`✅ Tüm tanklar güncel`);
  }

  /**
   * 🌐 Cross-tank learning çalıştır
   * 
   * Tüm tankların verilerini birleştirerek global öğrenme yapar.
   * En başarılı tankların parametrelerini analiz eder.
   */
  performCrossTankLearning() {
    const allStates = this.getAllTankStates();
    
    if (allStates.length < 2) {
      console.log('⚠️ Cross-tank learning için en az 2 tank gerekli');
      return null;
    }

    console.log(`🌐 Cross-tank learning başlatılıyor (${allStates.length} tank)...`);

    // Her tank için ölçümleri LearningEngine'e kaydet
    allStates.forEach(state => {
      if (state.measurements && state.measurements.length > 0) {
        state.measurements.forEach(m => {
          learningEngine.registerTankData(state.tankId, {
            biomass: m.OD750 * 1.5, // OD750'den biyokütle tahmini
            pH: m.pH,
            temperature: m.temperature,
            day: state.currentDay
          });
        });
      }
    });

    // Cross-tank learning çalıştır
    const result = learningEngine.performCrossTankLearning();

    if (result) {
      console.log(`✅ Cross-tank learning tamamlandı:`);
      console.log(`   - Toplam veri: ${result.totalData} ölçüm`);
      console.log(`   - Tank sayısı: ${result.tankCount}`);
      console.log(`   - En başarılı tanklar: ${result.bestTanks.map(t => t.tankId).join(', ')}`);
    }

    return result;
  }

  /**
   * Learning engine istatistiklerini getir
   */
  getLearningEngineStatus() {
    return learningEngine.getStatus();
  }

  /**
   * Parametre güven aralıklarını hesapla
   */
  getParameterConfidence() {
    return learningEngine.calculateParameterConfidence();
  }
}

// Singleton instance export
const modelManager = new ModelManager();
export default modelManager;

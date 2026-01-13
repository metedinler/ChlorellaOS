/**
 * ============================================
 * 🧬 CHLORELLA MODEL V4 - TAM KAPSAMLI
 * ============================================
 * 
 * tamkapsamli_chlorellaOS_model.md'den port edildi
 * 
 * YENİ FEATURES (V4):
 * - RK4/RKF45 ODE çözücüler (odeSolver.js)
 * - Su kimyası modülü (waterChemistry.js)
 * - 16 risk senaryosu + CRI (riskModel.js)
 * - Dijital ikiz öğrenme motoru
 * - NH3/NH4+ denge hesaplama
 * - Işık spektral model
 * - Gaz transfer modeli (O2, CO2)
 * 
 * ESKİ FEATURES (V3 - korundu):
 * - Monod kinetik büyüme modeli
 * - N, P, CO₂ limitasyonu
 * - Fed-batch müdahale desteği
 * - Otomatik kalibrasyon (gerçek veri ile)
 * 
 * MODÜLER MİMARİ:
 * ChlorellaModel.js → Ana model
 * ├── odeSolver.js → RK4, RKF45
 * ├── waterChemistry.js → pH, alkalinite
 * ├── riskModel.js → 16 risk + CRI
 * └── types.js → Type definitions
 * 
 * KULLANIM:
 * ```javascript
 * import { ChlorellaModel } from './ChlorellaModel.js';
 * 
 * const model = new ChlorellaModel({
 *   volume: 2.0,  // L
 *   initialBiomass: 0.1,  // g/L
 *   initialN: 100,  // mg/L
 *   initialP: 10,  // mg/L
 *   lightIntensity: 5000,  // lux
 *   temperature: 28,  // °C
 *   pH: 7.5
 * });
 * 
 * model.simulate(10);  // 10 gün simülasyon
 * const riskReport = model.assessRisks();  // 16 risk analizi
 * const cri = model.getComprehensiveRiskIndex();  // CRI değeri
 * model.addIntervention(5, 'N', 50);  // Gün 5'te 50 mg/L N ekle
 * ```
 */

import { rk4, rkf45 } from '../models/odeSolver.js';
import { WaterChemistry } from '../models/waterChemistry.js';
import { RiskModel, CRIModel } from '../models/riskModel.js';

class ChlorellaModel {
  constructor(params = {}) {
    // Sistem parametreleri
    this.volume = params.volume || 2.0;  // L
    this.initialBiomass = params.initialBiomass || 0.1;  // g/L (kuru ağırlık)
    this.initialN = params.initialN || 100;  // mg/L
    this.initialP = params.initialP || 10;  // mg/L
    this.initialCO2 = params.initialCO2 || 20;  // mg/L (çözünmüş)
    this.lightIntensity = params.lightIntensity || 5000;  // lux
    this.temperature = params.temperature || 28;  // °C
    this.pH = params.pH || 7.5;
    this.initialTAN = params.initialTAN || 0;  // mg/L (Total Ammonia Nitrogen)
    this.initialO2 = params.initialO2 || 8.0;  // mg/L
    
    // Monod sabitleri (Chlorella vulgaris için optimize)
    this.μmax = params.μmax || 0.15;  // 1/saat (maksimum büyüme hızı)
    this.Ks_N = params.Ks_N || 5.0;  // mg/L (N için yarı doygunluk sabiti)
    this.Ks_P = params.Ks_P || 0.5;  // mg/L (P için yarı doygunluk sabiti)
    this.Ks_CO2 = params.Ks_CO2 || 2.0;  // mg/L (CO₂ için)
    
    // Stokiyometri sabitleri
    this.Y_N = 0.06;  // g biomass / mg N
    this.Y_P = 0.01;  // g biomass / mg P
    this.Y_CO2 = 1.83;  // g biomass / mg CO₂
    
    // Çevresel faktörler
    this.K_light = 2500;  // lux (ışık yarı doygunluk)
    this.T_opt = 28;  // °C (optimal sıcaklık)
    this.pH_opt = 7.5;  // Optimal pH
    
    // Durum değişkenleri
    this.currentBiomass = this.initialBiomass;
    this.currentN = this.initialN;
    this.currentP = this.initialP;
    this.currentCO2 = this.initialCO2;
    this.currentTAN = this.initialTAN;
    this.currentO2 = this.initialO2;
    this.currentDay = 0;
    this.currentHour = 0;  // 🕐 YENİ: Saatlik tracking
    
    // YENİ: Alt modül entegrasyonu
    this.waterChem = new WaterChemistry({
      volume: this.volume,
      pH: this.pH,
      temperature: this.temperature,
      alkalinity: params.alkalinity || 50,
      EC: params.EC || 64
    });
    
    this.riskModel = new RiskModel();
    this.criModel = new CRIModel(this.riskModel);
    
    // Simülasyon geçmişi
    this.history = [{
      day: 0,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      TAN: this.currentTAN,
      O2: this.currentO2,
      pH: this.pH,
      temperature: this.temperature,
      μ: 0,
      limitingFactor: null,
      risks: {},
      CRI: 0
    }];
    
    // Risk geçmişi (V4 YENİ)
    this.riskHistory = [];
    this.CRIHistory = [0];
    
    // Müdahaleler
    this.interventions = [];
    
    // Kalibrasyon verileri
    this.realData = [];
    this.calibrationFactor = 1.0;
  }

  /**
   * NH3/NH4 dengesi hesapla (V4 YENİ)
   */
  calculateNH3NH4() {
    return this.waterChem.calculateNH3NH4(this.currentTAN, this.temperature);
  }

  /**
   * Işık limitasyon faktörü (Monod tipi)
   */
  lightLimitation() {
    return this.lightIntensity / (this.K_light + this.lightIntensity);
  }

  /**
   * Sıcaklık limitasyon faktörü (Gaussian)
   */
  temperatureLimitation() {
    const diff = Math.abs(this.temperature - this.T_opt);
    return Math.exp(-0.01 * diff * diff);
  }

  /**
   * pH limitasyon faktörü (Gaussian)
   */
  pHLimitation() {
    const diff = Math.abs(this.pH - this.pH_opt);
    return Math.exp(-0.1 * diff * diff);
  }

  /**
   * Besin limitasyonu (Monod kinetik)
   */
  nutrientLimitation(S, Ks) {
    return S / (Ks + S);
  }

  /**
   * Büyüme hızı hesapla (μ) - Liebig's Law of Minimum
   */
  calculateGrowthRate() {
    // Her besin için limitasyon faktörü
    const lim_N = this.nutrientLimitation(this.currentN, this.Ks_N);
    const lim_P = this.nutrientLimitation(this.currentP, this.Ks_P);
    const lim_CO2 = this.nutrientLimitation(this.currentCO2, this.Ks_CO2);
    const lim_light = this.lightLimitation();
    const lim_temp = this.temperatureLimitation();
    const lim_pH = this.pHLimitation();
    
    // Minimum limitasyonu bul (Liebig's Law)
    const nutrientMin = Math.min(lim_N, lim_P, lim_CO2);
    const environmentalMin = Math.min(lim_light, lim_temp, lim_pH);
    const totalLimitation = Math.min(nutrientMin, environmentalMin);
    
    // Sınırlayıcı faktörü belirle
    let limitingFactor = 'none';
    if (totalLimitation === lim_N) limitingFactor = 'N';
    else if (totalLimitation === lim_P) limitingFactor = 'P';
    else if (totalLimitation === lim_CO2) limitingFactor = 'CO2';
    else if (totalLimitation === lim_light) limitingFactor = 'light';
    else if (totalLimitation === lim_temp) limitingFactor = 'temperature';
    else if (totalLimitation === lim_pH) limitingFactor = 'pH';
    
    // Büyüme hızı (1/saat → 1/gün dönüşümü)
    const μ_hourly = this.μmax * totalLimitation * this.calibrationFactor;
    const μ_daily = μ_hourly * 24;
    
    return { μ: μ_daily, limitingFactor };
  }

  /**
   * V4 YENİ: 16 Risk Senaryosu Analizi
   */
  assessRisks() {
    const { NH3, NH4 } = this.calculateNH3NH4();
    
    const currentState = {
      X: this.currentBiomass,
      pH: this.pH,
      temperature: this.temperature,
      O2: this.currentO2,
      CO2: this.currentCO2,
      TAN: this.currentTAN,
      NO3: this.currentN,
      NH3,
      NH4,
      EC: this.waterChem.EC,
      hourOfDay: new Date().getHours(),
      cellDensity: this.currentBiomass * 1e8,  // cells/mL tahmini
      lightIntensity: this.lightIntensity
    };
    
    const risks = this.riskModel.calculateAllRisks(
      currentState,
      this.history.length > 1 ? this.history[this.history.length - 2] : {}
    );
    
    return risks;
  }

  /**
   * V4 YENİ: CRI (Composite Risk Index) hesapla
   */
  getComprehensiveRiskIndex() {
    const risks = this.assessRisks();
    const CRI = this.criModel.calculateTotalCRI(risks);
    return CRI;
  }

  /**
   * 🆕 Bir saatlik simülasyon (saatlik adımlar için)
   */
  simulateOneHour() {
    const { μ, limitingFactor } = this.calculateGrowthRate();
    
    // Saatlik büyüme (μ günlük, 24'e böl)
    const μ_hourly = μ / 24;
    
    // Biyokütle artışı
    const dX = μ_hourly * this.currentBiomass;
    this.currentBiomass += dX;
    
    // Besin tüketimi (stokiyometri)
    const dN = dX / this.Y_N;
    const dP = dX / this.Y_P;
    const dCO2 = dX / this.Y_CO2;
    
    this.currentN = Math.max(0, this.currentN - dN);
    this.currentP = Math.max(0, this.currentP - dP);
    this.currentCO2 = Math.max(0, this.currentCO2 - dCO2);
    
    // CO₂ rejenenerasyonu (saatlik)
    const CO2_regen = 5 / 24;  // mg/L/saat
    this.currentCO2 = Math.min(50, this.currentCO2 + CO2_regen);
    
    // O2 dinamiği
    const O2_production = dX * 1.38;
    const O2_respiration = this.currentBiomass * 0.02 / 24;
    this.currentO2 = Math.max(0, this.currentO2 + O2_production - O2_respiration);
    this.currentO2 = Math.min(12, this.currentO2);
    
    this.currentHour++;
    if (this.currentHour >= 24) {
      this.currentHour = 0;
      this.currentDay++;
    }
    
    // Risk ve CRI hesapla
    const risks = this.assessRisks();
    const CRI = this.criModel.calculateTotalCRI(risks);
    
    // Geçmişe kaydet (her saat)
    this.history.push({
      day: this.currentDay,
      hour: this.currentHour,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      TAN: this.currentTAN,
      O2: this.currentO2,
      pH: this.pH,
      temperature: this.temperature,
      μ: μ_hourly,
      limitingFactor,
      risks,
      CRI
    });
    
    this.riskHistory.push(risks);
    this.CRIHistory.push(CRI);
    
    return this.history[this.history.length - 1];
  }

  /**
   * Bir günlük simülasyon (Euler method - basit versiyon)
   */
  simulateDay() {
    const { μ, limitingFactor } = this.calculateGrowthRate();
    
    // Biyokütle artışı
    const dX = μ * this.currentBiomass;
    this.currentBiomass += dX;
    
    // Besin tüketimi (stokiyometri)
    const dN = dX / this.Y_N;
    const dP = dX / this.Y_P;
    const dCO2 = dX / this.Y_CO2;
    
    this.currentN = Math.max(0, this.currentN - dN);
    this.currentP = Math.max(0, this.currentP - dP);
    this.currentCO2 = Math.max(0, this.currentCO2 - dCO2);
    
    // CO₂ doğal rejenenerasyonu (havadan diffüzyon)
    const CO2_regen = 5;  // mg/L/day
    this.currentCO2 = Math.min(50, this.currentCO2 + CO2_regen);
    
    // V4 YENİ: O2 dinamiği (basit)
    const O2_production = dX * 1.38;  // g O2 / g biomass (fotosentez)
    const O2_respiration = this.currentBiomass * 0.02;  // Gece solunumu
    this.currentO2 = Math.max(0, this.currentO2 + O2_production - O2_respiration);
    this.currentO2 = Math.min(12, this.currentO2);  // Doygunluk limiti
    
    this.currentDay++;
    
    // V4 YENİ: Risk ve CRI hesapla
    const risks = this.assessRisks();
    const CRI = this.criModel.calculateTotalCRI(risks);
    
    this.riskHistory.push(risks);
    this.CRIHistory.push(CRI);
    
    // Geçmişe kaydet
    this.history.push({
      day: this.currentDay,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      TAN: this.currentTAN,
      O2: this.currentO2,
      pH: this.pH,
      temperature: this.temperature,
      μ: μ,
      limitingFactor,
      risks,
      CRI
    });
    
    return this.history[this.history.length - 1];
  }

  /**
   * N gün simülasyon
   */
  simulate(days) {
    for (let i = 0; i < days; i++) {
      this.simulateDay();
    }
    return this.history;
  }

  /**
   * Müdahale ekle (Fed-Batch)
   */
  addIntervention(day, nutrient, amount) {
    this.interventions.push({ day, nutrient, amount });
    
    // Eğer şu anki gün ise hemen uygula
    if (day === this.currentDay) {
      this.applyIntervention(nutrient, amount);
    }
  }

  /**
   * Müdahaleyi uygula
   */
  applyIntervention(nutrient, amount) {
    if (nutrient === 'N') {
      this.currentN += amount;
    } else if (nutrient === 'P') {
      this.currentP += amount;
    } else if (nutrient === 'CO2') {
      this.currentCO2 += amount;
    }
    
    console.log(`✅ Müdahale uygulandı: ${nutrient} +${amount} mg/L`);
  }

  /**
   * Gelecek N gün tahmini
   */
  predictNextDays(days) {
    // Mevcut durumu kaydet
    const snapshot = {
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      day: this.currentDay,
      history: [...this.history]
    };
    
    // İleri simülasyon
    const predictions = [];
    for (let i = 0; i < days; i++) {
      // Planlı müdahaleleri kontrol et
      const scheduledInt = this.interventions.find(int => int.day === this.currentDay + 1);
      if (scheduledInt) {
        this.applyIntervention(scheduledInt.nutrient, scheduledInt.amount);
      }
      
      const result = this.simulateDay();
      predictions.push(result);
    }
    
    // Durumu geri yükle
    this.currentBiomass = snapshot.biomass;
    this.currentN = snapshot.N;
    this.currentP = snapshot.P;
    this.currentCO2 = snapshot.CO2;
    this.currentDay = snapshot.day;
    this.history = snapshot.history;
    
    return predictions;
  }

  /**
   * Gerçek veri ile kalibrasyon
   */
  calibrateWithRealData(realData) {
    // realData: [{day, biomass}, ...]
    if (realData.length === 0) return;
    
    this.realData = realData;
    
    // Teorik vs gerçek sapması hesapla
    let totalError = 0;
    let count = 0;
    
    realData.forEach(point => {
      const predicted = this.history.find(h => h.day === point.day);
      if (predicted) {
        const error = Math.abs(predicted.biomass - point.biomass) / point.biomass;
        totalError += error;
        count++;
      }
    });
    
    const avgError = count > 0 ? totalError / count : 0;
    
    // Kalibrasyon faktörü ayarla (basitleştirilmiş)
    if (avgError > 0.1) {  // %10'dan fazla sapma
      const avgReal = realData.reduce((sum, p) => sum + p.biomass, 0) / realData.length;
      const avgPredicted = realData.map(p => 
        this.history.find(h => h.day === p.day)?.biomass || 0
      ).reduce((sum, b) => sum + b, 0) / realData.length;
      
      this.calibrationFactor = avgReal / avgPredicted;
      console.log(`📊 Kalibrasyon faktörü güncellendi: ${this.calibrationFactor.toFixed(3)}`);
    }
  }

  /**
   * Fed-Batch önerisi (V4: CRI bazlı)
   */
  /**
   * 🔥 B+++ GENİŞLETİLMİŞ: Gerçek malzeme stoklarıyla alternatif beslenme önerileri
   * @param {number} tankVolume - Tank hacmi (L)
   * @param {Array} availableMaterials - MaterialsContext'ten gelen stok listesi (opsiyonel)
   * @returns {Array} Alternatifli müdahale önerileri
   */
  suggestIntervention(tankVolume = 1000, availableMaterials = null) {
    // Gelecek 5 günü tahmin et
    const predictions = this.predictNextDays(5);
    
    const suggestions = [];
    
    // MaterialsContext varsa kullan, yoksa localStorage'dan oku
    let materials = availableMaterials;
    if (!materials) {
      try {
        const stored = localStorage.getItem('chlorellaMaterials');
        materials = stored ? JSON.parse(stored) : [];
      } catch (e) {
        materials = [];
      }
    }
    
    predictions.forEach((pred, idx) => {
      const day = this.currentDay + idx + 1;
      
      // N kritik seviyede mi?
      if (pred.N < this.Ks_N * 2 && pred.limitingFactor === 'N') {
        const targetAmount = 50; // mg/L artış hedefi
        const alternatives = this._findNitrogenSources(targetAmount, tankVolume, materials);
        
        suggestions.push({
          day,
          type: 'fedbatch',
          nutrient: 'N',
          reason: `N seviyesi kritik (${pred.N.toFixed(1)} mg/L)`,
          suggestedAmount: targetAmount,
          urgency: pred.N < this.Ks_N ? 'high' : 'medium',
          CRI: pred.CRI || 0,
          alternatives // 🆕 Gerçek kimyasal alternatifler
        });
      }
      
      // P kritik seviyede mi?
      if (pred.P < this.Ks_P * 2 && pred.limitingFactor === 'P') {
        const targetAmount = 5; // mg/L artış hedefi
        const alternatives = this._findPhosphorusSources(targetAmount, tankVolume, materials);
        
        suggestions.push({
          day,
          type: 'fedbatch',
          nutrient: 'P',
          reason: `P seviyesi kritik (${pred.P.toFixed(1)} mg/L)`,
          suggestedAmount: targetAmount,
          urgency: pred.P < this.Ks_P ? 'high' : 'medium',
          CRI: pred.CRI || 0,
          alternatives // 🆕 Gerçek kimyasal alternatifler
        });
      }
      
      // V4 YENİ: CRI yüksekse genel uyarı
      if (pred.CRI > 0.6) {
        suggestions.push({
          day,
          type: 'emergency',
          nutrient: 'multiple',
          reason: `Yüksek risk (CRI=${(pred.CRI * 100).toFixed(1)}%)`,
          suggestedAmount: null,
          urgency: 'critical',
          CRI: pred.CRI,
          details: pred.risks
        });
      }
    });
    
    return suggestions;
  }

  /**
   * 🆕 Azot kaynağı alternatifleri bul - STOK ÇÖZELTİ SİSTEMİ
   */
  _findNitrogenSources(targetMgL, tankVolumeL, materials) {
    // Azot kaynakları ve N içerikleri (% w/w) + çözünürlük (g/L)
    const nSources = {
      'KNO3': { N: 13.85, formula: 'KNO3', MW: 101.1, solubility: 316 },
      'NaNO3': { N: 16.47, formula: 'NaNO3', MW: 85.0, solubility: 880 },
      'Ca(NO3)2': { N: 17.07, formula: 'Ca(NO3)2', MW: 164.1, solubility: 1212 },
      'NH4NO3': { N: 35.0, formula: 'NH4NO3', MW: 80.0, solubility: 1920 },
      'Urea': { N: 46.65, formula: 'CO(NH2)2', MW: 60.1, solubility: 1080 },
      '(NH4)2SO4': { N: 21.2, formula: '(NH4)2SO4', MW: 132.1, solubility: 750 }
    };
    
    const alternatives = [];
    
    Object.entries(nSources).forEach(([chemical, props]) => {
      const neededGrams = (targetMgL * tankVolumeL) / (props.N * 10); // mg/L → g total
      
      // Stok kontrolü
      const stock = materials.find(m => 
        m.name.includes(chemical) || 
        m.formula?.includes(props.formula) ||
        m.name.toUpperCase().includes(chemical.toUpperCase())
      );
      
      // STOK ÇÖZELTİ TARİFİ (Standart: 100g/L veya maksimum çözünürlük)
      const stockConcentration = Math.min(100, props.solubility * 0.8); // g/L (güvenli çözünürlük)
      const stockVolume = 100; // ml (standart)
      const stockMass = (stockConcentration * stockVolume) / 1000; // g
      const usageVolume = (neededGrams / stockMass) * stockVolume; // ml
      
      alternatives.push({
        chemical,
        formula: props.formula,
        nContent: props.N,
        // Ham kimyasal kullanım
        directUse: {
          amount: neededGrams,
          unit: 'g',
          instruction: `${neededGrams.toFixed(2)}g ${chemical}'ü doğrudan ${tankVolumeL}L tank suyuna ekleyin`
        },
        // Stok çözelti kullanımı
        stockSolution: {
          preparation: `${stockMass.toFixed(1)}g ${chemical}'ü ${stockVolume}ml saf suda çözün`,
          concentration: `${stockConcentration.toFixed(0)}g/L`,
          usage: `Bu stoktan ${usageVolume.toFixed(1)}ml kullanın`,
          totalVolume: stockVolume,
          chemicalMass: stockMass
        },
        // Stok durumu
        inStock: !!stock,
        stockAmount: stock ? stock.quantity : 0,
        stockUnit: stock ? stock.unit : '-',
        sufficient: stock ? (stock.quantity >= stockMass) : false,
        cost: stock ? ((stockMass / 1000) * stock.unitPrice).toFixed(2) : 'N/A',
        currency: stock ? stock.currency : '-'
      });
    });
    
    // Stokta olanlara öncelik ver, sonra N içeriğine göre sırala
    return alternatives.sort((a, b) => {
      if (a.sufficient && !b.sufficient) return -1;
      if (!a.sufficient && b.sufficient) return 1;
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return b.nContent - a.nContent;
    });
  }

  /**
   * 🆕 Fosfor kaynağı alternatifleri bul - STOK ÇÖZELTİ SİSTEMİ
   */
  _findPhosphorusSources(targetMgL, tankVolumeL, materials) {
    // Fosfor kaynakları ve P içerikleri (% w/w) + çözünürlük (g/L)
    const pSources = {
      'K2HPO4': { P: 17.77, formula: 'K2HPO4', MW: 174.2, solubility: 1600 },
      'KH2PO4': { P: 22.76, formula: 'KH2PO4', MW: 136.1, solubility: 226 },
      'NaH2PO4': { P: 25.83, formula: 'NaH2PO4', MW: 120.0, solubility: 850 },
      'Na2HPO4': { P: 21.83, formula: 'Na2HPO4', MW: 142.0, solubility: 77 },
      'H3PO4': { P: 31.61, formula: 'H3PO4', MW: 98.0, solubility: 5480 }
    };
    
    const alternatives = [];
    
    Object.entries(pSources).forEach(([chemical, props]) => {
      const neededGrams = (targetMgL * tankVolumeL) / (props.P * 10);
      
      // Stok kontrolü
      const stock = materials.find(m => 
        m.name.includes(chemical) || 
        m.formula?.includes(props.formula) ||
        m.name.toUpperCase().includes(chemical.toUpperCase())
      );
      
      // STOK ÇÖZELTİ TARİFİ
      const stockConcentration = Math.min(100, props.solubility * 0.8); // g/L
      const stockVolume = 100; // ml
      const stockMass = (stockConcentration * stockVolume) / 1000; // g
      const usageVolume = (neededGrams / stockMass) * stockVolume; // ml
      
      alternatives.push({
        chemical,
        formula: props.formula,
        pContent: props.P,
        // Ham kimyasal
        directUse: {
          amount: neededGrams,
          unit: 'g',
          instruction: `${neededGrams.toFixed(2)}g ${chemical}'ü doğrudan ${tankVolumeL}L tank suyuna ekleyin`
        },
        // Stok çözelti
        stockSolution: {
          preparation: `${stockMass.toFixed(1)}g ${chemical}'ü ${stockVolume}ml saf suda çözün`,
          concentration: `${stockConcentration.toFixed(0)}g/L`,
          usage: `Bu stoktan ${usageVolume.toFixed(1)}ml kullanın`,
          totalVolume: stockVolume,
          chemicalMass: stockMass
        },
        // Stok durumu
        inStock: !!stock,
        stockAmount: stock ? stock.quantity : 0,
        stockUnit: stock ? stock.unit : '-',
        sufficient: stock ? (stock.quantity >= stockMass) : false,
        cost: stock ? ((stockMass / 1000) * stock.unitPrice).toFixed(2) : 'N/A',
        currency: stock ? stock.currency : '-'
      });
    });
    
    return alternatives.sort((a, b) => {
      if (a.sufficient && !b.sufficient) return -1;
      if (!a.sufficient && b.sufficient) return 1;
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return b.pContent - a.pContent;
    });
  }

  /**
   * V4 YENİ: Dijital İkiz Durum Raporu
   */
  getDigitalTwinStatus() {
    const currentState = this.history[this.history.length - 1];
    const risks = this.assessRisks();
    const CRI = this.getComprehensiveRiskIndex();
    const riskLevel = this.criModel.getRiskLevel(CRI);
    
    // En yüksek 3 risk
    const topRisks = Object.entries(risks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([risk, value]) => ({ risk, value }));
    
    // Öneriler
    const recommendations = [];
    
    if (CRI > 0.6) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Kritik risk seviyesi. Hemen müdahale gerekiyor.',
        details: 'Kültürü %30-50 seyreltin, ışığı %40 azaltın, pH reset yapın.'
      });
    } else if (CRI > 0.4) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Yüksek risk. Önleyici müdahale önerilir.',
        details: 'Fotoperiyodu 16/8 yapın, gece aerasyonunu %20 artırın.'
      });
    }
    
    if (risks.NH3_toxicity > 0.5) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Amonyak toksisitesi riski yüksek.',
        details: 'CO2 enjeksiyonunu artırarak pH\'ı 7.5\'e düşürün.'
      });
    }
    
    if (risks.night_hypoxia > 0.5) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Gece hipoksisi riski yüksek.',
        details: 'Gece aerasyonunu %50 artırın veya O2 enjeksiyonu yapın.'
      });
    }
    
    if (risks.N_limitation > 0.5) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Azot limitasyonu var.',
        details: `NO3: ${currentState.N.toFixed(1)} mg/L. 50 mg/L NO3 ekleyin.`
      });
    }
    
    return {
      timestamp: new Date(),
      simulation_day: this.currentDay,
      biomass_gL: currentState.biomass,
      cell_density: currentState.biomass * 1e8,
      pH: currentState.pH,
      temperature: currentState.temperature,
      CRI,
      risk_level: riskLevel,
      top_risks: topRisks,
      intervention_count: this.interventions.length,
      recommendations
    };
  }

  /**
   * Model durumunu sıfırla
   */
  reset() {
    this.currentBiomass = this.initialBiomass;
    this.currentN = this.initialN;
    this.currentP = this.initialP;
    this.currentCO2 = this.initialCO2;
    this.currentTAN = this.initialTAN;
    this.currentO2 = this.initialO2;
    this.currentDay = 0;
    
    this.history = [{
      day: 0,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      TAN: this.currentTAN,
      O2: this.currentO2,
      pH: this.pH,
      temperature: this.temperature,
      μ: 0,
      limitingFactor: null,
      risks: {},
      CRI: 0
    }];
    
    this.riskHistory = [];
    this.CRIHistory = [0];
    this.interventions = [];
  }

  /**
   * 🆕 Model durumunu yükle (persistence için)
   */
  loadState(state) {
    if (!state) return;
    
    console.log('🔄 Model durumu yükleniyor...');
    
    // Parametreleri yükle
    if (state.params) {
      Object.keys(state.params).forEach(key => {
        if (this[key] !== undefined) {
          this[key] = state.params[key];
        }
      });
    }
    
    // Mevcut durumu yükle
    if (state.current) {
      this.currentDay = state.current.day || 0;
      this.currentBiomass = state.current.biomass || this.initialBiomass;
      this.currentN = state.current.N || this.initialN;
      this.currentP = state.current.P || this.initialP;
      this.currentCO2 = state.current.CO2 || this.initialCO2;
      this.currentTAN = state.current.TAN || 0;
      this.currentO2 = state.current.O2 || 8;
      this.pH = state.current.pH || this.pH;
      this.temperature = state.current.temperature || this.temperature;
    }
    
    // Geçmişi yükle
    if (state.history && state.history.length > 0) {
      this.history = state.history;
    }
    
    // Müdahaleleri yükle
    if (state.interventions) {
      this.interventions = state.interventions;
    }
    
    // Risk geçmişini yükle
    if (state.riskHistory) {
      this.riskHistory = state.riskHistory;
    }
    
    if (state.CRIHistory) {
      this.CRIHistory = state.CRIHistory;
    }
    
    console.log(`✅ Model durumu yüklendi: Gün ${this.currentDay}, Biyokütle ${this.currentBiomass.toFixed(3)} g/L`);
  }

  /**
   * 🆕 Model'i klonla (öngörü simülasyonları için)
   */
  clone() {
    const cloned = new ChlorellaModel({
      volume: this.volume,
      initialBiomass: this.initialBiomass,
      initialN: this.initialN,
      initialP: this.initialP,
      initialCO2: this.initialCO2,
      lightIntensity: this.lightIntensity,
      temperature: this.temperature,
      pH: this.pH,
      μmax: this.μmax,
      Ks_N: this.Ks_N,
      Ks_P: this.Ks_P,
      Ks_CO2: this.Ks_CO2
    });
    
    // Mevcut durumu kopyala
    cloned.currentBiomass = this.currentBiomass;
    cloned.currentN = this.currentN;
    cloned.currentP = this.currentP;
    cloned.currentCO2 = this.currentCO2;
    cloned.currentTAN = this.currentTAN;
    cloned.currentO2 = this.currentO2;
    cloned.currentDay = this.currentDay;
    cloned.currentHour = this.currentHour || 0;
    cloned.history = [...this.history];
    cloned.interventions = [...this.interventions];
    
    return cloned;
  }

  /**
   * Model durumunu export et (V4: risk geçmişi dahil)
   */
  exportState() {
    return {
      version: 'V4',
      params: {
        volume: this.volume,
        initialBiomass: this.initialBiomass,
        initialN: this.initialN,
        initialP: this.initialP,
        μmax: this.μmax,
        calibrationFactor: this.calibrationFactor
      },
      current: {
        day: this.currentDay,
        hour: this.currentHour || 0,
        biomass: this.currentBiomass,
        N: this.currentN,
        P: this.currentP,
        CO2: this.currentCO2,
        TAN: this.currentTAN,
        O2: this.currentO2,
        pH: this.pH,
        temperature: this.temperature
      },
      history: this.history,
      riskHistory: this.riskHistory,
      CRIHistory: this.CRIHistory,
      interventions: this.interventions,
      digitalTwinStatus: this.getDigitalTwinStatus()
    };
  }
}

export default ChlorellaModel;

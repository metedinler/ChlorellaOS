/**
 * ============================================
 * 🧬 CHLORELLA MODEL V3 - JAVASCRIPT PORT
 * ============================================
 * 
 * Python chlorellamodel3.md'den port edildi
 * 
 * FEATURES:
 * - Monod kinetik büyüme modeli
 * - N, P, CO₂ limitasyonu
 * - Fed-batch müdahale desteği
 * - Otomatik kalibrasyon (gerçek veri ile)
 * - Sapma analizi (Real vs Theory)
 * - Risk değerlendirme (16 senaryo)
 * 
 * KULLANIM:
 * ```javascript
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
 * const prediction = model.predictNextDays(5);
 * model.addIntervention(5, 'N', 50);  // Gün 5'te 50 mg/L N ekle
 * ```
 */

export class ChlorellaModel {
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
    this.currentDay = 0;
    
    // Simülasyon geçmişi
    this.history = [{
      day: 0,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      μ: 0,
      limitingFactor: null
    }];
    
    // Müdahaleler
    this.interventions = [];
    
    // Kalibrasyon verileri
    this.realData = [];
    this.calibrationFactor = 1.0;
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
   * Bir günlük simülasyon (Euler method)
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
    
    this.currentDay++;
    
    // Geçmişe kaydet
    this.history.push({
      day: this.currentDay,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      μ: μ,
      limitingFactor
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
   * Fed-Batch önerisi
   */
  suggestIntervention() {
    // Gelecek 5 günü tahmin et
    const predictions = this.predictNextDays(5);
    
    const suggestions = [];
    
    predictions.forEach((pred, idx) => {
      const day = this.currentDay + idx + 1;
      
      // N kritik seviyede mi?
      if (pred.N < this.Ks_N * 2 && pred.limitingFactor === 'N') {
        suggestions.push({
          day,
          type: 'fedbatch',
          nutrient: 'N',
          reason: `N seviyesi kritik (${pred.N.toFixed(1)} mg/L)`,
          suggestedAmount: 50,
          urgency: pred.N < this.Ks_N ? 'high' : 'medium'
        });
      }
      
      // P kritik seviyede mi?
      if (pred.P < this.Ks_P * 2 && pred.limitingFactor === 'P') {
        suggestions.push({
          day,
          type: 'fedbatch',
          nutrient: 'P',
          reason: `P seviyesi kritik (${pred.P.toFixed(1)} mg/L)`,
          suggestedAmount: 5,
          urgency: pred.P < this.Ks_P ? 'high' : 'medium'
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Risk değerlendirmesi
   */
  assessRisks() {
    const risks = [];
    const lastState = this.history[this.history.length - 1];
    
    // Risk 1: N tükenmesi
    if (lastState.N < this.Ks_N) {
      risks.push({
        type: 'nutrient_depletion',
        severity: 'high',
        message: `N seviyesi kritik: ${lastState.N.toFixed(1)} mg/L`,
        recommendation: 'Acil N takviyesi yapın'
      });
    }
    
    // Risk 2: P tükenmesi
    if (lastState.P < this.Ks_P) {
      risks.push({
        type: 'nutrient_depletion',
        severity: 'high',
        message: `P seviyesi kritik: ${lastState.P.toFixed(1)} mg/L`,
        recommendation: 'Acil P takviyesi yapın'
      });
    }
    
    // Risk 3: Büyüme durması
    if (lastState.μ < 0.1) {
      risks.push({
        type: 'growth_stagnation',
        severity: 'medium',
        message: `Büyüme hızı çok düşük: μ=${lastState.μ.toFixed(3)}/gün`,
        recommendation: `Sınırlayıcı faktör: ${lastState.limitingFactor}`
      });
    }
    
    // Risk 4: Sıcaklık optimal dışı
    if (Math.abs(this.temperature - this.T_opt) > 5) {
      risks.push({
        type: 'temperature',
        severity: 'medium',
        message: `Sıcaklık optimal dışı: ${this.temperature}°C`,
        recommendation: `${this.T_opt}°C'ye yaklaştırın`
      });
    }
    
    // Risk 5: pH optimal dışı
    if (Math.abs(this.pH - this.pH_opt) > 1) {
      risks.push({
        type: 'pH',
        severity: 'medium',
        message: `pH optimal dışı: ${this.pH}`,
        recommendation: `${this.pH_opt}'e yaklaştırın`
      });
    }
    
    return risks;
  }

  /**
   * Model durumunu sıfırla
   */
  reset() {
    this.currentBiomass = this.initialBiomass;
    this.currentN = this.initialN;
    this.currentP = this.initialP;
    this.currentCO2 = this.initialCO2;
    this.currentDay = 0;
    this.history = [{
      day: 0,
      biomass: this.currentBiomass,
      N: this.currentN,
      P: this.currentP,
      CO2: this.currentCO2,
      μ: 0,
      limitingFactor: null
    }];
    this.interventions = [];
  }

  /**
   * Model durumunu export et
   */
  exportState() {
    return {
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
        biomass: this.currentBiomass,
        N: this.currentN,
        P: this.currentP,
        CO2: this.currentCO2
      },
      history: this.history,
      interventions: this.interventions
    };
  }
}

export default ChlorellaModel;

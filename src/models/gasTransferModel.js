// gasTransferModel.js - O2/CO2 gaz transfer modeli (Losordo-Boyd)

export class GasTransferModel {
  constructor() {
    // Henry sabitleri (mol/L/atm @ 25°C)
    this.H_O2_25 = 1.26e-3;
    this.H_CO2_25 = 3.34e-2;
    
    // Sıcaklık düzeltme parametreleri (Van't Hoff)
    this.dH_O2 = -1500; // J/mol
    this.dH_CO2 = -2400; // J/mol
    
    // Standart kLa değerleri (h^-1)
    this.kLa_O2_standard = 5.0;  // Havalandırma ile
    this.kLa_CO2_standard = 4.5;
    
    // Difüzyon katsayı oranı
    this.D_ratio = 0.9; // D_CO2 / D_O2
    
    // Gaz sabiti
    this.R = 8.314; // J/(mol·K)
  }

  /**
   * Henry sabiti sıcaklık düzeltmesi
   * H(T) = H(25) * exp(dH/R * (1/T - 1/298.15))
   */
  calculateHenryConstant(gas, temperature_C) {
    const T = temperature_C + 273.15;
    const T_ref = 298.15;
    
    const H_ref = gas === 'O2' ? this.H_O2_25 : this.H_CO2_25;
    const dH = gas === 'O2' ? this.dH_O2 : this.dH_CO2;
    
    const H_T = H_ref * Math.exp((dH / this.R) * (1/T - 1/T_ref));
    
    return H_T;
  }

  /**
   * Doygunluk konsantrasyonu
   * C* = H * P_gas * f_correction
   */
  calculateSaturationConcentration(gas, temperature_C, pressure_atm = 1.0, salinity = 0) {
    const H_T = this.calculateHenryConstant(gas, temperature_C);
    
    // Hava kompozisyonu
    const P_O2 = 0.21 * pressure_atm; // atm
    const P_CO2 = 0.0004 * pressure_atm; // 400 ppm
    
    const P_gas = gas === 'O2' ? P_O2 : P_CO2;
    
    // Tuzluluk düzeltmesi (Weiss formülü)
    const salinityFactor = Math.exp(-salinity * 0.01);
    
    const C_sat = H_T * P_gas * salinityFactor * 1000; // mg/L
    
    return C_sat;
  }

  /**
   * kLa sıcaklık düzeltmesi
   * kLa(T) = kLa(20) * θ^(T-20)
   */
  calculateKLa(gas, temperature_C, aeration_vvm = 0.5, agitation_rpm = 0) {
    const kLa_20 = gas === 'O2' ? this.kLa_O2_standard : this.kLa_CO2_standard;
    
    // Sıcaklık faktörü (θ ≈ 1.024)
    const theta = 1.024;
    const kLa_T = kLa_20 * Math.pow(theta, temperature_C - 20);
    
    // Havalandırma faktörü
    const aerationFactor = 1 + (aeration_vvm / 0.5); // vvm artışı ile kLa artar
    
    // Karıştırma faktörü (varsa)
    const agitationFactor = 1 + (agitation_rpm / 200) * 0.3;
    
    const kLa_actual = kLa_T * aerationFactor * agitationFactor;
    
    return kLa_actual;
  }

  /**
   * Gaz transfer hızı (OTR/CTR)
   * dC/dt = kLa * (C* - C)
   */
  calculateTransferRate(gas, C_current, C_sat, kLa) {
    // Transfer hızı (mg/L/h)
    const transferRate = kLa * (C_sat - C_current);
    
    return {
      rate: transferRate,
      deficit: C_sat - C_current,
      saturationPercent: (C_current / C_sat) * 100
    };
  }

  /**
   * O2 dengesi (Fotosentez + Havalandırma - Solunum)
   */
  calculateO2Balance(state) {
    const {
      O2_current = 8.0,        // mg/L
      temperature = 25,         // °C
      biomass = 1.0,           // g/L
      lightIntensity = 5000,   // lux
      aeration = 0.5,          // vvm
      hourOfDay = 12           // 0-24
    } = state;
    
    // Doygunluk
    const O2_sat = this.calculateSaturationConcentration('O2', temperature);
    const kLa_O2 = this.calculateKLa('O2', temperature, aeration);
    
    // Gaz transferi (havalandırma)
    const OTR = kLa_O2 * (O2_sat - O2_current); // mg/L/h
    
    // Fotosentez O2 üretimi
    const isDay = hourOfDay >= 6 && hourOfDay <= 20;
    const lightFactor = isDay ? Math.min(1.0, lightIntensity / 10000) : 0;
    const P_O2 = 2.0 * biomass * lightFactor; // mg O2/L/h
    
    // Solunum O2 tüketimi (gece + gündüz)
    const R_O2 = 0.3 * biomass; // mg O2/L/h
    
    // Net değişim
    const dO2_dt = OTR + P_O2 - R_O2;
    
    return {
      dO2_dt,
      OTR,
      photosynthesis_O2: P_O2,
      respiration_O2: R_O2,
      O2_sat,
      saturation_percent: (O2_current / O2_sat) * 100
    };
  }

  /**
   * CO2 dengesi (Havalandırma - Fotosentez + Solunum)
   */
  calculateCO2Balance(state) {
    const {
      CO2_current = 10.0,      // mg/L
      temperature = 25,         // °C
      biomass = 1.0,           // g/L
      lightIntensity = 5000,   // lux
      aeration = 0.5,          // vvm
      hourOfDay = 12,          // 0-24
      pH = 7.2                 // pH
    } = state;
    
    // Doygunluk (atmosferden)
    const CO2_sat = this.calculateSaturationConcentration('CO2', temperature);
    const kLa_CO2 = this.calculateKLa('CO2', temperature, aeration);
    
    // Gaz transferi (CO2 stripping)
    const CTR = kLa_CO2 * (CO2_sat - CO2_current); // Negatif olabilir (çıkış)
    
    // Fotosentez CO2 tüketimi
    const isDay = hourOfDay >= 6 && hourOfDay <= 20;
    const lightFactor = isDay ? Math.min(1.0, lightIntensity / 10000) : 0;
    const P_CO2 = -1.65 * biomass * lightFactor; // mg CO2/L/h (negatif = tüketim)
    
    // Solunum CO2 üretimi
    const R_CO2 = 0.25 * biomass; // mg CO2/L/h
    
    // pH etkisi (yüksek pH'da CO2 limitasyonu)
    const pH_limitation = pH < 8.0 ? 1.0 : Math.exp(-(pH - 8.0));
    
    // Net değişim
    const dCO2_dt = CTR + P_CO2 * pH_limitation + R_CO2;
    
    return {
      dCO2_dt,
      CTR,
      photosynthesis_CO2: P_CO2 * pH_limitation,
      respiration_CO2: R_CO2,
      CO2_sat,
      pH_limitation
    };
  }

  /**
   * RQ (Respiratory Quotient) hesaplama
   * RQ = CO2 üretimi / O2 tüketimi
   */
  calculateRQ(CO2_production, O2_consumption) {
    if (O2_consumption <= 0) return 1.0;
    return CO2_production / O2_consumption;
  }

  /**
   * Kritik O2 seviyesi hesaplama (gece hipoksisi riski)
   */
  calculateCriticalO2(biomass, nightDuration_h = 10) {
    // Gece solunum
    const R_O2 = 0.3 * biomass; // mg O2/L/h
    
    // Minimum güvenli O2 (2.0 mg/L)
    const O2_min = 2.0;
    
    // Gerekli başlangıç O2
    const O2_critical = O2_min + (R_O2 * nightDuration_h);
    
    return {
      O2_critical,
      R_O2_night: R_O2 * nightDuration_h,
      O2_min,
      warning: O2_critical > 8.0 ? 'Yüksek yoğunluk - gece hipoksisi riski!' : 'Güvenli'
    };
  }

  /**
   * Optimum havalandırma önerisi
   */
  recommendAeration(O2_current, biomass, temperature) {
    const O2_sat = this.calculateSaturationConcentration('O2', temperature);
    const O2_target = O2_sat * 0.8; // %80 doygunluk hedefi
    
    // Gerekli OTR
    const R_O2 = 0.3 * biomass;
    const OTR_needed = R_O2 + (O2_target - O2_current) * 0.5; // mg/L/h
    
    // Gerekli kLa
    const kLa_needed = OTR_needed / (O2_sat - O2_target);
    
    // Gerekli aeration (vvm)
    const kLa_per_vvm = this.kLa_O2_standard * 2;
    const vvm_needed = kLa_needed / kLa_per_vvm;
    
    return {
      vvm_recommended: Math.max(0.1, Math.min(2.0, vvm_needed)),
      OTR_needed,
      kLa_needed,
      message: vvm_needed > 1.5 ? 'Yüksek havalandırma gerekli' : 'Normal havalandırma'
    };
  }

  /**
   * Durum raporu
   */
  getStatus(state) {
    const O2_balance = this.calculateO2Balance(state);
    const CO2_balance = this.calculateCO2Balance(state);
    const critical_O2 = this.calculateCriticalO2(state.biomass || 1.0);
    const RQ = this.calculateRQ(CO2_balance.respiration_CO2, O2_balance.respiration_O2);
    
    // Uyarılar
    const warnings = [];
    if (O2_balance.saturation_percent < 50) warnings.push('LOW_O2');
    if (O2_balance.dO2_dt < -1.0) warnings.push('O2_DECLINING');
    if (CO2_balance.pH_limitation < 0.5) warnings.push('CO2_LIMITATION');
    if (state.O2_current < critical_O2.O2_critical && state.hourOfDay >= 20) {
      warnings.push('NIGHT_HYPOXIA_RISK');
    }
    
    return {
      O2: {
        current: state.O2_current,
        saturation: O2_balance.O2_sat,
        saturationPercent: O2_balance.saturation_percent,
        dO2_dt: O2_balance.dO2_dt,
        OTR: O2_balance.OTR,
        photosynthesis: O2_balance.photosynthesis_O2,
        respiration: O2_balance.respiration_O2
      },
      CO2: {
        current: state.CO2_current,
        saturation: CO2_balance.CO2_sat,
        dCO2_dt: CO2_balance.dCO2_dt,
        CTR: CO2_balance.CTR,
        photosynthesis: CO2_balance.photosynthesis_CO2,
        respiration: CO2_balance.respiration_CO2,
        pH_limitation: CO2_balance.pH_limitation
      },
      RQ,
      critical_O2: critical_O2.O2_critical,
      warnings,
      recommendation: this.generateRecommendation(O2_balance, CO2_balance, warnings)
    };
  }

  /**
   * Öneri üretimi
   */
  generateRecommendation(O2_balance, CO2_balance, warnings) {
    if (warnings.includes('NIGHT_HYPOXIA_RISK')) {
      return 'GECEHİPOKSİSİ RİSKİ! Havalandırmayı artır veya biyokütleyi azalt.';
    }
    
    if (warnings.includes('LOW_O2')) {
      return 'O2 düşük! Havalandırmayı artır.';
    }
    
    if (warnings.includes('CO2_LIMITATION')) {
      return 'CO2 limitasyonu (yüksek pH). CO2 ekle veya pH düşür.';
    }
    
    if (O2_balance.saturation_percent > 95 && CO2_balance.dCO2_dt > 0) {
      return 'Gaz dengesi optimum. Mevcut koşulları sürdür.';
    }
    
    return 'Gaz transferi normal aralıkta.';
  }
}

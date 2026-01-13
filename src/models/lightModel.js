// lightModel.js - Spektral ışık modeli (Lambert-Beer + PAR)

export class LightModel {
  constructor() {
    // Spektral absorpsiyon katsayıları (m^-1 per g/L)
    this.absorptionCoeffs = {
      blue: 0.15,    // 400-500 nm - Karotenoidler
      red: 0.12,     // 600-700 nm - Klorofil a
      green: 0.05,   // 500-600 nm - Düşük absorpsiyon
      farRed: 0.08   // 700-750 nm - Klorofil a kuyruk
    };
    
    // Fotokimyasal verim (quantum yield)
    this.quantumYields = {
      blue: 0.08,
      red: 0.10,
      green: 0.04,
      farRed: 0.06
    };
    
    // PAR fraksiyonları (güneş ışığında)
    this.parFractions = {
      blue: 0.25,
      red: 0.30,
      green: 0.35,
      farRed: 0.10
    };
    
    // Fotosentez parametreleri
    this.Ik = 200;  // Saturasyon sabiti (μmol/m²/s)
    this.Im = 50;   // Yarı-saturasyon (μmol/m²/s)
    this.Ii = 500;  // Fotoinhibisyon başlangıcı (μmol/m²/s)
  }

  /**
   * Lambert-Beer ışık zayıflaması
   * I(z) = I0 * exp(-k * biomass * z)
   */
  calculateLightAttenuation(I0, biomass_gL, depth_cm, wavelengthBand = 'red') {
    const k = this.absorptionCoeffs[wavelengthBand];
    const depth_m = depth_cm / 100;
    
    // I(z) = I0 * exp(-k * X * z)
    const I_z = I0 * Math.exp(-k * biomass_gL * depth_m);
    
    return {
      surfaceLight: I0,
      bottomLight: I_z,
      attenuationFactor: I_z / I0,
      k_actual: k * biomass_gL
    };
  }

  /**
   * Ortalama ışık yoğunluğu (reaktör içinde)
   */
  calculateAverageLight(I0, biomass_gL, depth_cm, wavelengthBand = 'red') {
    const k = this.absorptionCoeffs[wavelengthBand];
    const depth_m = depth_cm / 100;
    const kX = k * biomass_gL;
    
    // Ortalama: I_avg = I0 * (1 - exp(-k*X*z)) / (k*X*z)
    if (kX * depth_m < 0.01) {
      // Taylor açılımı (kX*z çok küçükse)
      return I0 * (1 - 0.5 * kX * depth_m);
    }
    
    const I_avg = I0 * (1 - Math.exp(-kX * depth_m)) / (kX * depth_m);
    
    return {
      avgLight: I_avg,
      surfaceLight: I0,
      bottomLight: I0 * Math.exp(-kX * depth_m)
    };
  }

  /**
   * PAR (Photosynthetically Active Radiation) hesaplama
   * Lux → μmol/m²/s dönüşümü
   */
  convertLuxToPAR(lux) {
    // Ortalama dönüşüm: 1 μmol/m²/s ≈ 54 lux (white light)
    const conversionFactor = 54;
    return lux / conversionFactor;
  }

  /**
   * Spektral PAR dağılımı
   */
  calculateSpectralPAR(totalPAR) {
    return {
      blue: totalPAR * this.parFractions.blue,
      red: totalPAR * this.parFractions.red,
      green: totalPAR * this.parFractions.green,
      farRed: totalPAR * this.parFractions.farRed
    };
  }

  /**
   * Fotosentez hızı vs. ışık (Webb eğrisi)
   * P = Pmax * tanh(α * I / Pmax) - R
   */
  calculatePhotosynthesisRate(I, Pmax = 0.5, alpha = 0.01, R = 0.05) {
    // I: μmol/m²/s
    // Pmax: Maksimum fotosentez hızı (d^-1)
    // alpha: Foton kullanım verimi (d^-1 per μmol/m²/s)
    // R: Karanlık solunum (d^-1)
    
    const P_gross = Pmax * Math.tanh(alpha * I / Pmax);
    const P_net = P_gross - R;
    
    return {
      grossRate: P_gross,
      netRate: P_net,
      respiration: R,
      efficiency: P_gross / I // μmol CO2 per μmol photon
    };
  }

  /**
   * Işık limitasyon faktörü (Monod-tipi)
   */
  calculateLightLimitation(I) {
    // Steele modeli (fotoinhibisyon dahil)
    // f(I) = (I / Ik) * exp(1 - I / Ik)
    
    const f_light = (I / this.Ik) * Math.exp(1 - I / this.Ik);
    
    return Math.min(1.0, Math.max(0.0, f_light));
  }

  /**
   * Fotoinhibisyon kontrolü
   */
  calculatePhotoinhibition(I) {
    if (I < this.Ii) return 0.0;
    
    // Fotoinhibisyon faktörü
    const inhibition = (I - this.Ii) / (2 * this.Ii);
    
    return Math.min(1.0, inhibition);
  }

  /**
   * Günlük ışık integrali (DLI - Daily Light Integral)
   */
  calculateDLI(hourlyPAR) {
    // DLI = Σ PAR * 3600 / 1e6 (mol/m²/d)
    const sum = hourlyPAR.reduce((acc, val) => acc + val, 0);
    return sum * 3600 / 1e6;
  }

  /**
   * Optimum ışık önerisi
   */
  recommendOptimalLight(biomass_gL, depth_cm) {
    const k_red = this.absorptionCoeffs.red;
    const kX = k_red * biomass_gL;
    const depth_m = depth_cm / 100;
    
    // Hedef: Ortalama ışık = Im (yarı-saturasyon)
    // I_avg = I0 * (1 - exp(-kXz)) / (kXz) = Im
    // I0 ≈ Im * kXz / (1 - exp(-kXz))
    
    const kXz = kX * depth_m;
    let I0_optimal;
    
    if (kXz < 0.01) {
      I0_optimal = this.Im / (1 - 0.5 * kXz);
    } else {
      I0_optimal = this.Im * kXz / (1 - Math.exp(-kXz));
    }
    
    // Lux'a çevir
    const lux_optimal = I0_optimal * 54;
    
    return {
      optimalPAR: I0_optimal,
      optimalLux: lux_optimal,
      attenuationDepth: 1 / (kX + 1e-10),
      message: biomass_gL > 2.0 ? 'Yüksek yoğunluk - ışık artır' : 'Normal ışık seviyesi'
    };
  }

  /**
   * Spektral verim hesaplama
   */
  calculateSpectralEfficiency(spectralPAR, biomass_gL) {
    let totalEfficiency = 0;
    let totalPAR = 0;
    
    for (const [band, PAR] of Object.entries(spectralPAR)) {
      const QY = this.quantumYields[band];
      totalEfficiency += PAR * QY;
      totalPAR += PAR;
    }
    
    return {
      avgEfficiency: totalEfficiency / (totalPAR + 1e-10),
      bestBand: 'red', // Klorofil a için kırmızı en iyi
      biomassEffect: biomass_gL > 1.0 ? 'Işık sınırlanıyor' : 'Işık yeterli'
    };
  }

  /**
   * Durum raporu
   */
  getStatus(lightIntensity_lux, biomass_gL, depth_cm) {
    const PAR = this.convertLuxToPAR(lightIntensity_lux);
    const avgLight = this.calculateAverageLight(PAR, biomass_gL, depth_cm, 'red');
    const limitation = this.calculateLightLimitation(avgLight.avgLight);
    const photoinhibition = this.calculatePhotoinhibition(PAR);
    const optimal = this.recommendOptimalLight(biomass_gL, depth_cm);
    
    // Uyarılar
    const warnings = [];
    if (limitation < 0.5) warnings.push('LIGHT_LIMITATION');
    if (photoinhibition > 0.3) warnings.push('PHOTOINHIBITION');
    if (avgLight.bottomLight < 10) warnings.push('DARK_BOTTOM');
    if (biomass_gL > 3.0 && PAR < 200) warnings.push('HIGH_DENSITY_LOW_LIGHT');
    
    return {
      surfacePAR: PAR,
      averagePAR: avgLight.avgLight,
      bottomPAR: avgLight.bottomLight,
      lightLimitation: limitation,
      photoinhibition,
      optimalPAR: optimal.optimalPAR,
      warnings,
      recommendation: this.generateRecommendation(PAR, limitation, photoinhibition)
    };
  }

  /**
   * Öneri üretimi
   */
  generateRecommendation(PAR, limitation, photoinhibition) {
    if (photoinhibition > 0.3) {
      return 'Işık çok yüksek - fotoinhibisyon riski! Işığı azalt veya gölgelendirme kullan.';
    }
    
    if (limitation < 0.3) {
      return 'Işık ciddi şekilde yetersiz! Işık yoğunluğunu artır veya reaktör derinliğini azalt.';
    }
    
    if (limitation < 0.6) {
      return 'Işık limitasyonu var. Işık yoğunluğunu artır.';
    }
    
    return 'Işık seviyesi optimum aralıkta.';
  }
}

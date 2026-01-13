// calibrationService.js - OD → Biomass kalibrasyon sistemi

export class CalibrationService {
  constructor() {
    // Kalibrasyon verileri (OD → biomass)
    this.calibrationData = {
      OD600: [],
      OD680: [],
      OD750: []
    };
    
    // Kalibrasyon modelleri
    this.models = {
      OD600: null,
      OD680: null,
      OD750: null
    };
    
    // Model parametreleri (linear: y = a*x + b)
    this.params = {
      OD600: { a: 0.35, b: 0.0, r2: 0 },
      OD680: { a: 0.38, b: 0.0, r2: 0 },
      OD750: { a: 0.40, b: 0.0, r2: 0 }
    };
    
    // Kalibrasyon kalitesi
    this.quality = {
      OD600: 'POOR',
      OD680: 'POOR',
      OD750: 'POOR'
    };
  }

  /**
   * Kalibrasyon noktası ekle
   */
  addCalibrationPoint(wavelength, OD_value, biomass_gL) {
    const key = `OD${wavelength}`;
    
    if (!this.calibrationData[key]) {
      this.calibrationData[key] = [];
    }
    
    // Yeni nokta ekle
    this.calibrationData[key].push({
      OD: OD_value,
      biomass: biomass_gL,
      timestamp: new Date().toISOString()
    });
    
    // Model güncelle
    this.updateModel(key);
    
    return {
      success: true,
      dataPoints: this.calibrationData[key].length,
      quality: this.quality[key]
    };
  }

  /**
   * Linear regression (OLS)
   */
  linearRegression(points) {
    const n = points.length;
    
    if (n < 3) {
      return {
        a: 0.35,
        b: 0.0,
        r2: 0,
        valid: false
      };
    }
    
    // Σx, Σy, Σxy, Σx²
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    points.forEach(p => {
      const x = p.OD;
      const y = p.biomass;
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });
    
    // y = a*x + b
    const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - a * sumX) / n;
    
    // R² hesaplama
    const meanY = sumY / n;
    let SS_tot = 0, SS_res = 0;
    
    points.forEach(p => {
      const y_pred = a * p.OD + b;
      SS_tot += Math.pow(p.biomass - meanY, 2);
      SS_res += Math.pow(p.biomass - y_pred, 2);
    });
    
    const r2 = SS_tot > 0 ? 1 - (SS_res / SS_tot) : 0;
    
    return {
      a,
      b,
      r2,
      valid: r2 > 0.8 && n >= 5
    };
  }

  /**
   * Model güncelle
   */
  updateModel(wavelengthKey) {
    const points = this.calibrationData[wavelengthKey];
    
    // Linear regression
    const result = this.linearRegression(points);
    
    // Parametreleri güncelle
    this.params[wavelengthKey] = {
      a: result.a,
      b: result.b,
      r2: result.r2
    };
    
    // Kalite belirleme
    if (result.r2 > 0.95 && points.length >= 10) {
      this.quality[wavelengthKey] = 'EXCELLENT';
    } else if (result.r2 > 0.9 && points.length >= 5) {
      this.quality[wavelengthKey] = 'GOOD';
    } else if (result.r2 > 0.8 && points.length >= 3) {
      this.quality[wavelengthKey] = 'FAIR';
    } else {
      this.quality[wavelengthKey] = 'POOR';
    }
  }

  /**
   * OD → Biomass dönüşümü
   */
  odToBiomass(wavelength, OD_value) {
    const key = `OD${wavelength}`;
    const params = this.params[key];
    
    if (!params) {
      return {
        biomass: OD_value * 0.35, // Default
        confidence: 'LOW',
        source: 'DEFAULT'
      };
    }
    
    const biomass = params.a * OD_value + params.b;
    
    return {
      biomass: Math.max(0, biomass),
      confidence: this.quality[key],
      r2: params.r2,
      source: 'CALIBRATED'
    };
  }

  /**
   * Biomass → OD tahmini (ters dönüşüm)
   */
  biomassToOD(wavelength, biomass_gL) {
    const key = `OD${wavelength}`;
    const params = this.params[key];
    
    if (!params || params.a === 0) {
      return {
        OD: biomass_gL / 0.35,
        confidence: 'LOW'
      };
    }
    
    const OD = (biomass_gL - params.b) / params.a;
    
    return {
      OD: Math.max(0, OD),
      confidence: this.quality[key]
    };
  }

  /**
   * Kalibrasyon kalitesi raporu
   */
  getQualityReport() {
    const report = {};
    
    for (const [key, quality] of Object.entries(this.quality)) {
      const params = this.params[key];
      const dataPoints = this.calibrationData[key].length;
      
      report[key] = {
        quality,
        dataPoints,
        r2: params.r2,
        equation: `Biomass = ${params.a.toFixed(3)} × OD + ${params.b.toFixed(3)}`,
        recommendation: this.getRecommendation(quality, dataPoints)
      };
    }
    
    return report;
  }

  /**
   * Öneri üretimi
   */
  getRecommendation(quality, dataPoints) {
    if (quality === 'EXCELLENT') {
      return 'Kalibrasyon mükemmel. Güvenle kullanabilirsiniz.';
    }
    
    if (quality === 'GOOD') {
      return 'Kalibrasyon iyi. Daha fazla veri noktası ekleyebilirsiniz.';
    }
    
    if (quality === 'FAIR') {
      return 'Kalibrasyon kabul edilebilir. En az 5 veri noktası toplayın.';
    }
    
    if (dataPoints < 3) {
      return `Yetersiz veri! ${3 - dataPoints} veri noktası daha gerekli.`;
    }
    
    return 'Kalibrasyon zayıf. Veri kalitesini kontrol edin (outliers).';
  }

  /**
   * Outlier tespiti (IQR metodu)
   */
  detectOutliers(wavelengthKey) {
    const points = this.calibrationData[wavelengthKey];
    
    if (points.length < 4) {
      return [];
    }
    
    // Residuals hesapla
    const params = this.params[wavelengthKey];
    const residuals = points.map((p, idx) => {
      const y_pred = params.a * p.OD + params.b;
      return {
        index: idx,
        residual: Math.abs(p.biomass - y_pred),
        OD: p.OD,
        biomass: p.biomass
      };
    });
    
    // IQR hesaplama
    const sorted = residuals.map(r => r.residual).sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const threshold = q3 + 1.5 * iqr;
    
    // Outliers
    const outliers = residuals.filter(r => r.residual > threshold);
    
    return outliers;
  }

  /**
   * Outlier temizleme
   */
  removeOutliers(wavelengthKey) {
    const outliers = this.detectOutliers(wavelengthKey);
    
    if (outliers.length === 0) {
      return {
        success: true,
        removed: 0
      };
    }
    
    // Ters sırada sil (index'ler kaymaz)
    outliers.sort((a, b) => b.index - a.index);
    
    outliers.forEach(outlier => {
      this.calibrationData[wavelengthKey].splice(outlier.index, 1);
    });
    
    // Model güncelle
    this.updateModel(wavelengthKey);
    
    return {
      success: true,
      removed: outliers.length,
      outliers: outliers.map(o => ({ OD: o.OD, biomass: o.biomass }))
    };
  }

  /**
   * Kalibrasyon sıfırla
   */
  resetCalibration(wavelengthKey) {
    if (wavelengthKey) {
      this.calibrationData[wavelengthKey] = [];
      this.params[wavelengthKey] = { a: 0.35, b: 0.0, r2: 0 };
      this.quality[wavelengthKey] = 'POOR';
    } else {
      // Tümünü sıfırla
      this.calibrationData = {
        OD600: [],
        OD680: [],
        OD750: []
      };
      
      this.params = {
        OD600: { a: 0.35, b: 0.0, r2: 0 },
        OD680: { a: 0.38, b: 0.0, r2: 0 },
        OD750: { a: 0.40, b: 0.0, r2: 0 }
      };
      
      this.quality = {
        OD600: 'POOR',
        OD680: 'POOR',
        OD750: 'POOR'
      };
    }
    
    return {
      success: true
    };
  }

  /**
   * Export kalibrasyon
   */
  export() {
    return {
      calibrationData: this.calibrationData,
      params: this.params,
      quality: this.quality,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import kalibrasyon
   */
  import(data) {
    if (data.calibrationData) {
      this.calibrationData = data.calibrationData;
    }
    
    if (data.params) {
      this.params = data.params;
    }
    
    if (data.quality) {
      this.quality = data.quality;
    }
    
    return {
      success: true
    };
  }
}

// Singleton export
const calibrationService = new CalibrationService();
export default calibrationService;

/**
 * Kalibrasyon Eğrisi Yönetim Sistemi
 * 
 * Her analiz metodu için kalibrasyon eğrilerini saklar, yönetir ve uygular.
 * LocalStorage tabanlı veri saklama.
 */

// Varsayılan kalibrasyon eğrileri (fabrika ayarları)
const DEFAULT_CALIBRATIONS = {
  phosphate_880nm: {
    name: "Fosfor (PO4-P) - Molybdenum Blue 880nm",
    method: "phosphate_880nm",
    wavelength: 880,
    unit: "mg/L PO4-P",
    equation: "y = 15000x + 0.005", // y = absorbance, x = concentration
    slope: 15000,
    intercept: 0.005,
    rSquared: 0.998,
    range: { min: 0.1, max: 10 },
    standards: [
      { concentration: 0.1, absorbance: 0.015 },
      { concentration: 0.5, absorbance: 0.075 },
      { concentration: 1.0, absorbance: 0.150 },
      { concentration: 2.0, absorbance: 0.300 },
      { concentration: 5.0, absorbance: 0.750 },
      { concentration: 10.0, absorbance: 1.500 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "Antimony-free method, 20 min reaction time"
  },
  
  nitrogen_nessler_425nm: {
    name: "Azot (NH4-N) - Nessler 425nm",
    method: "nitrogen_nessler_425nm",
    wavelength: 425,
    unit: "mg/L NH4-N",
    equation: "y = 20000x + 0.003",
    slope: 20000,
    intercept: 0.003,
    rSquared: 0.997,
    range: { min: 0.1, max: 5 },
    standards: [
      { concentration: 0.1, absorbance: 0.020 },
      { concentration: 0.5, absorbance: 0.100 },
      { concentration: 1.0, absorbance: 0.200 },
      { concentration: 2.0, absorbance: 0.400 },
      { concentration: 5.0, absorbance: 1.000 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "10 min reaction time, toxic reagent - use hood"
  },
  
  nitrogen_salicylate_655nm: {
    name: "Azot (NH4-N) - Salicylate 655nm",
    method: "nitrogen_salicylate_655nm",
    wavelength: 655,
    unit: "mg/L NH4-N",
    equation: "y = 25000x + 0.002",
    slope: 25000,
    intercept: 0.002,
    rSquared: 0.999,
    range: { min: 0.1, max: 5 },
    standards: [
      { concentration: 0.1, absorbance: 0.025 },
      { concentration: 0.5, absorbance: 0.125 },
      { concentration: 1.0, absorbance: 0.250 },
      { concentration: 2.0, absorbance: 0.500 },
      { concentration: 5.0, absorbance: 1.250 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "20 min reaction time, safer alternative to Nessler"
  },
  
  alkalinity_bromocresol_630nm: {
    name: "Alkalinite - Bromocresol Green 630nm",
    method: "alkalinity_bromocresol_630nm",
    wavelength: 630,
    unit: "mg/L CaCO3",
    equation: "y = 0.0025x + 0.01",
    slope: 0.0025,
    intercept: 0.01,
    rSquared: 0.996,
    range: { min: 10, max: 500 },
    standards: [
      { concentration: 10, absorbance: 0.035 },
      { concentration: 50, absorbance: 0.135 },
      { concentration: 100, absorbance: 0.260 },
      { concentration: 200, absorbance: 0.510 },
      { concentration: 500, absorbance: 1.260 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "pH indicator method, read immediately"
  },
  
  hardness_edta_520nm: {
    name: "Sertlik (Toplam) - EDTA Titrimetrik/Calmagite 520nm",
    method: "hardness_edta_520nm",
    wavelength: 520,
    unit: "mg/L CaCO3",
    equation: "y = 0.002x + 0.015",
    slope: 0.002,
    intercept: 0.015,
    rSquared: 0.995,
    range: { min: 10, max: 500 },
    standards: [
      { concentration: 10, absorbance: 0.035 },
      { concentration: 50, absorbance: 0.115 },
      { concentration: 100, absorbance: 0.215 },
      { concentration: 200, absorbance: 0.415 },
      { concentration: 500, absorbance: 1.015 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "Calmagite indicator, pH 10 buffer required"
  },
  
  urea_diacetyl_520nm: {
    name: "Üre - Diacetyl Monoxime 520nm",
    method: "urea_diacetyl_520nm",
    wavelength: 520,
    unit: "mg/L Urea",
    equation: "y = 0.025x + 0.005",
    slope: 0.025,
    intercept: 0.005,
    rSquared: 0.997,
    range: { min: 1, max: 100 },
    standards: [
      { concentration: 1, absorbance: 0.030 },
      { concentration: 5, absorbance: 0.130 },
      { concentration: 10, absorbance: 0.255 },
      { concentration: 25, absorbance: 0.630 },
      { concentration: 50, absorbance: 1.255 },
      { concentration: 100, absorbance: 2.505 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "Heating required (95°C, 10 min), corrosive reagents"
  },
  
  total_ammonia_655nm: {
    name: "Toplam Amonyak Azotu (TAN) - Phenol-Hypochlorite 655nm",
    method: "total_ammonia_655nm",
    wavelength: 655,
    unit: "mg/L TAN",
    equation: "y = 22000x + 0.004",
    slope: 22000,
    intercept: 0.004,
    rSquared: 0.998,
    range: { min: 0.1, max: 5 },
    standards: [
      { concentration: 0.1, absorbance: 0.022 },
      { concentration: 0.5, absorbance: 0.110 },
      { concentration: 1.0, absorbance: 0.220 },
      { concentration: 2.0, absorbance: 0.440 },
      { concentration: 5.0, absorbance: 1.100 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "Indophenol blue method, 60 min reaction time"
  },
  
  total_phosphorus_880nm: {
    name: "Toplam Fosfor (TP) - Persulfate Digestion + Molybdenum Blue 880nm",
    method: "total_phosphorus_880nm",
    wavelength: 880,
    unit: "mg/L TP",
    equation: "y = 14500x + 0.006",
    slope: 14500,
    intercept: 0.006,
    rSquared: 0.997,
    range: { min: 0.1, max: 10 },
    standards: [
      { concentration: 0.1, absorbance: 0.015 },
      { concentration: 0.5, absorbance: 0.073 },
      { concentration: 1.0, absorbance: 0.145 },
      { concentration: 2.0, absorbance: 0.290 },
      { concentration: 5.0, absorbance: 0.725 },
      { concentration: 10.0, absorbance: 1.450 }
    ],
    createdDate: "2025-01-01",
    lastUsed: null,
    notes: "Requires digestion: 121°C autoclave 30 min OR 100°C heating block 90 min"
  }
};

/**
 * LocalStorage'dan tüm kalibrasyonları yükle
 */
export function loadCalibrations() {
  try {
    const stored = localStorage.getItem('chlorella_calibrations');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Calibration load error:', error);
  }
  
  // İlk kullanım - varsayılanları yükle
  saveCalibrations(DEFAULT_CALIBRATIONS);
  return DEFAULT_CALIBRATIONS;
}

/**
 * Tüm kalibrasyonları kaydet
 */
export function saveCalibrations(calibrations) {
  try {
    localStorage.setItem('chlorella_calibrations', JSON.stringify(calibrations));
    return true;
  } catch (error) {
    console.error('Calibration save error:', error);
    return false;
  }
}

/**
 * Yeni kalibrasyon eğrisi ekle
 */
export function addCalibration(calibration) {
  const calibrations = loadCalibrations();
  
  // Benzersiz ID oluştur
  const methodId = calibration.method || `custom_${Date.now()}`;
  
  // Varsayılan değerler ekle
  const newCalibration = {
    ...calibration,
    method: methodId,
    createdDate: new Date().toISOString().split('T')[0],
    lastUsed: null
  };
  
  calibrations[methodId] = newCalibration;
  saveCalibrations(calibrations);
  
  return methodId;
}

/**
 * Kalibrasyon eğrisini güncelle
 */
export function updateCalibration(methodId, updates) {
  const calibrations = loadCalibrations();
  
  if (!calibrations[methodId]) {
    throw new Error(`Calibration not found: ${methodId}`);
  }
  
  calibrations[methodId] = {
    ...calibrations[methodId],
    ...updates,
    method: methodId // ID değişmesin
  };
  
  saveCalibrations(calibrations);
  return calibrations[methodId];
}

/**
 * Kalibrasyon eğrisini sil
 */
export function deleteCalibration(methodId) {
  const calibrations = loadCalibrations();
  
  // Varsayılan kalibrasyonlar silinemez
  if (DEFAULT_CALIBRATIONS[methodId]) {
    throw new Error('Varsayılan kalibrasyonlar silinemez! Bunun yerine "Fabrika ayarlarına sıfırla" kullanın.');
  }
  
  if (!calibrations[methodId]) {
    throw new Error(`Calibration not found: ${methodId}`);
  }
  
  delete calibrations[methodId];
  saveCalibrations(calibrations);
  
  return true;
}

/**
 * Kalibrasyon eğrisini fabrika ayarlarına sıfırla
 */
export function resetCalibration(methodId) {
  const calibrations = loadCalibrations();
  
  if (!DEFAULT_CALIBRATIONS[methodId]) {
    throw new Error(`Varsayılan kalibrasyon bulunamadı: ${methodId}`);
  }
  
  calibrations[methodId] = { ...DEFAULT_CALIBRATIONS[methodId] };
  saveCalibrations(calibrations);
  
  return calibrations[methodId];
}

/**
 * Tüm kalibrasyonları fabrika ayarlarına sıfırla
 */
export function resetAllCalibrations() {
  saveCalibrations({ ...DEFAULT_CALIBRATIONS });
  return DEFAULT_CALIBRATIONS;
}

/**
 * Kalibrasyon eğrisinden konsantrasyon hesapla
 * Beer-Lambert yasası: A = ε × c × l
 * Lineer regresyon: A = slope × c + intercept
 * Tersi: c = (A - intercept) / slope
 */
export function calculateConcentrationFromCalibration(methodId, absorbance) {
  const calibrations = loadCalibrations();
  const calibration = calibrations[methodId];
  
  if (!calibration) {
    throw new Error(`Calibration not found: ${methodId}`);
  }
  
  // Konsantrasyon hesapla
  const concentration = (absorbance - calibration.intercept) / calibration.slope;
  
  // Aralık kontrolü
  const { min, max } = calibration.range;
  let warning = null;
  
  if (concentration < min) {
    warning = `⚠️ Konsantrasyon kalibrasyon aralığının altında (< ${min} ${calibration.unit})`;
  } else if (concentration > max) {
    warning = `⚠️ Konsantrasyon kalibrasyon aralığının üstünde (> ${max} ${calibration.unit})`;
  }
  
  // Son kullanım tarihini güncelle
  updateCalibration(methodId, { lastUsed: new Date().toISOString() });
  
  return {
    concentration: Math.max(0, concentration), // Negatif değer önleme
    unit: calibration.unit,
    method: calibration.name,
    calibration: {
      equation: calibration.equation,
      rSquared: calibration.rSquared,
      range: calibration.range
    },
    warning,
    withinRange: concentration >= min && concentration <= max
  };
}

/**
 * Standart noktalardan lineer regresyon hesapla
 */
export function calculateLinearRegression(standards) {
  const n = standards.length;
  
  if (n < 2) {
    throw new Error('En az 2 standart nokta gerekli');
  }
  
  // x = concentration, y = absorbance
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  
  standards.forEach(point => {
    sumX += point.concentration;
    sumY += point.absorbance;
    sumXY += point.concentration * point.absorbance;
    sumXX += point.concentration * point.concentration;
    sumYY += point.absorbance * point.absorbance;
  });
  
  // Slope (eğim)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Intercept (kesim noktası)
  const intercept = (sumY - slope * sumX) / n;
  
  // R² (determinasyon katsayısı)
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  
  standards.forEach(point => {
    const yPred = slope * point.concentration + intercept;
    ssRes += Math.pow(point.absorbance - yPred, 2);
    ssTot += Math.pow(point.absorbance - yMean, 2);
  });
  
  const rSquared = 1 - (ssRes / ssTot);
  
  return {
    slope,
    intercept,
    rSquared,
    equation: `y = ${slope.toFixed(2)}x ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(4)}`
  };
}

/**
 * Kalibrasyon kalitesini değerlendir
 */
export function evaluateCalibrationQuality(rSquared, standardCount) {
  let quality = 'unknown';
  let recommendation = '';
  
  if (rSquared >= 0.999) {
    quality = 'excellent';
    recommendation = '✅ Mükemmel kalibrasyon! Güvenle kullanabilirsiniz.';
  } else if (rSquared >= 0.995) {
    quality = 'good';
    recommendation = '✓ İyi kalibrasyon. Kabul edilebilir.';
  } else if (rSquared >= 0.990) {
    quality = 'acceptable';
    recommendation = '⚠️ Kabul edilebilir ama daha iyi olabilir. Standart sayısını artırın.';
  } else {
    quality = 'poor';
    recommendation = '❌ Zayıf kalibrasyon! Standartları kontrol edin ve tekrar ölçün.';
  }
  
  if (standardCount < 5) {
    recommendation += ` Not: En az 5 standart nokta önerilir (şu an: ${standardCount}).`;
  }
  
  return { quality, recommendation, rSquared };
}

export default {
  loadCalibrations,
  saveCalibrations,
  addCalibration,
  updateCalibration,
  deleteCalibration,
  resetCalibration,
  resetAllCalibrations,
  calculateConcentrationFromCalibration,
  calculateLinearRegression,
  evaluateCalibrationQuality,
  DEFAULT_CALIBRATIONS
};

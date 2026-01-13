/**
 * STOKİYOMETRİ HESAPLAMA MOTORU
 * 
 * Amaç: Scale-up sırasında tüm elementlerin ve tuzların artıklarını hesapla
 * Her element/tuz için "eski sudan ne kaldı + ne eklenmeli" analizi
 */

import { CHEMICALS, ELEMENT_WEIGHTS, calculateRecipeComposition, analyzeNPRatio } from '../data/chemicalDatabase.js';

// ==================== KÜTLE DENGESİ HESAPLAYICILARI ====================

/**
 * Bir tanktan başka tanka geçişte artıkları hesaplar
 * @param {Object} params - {oldVolume, newVolume, oldTDS, measurements}
 * @param {Object} recipe - Kullanılan besiyeri tarifi
 * @returns {Object} Artık analizi
 */
export function calculateResidue(params, recipe) {
  const { oldVolume, newVolume, oldTDS, measurements = {} } = params;
  
  // İlk formülasyonun toplam kompozisyonunu hesapla
  const originalComposition = calculateRecipeComposition(recipe);
  
  // Eski tankta ne vardı (toplam yük)
  const oldLoad = {
    volume: oldVolume,
    tds: oldTDS,
    totalSalts: oldVolume * oldTDS  // mg
  };

  // Tüketim analizi (eğer ölçüm varsa)
  const consumption = {
    N: measurements.TAN !== undefined ? 
       (originalComposition.elements.N - measurements.TAN * oldVolume) : 0,
    P: measurements.TP !== undefined ?
       (originalComposition.elements.P - measurements.TP * oldVolume) : 0
  };

  // Artıklar (eski tankta kalanlar)
  const residuals = {
    // Ana elementler
    N: measurements.TAN ? measurements.TAN * oldVolume : originalComposition.elements.N * 0.3,  // Tahmin: %70 tüketildi
    P: measurements.TP ? measurements.TP * oldVolume : originalComposition.elements.P * 0.5,    // %50 tüketildi
    K: originalComposition.elements.K * 0.7,  // Potasyum nadiren tükenir
    Mg: originalComposition.elements.Mg * 0.8,
    Ca: originalComposition.elements.Ca * 0.85,
    S: originalComposition.elements.S * 0.75,
    Fe: originalComposition.elements.Fe ? originalComposition.elements.Fe * 0.6 : 0,
    
    // Mikro elementler (genelde artık kalır)
    B: originalComposition.elements.B ? originalComposition.elements.B * 0.9 : 0,
    Zn: originalComposition.elements.Zn ? originalComposition.elements.Zn * 0.85 : 0,
    Mn: originalComposition.elements.Mn ? originalComposition.elements.Mn * 0.85 : 0,
    Cu: originalComposition.elements.Cu ? originalComposition.elements.Cu * 0.9 : 0,
    Mo: originalComposition.elements.Mo ? originalComposition.elements.Mo * 0.95 : 0
  };

  // İyon/Tuz artıkları
  const ionResiduals = {
    SO4: (originalComposition.elements.S * 0.75 / 32.07) * 96.06,  // Sülfat (SO4^2-)
    Cl: (originalComposition.elements.Cl || 0) * 0.95,              // Klorür (nadiren tükenir)
    NO3: measurements.nitrate ? measurements.nitrate * oldVolume : 0,
    PO4: measurements.phosphate ? measurements.phosphate * oldVolume : residuals.P * (94.97 / 30.97),
    CO3: (originalComposition.elements.C || 0) * 0.4  // Karbonat (CO2 olarak kaybolur)
  };

  return {
    oldVolume,
    newVolume,
    addedWater: newVolume - oldVolume,
    elementResiduals: residuals,
    ionResiduals: ionResiduals,
    consumption: consumption,
    totalSaltLoad: oldLoad.totalSalts,
    warning: checkAccumulationRisk(residuals, oldVolume)
  };
}

/**
 * Artık birikim riski kontrolü
 */
function checkAccumulationRisk(residuals, volume) {
  const warnings = [];
  
  // Fosfor birikimi (en kritik)
  const P_concentration = residuals.P / volume;  // mg/L
  if (P_concentration > 10) {
    warnings.push(`⚠️ FOSFOR BİRİKİMİ: ${P_concentration.toFixed(1)} mg/L (>10 mg/L)`);
  }
  
  // Sülfat birikimi
  const S_concentration = residuals.S / volume;
  if (S_concentration > 50) {
    warnings.push(`⚠️ SÜLFAT BİRİKİMİ: ${S_concentration.toFixed(1)} mg/L (>50 mg/L)`);
  }
  
  // Klorür birikimi
  const Cl = residuals.Cl || 0;
  const Cl_concentration = Cl / volume;
  if (Cl_concentration > 30) {
    warnings.push(`⚠️ KLORüR BİRİKİMİ: ${Cl_concentration.toFixed(1)} mg/L (>30 mg/L)`);
  }
  
  // Potasyum fazlalığı
  const K_concentration = residuals.K / volume;
  if (K_concentration > 100) {
    warnings.push(`⚠️ POTASYUM FAZLA: ${K_concentration.toFixed(1)} mg/L (>100 mg/L)`);
  }

  return warnings.length > 0 ? warnings : ["✅ Artık birikimi normal seviyede"];
}

/**
 * Scale-up için gerekli besin miktarını hesaplar
 * AKILLI: Artıkları hesaba katarak sadece eksiği tamamlar
 * 
 * @param {Object} params - {oldVolume, newVolume, oldTDS, targetTDS, measurements}
 * @param {Object} recipe - Standart besiyeri tarifi
 * @param {string} mode - "AUTO", "MANUAL", "HYBRID"
 * @returns {Object} Eklenecek miktarlar
 */
export function calculateScaleUpNutrients(params, recipe, mode = "AUTO") {
  const { oldVolume, newVolume, targetTDS = 600, measurements = {} } = params;
  
  // Artık analizi yap
  const residueAnalysis = calculateResidue(params, recipe);
  
  // Hedef kompozisyon (taze besiyeri için)
  const targetComposition = calculateRecipeComposition(recipe);
  
  // Yeni tankta olması gereken toplam yük
  const requiredLoad = {
    N: (targetTDS * 0.2) * newVolume,  // Azot genelde TDS'nin %20'si
    P: (targetTDS * 0.08) * newVolume, // Fosfor ~%8
    K: (targetTDS * 0.12) * newVolume,
    Mg: (targetTDS * 0.015) * newVolume,
    Ca: (targetTDS * 0.01) * newVolume,
    S: (targetTDS * 0.015) * newVolume
  };

  // Eksik miktar = Hedef - Mevcut
  const deficit = {};
  for (const element in requiredLoad) {
    deficit[element] = Math.max(0, requiredLoad[element] - residueAnalysis.elementResiduals[element]);
  }

  // Kimyasal dozajları hesapla
  const dosing = calculateChemicalDosing(deficit, recipe);

  // Mod'a göre öneri oluştur
  let recommendation = {};
  if (mode === "AUTO") {
    recommendation = {
      mode: "Otomatik",
      action: "Sadece eksik elementler için besin ekle",
      chemicals: dosing.chemicals,
      savings: calculateSavings(dosing, targetComposition)
    };
  } else if (mode === "MANUAL") {
    recommendation = {
      mode: "Manuel",
      action: "Kullanıcı seçimi bekleniyor",
      suggestions: dosing.chemicals,
      fullDose: targetComposition
    };
  } else {  // HYBRID
    recommendation = {
      mode: "Hibrit",
      action: "Öneri sunuluyor, onay bekleniyor",
      suggestion: dosing.chemicals,
      alternative: "Tam doz ekle (artıkları göz ardı et)",
      warning: residueAnalysis.warning
    };
  }

  return {
    scaleUpInfo: {
      oldVolume,
      newVolume,
      addedWater: newVolume - oldVolume,
      waterPercentage: ((newVolume - oldVolume) / newVolume * 100).toFixed(1) + "%"
    },
    residueAnalysis,
    deficit,
    dosing,
    recommendation,
    npRatio: analyzeNPRatio({ elements: deficit })
  };
}

/**
 * Eksik elementler için kimyasal dozajı hesaplar
 */
function calculateChemicalDosing(deficit, originalRecipe) {
  const chemicals = [];
  
  // Azot ihtiyacı
  if (deficit.N > 0) {
    // Üre tercih et (en ekonomik)
    const ureaNeeded = deficit.N / 0.466;  // Üre %46.6 N
    chemicals.push({
      name: "Üre",
      amount: ureaNeeded,
      unit: "g",
      provides: { N: deficit.N },
      reason: "Azot eksikliği"
    });
  }

  // Fosfor ihtiyacı
  if (deficit.P > 0) {
    // MKP veya MAP kullan
    const mkpNeeded = deficit.P / 0.228;  // MKP %22.8 P
    chemicals.push({
      name: "MKP",
      amount: mkpNeeded,
      unit: "g",
      provides: { P: deficit.P, K: mkpNeeded * 0.287 },
      reason: "Fosfor eksikliği",
      note: "pH düşürücü etkisi var"
    });
  }

  // Magnezyum ihtiyacı
  if (deficit.Mg > 0) {
    const mgso4Needed = deficit.Mg / 0.099;  // MgSO4·7H2O %9.9 Mg
    chemicals.push({
      name: "Magnezyum Sülfat",
      amount: mgso4Needed,
      unit: "g",
      provides: { Mg: deficit.Mg, S: mgso4Needed * 0.130 },
      reason: "Magnezyum eksikliği"
    });
  }

  // Kalsiyum ihtiyacı
  if (deficit.Ca > 0) {
    const cacl2Needed = deficit.Ca / 0.273;  // CaCl2·2H2O %27.3 Ca
    chemicals.push({
      name: "Kalsiyum Klorür",
      amount: cacl2Needed,
      unit: "g",
      provides: { Ca: deficit.Ca, Cl: cacl2Needed * 0.482 },
      reason: "Kalsiyum eksikliği",
      warning: "Ayrı stokta ekle (çökelti riski)"
    });
  }

  return {
    chemicals,
    totalMass: chemicals.reduce((sum, c) => sum + c.amount, 0),
    costEstimate: estimateCost(chemicals)
  };
}

/**
 * Tasarruf hesaplama
 */
function calculateSavings(smartDosing, fullDosing) {
  const smartCost = smartDosing.costEstimate;
  const fullCost = estimateCost(fullDosing);
  
  return {
    smartCost: smartCost.toFixed(2) + " TL",
    fullCost: fullCost.toFixed(2) + " TL",
    savings: (fullCost - smartCost).toFixed(2) + " TL",
    savingsPercent: ((fullCost - smartCost) / fullCost * 100).toFixed(1) + "%"
  };
}

/**
 * Maliyet tahmini
 */
function estimateCost(chemicals) {
  let total = 0;
  
  if (Array.isArray(chemicals)) {
    chemicals.forEach(chem => {
      const chemData = CHEMICALS[chem.name];
      if (chemData && chemData.prices) {
        const price = chemData.prices.agricultural || chemData.prices.laboratory;
        total += (chem.amount / 1000) * price;  // g → kg
      }
    });
  } else if (chemicals.elements) {
    // Element bazlı tahmini maliyet
    total = (chemicals.elements.N || 0) * 0.15 +  // 150 TL/kg üre
            (chemicals.elements.P || 0) * 0.62 +  // 620 TL/kg MKP
            (chemicals.elements.Mg || 0) * 0.10;  // 100 TL/kg MgSO4
  }
  
  return total;
}

// ==================== BESİYERİ KARŞILAŞTIRMA ====================

/**
 * Farklı besiyerlerini karşılaştırır
 */
export function compareMedia(media1, media2) {
  const comp1 = calculateRecipeComposition(media1.recipe);
  const comp2 = calculateRecipeComposition(media2.recipe);
  
  const comparison = {
    media1: { name: media1.name, elements: comp1.elements },
    media2: { name: media2.name, elements: comp2.elements },
    differences: {}
  };

  // Element bazlı farklar
  const allElements = new Set([
    ...Object.keys(comp1.elements),
    ...Object.keys(comp2.elements)
  ]);

  allElements.forEach(element => {
    const val1 = comp1.elements[element] || 0;
    const val2 = comp2.elements[element] || 0;
    const diff = val2 - val1;
    const percentDiff = val1 > 0 ? (diff / val1 * 100) : Infinity;
    
    comparison.differences[element] = {
      media1: val1.toFixed(2),
      media2: val2.toFixed(2),
      difference: diff.toFixed(2),
      percentChange: percentDiff !== Infinity ? percentDiff.toFixed(1) + "%" : "N/A"
    };
  });

  // N:P oranı karşılaştırması
  comparison.npRatio = {
    media1: analyzeNPRatio(comp1),
    media2: analyzeNPRatio(comp2)
  };

  return comparison;
}

// ==================== SPEKTROFOTOMETRE HESAPLAMALARI ====================

/**
 * Absorbans → Konsantrasyon dönüşümü (Beer-Lambert)
 * A = ε × c × l
 * c = A / (ε × l)
 */
export function absorbanceToConcentration(absorbance, params) {
  const { 
    wavelength, 
    pathLength = 1,  // cm (standart küvet)
    calibrationCurve = null,
    molarExtinction = null
  } = params;

  // Kalibrasyon eğrisi varsa kullan
  if (calibrationCurve) {
    // y = mx + b formatında
    const { slope, intercept } = calibrationCurve;
    return (absorbance - intercept) / slope;
  }

  // Molar sönüm katsayısı varsa Beer-Lambert kullan
  if (molarExtinction) {
    return absorbance / (molarExtinction * pathLength);
  }

  // Varsayılan: Doğrusal yaklaşım
  return absorbance * 10;  // Örnek çarpan
}

/**
 * Fosfor analizi (Molibden Mavisi)
 */
export function calculatePhosphate(absorbance880nm, volume = 1) {
  // Standart kalibrasyon: y = 0.0425x + 0.015 (örnek)
  // x = (y - 0.015) / 0.0425
  const concentration_ppm = (absorbance880nm - 0.015) / 0.0425;
  
  return {
    absorbance: absorbance880nm,
    wavelength: "880 nm",
    method: "Molybdenum Blue (Antimony-free)",
    concentration_ppm: concentration_ppm.toFixed(3),
    concentration_mg_L: concentration_ppm.toFixed(3),
    totalAmount_mg: (concentration_ppm * volume).toFixed(2),
    interpretation: interpretPhosphate(concentration_ppm),
    warning: concentration_ppm > 10 ? "⚠️ Fosfor birikimi var!" : null
  };
}

/**
 * Azot analizi (Nessler veya Salicylate)
 */
export function calculateNitrogen(absorbance, method, volume = 1) {
  let concentration_ppm;
  let wavelength;

  if (method === "Nessler") {
    wavelength = "425 nm";
    // Kalibrasyon: y = 0.035x + 0.008
    concentration_ppm = (absorbance - 0.008) / 0.035;
  } else {  // Salicylate
    wavelength = "655 nm";
    // Kalibrasyon: y = 0.028x + 0.012
    concentration_ppm = (absorbance - 0.012) / 0.028;
  }

  return {
    absorbance,
    wavelength,
    method,
    concentration_ppm: concentration_ppm.toFixed(3),
    concentration_mg_L: concentration_ppm.toFixed(3),
    totalAmount_mg: (concentration_ppm * volume).toFixed(2),
    interpretation: interpretNitrogen(concentration_ppm),
    warning: concentration_ppm < 1 ? "⚠️ Azot tükenmiş!" : null
  };
}

/**
 * Fosfor yorumlama
 */
function interpretPhosphate(ppm) {
  if (ppm < 0.5) return "❌ TÜKENMİŞ - Acilen besin ekle";
  if (ppm < 2) return "⚠️ DÜŞÜK - Yakında besin gerekecek";
  if (ppm <= 5) return "✅ İDEAL - Büyüme için yeterli";
  if (ppm <= 10) return "⚡ YÜKSEK - İyi ama fazla ekleme";
  return "🔴 ÇOK YÜKSEK - Birikim var, sulandır";
}

/**
 * Azot yorumlama
 */
function interpretNitrogen(ppm) {
  if (ppm < 1) return "❌ TÜKENMİŞ - Sarma başlayabilir";
  if (ppm < 5) return "⚠️ DÜŞÜK - 24 saat içinde besin ekle";
  if (ppm <= 20) return "✅ İDEAL - Aktif büyüme";
  if (ppm <= 50) return "⚡ YÜKSEK - Yeterli, eklemeye gerek yok";
  return "🔴 ÇOK YÜKSEK - Fazla, havalandırmayı artır";
}

// ==================== pH KRİZİ YÖNETİMİ ====================

/**
 * pH 9 krizi algılama ve müdahale önerisi
 */
export function detectPHCrisis(pH, tds, cellDensity = null) {
  const crisis = {
    detected: false,
    severity: "normal",
    causes: [],
    actions: []
  };

  // pH 9 patlaması
  if (pH > 9.0) {
    crisis.detected = true;
    crisis.severity = "critical";
    crisis.causes.push("CO2 tüketimi (fotosentez)", "Karbonat tampon etkisi");
    crisis.actions.push({
      immediate: "Rescue Feed: 1ml/L (5g Üre + 5g MKP + 0.5g Sitrik asit/100ml)",
      expected: "pH 9.0 → 6.8-7.2 (24 saat içinde)"
    });
  } else if (pH > 8.5 && tds > 500) {
    crisis.detected = true;
    crisis.severity = "warning";
    crisis.causes.push("Yüksek fotosentez + besin hala var");
    crisis.actions.push({
      immediate: "Asit ekle (HCl veya Sitrik asit)",
      preventive: "CO2 enjeksiyonunu artır"
    });
  }

  // Besin kilitlenmesi kontrolü
  if (pH > 8.5 && tds > 400) {
    crisis.nutrientLockout = true;
    crisis.actions.push({
      warning: "Nutrient Lockout: Demir, fosfor ve mikro elementler çökme riskinde",
      action: "pH'ı 7.0'a düşür, ardından besle"
    });
  }

  // Yeşil ama pH yüksek = Kriz öncesi
  if (pH > 8.0 && pH < 8.5 && cellDensity > 30e6) {
    crisis.detected = true;
    crisis.severity = "early";
    crisis.actions.push({
      preventive: "V2.0 formülasyona geç (Karbonat 0g, MKP 2.5g)",
      monitoring: "pH'ı günde 2 kez ölç"
    });
  }

  return crisis;
}

/**
 * Rescue Feed hesaplama
 */
export function calculateRescueFeed(volume_L, currentPH, targetPH = 7.0) {
  // 100ml stok = 5g Üre + 5g MKP + 0.5g Sitrik asit
  const stockComposition = {
    urea: 50,    // g/L
    mkp: 50,     // g/L
    citric: 5    // g/L
  };

  // pH farkına göre dozaj (deneysel formül)
  const pHDiff = currentPH - targetPH;
  const baseDose_ml_per_L = 1.0;  // Standart doz
  const adjustedDose = baseDose_ml_per_L * (pHDiff / 2);  // pH 9 için ~1ml/L

  const totalDose_ml = adjustedDose * volume_L;

  return {
    tankVolume_L: volume_L,
    currentPH,
    targetPH,
    pHDrop: pHDiff.toFixed(1),
    rescueFeedDose_ml: totalDose_ml.toFixed(1),
    composition: {
      urea_mg: (totalDose_ml * stockComposition.urea).toFixed(0),
      mkp_mg: (totalDose_ml * stockComposition.mkp).toFixed(0),
      citric_mg: (totalDose_ml * stockComposition.citric).toFixed(0)
    },
    instructions: [
      `1. ${totalDose_ml.toFixed(1)} ml Rescue Feed hazırla`,
      "2. Havalandırmayı durdur",
      "3. Stoku yavaşça ekle ve karıştır",
      "4. 5 dakika bekle, havalandırmayı aç",
      "5. 1 saat sonra pH'ı ölç (hedef: 7.0-7.5)",
      "6. 24 saat içinde renk yeşile dönmeli"
    ],
    expectedRecovery: "24-48 saat",
    monitoring: "pH'ı 6 saat sonra tekrar ölç (rebound kontrolü)"
  };
}

export default {
  calculateResidue,
  calculateScaleUpNutrients,
  compareMedia,
  absorbanceToConcentration,
  calculatePhosphate,
  calculateNitrogen,
  detectPHCrisis,
  calculateRescueFeed
};

/**
 * Stokiyometrik Hesaplama Modülü (UNIFIED SYSTEM)
 * 
 * ✅ 300+ Kimyasal Desteği (3 database birleşik)
 * ✅ Alias desteği: "Üre (%46N)" → "CO(NH2)2"
 * ✅ Fuzzy matching: "Sodyum Nitrat" → "NaNO3"
 * ✅ Azot fraksiyonları: NH4, NH3, NO3, NO2, Organik-N
 * ✅ Türkçe isimlendirme
 * ✅ Çözünürlük uyarıları
 */

import { 
  resolveChemicalFormula, 
  getUnifiedChemicalData,
  getNitrogenFraction 
} from './unifiedChemicalDatabase.js';

/**
 * Adapter: Unified database → stoichiometry format
 * @param {string} formula - Kimyasal formül (örn: 'NaNO3', 'Üre (%46N)')
 * @returns {object|null} - Hesaplama formatında veri veya null
 */
function getChemicalData(input) {
  // 🔍 ALIAS ÇÖZÜMLEME: "Üre (%46N)" → "CO(NH2)2"
  const formula = resolveChemicalFormula(input);
  if (!formula) return null;
  
  // 🔗 BİRLEŞİK VERİ: 3 database'den tüm bilgileri al
  const chem = getUnifiedChemicalData(formula);
  if (!chem) return null;
  
  // 🧬 AZOT FRAKSİYON TESPİTİ
  const nFraction = getNitrogenFraction(formula);
  
  return {
    MW: chem.molarMass,
    
    // Makro besinler (% → fraction)
    N: chem.nutrients.N / 100,
    P: chem.nutrients.P / 100,
    K: chem.nutrients.K / 100,
    S: chem.nutrients.S / 100,
    Ca: chem.nutrients.Ca / 100,
    Mg: chem.nutrients.Mg / 100,
    
    // Mikro elementler
    Fe: chem.nutrients.Fe / 100,
    Mn: chem.nutrients.Mn / 100,
    Zn: chem.nutrients.Zn / 100,
    Cu: chem.nutrients.Cu / 100,
    B: chem.nutrients.B / 100,
    Mo: chem.nutrients.Mo / 100,
    
    // Diğer elementler
    Na: chem.nutrients.Na / 100,
    Cl: chem.nutrients.Cl / 100,
    
    // Özellikler
    dissolves: chem.solubility > 0.1,
    pKa: chem.pKa,
    strong_acid: chem.pKa && parseFloat(chem.pKa) < 1,
    isBuffer: chem.pKa && parseFloat(chem.pKa) >= 6 && parseFloat(chem.pKa) <= 8,
    
    // Alkalinity (HCO3/CO3 varlığı)
    alkalinity: formula.includes('HCO3') ? 1.19 : (formula.includes('CO3') ? 1.2 : 0),
    
    // Hardness
    hardness: chem.nutrients.Ca || chem.nutrients.Mg ? 'Ca' : null,
    
    // ✨ YENİ: Azot fraksiyonları
    nitrogenFraction: nFraction,
    
    // Kullanıcı dostu bilgiler
    name: chem.name,
    category: chem.category,
    ions: chem.ions,
    solubility: chem.solubility,
    formula: formula // Çözümlenmiş formül
  };
}

/**
 * Besin yeri stokiyometrisini hesapla
 * @param {Array} stocks - [{chemical: 'NaNO3', concentration_g_per_L: 1.5}]
 * @param {Number} volumeL - Toplam hacim (L)
 * @returns {Object} - Su kimyası parametreleri
 */
export function calculateMediaStoichiometry(stocks, volumeL = 1) {
  const results = {
    // Ana parametreler
    TDS: 0,                    // mg/L
    theoreticalPH: 7.0,        // pH (teorik)
    EC: 0,                     // μS/cm
    
    // Azot fraksiyonları
    TAN: 0,                    // mg N/L (Total Ammonia Nitrogen)
    NO3_N: 0,                  // mg N/L (Nitrat-azotu)
    NO2_N: 0,                  // mg N/L (Nitrit-azotu)
    NH4_N: 0,                  // mg N/L (Amonyum-azotu)
    NH3_N: 0,                  // mg N/L (Amonyak-azotu)
    organicN: 0,               // mg N/L (Organik azot, üre gibi)
    totalN: 0,                 // mg N/L (Toplam azot)
    
    // Fosfor
    TP: 0,                     // mg P/L (Total Phosphorus)
    PO4_P: 0,                  // mg P/L (Ortofosfat-fosforu)
    
    // Diğer makro elementler
    K: 0,                      // mg K/L (Potasyum)
    Ca: 0,                     // mg Ca/L (Kalsiyum)
    Mg: 0,                     // mg Mg/L (Magnezyum)
    S: 0,                      // mg S/L (Kükürt)
    
    // Alkalinite ve sertlik
    alkalinity: 0,             // mg/L as CaCO₃
    hardness: 0,               // mg/L as CaCO₃
    
    // pH etkileri
    acidicComponents: [],
    basicComponents: [],
    bufferComponents: [],
    
    // Detaylı stok bilgisi
    stockDetails: [],
    
    // Uyarılar
    warnings: []
  };

  if (!stocks || stocks.length === 0) {
    results.warnings.push('Stok bilgisi bulunamadı');
    return results;
  }

  stocks.forEach(stock => {
    const chemData = getChemicalData(stock.chemical);
    
    if (!chemData) {
      results.warnings.push(`⚠️ Bilinmeyen kimyasal: ${stock.chemical}`);
      return;
    }
    
    // ✅ Çözünürlük uyarısı
    if (!chemData.dissolves) {
      results.warnings.push(
        `⚠️ ${chemData.name} (${chemData.formula}) düşük çözünürlük (${chemData.solubility} g/100ml) - Sıcak su veya uzun karıştırma gerekir`
      );
    }

    const concentration = stock.concentration_g_per_L; // g/L
    const molarConcentration = concentration / chemData.MW; // mol/L

    // TDS ekle
    results.TDS += concentration * 1000; // mg/L

    // ✨ AZOT FRAKSİYONLARI (DÜZELTİLDİ)
    if (chemData.N > 0) {
      const N_mg = concentration * chemData.N * 1000; // mg N/L
      results.totalN += N_mg;

      // 🔬 Azot fraksiyonlarını kimyasal yapıya göre dağıt
      const nFrac = chemData.nitrogenFraction;
      
      if (nFrac.hasNO3) {
        // NO3 içeren bileşikler (NaNO3, KNO3, Ca(NO3)2 vb.)
        results.NO3_N += N_mg;
      } 
      else if (nFrac.hasNH4) {
        // NH4 içeren bileşikler (NH4Cl, (NH4)2SO4, NH4NO3 vb.)
        // NOT: NH4NO3 hem NH4 hem NO3 içerir
        if (chemData.formula.includes('NH4NO3')) {
          // Yarısı NH4, yarısı NO3
          results.NH4_N += N_mg / 2;
          results.NO3_N += N_mg / 2;
          results.TAN += N_mg / 2;
        } else {
          results.NH4_N += N_mg;
          results.TAN += N_mg;
        }
      } 
      else if (nFrac.hasNO2) {
        // NO2 içeren bileşikler (NaNO2 vb.)
        results.NO2_N += N_mg;
      } 
      else if (nFrac.isOrganic) {
        // Organik azot (Üre, amino asitler vb.)
        results.organicN += N_mg;
      }
      else {
        // Diğer (belirsiz)
        results.organicN += N_mg;
      }
    }

    // FOSFOR
    if (chemData.P > 0) {
      const P_mg = concentration * chemData.P * 1000;
      results.TP += P_mg;
      results.PO4_P += P_mg; // Çoğu fosfat tuzlarından gelen PO4
    }

    // DİĞER MAKRO ELEMENTLER
    if (chemData.K > 0) results.K += concentration * chemData.K * 1000;
    if (chemData.Ca > 0) results.Ca += concentration * chemData.Ca * 1000;
    if (chemData.Mg > 0) results.Mg += concentration * chemData.Mg * 1000;
    if (chemData.S > 0) results.S += concentration * chemData.S * 1000;

    // ALKALİNİTE
    if (chemData.alkalinity) {
      results.alkalinity += concentration * chemData.alkalinity * 1000;
    }

    // SERTLİK (Hardness)
    if (chemData.hardness === 'Ca' && chemData.Ca > 0) {
      results.hardness += concentration * chemData.Ca * 1000 * (100.09 / 40.08); // CaCO₃ cinsinden
    }
    if (chemData.hardness === 'Mg' && chemData.Mg > 0) {
      results.hardness += concentration * chemData.Mg * 1000 * (100.09 / 24.31);
    }

    // pH ETKİLERİ
    if (chemData.strong_acid) {
      results.acidicComponents.push({
        name: chemData.name,
        formula: stock.chemical,
        concentration: concentration
      });
    }

    if (chemData.isBuffer) {
      results.bufferComponents.push({
        name: chemData.name,
        formula: stock.chemical,
        concentration: concentration,
        pKa: chemData.pKa
      });
    }

    // Detaylı stok bilgisi (✅ UI uyumlu format)
    const N_contribution = chemData.N > 0 ? (concentration * chemData.N * 1000) : 0;
    const P_contribution = chemData.P > 0 ? (concentration * chemData.P * 1000) : 0;
    const K_contribution = chemData.K > 0 ? (concentration * chemData.K * 1000) : 0;
    
    results.stockDetails.push({
      chemical: stock.chemical,
      name: chemData.name,
      category: chemData.category,
      concentration_g_per_L: concentration,
      finalConc_mg_L: concentration * 1000,
      contributions: {
        N: N_contribution,
        P: P_contribution,
        K: K_contribution
      }
    });
  });

  // NH3 Hesaplaması (pH bağımlı)
  const pKa_ammonia = 9.25;
  const pH = results.theoreticalPH;
  const fractionNH3 = 1 / (1 + Math.pow(10, pKa_ammonia - pH));
  results.NH3_N = results.NH4_N * fractionNH3;

  // EC Hesaplama (TDS'den yaklaşık)
  results.EC = results.TDS * 1.56; // μS/cm (yaklaşık)

  // pH Tahmini (basit)
  if (results.acidicComponents.length > 0) {
    results.theoreticalPH = 5.5;
    results.warnings.push('⚠️ Güçlü asit içeriyor - pH düşük olabilir');
  } else if (results.alkalinity > 100) {
    results.theoreticalPH = 8.5;
  } else if (results.bufferComponents.length > 0) {
    const avgPKa = results.bufferComponents.reduce((sum, b) => sum + parseFloat(b.pKa), 0) / results.bufferComponents.length;
    results.theoreticalPH = avgPKa;
  }

  // NH3 TOKSİSİTE UYARISI
  if (results.NH3_N > 0.5) {
    results.warnings.push(`🚨 YÜKSEK NH3 (${results.NH3_N.toFixed(2)} mg/L) - pH = ${pH.toFixed(2)} (TOKSİK!)`);
  } else if (results.NH3_N > 0.1) {
    results.warnings.push(`⚠️ Orta NH3 (${results.NH3_N.toFixed(2)} mg/L) - Havalandırma önerilir`);
  }

  return results;
}

/**
 * Sonuçları formatlı object'e çevir (UI gösterimi için)
 * @param {Object} results - calculateMediaStoichiometry() çıktısı
 * @returns {Object} - Kategorize edilmiş formatlı sonuçlar
 */
export function formatStoichiometryResults(results) {
  if (!results || typeof results !== 'object') {
    return {
      summary: {},
      nitrogen: {},
      phosphorus: {},
      macros: {},
      stockDetails: [],
      warnings: []
    };
  }

  return {
    // 1. ANA SU KİMYASI
    summary: {
      'TDS': `${results.TDS.toFixed(1)} mg/L`,
      'EC': `${results.EC.toFixed(0)} μS/cm`,
      'pH (teorik)': results.theoreticalPH.toFixed(2),
      'Alkalinite': `${results.alkalinity.toFixed(1)} mg/L`,
      'Sertlik': `${results.hardness.toFixed(1)} mg/L`
    },

    // 2. AZOT FRAKSİYONLARI
    nitrogen: {
      'Toplam Azot': `${results.totalN.toFixed(2)} mg N/L`,
      'NO3-N (Nitrat)': `${results.NO3_N.toFixed(2)} mg N/L`,
      'NH4-N (Amonyum)': `${results.NH4_N.toFixed(2)} mg N/L`,
      'NH3-N (Amonyak)': `${results.NH3_N.toFixed(3)} mg N/L`,
      'NO2-N (Nitrit)': `${results.NO2_N.toFixed(2)} mg N/L`,
      'Organik-N': `${results.organicN.toFixed(2)} mg N/L`,
      'TAN (NH4 + NH3)': `${results.TAN.toFixed(2)} mg N/L`
    },

    // 3. FOSFOR
    phosphorus: {
      'Toplam Fosfor (TP)': `${results.TP.toFixed(2)} mg P/L`,
      'PO4-P': `${results.PO4_P.toFixed(2)} mg P/L`
    },

    // 4. DİĞER MAKRO ELEMENTLER
    macros: {
      'K (Potasyum)': `${results.K.toFixed(2)} mg/L`,
      'Ca (Kalsiyum)': `${results.Ca.toFixed(2)} mg/L`,
      'Mg (Magnezyum)': `${results.Mg.toFixed(2)} mg/L`,
      'S (Kükürt)': `${results.S.toFixed(2)} mg/L`
    },

    // 5. STOK DETAYLARI (✅ KATEGORİ İLE)
    stockDetails: results.stockDetails || [],

    // 6. UYARILAR
    warnings: results.warnings || []
  };
}

export default {
  calculateMediaStoichiometry,
  formatStoichiometryResults,
  getChemicalData  // Export for testing
};

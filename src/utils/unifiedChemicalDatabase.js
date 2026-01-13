/**
 * 🧪 BİRLEŞİK KİMYASAL VERİTABANI SİSTEMİ
 * 
 * 3 farklı database'i birleştiren ve akıllı arama yapan unified sistem:
 * - expandedChemicalDatabase.js (300+ kimyasal)
 * - chemicalLibrary.js (detaylı ion/TDS verileri)
 * - chemicalDatabase.js (ELEMENT_WEIGHTS, fonksiyonlar)
 * 
 * ÖZELLİKLER:
 * ✅ Alias desteği: "Üre (%46N)" → "CO(NH2)2"
 * ✅ Fuzzy matching: "Sodyum Nitrat" → "NaNO3"
 * ✅ Formula → Name çevirisi
 * ✅ Tüm verileri birleştirir
 */

import { expandedChemicalDatabase } from '../data/expandedChemicalDatabase.js';
import chemicalLibrary from '../data/chemicalLibrary.js';
import { CHEMICALS, ELEMENT_WEIGHTS } from '../data/chemicalDatabase.js';

// ========== ALIAS HARİTASI ==========
// Kullanıcıların kullandığı isimler → Resmi formüller
export const CHEMICAL_ALIASES = {
  // ÜRE - En yaygın girişler
  'Üre': 'CO(NH2)2',
  'üre': 'CO(NH2)2',
  'Üre (%46N)': 'CO(NH2)2',
  'Urea': 'CO(NH2)2',
  'urea': 'CO(NH2)2',
  'Üre (46%)': 'CO(NH2)2',
  
  // SODYUM BİKARBONAT
  'NaHCO3': 'Sodium Bicarbonate',
  'Sodyum Bikarbonat': 'Sodium Bicarbonate',
  'sodyum bikarbonat': 'Sodium Bicarbonate',
  'Sodium Bicarbonate': 'Sodium Bicarbonate',
  'sodium bicarbonate': 'Sodium Bicarbonate',
  
  // SİTRİK ASİT
  'Sitrik Asit': 'Citric Acid',
  'sitrik asit': 'Citric Acid',
  'Citric Acid': 'Citric Acid',
  'Citric acid': 'Citric Acid',
  'citric acid': 'Citric Acid',
  'C6H8O7·H2O': 'Citric Acid',
  'C6H8O7': 'Citric Acid',
  
  // EDTA
  'Na-EDTA': 'Na2EDTA·2H2O',
  'EDTA': 'Na2EDTA·2H2O',
  'edta': 'Na2EDTA·2H2O',
  'Na2-EDTA': 'Na2EDTA·2H2O',
  'Na2EDTA': 'Na2EDTA·2H2O',
  'Disodium EDTA': 'Na2EDTA·2H2O',
  'EDTA-2Na': 'Na2EDTA·2H2O',
  
  // MKP (Mono Potasyum Fosfat)
  'MKP': 'KH2PO4',
  'MKP-Fertilizer': 'KH2PO4',
  'mkp': 'KH2PO4',
  'Mono Potasyum Fosfat': 'KH2PO4',
  
  // MAGNEZYUM SÜLFAT
  'MgSO4': 'MgSO4·7H2O',
  'Magnezyum Sülfat': 'MgSO4·7H2O',
  'Magnesium Sulfate': 'MgSO4·7H2O',
  'Epsom Tuzu': 'MgSO4·7H2O',
  
  // KALSİYUM KLORÜR
  'CaCl2': 'CaCl2·2H2O',
  'Kalsiyum Klorür': 'CaCl2·2H2O',
  'Calcium Chloride': 'CaCl2·2H2O',
  
  // DEMİR SÜLFAT
  'FeSO4': 'FeSO4·7H2O',
  'Demir Sülfat': 'FeSO4·7H2O',
  'Iron Sulfate': 'FeSO4·7H2O',
  
  // SODYUM NITRAT
  'Sodyum Nitrat': 'NaNO3',
  'sodyum nitrat': 'NaNO3',
  'Sodium Nitrate': 'NaNO3',
  
  // POTASYUM NITRAT
  'Potasyum Nitrat': 'KNO3',
  'potasyum nitrat': 'KNO3',
  'Potassium Nitrate': 'KNO3',
  
  // AMONYUM SÜLFAT
  'Amonyum Sülfat': '(NH4)2SO4',
  'Ammonium Sulfate': '(NH4)2SO4',
  
  // POTASYUM SÜLFAT
  'K2SO4': 'K2SO4',
  'Potasyum Sülfat': 'K2SO4',
  'Potassium Sulfate': 'K2SO4'
};

/**
 * Kimyasal adını normalize et ve formülü bul
 * @param {string} input - Kullanıcı girişi (örn: "Üre (%46N)", "NaNO3")
 * @returns {string|null} - Resmi formül veya null
 */
export function resolveChemicalFormula(input) {
  if (!input) return null;
  
  const cleaned = input.trim();
  
  // 1. Direkt alias match
  if (CHEMICAL_ALIASES[cleaned]) {
    return CHEMICAL_ALIASES[cleaned];
  }
  
  // 2. expandedChemicalDatabase'de formül olarak var mı?
  if (expandedChemicalDatabase[cleaned]) {
    return cleaned;
  }
  
  // 3. chemicalLibrary'de var mı?
  if (chemicalLibrary[cleaned]) {
    return cleaned;
  }
  
  // 4. CHEMICALS'da var mı?
  if (CHEMICALS && CHEMICALS[cleaned]) {
    return cleaned;
  }
  
  // 5. Türkçe isim ile ara (case-insensitive)
  const lowerInput = cleaned.toLowerCase();
  
  for (const [formula, data] of Object.entries(expandedChemicalDatabase)) {
    if (data.name && data.name.toLowerCase() === lowerInput) {
      return formula;
    }
  }
  
  for (const [formula, data] of Object.entries(chemicalLibrary)) {
    if (data.name && data.name.toLowerCase() === lowerInput) {
      return formula;
    }
  }
  
  // 6. Kısmi eşleşme (fuzzy matching)
  for (const [formula, data] of Object.entries(expandedChemicalDatabase)) {
    if (data.name && data.name.toLowerCase().includes(lowerInput)) {
      return formula;
    }
  }
  
  return null;
}

/**
 * Birleşik kimyasal veri objesi oluştur
 * @param {string} formula - Kimyasal formül
 * @returns {object|null} - Tüm kaynaklardan birleştirilmiş veri
 */
export function getUnifiedChemicalData(formula) {
  const resolvedFormula = resolveChemicalFormula(formula);
  if (!resolvedFormula) return null;
  
  // 3 kaynaktan veri topla
  const expanded = expandedChemicalDatabase[resolvedFormula] || {};
  const library = chemicalLibrary[resolvedFormula] || {};
  const legacy = (CHEMICALS && CHEMICALS[resolvedFormula]) ? CHEMICALS[resolvedFormula] : {};
  
  // Helper: Güvenli değer alma (NaN kontrolü)
  const safeValue = (val) => (val && !isNaN(val)) ? val : 0;
  
  // Birleştir (öncelik: expanded > library > legacy)
  return {
    // Temel bilgiler
    formula: resolvedFormula,
    name: expanded.name || library.name || legacy.name || resolvedFormula,
    molarMass: expanded.molarMass || library.molarMass || legacy.MW || 0,
    
    // Besin elementleri (% ağırlık)
    nutrients: {
      N: safeValue(expanded.nutrients?.N) || safeValue(library.nutrients?.N) || safeValue(legacy.N) * 100 || 0,
      P: safeValue(expanded.nutrients?.P) || safeValue(library.nutrients?.P) || safeValue(legacy.P) * 100 || 0,
      K: safeValue(expanded.nutrients?.K) || safeValue(library.nutrients?.K) || safeValue(legacy.K) * 100 || 0,
      S: safeValue(expanded.nutrients?.S) || safeValue(library.nutrients?.S) || safeValue(legacy.S) * 100 || 0,
      Ca: safeValue(expanded.nutrients?.Ca) || safeValue(library.nutrients?.Ca) || safeValue(legacy.Ca) * 100 || 0,
      Mg: safeValue(expanded.nutrients?.Mg) || safeValue(library.nutrients?.Mg) || safeValue(legacy.Mg) * 100 || 0,
      Fe: safeValue(expanded.nutrients?.Fe) || safeValue(library.nutrients?.Fe) || safeValue(legacy.Fe) * 100 || 0,
      Mn: safeValue(expanded.nutrients?.Mn) || safeValue(library.nutrients?.Mn) || 0,
      Zn: safeValue(expanded.nutrients?.Zn) || safeValue(library.nutrients?.Zn) || 0,
      Cu: safeValue(expanded.nutrients?.Cu) || safeValue(library.nutrients?.Cu) || 0,
      B: safeValue(expanded.nutrients?.B) || safeValue(library.nutrients?.B) || 0,
      Mo: safeValue(expanded.nutrients?.Mo) || safeValue(library.nutrients?.Mo) || 0,
      Na: safeValue(expanded.nutrients?.Na) || safeValue(library.nutrients?.Na) || 0,
      Cl: safeValue(expanded.nutrients?.Cl) || safeValue(library.nutrients?.Cl) || 0
    },
    
    // İyonlar
    ions: expanded.ions || library.ions || {},
    
    // pKa
    pKa: expanded.pKa || library.pKa || null,
    
    // Çözünürlük
    solubility: expanded.solubility || library.solubility || 0,
    
    // Kategori
    category: expanded.category || library.category || 'Diğer',
    
    // TDS katkısı
    tdsContribution: library.tdsContribution || 1.0,
    
    // Kaynak bilgisi
    sources: {
      expandedDB: !!expandedChemicalDatabase[resolvedFormula],
      libraryDB: !!chemicalLibrary[resolvedFormula],
      legacyDB: CHEMICALS ? !!CHEMICALS[resolvedFormula] : false
    }
  };
}

/**
 * Tüm kimyasalları birleşik formatta getir
 * @returns {Array} - Tüm kimyasallar (alfabetik sıralı)
 */
export function getAllUnifiedChemicals() {
  const allFormulas = new Set([
    ...Object.keys(expandedChemicalDatabase),
    ...Object.keys(chemicalLibrary),
    ...(CHEMICALS ? Object.keys(CHEMICALS) : [])
  ]);
  
  const chemicals = [];
  
  for (const formula of allFormulas) {
    const data = getUnifiedChemicalData(formula);
    if (data) {
      chemicals.push(data);
    }
  }
  
  // Alfabetik sırala (Türkçe)
  return chemicals.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

/**
 * Kimyasal ara (fuzzy search)
 * @param {string} query - Arama terimi
 * @returns {Array} - Eşleşen kimyasallar
 */
export function searchChemicals(query) {
  if (!query || query.length < 2) return getAllUnifiedChemicals();
  
  const lowerQuery = query.toLowerCase();
  const allChemicals = getAllUnifiedChemicals();
  
  return allChemicals.filter(chem => 
    chem.name.toLowerCase().includes(lowerQuery) ||
    chem.formula.toLowerCase().includes(lowerQuery) ||
    chem.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * AZOT FRAKSİYON TESPİTİ
 * Kimyasalın hangi azot formlarını içerdiğini belirler
 * @param {string} formula - Kimyasal formül
 * @returns {object} - {hasNH4: bool, hasNO3: bool, hasNO2: bool, isOrganic: bool}
 */
export function getNitrogenFraction(formula) {
  const upper = formula.toUpperCase();
  
  return {
    hasNH4: upper.includes('NH4') || upper.includes('(NH4)'),
    hasNO3: upper.includes('NO3'),
    hasNO2: upper.includes('NO2') && !upper.includes('NO3'),
    isOrganic: upper.includes('CO(NH2)2') || upper.includes('UREA') || 
               upper.includes('C') && upper.includes('N') && !upper.includes('NO')
  };
}

export default {
  resolveChemicalFormula,
  getUnifiedChemicalData,
  getAllUnifiedChemicals,
  searchChemicals,
  getNitrogenFraction,
  CHEMICAL_ALIASES,
  ELEMENT_WEIGHTS
};

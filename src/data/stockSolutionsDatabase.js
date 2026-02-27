/**
 * Stok Çözelti Veritabanı
 * Her besin ortamı için stok çözelti formülasyonları
 */

export const STOCK_SOLUTIONS_DATABASE = {
  // ========== STANDART & TEMEL ==========
  'BG-11': {
    name: 'BG-11 (Blue-Green Medium)',
    description: 'Cyanobacteria ve Chlorella için zengin ortam',
    targetSpecies: ['Spirulina', 'Chlorella', 'Arthrospira'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaNO3', amount: 150, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 4, unit: 'g', mw: 174.2 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g', mw: 246.5 },
        { chemical: 'CaCl2·2H2O', amount: 3.6, unit: 'g', mw: 147 },
        { chemical: 'Na2CO3', amount: 2, unit: 'g', mw: 106 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    microStock: {
      name: 'Mikro + Fe Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'Ferric Ammonium Citrate', amount: 0.6, unit: 'g' },
        { chemical: 'EDTA Disodium', amount: 0.1, unit: 'g' },
        { chemical: 'H3BO3', amount: 0.286, unit: 'g', mw: 61.83 },
        { chemical: 'MnSO4·H2O', amount: 0.223, unit: 'g', mw: 169 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 1500, // mg/L (çok yüksek)
      P: 31, // mg/L
      K: 45, // mg/L
      Mg: 30, // mg/L
      S: 32, // mg/L
      Ca: 24, // mg/L
      Fe: 2.4, // mg/L
      Na: 270 // mg/L (yüksek)
    },
    finalPH: 7.5,
    notes: 'Yüksek alkalinite, Spirulina için ideal'
  },

  'BS11': {
    name: 'BS11 (Blue-Green Medium)',
    description: 'Cyanobacteria ve Chlorella için zengin ortam',
    targetSpecies: ['Spirulina', 'Chlorella', 'Arthrospira'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaNO3', amount: 150, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 4, unit: 'g', mw: 174.2 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g', mw: 246.5 },
        { chemical: 'CaCl2·2H2O', amount: 3.6, unit: 'g', mw: 147 },
        { chemical: 'Na2CO3', amount: 2, unit: 'g', mw: 106 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    microStock: {
      name: 'Mikro + Fe Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'Ferric Ammonium Citrate', amount: 0.6, unit: 'g' },
        { chemical: 'EDTA Disodium', amount: 0.1, unit: 'g' },
        { chemical: 'H3BO3', amount: 0.286, unit: 'g', mw: 61.83 },
        { chemical: 'MnSO4·H2O', amount: 0.223, unit: 'g', mw: 169 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 1500, // mg/L (çok yüksek)
      P: 31, // mg/L
      K: 45, // mg/L
      Mg: 30, // mg/L
      S: 32, // mg/L
      Ca: 24, // mg/L
      Fe: 2.4, // mg/L
      Na: 270 // mg/L (yüksek)
    },
    finalPH: 7.5,
    notes: 'Yüksek alkalinite, Spirulina için ideal'
  },

  'BBM': {
    name: 'BBM (Bold Basal Medium)',
    description: 'Yeşil algler için temel ortam',
    targetSpecies: ['Chlorella vulgaris', 'Scenedesmus obliquus'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaNO3', amount: 25, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 7.5, unit: 'g', mw: 174.2 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g', mw: 246.5 },
        { chemical: 'NaCl', amount: 2.5, unit: 'g', mw: 58.44 },
        { chemical: 'KH2PO4', amount: 17.5, unit: 'g', mw: 136.09 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    caStock: {
      name: 'Kalsiyum Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'CaCl2·2H2O', amount: 2.5, unit: 'g', mw: 147 }
      ],
      dosage: { amount: 0.5, unit: 'ml', per: '1L medium' }
    },
    feStock: {
      name: 'Demir-EDTA Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'FeSO4·7H2O', amount: 4.98, unit: 'g', mw: 278.01 },
        { chemical: 'EDTA', amount: 6.72, unit: 'g', mw: 292.24 }
      ],
      dosage: { amount: 0.1, unit: 'ml', per: '1L medium' }
    },
    usageRatio: { main: 100, ca: 5, fe: 0.1 },
    elementalComposition: {
      N: 247.5, // mg/L
      P: 53.3, // mg/L
      K: 78.4, // mg/L
      Mg: 7.4, // mg/L
      S: 16, // mg/L
      Ca: 6.8, // mg/L
      Fe: 0.5, // mg/L
      Na: 41.2 // mg/L
    },
    finalPH: 6.6,
    notes: 'Yeşil algler için optimize edilmiş'
  },

  'JM': {
    name: 'JM (Jaworski Medium)',
    description: 'Uzun süreli kültür saklama için',
    targetSpecies: ['Chlorella sp.', 'Scenedesmus sp.'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'Ca(NO3)2·4H2O', amount: 4, unit: 'g', mw: 236.15 },
        { chemical: 'KH2PO4', amount: 1.24, unit: 'g', mw: 136.09 },
        { chemical: 'MgSO4·7H2O', amount: 0.5, unit: 'g', mw: 246.5 },
        { chemical: 'NaHCO3', amount: 0.016, unit: 'g', mw: 84.01 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 237, // mg/L
      P: 28.2, // mg/L
      K: 13.6, // mg/L
      Mg: 4.9, // mg/L
      S: 8, // mg/L
      Ca: 49.8, // mg/L
      Na: 2.3 // mg/L
    },
    finalPH: 7.2,
    notes: 'Çökelme riski düşük, uzun raf ömrü'
  },

  'Chu-10': {
    name: 'Chu-10',
    description: 'Oligotrofik türler için',
    targetSpecies: ['Yeni izole edilen türler'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'Ca(NO3)2·4H2O', amount: 0.04, unit: 'g', mw: 236.15 },
        { chemical: 'K2HPO4', amount: 0.01, unit: 'g', mw: 174.2 },
        { chemical: 'MgSO4·7H2O', amount: 0.025, unit: 'g', mw: 246.5 },
        { chemical: 'Na2CO3', amount: 0.02, unit: 'g', mw: 106 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 23.7, // mg/L
      P: 7.1, // mg/L
      K: 11.4, // mg/L
      Mg: 2.5, // mg/L
      S: 4, // mg/L
      Ca: 4.9, // mg/L
      Na: 4.3 // mg/L
    },
    finalPH: 7.0,
    notes: 'Çok düşük besin, oligotrofik türler için'
  },

  'WC': {
    name: 'WC Medium',
    description: 'Çok amaçlı yeşil alg ortamı',
    targetSpecies: ['Chlorella sp.', 'Scenedesmus sp.'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaNO3', amount: 25, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 7.5, unit: 'g', mw: 174.2 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g', mw: 246.5 },
        { chemical: 'CaCl2·2H2O', amount: 2.5, unit: 'g', mw: 147 },
        { chemical: 'NaHCO3', amount: 1.68, unit: 'g', mw: 84.01 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 247.5, // mg/L
      P: 53.3, // mg/L
      K: 78.4, // mg/L
      Mg: 7.4, // mg/L
      S: 16, // mg/L
      Ca: 17, // mg/L
      Na: 45.8 // mg/L
    },
    finalPH: 7.0,
    notes: 'Wright & Jeffrey tarafından geliştirilmiş'
  },

  'TAP': {
    name: 'TAP Medium',
    description: 'Chlamydomonas için yüksek yoğunluk',
    targetSpecies: ['Chlamydomonas reinhardtii'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NH4Cl', amount: 15, unit: 'g', mw: 53.49 },
        { chemical: 'K2HPO4', amount: 4, unit: 'g', mw: 174.2 },
        { chemical: 'KH2PO4', amount: 10.5, unit: 'g', mw: 136.09 },
        { chemical: 'MgSO4·7H2O', amount: 10, unit: 'g', mw: 246.5 },
        { chemical: 'CaCl2·2H2O', amount: 5, unit: 'g', mw: 147 },
        { chemical: 'Sodium Acetate', amount: 100, unit: 'g', mw: 82.03 },
        { chemical: 'Proteose Peptone', amount: 10, unit: 'g' }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 283, // mg/L
      P: 78.4, // mg/L
      K: 117.6, // mg/L
      Mg: 9.9, // mg/L
      S: 20, // mg/L
      Ca: 34, // mg/L
      Na: 293.6 // mg/L
    },
    finalPH: 7.0,
    notes: 'TRIS tamponlu, yüksek yoğunluk için'
  },

  'Bristol': {
    name: 'Bristol Medium',
    description: 'Temel yeşil alg ortamı',
    targetSpecies: ['Chlorella sp.'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaNO3', amount: 25, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 7.5, unit: 'g', mw: 174.2 },
        { chemical: 'KH2PO4', amount: 17.5, unit: 'g', mw: 136.09 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g', mw: 246.5 },
        { chemical: 'CaCl2·2H2O', amount: 2.5, unit: 'g', mw: 147 },
        { chemical: 'NaCl', amount: 2.5, unit: 'g', mw: 58.44 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 247.5, // mg/L
      P: 53.3, // mg/L
      K: 78.4, // mg/L
      Mg: 7.4, // mg/L
      S: 16, // mg/L
      Ca: 17, // mg/L
      Na: 41.2 // mg/L
    },
    finalPH: 6.6,
    notes: 'BBM\'ye benzer, basit formülasyon'
  },

  'Zarrouk': {
    name: "Zarrouk's Medium",
    description: 'Spirulina için endüstriyel ortam',
    targetSpecies: ['Spirulina platensis', 'Arthrospira maxima'],
    mainStock: {
      name: 'Ana Makro Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaHCO3', amount: 168, unit: 'g', mw: 84.01 },
        { chemical: 'NaNO3', amount: 25, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 5, unit: 'g', mw: 174.2 },
        { chemical: 'K2SO4', amount: 10, unit: 'g', mw: 174.26 },
        { chemical: 'NaCl', amount: 10, unit: 'g', mw: 58.44 },
        { chemical: 'MgSO4·7H2O', amount: 2, unit: 'g', mw: 246.5 },
        { chemical: 'CaCl2·2H2O', amount: 0.4, unit: 'g', mw: 147 },
        { chemical: 'FeSO4·7H2O', amount: 0.01, unit: 'g', mw: 278.01 },
        { chemical: 'EDTA', amount: 0.08, unit: 'g', mw: 292.24 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 412.5, // mg/L
      P: 89, // mg/L
      K: 195.5, // mg/L
      Mg: 2, // mg/L
      S: 34.8, // mg/L
      Ca: 2.7, // mg/L
      Fe: 0.036, // mg/L
      Na: 2401 // mg/L (çok yüksek)
    },
    finalPH: 9.5,
    notes: 'Çok yüksek bikarbonat, alkali ortam'
  }
};

// Yardımcı fonksiyonlar
export const getStockSolutionByCode = (code) => {
  return STOCK_SOLUTIONS_DATABASE[code] || null;
};

export const getAllStockSolutionCodes = () => {
  return Object.keys(STOCK_SOLUTIONS_DATABASE);
};

export const getStockSolutionsByCategory = (category) => {
  // Kategori bazlı filtreleme için genişletilebilir
  return STOCK_SOLUTIONS_DATABASE;
};
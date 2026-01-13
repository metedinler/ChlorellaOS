// Kimyasal Kütüphanesi - Formül, Mol, Tuzlar, pKa, TDS

export const chemicalLibrary = {
  // Azot Kaynakları
  'NaNO3': {
    name: 'Sodyum Nitrat',
    formula: 'NaNO3',
    molarMass: 85.0,
    ions: {
      'Na+': { moles: 1, mass: 23 },
      'NO3-': { moles: 1, mass: 62 }
    },
    nutrients: { N: 16.5 }, // % ağırlık
    pKa: null,
    solubility: 91.2, // g/100ml (20°C)
    tdsContribution: 1.0, // TDS katsayısı
    category: 'Azot Kaynağı'
  },
  
  'KNO3': {
    name: 'Potasyum Nitrat',
    formula: 'KNO3',
    molarMass: 101.1,
    ions: {
      'K+': { moles: 1, mass: 39.1 },
      'NO3-': { moles: 1, mass: 62 }
    },
    nutrients: { N: 13.9, K: 38.7 },
    pKa: null,
    solubility: 31.6,
    tdsContribution: 1.0,
    category: 'Azot + Potasyum'
  },

  'Ca(NO3)2·4H2O': {
    name: 'Kalsiyum Nitrat Tetrahidrat',
    formula: 'Ca(NO3)2·4H2O',
    molarMass: 236.15,
    ions: {
      'Ca2+': { moles: 1, mass: 40.1 },
      'NO3-': { moles: 2, mass: 124 }
    },
    nutrients: { N: 11.9, Ca: 17.0 },
    pKa: null,
    solubility: 129,
    tdsContribution: 1.0,
    category: 'Azot + Kalsiyum'
  },

  'Urea': {
    name: 'Üre',
    formula: 'CO(NH2)2',
    molarMass: 60.06,
    ions: {},
    nutrients: { N: 46.6 },
    pKa: 0.18,
    solubility: 108,
    tdsContribution: 0.95,
    category: 'Organik Azot'
  },

  // Fosfor Kaynakları
  'K2HPO4': {
    name: 'Dipotasyum Hidrojen Fosfat',
    formula: 'K2HPO4',
    molarMass: 174.2,
    ions: {
      'K+': { moles: 2, mass: 78.2 },
      'HPO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { P: 17.8, K: 44.9 },
    pKa: [2.15, 7.20, 12.35],
    solubility: 168,
    tdsContribution: 1.0,
    category: 'Fosfor + Potasyum'
  },

  'KH2PO4': {
    name: 'Potasyum Dihidrojen Fosfat',
    formula: 'KH2PO4',
    molarMass: 136.1,
    ions: {
      'K+': { moles: 1, mass: 39.1 },
      'H2PO4-': { moles: 1, mass: 97 }
    },
    nutrients: { P: 22.8, K: 28.7 },
    pKa: [2.15, 7.20, 12.35],
    solubility: 22.6,
    tdsContribution: 1.0,
    category: 'Fosfor + Potasyum'
  },

  'NaH2PO4·H2O': {
    name: 'Sodyum Dihidrojen Fosfat Monohidrat',
    formula: 'NaH2PO4·H2O',
    molarMass: 138.0,
    ions: {
      'Na+': { moles: 1, mass: 23 },
      'H2PO4-': { moles: 1, mass: 97 }
    },
    nutrients: { P: 22.5, Na: 16.7 },
    pKa: [2.15, 7.20, 12.35],
    solubility: 85,
    tdsContribution: 1.0,
    category: 'Fosfor + Sodyum'
  },

  // Kükürt Kaynakları
  'MgSO4·7H2O': {
    name: 'Magnezyum Sülfat Heptahidrat',
    formula: 'MgSO4·7H2O',
    molarMass: 246.5,
    ions: {
      'Mg2+': { moles: 1, mass: 24.3 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { Mg: 9.9, S: 13.0 },
    pKa: null,
    solubility: 71,
    tdsContribution: 1.0,
    category: 'Magnezyum + Kükürt'
  },

  'K2SO4': {
    name: 'Potasyum Sülfat',
    formula: 'K2SO4',
    molarMass: 174.3,
    ions: {
      'K+': { moles: 2, mass: 78.2 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { K: 44.9, S: 18.4 },
    pKa: null,
    solubility: 12,
    tdsContribution: 1.0,
    category: 'Potasyum + Kükürt'
  },

  // Kalsiyum Kaynakları
  'CaCl2·2H2O': {
    name: 'Kalsiyum Klorür Dihidrat',
    formula: 'CaCl2·2H2O',
    molarMass: 147.0,
    ions: {
      'Ca2+': { moles: 1, mass: 40.1 },
      'Cl-': { moles: 2, mass: 71 }
    },
    nutrients: { Ca: 27.3 },
    pKa: null,
    solubility: 74.5,
    tdsContribution: 1.05,
    category: 'Kalsiyum'
  },

  'CaSO4·2H2O': {
    name: 'Kalsiyum Sülfat Dihidrat (Alçı)',
    formula: 'CaSO4·2H2O',
    molarMass: 172.2,
    ions: {
      'Ca2+': { moles: 1, mass: 40.1 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { Ca: 23.3, S: 18.6 },
    pKa: null,
    solubility: 0.26,
    tdsContribution: 0.8,
    category: 'Kalsiyum + Kükürt'
  },

  // Sodyum Kaynakları
  'NaCl': {
    name: 'Sodyum Klorür',
    formula: 'NaCl',
    molarMass: 58.44,
    ions: {
      'Na+': { moles: 1, mass: 23 },
      'Cl-': { moles: 1, mass: 35.5 }
    },
    nutrients: { Na: 39.3 },
    pKa: null,
    solubility: 36,
    tdsContribution: 1.1,
    category: 'Sodyum'
  },

  'Na2CO3': {
    name: 'Sodyum Karbonat',
    formula: 'Na2CO3',
    molarMass: 106.0,
    ions: {
      'Na+': { moles: 2, mass: 46 },
      'CO3²-': { moles: 1, mass: 60 }
    },
    nutrients: { Na: 43.4 },
    pKa: [6.35, 10.33],
    solubility: 21.5,
    tdsContribution: 1.0,
    category: 'Sodyum + Karbon (pH Yükseltici)'
  },

  'NaHCO3': {
    name: 'Sodyum Bikarbonat',
    formula: 'NaHCO3',
    molarMass: 84.01,
    ions: {
      'Na+': { moles: 1, mass: 23 },
      'HCO3-': { moles: 1, mass: 61 }
    },
    nutrients: { Na: 27.4 },
    pKa: [6.35, 10.33],
    solubility: 9.6,
    tdsContribution: 1.0,
    category: 'Sodyum + Karbon (Buffer)'
  },

  // Demir Kaynakları
  'FeSO4·7H2O': {
    name: 'Demir(II) Sülfat Heptahidrat',
    formula: 'FeSO4·7H2O',
    molarMass: 278.0,
    ions: {
      'Fe²+': { moles: 1, mass: 55.8 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { Fe: 20.1, S: 11.5 },
    pKa: null,
    solubility: 48,
    tdsContribution: 0.9,
    category: 'Demir'
  },

  'FeCl3·6H2O': {
    name: 'Demir(III) Klorür Heksahidrat',
    formula: 'FeCl3·6H2O',
    molarMass: 270.3,
    ions: {
      'Fe³+': { moles: 1, mass: 55.8 },
      'Cl-': { moles: 3, mass: 106.5 }
    },
    nutrients: { Fe: 20.6 },
    pKa: null,
    solubility: 91.8,
    tdsContribution: 1.1,
    category: 'Demir'
  },

  // Şelat Ajanları
  'EDTA': {
    name: 'Etilen Diamin Tetra Asetik Asit',
    formula: 'C10H16N2O8',
    molarMass: 292.2,
    ions: {},
    nutrients: {},
    pKa: [2.0, 2.67, 6.16, 10.26],
    solubility: 0.05,
    tdsContribution: 0.8,
    category: 'Şelat Ajanı'
  },

  'Na2EDTA': {
    name: 'Disodyum EDTA',
    formula: 'C10H14N2Na2O8',
    molarMass: 336.2,
    ions: {
      'Na+': { moles: 2, mass: 46 }
    },
    nutrients: { Na: 13.7 },
    pKa: [2.0, 2.67, 6.16, 10.26],
    solubility: 11.1,
    tdsContribution: 0.85,
    category: 'Şelat Ajanı'
  },

  // Mikro Elementler
  'MnCl2·4H2O': {
    name: 'Mangan Klorür Tetrahidrat',
    formula: 'MnCl2·4H2O',
    molarMass: 197.9,
    ions: {
      'Mn²+': { moles: 1, mass: 54.9 },
      'Cl-': { moles: 2, mass: 71 }
    },
    nutrients: { Mn: 27.7 },
    pKa: null,
    solubility: 72.3,
    tdsContribution: 1.0,
    category: 'Mangan'
  },

  'ZnSO4·7H2O': {
    name: 'Çinko Sülfat Heptahidrat',
    formula: 'ZnSO4·7H2O',
    molarMass: 287.5,
    ions: {
      'Zn²+': { moles: 1, mass: 65.4 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { Zn: 22.7, S: 11.2 },
    pKa: null,
    solubility: 96.5,
    tdsContribution: 0.95,
    category: 'Çinko'
  },

  'CuSO4·5H2O': {
    name: 'Bakır Sülfat Pentahidrat',
    formula: 'CuSO4·5H2O',
    molarMass: 249.7,
    ions: {
      'Cu²+': { moles: 1, mass: 63.5 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { Cu: 25.4, S: 12.8 },
    pKa: null,
    solubility: 31.6,
    tdsContribution: 0.9,
    category: 'Bakır'
  },

  'H3BO3': {
    name: 'Borik Asit',
    formula: 'H3BO3',
    molarMass: 61.83,
    ions: {},
    nutrients: { B: 17.5 },
    pKa: [9.24, 12.74, 13.8],
    solubility: 5.7,
    tdsContribution: 0.85,
    category: 'Bor'
  },

  'Na2MoO4·2H2O': {
    name: 'Sodyum Molibdat Dihidrat',
    formula: 'Na2MoO4·2H2O',
    molarMass: 241.9,
    ions: {
      'Na+': { moles: 2, mass: 46 },
      'MoO4²-': { moles: 1, mass: 160 }
    },
    nutrients: { Mo: 39.7, Na: 19.0 },
    pKa: null,
    solubility: 65,
    tdsContribution: 0.9,
    category: 'Molibden'
  },

  'CoCl2·6H2O': {
    name: 'Kobalt Klorür Heksahidrat',
    formula: 'CoCl2·6H2O',
    molarMass: 237.9,
    ions: {
      'Co²+': { moles: 1, mass: 58.9 },
      'Cl-': { moles: 2, mass: 71 }
    },
    nutrients: { Co: 24.8 },
    pKa: null,
    solubility: 52.9,
    tdsContribution: 0.95,
    category: 'Kobalt'
  },

  // pH Düzenleyiciler
  'HCl': {
    name: 'Hidroklorik Asit (37%)',
    formula: 'HCl',
    molarMass: 36.46,
    ions: {
      'H+': { moles: 1, mass: 1 },
      'Cl-': { moles: 1, mass: 35.5 }
    },
    nutrients: {},
    pKa: -6.3,
    solubility: 'tam çözünür',
    tdsContribution: 1.1,
    category: 'pH Düşürücü (Asit)'
  },

  'H2SO4': {
    name: 'Sülfürik Asit (98%)',
    formula: 'H2SO4',
    molarMass: 98.08,
    ions: {
      'H+': { moles: 2, mass: 2 },
      'SO4²-': { moles: 1, mass: 96 }
    },
    nutrients: { S: 32.7 },
    pKa: [-3, 1.99],
    solubility: 'tam çözünür',
    tdsContribution: 1.2,
    category: 'pH Düşürücü (Asit)'
  },

  'KOH': {
    name: 'Potasyum Hidroksit',
    formula: 'KOH',
    molarMass: 56.11,
    ions: {
      'K+': { moles: 1, mass: 39.1 },
      'OH-': { moles: 1, mass: 17 }
    },
    nutrients: { K: 69.7 },
    pKa: 15.7,
    solubility: 110,
    tdsContribution: 1.05,
    category: 'pH Yükseltici (Baz)'
  },

  'NaOH': {
    name: 'Sodyum Hidroksit',
    formula: 'NaOH',
    molarMass: 40.0,
    ions: {
      'Na+': { moles: 1, mass: 23 },
      'OH-': { moles: 1, mass: 17 }
    },
    nutrients: { Na: 57.5 },
    pKa: 14.9,
    solubility: 111,
    tdsContribution: 1.1,
    category: 'pH Yükseltici (Baz)'
  }
};

// TDS Hesaplama Fonksiyonu
export const calculateTDS = (chemicals) => {
  // chemicals = [{ name: 'NaNO3', amount: 25, unit: 'g/L' }, ...]
  let totalTDS = 0;
  
  chemicals.forEach(chem => {
    const chemData = chemicalLibrary[chem.name];
    if (chemData) {
      // g/L cinsinden miktar * TDS katsayısı
      totalTDS += (chem.amount * chemData.tdsContribution);
    }
  });
  
  return totalTDS;
};

// pH Tahmin Fonksiyonu (Basitleştirilmiş)
export const estimatePH = (chemicals, volume = 1) => {
  let acidStrength = 0;
  let baseStrength = 0;
  
  chemicals.forEach(chem => {
    const chemData = chemicalLibrary[chem.name];
    if (!chemData || !chemData.pKa) return;
    
    const moles = (chem.amount / chemData.molarMass) * volume;
    
    if (Array.isArray(chemData.pKa)) {
      const avgPKa = chemData.pKa.reduce((a, b) => a + b) / chemData.pKa.length;
      if (avgPKa < 7) acidStrength += moles * (7 - avgPKa);
      else baseStrength += moles * (avgPKa - 7);
    } else {
      if (chemData.pKa < 7) acidStrength += moles * (7 - chemData.pKa);
      else baseStrength += moles * (chemData.pKa - 7);
    }
  });
  
  // Basitleştirilmiş pH tahmini
  const netEffect = baseStrength - acidStrength;
  const estimatedPH = 7 + (netEffect * 0.1); // Kabaca tahmin
  
  return {
    pH: Math.max(4, Math.min(10, estimatedPH)).toFixed(2),
    acidStrength: acidStrength.toFixed(3),
    baseStrength: baseStrength.toFixed(3)
  };
};

// İyon Analizi
export const analyzeIons = (chemicals) => {
  const ions = {};
  
  chemicals.forEach(chem => {
    const chemData = chemicalLibrary[chem.name];
    if (!chemData) return;
    
    const moles = chem.amount / chemData.molarMass;
    
    Object.entries(chemData.ions).forEach(([ion, data]) => {
      if (!ions[ion]) ions[ion] = 0;
      ions[ion] += moles * data.moles * data.mass;
    });
  });
  
  return ions;
};

export default chemicalLibrary;

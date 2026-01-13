/**
 * KİMYASAL İSİMLENDİRME SİSTEMİ
 * 
 * Kimyasal formülleri okunabilir isimlere çevirir:
 * "NaOH" → "Sodyum Hidroksit (Kostik)"
 * "H2SO4" → "Sülfürik Asit"
 */

// Yaygın kimyasalların isim tablosu
export const CHEMICAL_NAMES = {
  // Bazlar
  'NaOH': {
    name: 'Sodyum Hidroksit',
    commonName: 'Kostik',
    category: 'Baz'
  },
  'KOH': {
    name: 'Potasyum Hidroksit',
    commonName: 'Potasyum Kostik',
    category: 'Baz'
  },
  'Ca(OH)2': {
    name: 'Kalsiyum Hidroksit',
    commonName: 'Söndürülmüş Kireç',
    category: 'Baz'
  },

  // Asitler
  'H2SO4': {
    name: 'Sülfürik Asit',
    commonName: 'Zaç Yağı',
    category: 'Asit'
  },
  'HCl': {
    name: 'Hidroklorik Asit',
    commonName: 'Tuz Ruhu',
    category: 'Asit'
  },
  'HNO3': {
    name: 'Nitrik Asit',
    commonName: 'Kezzap',
    category: 'Asit'
  },
  'H3PO4': {
    name: 'Fosforik Asit',
    commonName: 'Ortofosfat',
    category: 'Asit'
  },
  'CH3COOH': {
    name: 'Asetik Asit',
    commonName: 'Sirke Asidi',
    category: 'Asit'
  },

  // Azot kaynakları
  'NaNO3': {
    name: 'Sodyum Nitrat',
    commonName: 'Güherçile',
    category: 'Azot Kaynağı'
  },
  'KNO3': {
    name: 'Potasyum Nitrat',
    commonName: 'Barut Tozu',
    category: 'Azot Kaynağı'
  },
  'NH4NO3': {
    name: 'Amonyum Nitrat',
    commonName: 'Amonyum Güherçilesi',
    category: 'Azot Kaynağı'
  },
  'NH4Cl': {
    name: 'Amonyum Klorür',
    commonName: 'Nişadır',
    category: 'Azot Kaynağı'
  },
  'CO(NH2)2': {
    name: 'Üre',
    commonName: 'Karbamid',
    category: 'Azot Kaynağı'
  },

  // Fosfor kaynakları
  'KH2PO4': {
    name: 'Monopotasyum Fosfat',
    commonName: 'MKP',
    category: 'Fosfor Kaynağı'
  },
  'K2HPO4': {
    name: 'Dipotasyum Fosfat',
    commonName: 'DKP',
    category: 'Fosfor Kaynağı'
  },
  'Na2HPO4': {
    name: 'Disodyum Fosfat',
    commonName: 'DSP',
    category: 'Fosfor Kaynağı'
  },

  // Karbon kaynakları
  'NaHCO3': {
    name: 'Sodyum Bikarbonat',
    commonName: 'Kabartma Tozu',
    category: 'Karbon Kaynağı'
  },
  'Na2CO3': {
    name: 'Sodyum Karbonat',
    commonName: 'Soda',
    category: 'Karbon Kaynağı'
  },
  'CO2': {
    name: 'Karbondioksit',
    commonName: 'CO₂ Gazı',
    category: 'Karbon Kaynağı'
  },

  // Magnezyum
  'MgSO4': {
    name: 'Magnezyum Sülfat',
    commonName: 'İngiliz Tuzu',
    category: 'Makro Element'
  },
  'MgCl2': {
    name: 'Magnezyum Klorür',
    commonName: 'Magnezyum Tuzu',
    category: 'Makro Element'
  },

  // Kalsiyum
  'CaCl2': {
    name: 'Kalsiyum Klorür',
    commonName: 'Buzlanma Önleyici',
    category: 'Makro Element'
  },
  'CaSO4': {
    name: 'Kalsiyum Sülfat',
    commonName: 'Alçıtaşı',
    category: 'Makro Element'
  },

  // Demir
  'FeSO4': {
    name: 'Demir(II) Sülfat',
    commonName: 'Yeşil Zaç',
    category: 'Mikro Element'
  },
  'FeCl3': {
    name: 'Demir(III) Klorür',
    commonName: 'Ferrik Klorür',
    category: 'Mikro Element'
  },
  'Fe-EDTA': {
    name: 'Demir EDTA',
    commonName: 'Şelatlı Demir',
    category: 'Mikro Element'
  },

  // Diğer tuzlar
  'NaCl': {
    name: 'Sodyum Klorür',
    commonName: 'Sofra Tuzu',
    category: 'Tuz'
  },
  'KCl': {
    name: 'Potasyum Klorür',
    commonName: 'Potasyum Tuzu',
    category: 'Tuz'
  }
};

/**
 * Kimyasal formülü okunabilir isme çevirir
 * @param {string} formula - Kimyasal formül (örn: "NaOH")
 * @param {string} format - Görüntüleme formatı:
 *   - "full": "NaOH (Sodyum Hidroksit - Kostik)"
 *   - "name": "Sodyum Hidroksit"
 *   - "common": "Kostik"
 *   - "nameWithCommon": "Sodyum Hidroksit (Kostik)"
 * @returns {string} Formatlanmış isim
 */
export const getChemicalDisplayName = (formula, format = 'full') => {
  if (!formula) return '';

  const chemicalData = CHEMICAL_NAMES[formula];
  
  if (!chemicalData) {
    // Bilinmeyen kimyasal - sadece formülü döndür
    return formula;
  }

  switch (format) {
    case 'full':
      return chemicalData.commonName 
        ? `${formula} (${chemicalData.name} - ${chemicalData.commonName})`
        : `${formula} (${chemicalData.name})`;
    
    case 'name':
      return chemicalData.name;
    
    case 'common':
      return chemicalData.commonName || chemicalData.name;
    
    case 'nameWithCommon':
      return chemicalData.commonName
        ? `${chemicalData.name} (${chemicalData.commonName})`
        : chemicalData.name;
    
    case 'formulaWithName':
      return `${formula} - ${chemicalData.name}`;
    
    default:
      return formula;
  }
};

/**
 * Kimyasal kategorisini döndürür
 * @param {string} formula - Kimyasal formül
 * @returns {string} Kategori adı
 */
export const getChemicalCategory = (formula) => {
  const chemicalData = CHEMICAL_NAMES[formula];
  return chemicalData?.category || 'Diğer';
};

/**
 * Tüm kimyasalları kategoriye göre gruplandırır
 * @returns {Object} Kategorilere göre gruplandırılmış kimyasallar
 */
export const getChemicalsByCategory = () => {
  const grouped = {};
  
  Object.entries(CHEMICAL_NAMES).forEach(([formula, data]) => {
    if (!grouped[data.category]) {
      grouped[data.category] = [];
    }
    grouped[data.category].push({
      formula,
      ...data
    });
  });
  
  return grouped;
};

/**
 * Kimyasal arama - isim veya formülle
 * @param {string} query - Arama terimi
 * @returns {Array} Eşleşen kimyasallar
 */
export const searchChemicals = (query) => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return Object.entries(CHEMICAL_NAMES)
    .filter(([formula, data]) => {
      return formula.toLowerCase().includes(lowerQuery) ||
             data.name.toLowerCase().includes(lowerQuery) ||
             (data.commonName && data.commonName.toLowerCase().includes(lowerQuery));
    })
    .map(([formula, data]) => ({
      formula,
      ...data
    }));
};

/**
 * React component için kimyasal seçici options
 * @param {string} format - Display format
 * @returns {Array} Select options dizisi
 */
export const getChemicalSelectOptions = (format = 'full') => {
  return Object.keys(CHEMICAL_NAMES).map(formula => ({
    value: formula,
    label: getChemicalDisplayName(formula, format)
  }));
};

// ========================================
// CHLORELLA OS - GENİŞLETİLMİŞ SİSTEM VERİLERİ
// ========================================

// Mevcut tank sistemi (korunuyor)
export { tankSystem, bbmFormulas, feasibilityData, productionPlan, chemicalPrices } from './systemData.js';

// ========================================
// 6 BESİN YERİ FORMÜLASYONU
// ========================================

export const mediumLibrary = {
  BBM: {
    name: 'BBM (Bold Basal Medium)',
    description: 'Chlorella vulgaris için standart besin ortamı',
    targetSpecies: ['Chlorella vulgaris', 'Chlorella sorokiniana'],
    mainStock: {
      name: 'Ana Stok Solüsyonu',
      stockVolume: 500, // ml
      components: [
        { chemical: 'NaNO3', amount: 12.5, unit: 'g', mw: 85, dissolvedIn: '500ml' },
        { chemical: 'K2HPO4', amount: 3.75, unit: 'g', mw: 174.2, dissolvedIn: '500ml' },
        { chemical: 'MgSO4·7H2O', amount: 3.75, unit: 'g', mw: 246.5, dissolvedIn: '500ml' },
        { chemical: 'NaCl', amount: 1.25, unit: 'g', mw: 58.44, dissolvedIn: '500ml' }
      ],
      dosage: { amount: 20, unit: 'ml', per: '1L medium' }
    },
    microStock: {
      name: 'Mikro Element Stoku',
      stockVolume: 100, // ml
      components: [
        { chemical: 'FeSO4·7H2O', amount: 0.498, unit: 'g', mw: 278 },
        { chemical: 'EDTA', amount: 0.745, unit: 'g', mw: 292 },
        { chemical: 'H3BO3', amount: 0.286, unit: 'g', mw: 61.83 },
        { chemical: 'MnCl2·4H2O', amount: 0.181, unit: 'g', mw: 197.9 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 250, // mg/L
      P: 43, // mg/L
      K: 45, // mg/L
      Mg: 15, // mg/L
      S: 20, // mg/L
      Ca: 0, // mg/L
      Fe: 1.8, // mg/L
      Cl: 12, // mg/L
      Na: 27 // mg/L
    },
    finalPH: 6.5,
    notes: 'En yaygın kullanılan Chlorella besiyeri'
  },

  BS11: {
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

  JAWORSKI: {
    name: 'Jaworski Medium (JM)',
    description: 'Tatlı su mikroalgleri için optimize ortam',
    targetSpecies: ['Chlorella', 'Scenedesmus', 'Chlamydomonas'],
    mainStock: {
      name: 'Makro Stok A',
      stockVolume: 500, // ml
      components: [
        { chemical: 'Ca(NO3)2·4H2O', amount: 10, unit: 'g', mw: 236.15 },
        { chemical: 'KH2PO4', amount: 6.25, unit: 'g', mw: 136.1 },
        { chemical: 'MgSO4·7H2O', amount: 10, unit: 'g', mw: 246.5 }
      ],
      dosage: { amount: 20, unit: 'ml', per: '1L medium' }
    },
    stockB: {
      name: 'Makro Stok B',
      stockVolume: 500, // ml
      components: [
        { chemical: 'NaNO3', amount: 25, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 1.25, unit: 'g', mw: 174.2 }
      ],
      dosage: { amount: 20, unit: 'ml', per: '1L medium' }
    },
    microStock: {
      name: 'Mikro Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'FeCl3·6H2O', amount: 0.194, unit: 'g', mw: 270.3 },
        { chemical: 'EDTA', amount: 0.3, unit: 'g', mw: 292 },
        { chemical: 'H3BO3', amount: 0.247, unit: 'g', mw: 61.83 },
        { chemical: 'MnCl2·4H2O', amount: 0.415, unit: 'g', mw: 197.9 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 280, // mg/L
      P: 62, // mg/L
      K: 78, // mg/L
      Mg: 49, // mg/L
      S: 65, // mg/L
      Ca: 80, // mg/L
      Fe: 1.4, // mg/L
      Na: 135 // mg/L
    },
    finalPH: 7.0,
    notes: 'Dengeli N:P oranı, scale-up için uygun'
  },

  FACHB: {
    name: 'F/2 Medium (Guillard)',
    description: 'Deniz mikroalgleri adaptasyonu',
    targetSpecies: ['Nannochloropsis', 'Chlorella', 'Tetraselmis'],
    mainStock: {
      name: 'Makro Nutrient Stok',
      stockVolume: 500, // ml
      components: [
        { chemical: 'NaNO3', amount: 37.5, unit: 'g', mw: 85 },
        { chemical: 'NaH2PO4·H2O', amount: 2.5, unit: 'g', mw: 138 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    microStock: {
      name: 'Trace Metal Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'FeCl3·6H2O', amount: 0.315, unit: 'g', mw: 270.3 },
        { chemical: 'EDTA', amount: 0.436, unit: 'g', mw: 292 },
        { chemical: 'CuSO4·5H2O', amount: 0.001, unit: 'g', mw: 249.7 },
        { chemical: 'ZnSO4·7H2O', amount: 0.0022, unit: 'g', mw: 287.6 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 882, // mg/L
      P: 45, // mg/L
      K: 0, // mg/L
      Mg: 0, // mg/L (deniz suyu kullanılır)
      S: 0, // mg/L
      Ca: 0, // mg/L (deniz suyu kullanılır)
      Fe: 1.17, // mg/L
      Cu: 0.00025, // mg/L
      Zn: 0.00076 // mg/L
    },
    finalPH: 8.0,
    notes: 'Deniz suyu bazlı, tatlı su adaptasyonu gerekir'
  },

  ZARROUK: {
    name: 'Zarrouk Medium',
    description: 'Spirulina için optimize yüksek alkalinite ortamı',
    targetSpecies: ['Arthrospira platensis', 'Spirulina'],
    mainStock: {
      name: 'Bikarbonat Stok',
      stockVolume: 1000, // ml
      components: [
        { chemical: 'NaHCO3', amount: 168, unit: 'g', mw: 84 },
        { chemical: 'Na2CO3', amount: 10, unit: 'g', mw: 106 }
      ],
      dosage: { amount: 10, unit: 'ml', per: '1L medium' }
    },
    macroStock: {
      name: 'Makro Stok',
      stockVolume: 500, // ml
      components: [
        { chemical: 'NaNO3', amount: 125, unit: 'g', mw: 85 },
        { chemical: 'K2HPO4', amount: 25, unit: 'g', mw: 174.2 },
        { chemical: 'K2SO4', amount: 5, unit: 'g', mw: 174.3 },
        { chemical: 'NaCl', amount: 5, unit: 'g', mw: 58.44 },
        { chemical: 'MgSO4·7H2O', amount: 10, unit: 'g', mw: 246.5 }
      ],
      dosage: { amount: 20, unit: 'ml', per: '1L medium' }
    },
    microStock: {
      name: 'Mikro + Fe Stok',
      stockVolume: 100, // ml
      components: [
        { chemical: 'FeSO4·7H2O', amount: 0.5, unit: 'g', mw: 278 },
        { chemical: 'EDTA', amount: 0.8, unit: 'g', mw: 292 }
      ],
      dosage: { amount: 1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 2500, // mg/L (çok yüksek)
      P: 170, // mg/L (çok yüksek)
      K: 225, // mg/L
      Mg: 40, // mg/L
      S: 55, // mg/L
      Fe: 1.8, // mg/L
      Na: 450, // mg/L (çok yüksek)
      HCO3: 1680 // mg/L (tampon)
    },
    finalPH: 9.5,
    notes: 'pH 9-10 arası, çok alkali, sadece Spirulina için'
  },

  CUSTOM_BBM: {
    name: 'Özel BBM (Mete Formülasyonu)',
    description: 'Maliyeti optimize edilmiş BBM varyasyonu',
    targetSpecies: ['Chlorella vulgaris'],
    mainStock: {
      name: 'Ana Stok (Üre Bazlı)',
      stockVolume: 500, // ml
      components: [
        { chemical: 'Urea', amount: 7.5, unit: 'g', mw: 60, note: 'Ucuz N kaynağı' },
        { chemical: 'MKP', amount: 3.75, unit: 'g', mw: 136.1, note: 'P ve K birlikte' },
        { chemical: 'MgSO4·7H2O', amount: 6, unit: 'g', mw: 246.5 },
        { chemical: 'NaHCO3', amount: 1, unit: 'g', mw: 84, note: 'Karbon + tampon' }
      ],
      dosage: { amount: 20, unit: 'ml', per: '1L medium' }
    },
    caStock: {
      name: 'Ca Stok (Ayrı)',
      stockVolume: 100, // ml
      components: [
        { chemical: 'CaCl2·2H2O', amount: 0.75, unit: 'g', mw: 147 }
      ],
      dosage: { amount: 5, unit: 'ml', per: '1L medium' }
    },
    feStock: {
      name: 'Fe+Chelat Stok',
      stockVolume: 50, // ml
      components: [
        { chemical: 'FeSO4·7H2O', amount: 0.5, unit: 'g', mw: 278 },
        { chemical: 'EDTA', amount: 0.8, unit: 'g', mw: 292 },
        { chemical: 'Citric Acid', amount: 0.8, unit: 'g', mw: 192 }
      ],
      dosage: { amount: 0.1, unit: 'ml', per: '1L medium' }
    },
    elementalComposition: {
      N: 280, // mg/L (Üre'den)
      P: 62, // mg/L
      K: 56, // mg/L
      Mg: 49, // mg/L
      S: 65, // mg/L
      Ca: 27, // mg/L
      Fe: 1.8, // mg/L
      Na: 27 // mg/L
    },
    finalPH: 7.0,
    notes: 'Maliyet optimize, üre kullanımı (sterilizasyon sonrası)'
  }
};

// ========================================
// MALZEME/MALİYET YÖNETİMİ (73 KALEM)
// ========================================

export const materialInventory = [
  // Büyük Ekipman
  { id: 1, category: 'Büyük Ekipman', name: 'Leica Mikroskop + Hitachi Spektrofotometre', quantity: 1, unitPrice: 28000, totalCost: 28000, date: '2024-01', usedInProduction: true },
  { id: 2, category: 'Ölçüm Cihazları', name: 'Hailea 60L/dk Kompresör', quantity: 1, unitPrice: 1800, totalCost: 1800, date: '2024-01', usedInProduction: true },
  { id: 3, category: 'Ölçüm Cihazları', name: 'pH Metre + TDS Metre Set', quantity: 1, unitPrice: 466, totalCost: 466, date: '2024-01', usedInProduction: true },
  { id: 4, category: 'Ölçüm Cihazları', name: 'Hassas Terazi (0.001g)', quantity: 1, unitPrice: 582, totalCost: 582, date: '2024-01', usedInProduction: true },
  { id: 5, category: 'Ölçüm Cihazları', name: 'Refraktometre', quantity: 1, unitPrice: 400, totalCost: 400, date: '2024-01', usedInProduction: true },
  
  // Tanklar
  { id: 6, category: 'Tanklar', name: 'IBC Tank 1000L', quantity: 4, unitPrice: 2500, totalCost: 10000, date: '2024-02', usedInProduction: true },
  { id: 7, category: 'Tanklar', name: 'Plastik Varil 100L', quantity: 10, unitPrice: 150, totalCost: 1500, date: '2024-02', usedInProduction: true },
  { id: 8, category: 'Tanklar', name: '5L Pet Şişe', quantity: 24, unitPrice: 15, totalCost: 360, date: '2024-02', usedInProduction: true },
  { id: 9, category: 'Tanklar', name: '1L Cam Kavanoz', quantity: 20, unitPrice: 8, totalCost: 160, date: '2024-02', usedInProduction: true },
  
  // Aydınlatma
  { id: 10, category: 'Aydınlatma', name: 'LED Panel 50W (Kırmızı+Mavi)', quantity: 15, unitPrice: 120, totalCost: 1800, date: '2024-02', usedInProduction: true },
  { id: 11, category: 'Aydınlatma', name: 'LED Driver + Timer', quantity: 3, unitPrice: 67, totalCost: 200, date: '2024-02', usedInProduction: true },
  
  // Kimyasallar (Ana Stoklar)
  { id: 12, category: 'Kimyasal', name: 'Sodyum Nitrat (NaNO3)', quantity: 5, unit: 'kg', unitPrice: 140, totalCost: 700, date: '2024-02', usedInProduction: true, currentStock: 3.2 },
  { id: 13, category: 'Kimyasal', name: 'MKP (Monopotasyum Fosfat)', quantity: 2, unit: 'kg', unitPrice: 150, totalCost: 300, date: '2024-02', usedInProduction: true, currentStock: 1.1 },
  { id: 14, category: 'Kimyasal', name: 'Magnezyum Sülfat (MgSO4·7H2O)', quantity: 5, unit: 'kg', unitPrice: 63, totalCost: 315, date: '2024-02', usedInProduction: true, currentStock: 2.8 },
  { id: 15, category: 'Kimyasal', name: 'Üre', quantity: 10, unit: 'kg', unitPrice: 30, totalCost: 300, date: '2024-02', usedInProduction: true, currentStock: 7.5 },
  { id: 16, category: 'Kimyasal', name: 'Kalsiyum Klorür (CaCl2·2H2O)', quantity: 2, unit: 'kg', unitPrice: 103, totalCost: 206, date: '2024-02', usedInProduction: true, currentStock: 1.4 },
  { id: 17, category: 'Kimyasal', name: 'Demir Sülfat (FeSO4·7H2O)', quantity: 1, unit: 'kg', unitPrice: 218, totalCost: 218, date: '2024-02', usedInProduction: true, currentStock: 0.65 },
  { id: 18, category: 'Kimyasal', name: 'EDTA', quantity: 1, unit: 'kg', unitPrice: 476, totalCost: 476, date: '2024-02', usedInProduction: true, currentStock: 0.55 },
  { id: 19, category: 'Kimyasal', name: 'Sitrik Asit', quantity: 2, unit: 'kg', unitPrice: 25, totalCost: 50, date: '2024-02', usedInProduction: true, currentStock: 1.2 },
  { id: 20, category: 'Kimyasal', name: 'Sodyum Karbonat (Na2CO3)', quantity: 5, unit: 'kg', unitPrice: 45, totalCost: 225, date: '2024-02', usedInProduction: true, currentStock: 3.8 },
  { id: 21, category: 'Kimyasal', name: 'Kostik (NaOH)', quantity: 5, unit: 'kg', unitPrice: 30, totalCost: 150, date: '2024-02', usedInProduction: true, currentStock: 3.5 },
  { id: 22, category: 'Kimyasal', name: 'Hidroklorik Asit (%37)', quantity: 5, unit: 'L', unitPrice: 50, totalCost: 250, date: '2024-02', usedInProduction: true, currentStock: 3.2 },
  
  // Mikro Elementler
  { id: 23, category: 'Mikro Element', name: 'Borik Asit (H3BO3)', quantity: 0.5, unit: 'kg', unitPrice: 180, totalCost: 90, date: '2024-02', usedInProduction: true, currentStock: 0.35 },
  { id: 24, category: 'Mikro Element', name: 'Mangan Klorür (MnCl2·4H2O)', quantity: 0.25, unit: 'kg', unitPrice: 320, totalCost: 80, date: '2024-02', usedInProduction: true, currentStock: 0.18 },
  { id: 25, category: 'Mikro Element', name: 'Çinko Sülfat (ZnSO4·7H2O)', quantity: 0.1, unit: 'kg', unitPrice: 250, totalCost: 25, date: '2024-02', usedInProduction: true, currentStock: 0.07 },
  { id: 26, category: 'Mikro Element', name: 'Bakır Sülfat (CuSO4·5H2O)', quantity: 0.1, unit: 'kg', unitPrice: 280, totalCost: 28, date: '2024-02', usedInProduction: true, currentStock: 0.08 },
  
  // Tesisat
  { id: 27, category: 'Tesisat', name: 'PPRC Boru (20mm, 32mm)', quantity: 1, unit: 'set', unitPrice: 400, totalCost: 400, date: '2024-02', usedInProduction: true },
  { id: 28, category: 'Tesisat', name: 'Vana ve Ekler', quantity: 1, unit: 'set', unitPrice: 300, totalCost: 300, date: '2024-02', usedInProduction: true },
  { id: 29, category: 'Tesisat', name: 'Hava Hortumu (10mm)', quantity: 50, unit: 'm', unitPrice: 3, totalCost: 150, date: '2024-02', usedInProduction: true },
  { id: 30, category: 'Tesisat', name: 'Hava Taşları (10cm)', quantity: 20, unit: 'adet', unitPrice: 8, totalCost: 160, date: '2024-02', usedInProduction: true },
  
  // Isıtma
  { id: 31, category: 'Isıtma', name: 'Akvaryum Isıtıcı (2400W)', quantity: 4, unitPrice: 450, totalCost: 1800, date: '2024-02', usedInProduction: true },
  { id: 32, category: 'Isıtma', name: 'Dijital Termostat', quantity: 2, unitPrice: 135, totalCost: 270, date: '2024-02', usedInProduction: true },
  { id: 33, category: 'Isıtma', name: 'İzolasyon Malzemesi', quantity: 1, unit: 'set', unitPrice: 200, totalCost: 200, date: '2024-02', usedInProduction: true },
  
  // Laboratuvar Malzemeleri
  { id: 34, category: 'Lab Malzeme', name: 'Beher (100, 250, 500, 1000ml)', quantity: 1, unit: 'set', unitPrice: 300, totalCost: 300, date: '2024-02', usedInProduction: true },
  { id: 35, category: 'Lab Malzeme', name: 'Erlenmayer (100, 250, 500ml)', quantity: 1, unit: 'set', unitPrice: 250, totalCost: 250, date: '2024-02', usedInProduction: true },
  { id: 36, category: 'Lab Malzeme', name: 'Ölçü Silindiri (10, 50, 100ml)', quantity: 1, unit: 'set', unitPrice: 150, totalCost: 150, date: '2024-02', usedInProduction: true },
  { id: 37, category: 'Lab Malzeme', name: 'Pipet (1, 5, 10ml)', quantity: 1, unit: 'set', unitPrice: 80, totalCost: 80, date: '2024-02', usedInProduction: true },
  { id: 38, category: 'Lab Malzeme', name: 'Petri Kabı (90mm)', quantity: 100, unit: 'adet', unitPrice: 1.5, totalCost: 150, date: '2024-02', usedInProduction: true },
  { id: 39, category: 'Lab Malzeme', name: 'Test Tüpü + Raf', quantity: 1, unit: 'set', unitPrice: 120, totalCost: 120, date: '2024-02', usedInProduction: true },
  { id: 40, category: 'Lab Malzeme', name: 'Spatula + Kaşık Set', quantity: 1, unit: 'set', unitPrice: 60, totalCost: 60, date: '2024-02', usedInProduction: true },
  
  // Pompalar
  { id: 41, category: 'Pompa', name: 'Dalgıç Pompa (50W)', quantity: 4, unitPrice: 180, totalCost: 720, date: '2024-02', usedInProduction: true },
  { id: 42, category: 'Pompa', name: 'Peristaltik Pompa', quantity: 2, unitPrice: 350, totalCost: 700, date: '2024-02', usedInProduction: true },
  
  // Havalandırma
  { id: 43, category: 'Havalandırma', name: 'Axial Fan (12V)', quantity: 8, unitPrice: 45, totalCost: 360, date: '2024-02', usedInProduction: true },
  { id: 44, category: 'Havalandırma', name: 'CO2 Difüzör', quantity: 4, unitPrice: 80, totalCost: 320, date: '2024-02', usedInProduction: true },
  
  // Sterilizasyon
  { id: 45, category: 'Sterilizasyon', name: 'Otoklavlanabilir Şişe (1L)', quantity: 20, unitPrice: 25, totalCost: 500, date: '2024-02', usedInProduction: true },
  { id: 46, category: 'Sterilizasyon', name: 'Alkol Lambası', quantity: 2, unitPrice: 45, totalCost: 90, date: '2024-02', usedInProduction: true },
  { id: 47, category: 'Sterilizasyon', name: 'Etanol (%96)', quantity: 5, unit: 'L', unitPrice: 120, totalCost: 600, date: '2024-02', usedInProduction: true },
  
  // Test Kitleri
  { id: 48, category: 'Test Kiti', name: 'TAN (Total Ammonia Nitrogen) Kit', quantity: 1, unitPrice: 450, totalCost: 450, date: '2024-02', usedInProduction: true, consumable: true },
  { id: 49, category: 'Test Kiti', name: 'TP (Total Phosphorus) Kit', quantity: 1, unitPrice: 420, totalCost: 420, date: '2024-02', usedInProduction: true, consumable: true },
  { id: 50, category: 'Test Kiti', name: 'Alkalinite Test Kiti', quantity: 1, unitPrice: 180, totalCost: 180, date: '2024-02', usedInProduction: true, consumable: true },
  
  // Elektrik
  { id: 51, category: 'Elektrik', name: 'Timer (Dijital)', quantity: 10, unitPrice: 25, totalCost: 250, date: '2024-02', usedInProduction: true },
  { id: 52, category: 'Elektrik', name: 'Uzatma Kablosu + Priz', quantity: 1, unit: 'set', unitPrice: 300, totalCost: 300, date: '2024-02', usedInProduction: true },
  
  // Güvenlik
  { id: 53, category: 'Güvenlik', name: 'Eldiven (Lateks, 100 adet)', quantity: 5, unit: 'kutu', unitPrice: 80, totalCost: 400, date: '2024-02', usedInProduction: true, consumable: true },
  { id: 54, category: 'Güvenlik', name: 'Gözlük (Lab)', quantity: 5, unitPrice: 35, totalCost: 175, date: '2024-02', usedInProduction: true },
  { id: 55, category: 'Güvenlik', name: 'Maske (N95, 50 adet)', quantity: 2, unit: 'kutu', unitPrice: 120, totalCost: 240, date: '2024-02', usedInProduction: true, consumable: true },
  
  // Diğer Lab Ekipmanı
  { id: 56, category: 'Lab Ekipman', name: 'Vorteks Mikser', quantity: 1, unitPrice: 420, totalCost: 420, date: '2024-02', usedInProduction: true },
  { id: 57, category: 'Lab Ekipman', name: 'Manyetik Karıştırıcı', quantity: 2, unitPrice: 350, totalCost: 700, date: '2024-02', usedInProduction: true },
  { id: 58, category: 'Lab Ekipman', name: 'Hot Plate', quantity: 1, unitPrice: 550, totalCost: 550, date: '2024-02', usedInProduction: true },
  
  // Hasat Ekipmanı
  { id: 59, category: 'Hasat', name: 'Süzme Bezi (Mikron)', quantity: 10, unit: 'adet', unitPrice: 15, totalCost: 150, date: '2024-02', usedInProduction: true },
  { id: 60, category: 'Hasat', name: 'Plastik Kova (20L)', quantity: 20, unitPrice: 25, totalCost: 500, date: '2024-02', usedInProduction: true },
  
  // Veri Kaydı
  { id: 61, category: 'Veri Kaydı', name: 'Laboratuvar Defteri', quantity: 5, unitPrice: 25, totalCost: 125, date: '2024-02', usedInProduction: true },
  { id: 62, category: 'Veri Kaydı', name: 'USB Sıcaklık Logger', quantity: 4, unitPrice: 180, totalCost: 720, date: '2024-02', usedInProduction: true },
  
  // İlgisiz Alımlar (Kullanılmayan ama alınan)
  { id: 63, category: 'Diğer', name: 'Melas (Şeker Pancarı)', quantity: 7, unit: 'kg', unitPrice: 271.43, totalCost: 1900, date: '2024-01', usedInProduction: false, note: 'Başka proje için alındı' },
  { id: 64, category: 'Diğer', name: 'Melas (İkinci Alım)', quantity: 5, unit: 'kg', unitPrice: 160, totalCost: 800, date: '2024-03', usedInProduction: false, note: 'Maya üretimi için' },
  { id: 65, category: 'Diğer', name: 'Pepton', quantity: 1, unit: 'kg', unitPrice: 850, totalCost: 850, date: '2024-01', usedInProduction: false, note: 'Bakteriyoloji denemesi' },
  { id: 66, category: 'Diğer', name: 'Agar Agar', quantity: 1, unit: 'kg', unitPrice: 420, totalCost: 420, date: '2024-01', usedInProduction: false, note: 'Petri kültürü' },
  { id: 67, category: 'Diğer', name: 'Glikoz', quantity: 5, unit: 'kg', unitPrice: 35, totalCost: 175, date: '2024-02', usedInProduction: false, note: 'Fermantasyon testi' },
  
  // Ofis/Destek
  { id: 68, category: 'Ofis', name: 'Dizüstü Bilgisayar', quantity: 1, unitPrice: 12000, totalCost: 12000, date: '2023-12', usedInProduction: false, note: 'Veri analizi' },
  { id: 69, category: 'Ofis', name: 'Yazıcı + Tarayıcı', quantity: 1, unitPrice: 1200, totalCost: 1200, date: '2024-01', usedInProduction: false },
  { id: 70, category: 'Ofis', name: 'Kağıt + Kırtasiye', quantity: 1, unit: 'set', unitPrice: 300, totalCost: 300, date: '2024-01', usedInProduction: false },
  
  // Son Eklemeler
  { id: 71, category: 'Tesisat', name: 'Silikon Hortum (8mm)', quantity: 30, unit: 'm', unitPrice: 4, totalCost: 120, date: '2024-02', usedInProduction: true },
  { id: 72, category: 'Kimyasal', name: 'Potasyum Nitrat (KNO3)', quantity: 2, unit: 'kg', unitPrice: 139.99, totalCost: 280, date: '2024-03', usedInProduction: true, currentStock: 1.8 },
  { id: 73, category: 'Lab Malzeme', name: 'pH Kalibrasyon Çözeltileri (pH 4, 7, 10)', quantity: 1, unit: 'set', unitPrice: 150, totalCost: 150, date: '2024-02', usedInProduction: true, consumable: true }
];

// Toplam maliyet hesaplama
export const totalMaterialCost = materialInventory.reduce((sum, item) => sum + item.totalCost, 0);
export const productionMaterialCost = materialInventory.filter(item => item.usedInProduction).reduce((sum, item) => sum + item.totalCost, 0);
export const nonProductionCost = materialInventory.filter(item => !item.usedInProduction).reduce((sum, item) => sum + item.totalCost, 0);

// ========================================
// GÜNLÜK İZLEME PARAMETRELERİ
// ========================================

export const monitoringParameters = {
  primary: [
    { key: 'temperature', name: 'Sıcaklık', unit: '°C', min: 20, max: 35, optimal: 28, icon: 'Thermometer' },
    { key: 'pH', name: 'pH', unit: '', min: 6.0, max: 8.5, optimal: 7.0, icon: 'Droplet' },
    { key: 'TDS', name: 'TDS', unit: 'ppm', min: 300, max: 800, optimal: 600, icon: 'Waves' },
    { key: 'EC', name: 'EC', unit: 'mS/cm', min: 0.5, max: 1.5, optimal: 1.0, icon: 'Zap' },
    { key: 'DO', name: 'Çözünmüş Oksijen', unit: 'mg/L', min: 5, max: 12, optimal: 8, icon: 'Wind' }
  ],
  optical: [
    { key: 'OD440', name: 'OD440', unit: 'Abs', min: 0, max: 3.0, optimal: 1.0, icon: 'Eye', note: 'Karotenoid' },
    { key: 'OD480', name: 'OD480', unit: 'Abs', min: 0, max: 3.0, optimal: 1.2, icon: 'Eye', note: 'Karotenoid' },
    { key: 'OD540', name: 'OD540', unit: 'Abs', min: 0, max: 2.5, optimal: 1.0, icon: 'Eye', note: 'Yeşil bölge' },
    { key: 'OD580', name: 'OD580', unit: 'Abs', min: 0, max: 2.5, optimal: 1.1, icon: 'Eye', note: 'Phycobilin' },
    { key: 'OD600', name: 'OD600', unit: 'Abs', min: 0, max: 3.0, optimal: 1.5, icon: 'Eye', note: 'Genel biyokütle' },
    { key: 'OD650', name: 'OD650', unit: 'Abs', min: 0, max: 2.5, optimal: 1.3, icon: 'Eye', note: 'Phycocyanin' },
    { key: 'OD680', name: 'OD680', unit: 'Abs', min: 0, max: 2.5, optimal: 1.2, icon: 'Eye', note: 'Klorofil a' },
    { key: 'OD750', name: 'OD750', unit: 'Abs', min: 0, max: 1.5, optimal: 0.8, icon: 'Eye', note: 'Scattering' },
    { key: 'color', name: 'Renk Tonu', unit: 'Green Index', min: 0, max: 10, optimal: 8, icon: 'Palette', note: 'Görsel değerlendirme' }
  ],
  light: [
    { key: 'luxFront', name: 'Işık (Ön)', unit: 'lux', min: 2000, max: 10000, optimal: 5000, icon: 'Sun' },
    { key: 'luxBack', name: 'Işık (Arka)', unit: 'lux', min: 2000, max: 10000, optimal: 5000, icon: 'Sun' },
    { key: 'photoperiod', name: 'Fotoperyot', unit: 'saat', min: 12, max: 24, optimal: 16, icon: 'Clock' }
  ],
  chemical: [
    { key: 'TAN', name: 'TAN (Toplam Amonyak)', unit: 'mg/L', min: 0, max: 50, optimal: 10, icon: 'TestTube', note: 'Azot kaynağı' },
    { key: 'ammonia', name: 'Amonyak (NH₃)', unit: 'mg/L', min: 0, max: 5, optimal: 0.5, icon: 'TestTube', note: 'Toksik form' },
    { key: 'ammonium', name: 'Amonyum (NH₄⁺)', unit: 'mg/L', min: 0, max: 20, optimal: 5, icon: 'TestTube', note: 'Non-toksik' },
    { key: 'nitrite', name: 'Nitrit (NO₂⁻)', unit: 'mg/L', min: 0, max: 2, optimal: 0.1, icon: 'TestTube', note: 'Ara ürün' },
    { key: 'nitrate', name: 'Nitrat (NO₃⁻)', unit: 'mg/L', min: 0, max: 100, optimal: 20, icon: 'TestTube', note: 'Azot kaynağı' },
    { key: 'TP', name: 'TP (Toplam Fosfor)', unit: 'mg/L', min: 0, max: 20, optimal: 5, icon: 'TestTube2', note: 'Fosfor kaynağı' },
    { key: 'phosphate', name: 'Fosfat (PO₄³⁻)', unit: 'mg/L', min: 0, max: 30, optimal: 10, icon: 'TestTube2', note: 'Fosfor kaynağı' },
    { key: 'alkalinity', name: 'Alkalinite', unit: 'mg/L CaCO₃', min: 50, max: 200, optimal: 100, icon: 'Beaker', note: 'Tampon kapasitesi' },
    { key: 'hardness', name: 'Sertlik', unit: 'mg/L CaCO₃', min: 20, max: 150, optimal: 80, icon: 'Droplets', note: 'Ca+Mg' }
  ],
  biological: [
    { key: 'cellCount', name: 'Hücre Sayısı', unit: 'x10⁶/ml', min: 0, max: 50, optimal: 25, icon: 'Microscope', note: 'Hemositometre' },
    { key: 'cellDensity', name: 'Hücre Yoğunluğu', unit: 'g/L', min: 0, max: 5, optimal: 2.5, icon: 'Weight', note: 'Kuru ağırlık' },
    { key: 'CO2', name: 'CO₂ Besleme', unit: 'L/dk', min: 0, max: 10, optimal: 2, icon: 'Wind', note: 'Karbon kaynağı' }
  ]
};

// ========================================
// LABORATUVAR DEFTERİ ŞABLONU
// ========================================

export const labJournalTemplate = {
  sections: [
    { key: 'purpose', name: 'Amaç', placeholder: 'Bugünkü işlemin amacını yazın...' },
    { key: 'procedure', name: 'İşlem', placeholder: 'Yapılan işlemleri sırasıyla yazın...' },
    { key: 'risks', name: 'Riskler', placeholder: 'Olası riskler ve önlemler...' },
    { key: 'checkpoints', name: 'Kontrol Noktaları', placeholder: 'Kritik kontrol noktaları...' },
    { key: 'lessons', name: 'Alınan Ders', placeholder: 'Bugün öğrenilen veya fark edilen...' },
    { key: 'observations', name: 'Günlük Gözlem', placeholder: 'Genel gözlemler ve notlar...' },
    { key: 'additionalAnalysis', name: 'Ek Analizler', placeholder: 'Yapılan ek testler...' },
    { key: 'nextSteps', name: 'Yarın Yapılacaklar', placeholder: 'Planlanan işler...' }
  ],
  routineChecks: [
    { key: 'cleaning', name: 'Temizlik', checked: false },
    { key: 'sterilization', name: 'Sterilizasyon', checked: false },
    { key: 'measurement', name: 'Ölçüm', checked: false },
    { key: 'production', name: 'İmalat', checked: false },
    { key: 'morningPhoto', name: 'Sabah Fotoğraf', checked: false },
    { key: 'eveningPhoto', name: 'Akşam Fotoğraf', checked: false }
  ]
};

export default {
  mediumLibrary,
  materialInventory,
  totalMaterialCost,
  productionMaterialCost,
  nonProductionCost,
  monitoringParameters,
  labJournalTemplate
};

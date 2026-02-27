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
  { id: 73, category: 'Lab Malzeme', name: 'pH Kalibrasyon Çözeltileri (pH 4, 7, 10)', quantity: 1, unit: 'set', unitPrice: 150, totalCost: 150, date: '2024-02', usedInProduction: true, consumable: true },

  // 2026-02 Alışveriş Entegrasyonu (KDV + Kargo Dağıtımı Uygulandı)
  { id: 74, category: 'Kimyasal', name: 'Amonyum Molibdat (Ammonium Molybdate) 100 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 891.9, totalCost: 891.9, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 726.01, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 75, category: 'Kimyasal', name: 'Boncuk Kostik (Sodyum Hidroksit) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 260.27, totalCost: 260.27, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 199.65, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 76, category: 'Kimyasal', name: 'Mangan Sülfat (Manganese Sulphate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 129.59, totalCost: 129.59, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 90.75, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 77, category: 'Kimyasal', name: 'Askorbik Asit (Ascorbic Acid) (Vitamin C) (E 300) 250 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 162.27, totalCost: 162.27, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 117.98, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 78, category: 'Kimyasal', name: 'Sodyum Nitrat (Sodium Nitrate) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 140.49, totalCost: 140.49, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 99.83, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 79, category: 'Kimyasal', name: 'Salisilik Asit (Salicylic Acid) 100 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 123.06, totalCost: 123.06, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 85.31, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 80, category: 'Kimyasal', name: 'Sodyum Tiyosülfat (Sodium Thiosulfate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 105.64, totalCost: 105.64, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 70.79, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 81, category: 'Kimyasal', name: 'Sodyum Persülfat (Sodium Persulfate) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 147.01, totalCost: 147.01, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 105.27, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 82, category: 'Kimyasal', name: 'Amonyum Persülfat (Ammonium Persulfate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 184.05, totalCost: 184.05, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 136.13, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 83, category: 'Kimyasal', name: 'Amonyum Sülfat (Ammonium Sulphate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 81.67, totalCost: 81.67, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 50.82, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 84, category: 'Kimyasal', name: 'Mono Amonyum Fosfat (Mono Ammonium Phosphate) (MAP) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 319.08, totalCost: 319.08, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 248.66, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 85, category: 'Kimyasal', name: 'Disodyum Fosfat (Disodium Phosphate) (DSP) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 205.83, totalCost: 205.83, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 154.28, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 86, category: 'Kimyasal', name: 'Monosodyum Fosfat (Monosodium Phosphate) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 271.17, totalCost: 271.17, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 208.73, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 87, category: 'Kimyasal', name: 'Sodyum Sülfit (Sodium Sulphite) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 173.15, totalCost: 173.15, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 127.05, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 88, category: 'Kimyasal', name: 'Sodyum Nitrit (Sodium Nitrite) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 170.98, totalCost: 170.98, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 125.24, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 89, category: 'Kimyasal', name: 'Sodyum Bikarbonat (Sodium Bicarbonate) (E 500) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 81.67, totalCost: 81.67, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 50.82, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 90, category: 'Kimyasal', name: 'Sodyum Bisülfat (Sodium Bisulphate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 86.03, totalCost: 86.03, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 54.45, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 91, category: 'Kimyasal', name: 'Sodyum Hipoklorit (HYPO) 20 Kg. Bidon', quantity: 1, unit: 'paket', unitPrice: 388.78, totalCost: 388.78, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 306.74, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 92, category: 'Kimyasal', name: 'Potasyum Nitrat (Potassium Nitrate) 5 Kg. Koli', quantity: 1, unit: 'paket', unitPrice: 843.97, totalCost: 843.97, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 686.07, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 93, category: 'Kimyasal', name: 'Hidroklorik Asit (Tuz Ruhu) HCL 1 Kg. Şişe', quantity: 1, unit: 'paket', unitPrice: 194.5, totalCost: 194.5, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 144.84, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 94, category: 'Kimyasal', name: 'Vanilin Etil (Ethyl Vanillin) (E 107) 100 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 208, totalCost: 208, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 156.09, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 95, category: 'Kimyasal', name: 'Bakır Sülfat (Göz Taşı) (Copper Sulphate) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 364.81, totalCost: 364.81, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 286.77, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 96, category: 'Kimyasal', name: 'Tartarik Asit (Tartaric acid) (E 334) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 303.83, totalCost: 303.83, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 235.95, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 97, category: 'Kimyasal', name: 'Trisodyum Sitrat (Trisodium Citrate) (E 331) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 247.2, totalCost: 247.2, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 188.76, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 98, category: 'Kimyasal', name: 'Sitrik Asit Monohidrat (Citric Acid Monohydrate) (E 330) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 153.55, totalCost: 153.55, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 110.72, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 99, category: 'Kimyasal', name: 'Potasyum Hidroksit (Potassium Hydroxide) (Potas Kostik) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 325.61, totalCost: 325.61, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 254.1, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 100, category: 'Kimyasal', name: 'Polisorbat 80 (Polysorbate) 500 Gr. Şişe', quantity: 1, unit: 'paket', unitPrice: 347.39, totalCost: 347.39, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 272.25, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 101, category: 'Kimyasal', name: 'Potasyum Sülfat (Potassium Sulphate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 173.15, totalCost: 173.15, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 127.05, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 102, category: 'Kimyasal', name: 'Potasyum Karbonat (Potassium Carbonate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 292.95, totalCost: 292.95, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 226.88, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 103, category: 'Kimyasal', name: 'Potasyum Alüminyum Sülfat (Potassium Aluminum Sulfate) (ŞAP) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 129.59, totalCost: 129.59, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 90.75, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 104, category: 'Kimyasal', name: 'Potasyum Klorür (Potassium Chloride) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 314.73, totalCost: 314.73, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 245.03, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 105, category: 'Kimyasal', name: 'Mono Potasyum Fosfat (MKP) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 277.69, totalCost: 277.69, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 214.17, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 106, category: 'Kimyasal', name: 'Kalsiyum Nitrat (Calcium Nitrate) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 133.95, totalCost: 133.95, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 94.38, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 107, category: 'Kimyasal', name: 'Kalsiyum Hidroksit (Calcium Hydroxide) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 129.59, totalCost: 129.59, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 90.75, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 108, category: 'Kimyasal', name: 'Bitkisel Gliserin, Gıda ve İlaç Tipi (E 422) 1 Kg. Şişe', quantity: 1, unit: 'paket', unitPrice: 199.29, totalCost: 199.29, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 148.83, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 109, category: 'Kimyasal', name: 'Fosforik Asit, Teknik Kalite %85 1 Kg. Şişe', quantity: 1, unit: 'paket', unitPrice: 325.18, totalCost: 325.18, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 253.74, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 110, category: 'Kimyasal', name: 'Dikalsiyum Fosfat (Dicalcium Phosphate) (DCP) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 129.59, totalCost: 129.59, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 90.75, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 111, category: 'Kimyasal', name: 'Diamonyum Fosfat (Diammonium Phosphate) (DAP) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 175.33, totalCost: 175.33, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 128.87, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 112, category: 'Kimyasal', name: 'Çinko Sülfat Monohidrat (Teknik Kalite) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 168.79, totalCost: 168.79, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 123.42, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 113, category: 'Kimyasal', name: 'Hint Yağı (Castor Oil) 500 Gr. Şişe', quantity: 1, unit: 'paket', unitPrice: 179.69, totalCost: 179.69, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 132.5, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 114, category: 'Kimyasal', name: 'Bitkisel Protein (Vegetable Protein) (Hidrolize) 100 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 93.01, totalCost: 93.01, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 60.27, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 115, category: 'Kimyasal', name: 'Alüminyum Hidroksit %99 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 260.27, totalCost: 260.27, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 199.65, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 116, category: 'Kimyasal', name: 'Amonyum Bikarbonat (E 503) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 162.27, totalCost: 162.27, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 117.98, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 117, category: 'Kimyasal', name: 'Asetik Asit (Acetic Acid) %80 1 Kg. Şişe', quantity: 1, unit: 'paket', unitPrice: 179.69, totalCost: 179.69, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 132.5, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 118, category: 'Kimyasal', name: 'Amonyum Klorür, Nişadır (Ammonium Chloride) (E 510) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 162.27, totalCost: 162.27, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 117.98, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 119, category: 'Kimyasal', name: 'Sodyum Molibdat (Sodium Molybdate) 100 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 347.39, totalCost: 347.39, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 272.25, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 120, category: 'Kimyasal', name: 'Sülfamik Asit (Sulfamic Acid) 500 Gr. Paket', quantity: 1, unit: 'paket', unitPrice: 227.61, totalCost: 227.61, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 172.43, shippingCost: 20.69, source: 'kimyasaldepom-1' },
  { id: 121, category: 'Kimyasal', name: 'Sodyum Asetat (Gıda Kalite) (E 262i) 1 Kg. Paket', quantity: 1, unit: 'paket', unitPrice: 404.02, totalCost: 404.02, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 319.44, shippingCost: 20.69, source: 'kimyasaldepom-1' },

  { id: 122, category: 'Kimyasal', name: 'Fenolftalein İndikatör Çözeltisi 50 ml', quantity: 1, unit: 'adet', unitPrice: 174.88, totalCost: 174.88, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 145.73, source: 'kimyalab-2' },
  { id: 123, category: 'Kimyasal', name: 'Phenol Red İndikatör Çözeltisi 50 ml', quantity: 1, unit: 'adet', unitPrice: 216.91, totalCost: 216.91, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 180.76, source: 'kimyalab-2' },
  { id: 124, category: 'Lab Malzeme', name: 'Milwaukee pH Tampon Çözeltileri (4.01 / 7.01 / 10.01)', quantity: 1, unit: 'set', unitPrice: 347.98, totalCost: 347.98, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 289.98, source: 'kimyalab-2' },
  { id: 125, category: 'Lab Malzeme', name: 'Milwaukee TDS Kalibrasyon Çözeltisi 1382 ppm', quantity: 1, unit: 'adet', unitPrice: 96.66, totalCost: 96.66, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 80.55, source: 'kimyalab-2' },
  { id: 126, category: 'Lab Malzeme', name: 'Milwaukee İletkenlik Kalibrasyon Çözeltisi 1413 µS', quantity: 1, unit: 'paket', unitPrice: 96.66, totalCost: 96.66, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 80.55, source: 'kimyalab-2' },
  { id: 127, category: 'Kimyasal', name: 'Bromkrezol Yeşili Çözelti 50 ml', quantity: 1, unit: 'adet', unitPrice: 216.91, totalCost: 216.91, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 180.76, source: 'kimyalab-2' },
  { id: 128, category: 'Kimyasal', name: 'Eriochrome Black T 10 g', quantity: 1, unit: 'adet', unitPrice: 145, totalCost: 145, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 120.83, source: 'kimyalab-2' },
  { id: 129, category: 'Kimyasal', name: 'Metilen Mavisi Çözeltisi 100 ml', quantity: 1, unit: 'adet', unitPrice: 172, totalCost: 172, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 143.33, source: 'kimyalab-2' },
  { id: 130, category: 'Kimyasal', name: 'Kristal Viyole Çözeltisi 100 ml', quantity: 1, unit: 'adet', unitPrice: 198.82, totalCost: 198.82, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 165.68, source: 'kimyalab-2' },
  { id: 131, category: 'Kimyasal', name: 'Potasyum Permanganat 250 g', quantity: 1, unit: 'adet', unitPrice: 338.3, totalCost: 338.3, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 281.92, source: 'kimyalab-2' },
  { id: 132, category: 'Kimyasal', name: 'Sodyum Dodesil Sülfat (SDS/SLS) 500 g', quantity: 1, unit: 'adet', unitPrice: 410.81, totalCost: 410.81, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 342.34, source: 'kimyalab-2' },
  { id: 133, category: 'Lab Ekipman', name: 'Aynalı Neubauer Sayım Lamı', quantity: 1, unit: 'adet', unitPrice: 884.68, totalCost: 884.68, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 737.23, source: 'kimyalab-2' },
  { id: 134, category: 'Lab Malzeme', name: 'pH Kağıdı (0-14 Universal)', quantity: 1, unit: 'adet', unitPrice: 159.73, totalCost: 159.73, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 133.11, source: 'kimyalab-2' },
  { id: 135, category: 'Kimyasal', name: 'Safranin 100 ml', quantity: 1, unit: 'şişe', unitPrice: 216.91, totalCost: 216.91, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 180.76, source: 'kimyalab-2' },
  { id: 136, category: 'Lab Malzeme', name: 'Otomatik Pipet Ucu 200 µL (1000 adet)', quantity: 1, unit: 'paket', unitPrice: 193.32, totalCost: 193.32, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 161.1, source: 'kimyalab-2' },
  { id: 137, category: 'Lab Malzeme', name: 'Otomatik Pipet Ucu 10 µL (1000 adet)', quantity: 1, unit: 'paket', unitPrice: 241.66, totalCost: 241.66, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 201.38, source: 'kimyalab-2' },
  { id: 138, category: 'Lab Malzeme', name: 'Plastik Beher 25 ml', quantity: 1, unit: 'adet', unitPrice: 21.74, totalCost: 21.74, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 18.12, source: 'kimyalab-2' },
  { id: 139, category: 'Lab Malzeme', name: 'Plastik Beher 50 ml', quantity: 1, unit: 'adet', unitPrice: 26.58, totalCost: 26.58, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 22.15, source: 'kimyalab-2' },
  { id: 140, category: 'Lab Malzeme', name: 'Plastik Beher 1000 ml', quantity: 1, unit: 'adet', unitPrice: 169.15, totalCost: 169.15, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 140.96, source: 'kimyalab-2' },
  { id: 141, category: 'Lab Malzeme', name: 'Plastik Beher 500 ml', quantity: 1, unit: 'adet', unitPrice: 96.66, totalCost: 96.66, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 80.55, source: 'kimyalab-2' },
  { id: 142, category: 'Lab Malzeme', name: 'Plastik Beher 100 ml', quantity: 2, unit: 'adet', unitPrice: 43.5, totalCost: 87, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 72.5, source: 'kimyalab-2' },
  { id: 143, category: 'Lab Malzeme', name: 'Plastik Beher 2000 ml', quantity: 1, unit: 'adet', unitPrice: 193.32, totalCost: 193.32, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 161.1, source: 'kimyalab-2' },

  { id: 144, category: 'Kimyasal', name: 'Hidrojen Peroksit %50 (1 L)', quantity: 1, unit: 'adet', unitPrice: 298.18, totalCost: 298.18, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 248.48, source: 'oksilab-4' },
  { id: 145, category: 'Kimyasal', name: 'Sülfürik Asit %97 (5 L)', quantity: 1, unit: 'adet', unitPrice: 675.12, totalCost: 675.12, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 562.6, source: 'oksilab-4' },
  { id: 146, category: 'Kimyasal', name: 'Nitrik Asit %52-56 (1 L)', quantity: 1, unit: 'adet', unitPrice: 166.28, totalCost: 166.28, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 138.57, source: 'oksilab-4' },
  { id: 147, category: 'Kimyasal', name: 'Dipotasyum Hidrojen Fosfat (K2HPO4) 1 Kg', quantity: 1, unit: 'adet', unitPrice: 736.39, totalCost: 736.39, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 613.66, source: 'oksilab-4' },
  { id: 148, category: 'Kimyasal', name: 'Ehrlich S Reaktifi 100 ml', quantity: 1, unit: 'adet', unitPrice: 0, totalCost: 0, date: '2026-02', usedInProduction: true, source: 'n11-5', note: 'Fiyat/fatura bilgisi bekleniyor' },

  { id: 149, category: 'Aydınlatma', name: 'Noas 50W 6500K LED Torch Ampul (YL95-5001)', quantity: 2, unit: 'adet', unitPrice: 150.53, totalCost: 301.06, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 216.22, shippingCost: 41.61, source: 'elektromarket-6' },
  { id: 150, category: 'Aydınlatma', name: 'Cata Slim Sıva Üstü Panel Driver (CT-2516)', quantity: 4, unit: 'adet', unitPrice: 40, totalCost: 160, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 64, shippingCost: 83.22, source: 'elektromarket-6' },
  { id: 151, category: 'Aydınlatma', name: 'Cata 36W 6400K Bant Armatür (CT-2478B)', quantity: 30, unit: 'adet', unitPrice: 131.21, totalCost: 3936.3, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: false, useInvoiceMode: true, invoiceTotal: 2760, shippingCost: 624.17, source: 'elektromarket-6' },

  { id: 152, category: 'Ölçüm Cihazları', name: 'BASTORE Kalem Tipi TDS + pH Metre Seti', quantity: 1, unit: 'adet', unitPrice: 355, totalCost: 355, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: true, source: 'trendyol-7' },
  { id: 153, category: 'Pompa', name: '12V Akülü Su Aktarma ve İlaçlama Pompası', quantity: 1, unit: 'adet', unitPrice: 319, totalCost: 319, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: true, source: 'trendyol-7' },
  { id: 154, category: 'Kimyasal', name: 'İzopropil Alkol 5 Litre', quantity: 1, unit: 'adet', unitPrice: 460, totalCost: 460, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: true, source: 'trendyol-7' },
  { id: 155, category: 'Kimyasal', name: 'Aseton 5 Litre', quantity: 1, unit: 'adet', unitPrice: 330, totalCost: 330, date: '2026-02', usedInProduction: true, kdvRate: 20, kdvIncluded: true, source: 'trendyol-7' },
  { id: 156, category: 'Lab Ekipman', name: 'Mikroskop Yedek Parça Paketi (objektif, tabla, lamba, vidalar)', quantity: 1, unit: 'paket', unitPrice: 2000, totalCost: 2000, date: '2026-02', usedInProduction: true, source: 'letgo-8' }
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
    { key: 'OD680Concentration', name: 'OD680 Gerçek Değer', unit: 'mg/L', min: 0, max: 5000, optimal: 1200, icon: 'Beaker', note: 'Kalibrasyon eğrisi ile hesaplanan konsantrasyon' },
    { key: 'OD750Concentration', name: 'OD750 Gerçek Değer', unit: 'mg/L', min: 0, max: 5000, optimal: 900, icon: 'Beaker', note: 'Kalibrasyon eğrisi ile hesaplanan konsantrasyon' },
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

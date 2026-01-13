// Tank yapısı ve seviyeleri
// K = 1L Kavanoz, S = 5L Şişe, V = 70L Kova, IBC = 1000L IBC Tank
export const tankSystem = {
  kavanozlar: {
    KA: { series: 'A', count: 5, volume: 1, type: 'K', unit: 'L', prefix: 'K' },
    KB: { series: 'B', count: 5, volume: 1, type: 'K', unit: 'L', prefix: 'K' },
    KC: { series: 'C', count: 5, volume: 1, type: 'K', unit: 'L', prefix: 'K' },
    KD: { series: 'D', count: 5, volume: 1, type: 'K', unit: 'L', prefix: 'K' }
  },
  siseler: {
    SA: { series: 'A', count: 6, volume: 5, type: 'S', unit: 'L', prefix: 'S', tanks: ['SA1', 'SA2', 'SA3', 'SA4', 'SA5', 'SA6'] },
    SB: { series: 'B', count: 6, volume: 5, type: 'S', unit: 'L', prefix: 'S', tanks: ['SB1', 'SB2', 'SB3', 'SB4', 'SB5', 'SB6'] },
    SC: { series: 'C', count: 6, volume: 5, type: 'S', unit: 'L', prefix: 'S', tanks: ['SC1', 'SC2', 'SC3', 'SC4', 'SC5', 'SC6'] },
    SD: { series: 'D', count: 6, volume: 5, type: 'S', unit: 'L', prefix: 'S', tanks: ['SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6'] }
  },
  kovalar: {
    VA: { series: 'A', count: 4, volume: 70, type: 'V', unit: 'L', prefix: 'V', tanks: ['VA1', 'VA2', 'VA3', 'VA4'] },
    VB: { series: 'B', count: 4, volume: 70, type: 'V', unit: 'L', prefix: 'V', tanks: ['VB1', 'VB2', 'VB3', 'VB4'] },
    VC: { series: 'C', count: 2, volume: 70, type: 'V', unit: 'L', prefix: 'V', tanks: ['VC1', 'VC2'] }
  },
  ibcler: {
    IBC: { series: '', count: 4, volume: 1000, type: 'IBC', unit: 'L', prefix: 'IBC', tanks: ['IBC1', 'IBC2', 'IBC3', 'IBC4'] }
  }
};

// Besin yeri formülleri (BBM - Bold Basal Medium)
export const bbmFormulas = {
  stockA_1L: {
    name: 'Ana Stok A (1L için)',
    volume: 500,
    unit: 'ml',
    dosage: '100ml/L',
    components: [
      { name: 'Üre', amount: 1.5, unit: 'g', pricePerKg: 30 },
      { name: 'MKP', amount: 0.75, unit: 'g', pricePerKg: 150 },
      { name: 'MgSO4', amount: 1.2, unit: 'g', pricePerKg: 63 },
      { name: 'Karbonat', amount: 1, unit: 'g', pricePerKg: 45 }
    ]
  },
  stockB_5L: {
    name: 'Ana Stok B (5L için)',
    volume: 500,
    unit: 'ml',
    dosage: '100ml/5L (20ml/L)',
    components: [
      { name: 'Üre', amount: 7.5, unit: 'g', pricePerKg: 30 },
      { name: 'MKP', amount: 3.75, unit: 'g', pricePerKg: 150 },
      { name: 'MgSO4', amount: 6, unit: 'g', pricePerKg: 63 },
      { name: 'Karbonat', amount: 1, unit: 'g', pricePerKg: 45 }
    ]
  },
  caStock: {
    name: 'Ca Stok',
    volume: 100,
    unit: 'ml',
    dosage: '5ml/L',
    components: [
      { name: 'Ca', amount: 0.75, unit: 'g', pricePerKg: 103 }
    ]
  },
  feStock: {
    name: 'Fe Stok',
    volume: 50,
    unit: 'ml',
    dosage: '0.1ml/L',
    components: [
      { name: 'Sitrik Asit', amount: 0.8, unit: 'g', pricePerKg: 25 },
      { name: 'EDTA', amount: 0.8, unit: 'g', pricePerKg: 476 },
      { name: 'FeSO4', amount: 0.5, unit: 'g', pricePerKg: 218 }
    ]
  },
  phAdjust: {
    name: 'pH Ayar Stok',
    volume: 1000,
    unit: 'ml',
    dosage: 'Değişken',
    components: [
      { name: 'HCl (0.33M)', amount: 20, unit: 'ml', pricePerKg: 50 }
    ]
  }
};

// Fizibilite verileri
export const feasibilityData = {
  investment: {
    equipment: [
      { name: 'Spektrofotometre + Mikroskop', count: 1, price: 28000, total: 28000 },
      { name: 'Hailea Kompresör + pH + TDS', count: 1, price: 2266, total: 2266 },
      { name: 'Terazi + Refraktometre', count: 1, price: 982, total: 982 }
    ],
    tanks: [
      { name: 'IBC Tank x4', count: 4, price: 2500, total: 10000 },
      { name: '100L Varil + 5L Şişe', count: 1, price: 2000, total: 2000 }
    ],
    lighting: [
      { name: 'LED Sistem Toplam', count: 1, price: 2000, total: 2000 }
    ],
    plumbing: [
      { name: 'Tüm Tesisat Malzemeleri', count: 1, price: 2000, total: 2000 }
    ],
    total: 54827
  },
  fixedCosts: {
    perCycle: 40, // gün
    items: [
      { name: 'Elektrik', amount: 1375, unit: 'kWh', unitPrice: 5.5, total: 7564 },
      { name: 'Su', amount: 3000, unit: 'L', unitPrice: 0.05, total: 150 },
      { name: 'İşçilik', amount: 40, unit: 'gün', unitPrice: 500, total: 20000 },
      { name: 'Ekipman Amortisman', total: 5451 },
      { name: 'Bakım & Onarım', total: 500 },
      { name: 'Genel Giderler', total: 2000 }
    ],
    total: 35665
  },
  variableCosts: {
    scenario1: { // 1-2. Üretim (Müşteri aljinat verir)
      items: [
        { name: 'Başlangıç Kültürü', amount: '100ml', price: 2000, total: 2000 },
        { name: 'BBM Besiyeri Makro', note: '3000L için', total: 150 },
        { name: 'BBM Mikro', note: '3000L için', total: 50 },
        { name: 'BBM Yenileme Stoğu', note: 'x3 kat', total: 600 },
        { name: 'Kostik (NaOH)', amount: '1.5kg', pricePerKg: 30, total: 45 },
        { name: 'Sitrik Asit', amount: '1.5kg', pricePerKg: 25, total: 38 }
      ],
      total: 4127
    },
    scenario3Plus: { // 3+ Üretim (Kendi aljinatı kullanır)
      items: [
        { name: 'Sodyum Aljinat', amount: '30kg', pricePerKg: 900, total: 27000 },
        { name: 'BBM Besiyeri Makro', total: 150 },
        { name: 'BBM Mikro', total: 50 },
        { name: 'BBM Yenileme', total: 600 },
        { name: 'Kostik + Sitrik', total: 83 }
      ],
      total: 31127
    }
  },
  profitAnalysis: {
    production: 1000, // kg
    priceUSD: {
      low: 3,
      high: 4
    },
    exchangeRate: 50,
    priceTL: {
      low: 150,
      high: 200
    },
    margins: {
      firstTwo: {
        revenue: 150000,
        fixedCost: 35665,
        variableCost: 4127,
        totalCost: 39792,
        profit: 110208,
        profitMargin: 73.5
      },
      thirdPlus: {
        revenue: 150000,
        fixedCost: 35665,
        variableCost: 31127,
        totalCost: 66792,
        profit: 83208,
        profitMargin: 55.5
      }
    }
  },
  cashFlow: [
    { month: 0, production: 'Yatırım', revenue: 0, cost: -54827, profit: -54827, cumulative: -54827 },
    { month: 1.5, production: '1. Üretim', revenue: 150000, cost: 39792, profit: 110208, cumulative: 55381 },
    { month: 3, production: '2. Üretim', revenue: 150000, cost: 39792, profit: 110208, cumulative: 165589 },
    { month: 4.5, production: '3. Üretim', revenue: 150000, cost: 66792, profit: 83208, cumulative: 248797 },
    { month: 6, production: '4. Üretim', revenue: 150000, cost: 66792, profit: 83208, cumulative: 332005 }
  ]
};

// Üretim planı
export const productionPlan = [
  { day: 0, stage: 'Başlangıç', volume: '100ml', container: 'Şişe', task: 'Starter kültür alımı', note: '2.000 TL maliyet' },
  { day: 5, stage: '1. Çoğaltma', volume: '5 x 1L', container: '5L Şişe', task: '100ml → 5 x 1L', note: '1L anaç ayrılır' },
  { day: 12, stage: '2. Çoğaltma', volume: '4 x 5L', container: '5L Şişe', task: '1L → 5L (x4)', note: 'BBM ekle, havalandır' },
  { day: 20, stage: '3. Çoğaltma', volume: '4 x 100L', container: '100L Varil', task: '5L → 100L (x4)', note: 'Yoğun besleme başlar' },
  { day: 30, stage: 'Ana Üretim', volume: '3 x 1000L', container: '3 IBC Tank', task: '100L → 1000L', note: '3 tank üretime, 1 yedek' },
  { day: 35, stage: 'Hasat Hazırlık', volume: '3000L', container: '3 IBC Tank', task: 'OD680 ölçümü', note: 'Hedef: OD > 2.0' },
  { day: 40, stage: 'Hasat', volume: '~1000kg', container: '3 IBC Tank', task: 'Santrifüj + Kurutma', note: 'Hedef: 1 ton kuru' }
];

// Kimyasal fiyatları
export const chemicalPrices = {
  'NaNO3': { name: 'Sodyum Nitrat', formula: 'NaNO3', mw: 85, pricePerKg: 140 },
  'KNO3': { name: 'Potasyum Nitrat', formula: 'KNO3', mw: 101.1, pricePerKg: 139.99 },
  'K2HPO4': { name: 'Dipotasyum Fosfat', formula: 'K2HPO4', mw: 174.2, pricePerKg: 150 },
  'KH2PO4': { name: 'Monopotasyum Fosfat', formula: 'KH2PO4', mw: 136.1, pricePerKg: 210 },
  'MgSO4': { name: 'Magnezyum Sülfat', formula: 'MgSO4·7H2O', mw: 246.5, pricePerKg: 63 },
  'CaCl2': { name: 'Kalsiyum Klorür', formula: 'CaCl2·2H2O', mw: 147, pricePerKg: 103 },
  'NaCl': { name: 'Sodyum Klorür', formula: 'NaCl', mw: 58.44, pricePerKg: 10 },
  'FeSO4': { name: 'Demir Sülfat', formula: 'FeSO4·7H2O', mw: 278, pricePerKg: 218 },
  'EDTA': { name: 'EDTA', formula: 'EDTA', mw: 292, pricePerKg: 476 },
  'Urea': { name: 'Üre', formula: 'CO(NH2)2', mw: 60, pricePerKg: 30 },
  'Citric': { name: 'Sitrik Asit', formula: 'C6H8O7', mw: 192, pricePerKg: 25 }
};

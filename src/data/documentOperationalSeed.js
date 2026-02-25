export const LEARNING_CENTER_TOPIC_SEEDS = [
  {
    id: 'lc_od_linearity_policy',
    title: 'OD Lineerlik ve Güvenilir Ölçüm Politikası',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'high',
    reviewStatus: 'reviewed',
    content: `## Lineerlik
- OD ölçümlerinde güvenli lineer pencere: genellikle 0.1-0.8
- 1.0 üzeri değerlerde gölgeleme etkisi ile cihaz doğruluğu düşebilir

## Seyreltme kararı
- OD > 0.8 ise seyreltme zorunlu
- Seyreltme faktörü ölçüm kaydına yazılmalı

## Dalga boyu yorumu
- OD750: biyokütle/sayı için daha kararlı
- OD680: pigment durumu için güçlü gösterge`
  },
  {
    id: 'lc_od_dilution_decision_tree',
    title: 'OD Seyreltme Karar Ağacı (1:2 / 1:10 / 1:20)',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    content: `## Pratik karar ağacı
- OD <= 0.8: doğrudan ölç
- 0.8 < OD <= 1.5: 1:2 veya 1:5 ile tekrar ölç
- OD > 1.5: 1:10 ve üzeri seyreltme ile tekrar ölç

## Kural
- Sonuç raporunda: Ölçülen OD × seyreltme faktörü`
  },
  {
    id: 'lc_co2_daynight_control',
    title: 'CO2 ile pH Kontrolü (Gündüz/Gece Mantığı)',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'high',
    reviewStatus: 'reviewed',
    content: `## pH kontrol mantığı
- pH > 8.5: CO2 artır
- pH < 7.0: CO2 azalt/kapat
- Üre kullanılan sistemlerde pH 9+ bölgesi kritik takip gerektirir

## Gece modu
- Fotosentez düşükken aşırı asit müdahalesi yapma
- Sabah ilk ölçüm ile düzeltme kararı ver`
  },
  {
    id: 'lc_blackout_incident_recovery',
    title: 'Elektrik Kesintisi Olay Kurtarma SOP',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    content: `## Olay tipi
- Elektrik kesintisi + havalandırma kaybı + pH çökmesi

## İlk aksiyonlar
1. Kontrollü aerasyon geri ver
2. pH düzeltmesini kademeli yap
3. Ani güçlü baz/asit şokundan kaçın
4. Canlılık ve OD trendini kısa aralıkla takip et`
  },
  {
    id: 'lc_floc_defloc_limits',
    title: 'Flok/Deflok Operasyon Sınırları',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    content: `## Flokülasyon
- pH 9.5-10.0 hedef bandı
- CaCl2 dozu jar test ile belirlenmeli

## Deflokülasyon
- pH 7.0-7.5 geri dönüş bandı
- pH 6 altına sert inişten kaçın
- Süre uzarsa canlılık kaybı riski artar`
  },
  {
    id: 'lc_quality_ratio_od680_750',
    title: 'OD680/OD750 Oranı ile Kalite Yorumu',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    content: `## Oran yorumu
- OD680/OD750 yüksek: pigment/sağlık iyi olabilir
- Oran düşüşü: pigment kaybı veya stres işareti olabilir

## Kural
- Hücre sayısı yorumunda OD750 önceliklidir`
  },
  {
    id: 'lc_cold_chain_labeling',
    title: 'Soğuk Zincir ve Etiket Standardı',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'high',
    reviewStatus: 'reviewed',
    content: `## Etiket zorunluları
- Parti/Lot No
- Üretim tarihi
- +4°C saklama uyarısı
- "Kullanmadan önce çalkalayınız"

## Garanti
- Teslim anı canlılık garantisi ayrı,
- Raf ömrü penceresi ayrı modellenmeli`
  },
  {
    id: 'lc_double_beam_spectro_sop',
    title: 'Double-Beam Spektro Ölçüm SOP',
    parentId: '',
    format: 'markdown',
    source: 'Xgemini su kalitesi analizleri.txt',
    sourceType: 'chat',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    content: `## SOP
1. Cihaz dalga boyunu seç
2. Blank ile sıfırla
3. Referans ve numune akışını sabit tut
4. Aynı yöntem için aynı küvet tipi kullan

## QA
- Blank drift kontrolü
- Kalibrasyon R² eşiği takip`
  }
];

export const PRODUCTION_PLAN_SEEDS = [
  {
    id: 'seed_production_delivery_50m',
    product: 'Canlı Chlorella Teslim Planı',
    target: 20,
    unit: 'L',
    deadline: '',
    status: 'planned',
    progress: 0,
    deliveryGuaranteeType: 'deliveryOnly',
    targetCellDensity: 50000000,
    overpackTargetCellDensity: 55000000,
    coldChainRequired: true,
    operationalLossAssumptions: {
      harvestLossPct: 10,
      shelfLossPct: 8
    },
    requiredChemicals: [],
    advisory: {
      estimatedDays: {
        min: 5,
        avg: 7,
        max: 10
      }
    },
    createdAt: new Date().toISOString()
  }
];

export const DAILY_STAGE_PLAN_SEEDS = [
  {
    id: 'seed_daily_plan_neon_goliath_titan',
    linkToProductionPlan: false,
    linkedProductionPlanId: '',
    linkedProductionPlanName: '',
    planName: 'NEON/GOLIATH/TITAN Günlük Operasyon Planı',
    startDate: new Date().toISOString().split('T')[0],
    totalDays: 7,
    selectedEnvironmentIds: [],
    createdAt: new Date().toISOString(),
    stages: [
      {
        id: 'stage_neon',
        name: 'NEON',
        durationDays: 3,
        phases: [
          {
            id: 'phase_neon_growth',
            name: 'Hızlı Büyüme',
            operation: 'Besleme + pH stabilizasyon + OD takibi',
            checks: [
              {
                id: 'check_neon_ph',
                metricKey: 'pH',
                mode: 'range',
                minValue: 7.0,
                maxValue: 8.5,
                targetValue: '',
                expectedObservation: 'pH güvenli bantta kalmalı',
                note: ''
              },
              {
                id: 'check_neon_od750',
                metricKey: 'OD750',
                mode: 'range',
                minValue: 0.1,
                maxValue: 0.8,
                targetValue: '',
                expectedObservation: 'OD750 artış trendi',
                note: '0.8 üzeri seyreltme planla'
              }
            ]
          }
        ]
      },
      {
        id: 'stage_goliath',
        name: 'GOLIATH',
        durationDays: 2,
        phases: [
          {
            id: 'phase_goliath_control',
            name: 'Yapısal Kontrol',
            operation: 'Flok/deflok hazırlık kontrolü',
            checks: [
              {
                id: 'check_goliath_od_ratio',
                metricKey: 'OD680',
                mode: 'target',
                targetValue: 0.7,
                minValue: '',
                maxValue: '',
                expectedObservation: 'OD680/OD750 oranı kalite ile uyumlu',
                note: ''
              }
            ]
          }
        ]
      },
      {
        id: 'stage_titan',
        name: 'TITAN',
        durationDays: 2,
        phases: [
          {
            id: 'phase_titan_delivery',
            name: 'Teslim Hazırlık',
            operation: 'Teslim garantisi doğrulama + soğuk zincir',
            checks: [
              {
                id: 'check_titan_density',
                metricKey: 'cellDensity',
                mode: 'target',
                targetValue: 50000000,
                minValue: '',
                maxValue: '',
                expectedObservation: 'Teslim minimum yoğunluğu sağlanmalı',
                note: ''
              }
            ]
          }
        ]
      }
    ]
  }
];

export const SPECTRO_CALIBRATION_OBJECT_SEEDS = {
  nitrite_griess_543: {
    name: 'Nitrit (Griess) 543nm',
    method: 'nitrite_griess_543',
    wavelength: 543,
    unit: 'mg/L NO2-N',
    equation: 'y = 14000x + 0.003',
    slope: 14000,
    intercept: 0.003,
    rSquared: 0.998,
    range: { min: 0.01, max: 2 },
    standards: [
      { concentration: 0.02, absorbance: 0.283 },
      { concentration: 0.05, absorbance: 0.703 },
      { concentration: 0.1, absorbance: 1.403 }
    ],
    createdDate: '2026-02-25',
    notes: 'Sulfanilamid + NED yöntemi'
  },
  nitrate_uv_220_275: {
    name: 'Nitrat (UV 220/275) ',
    method: 'nitrate_uv_220_275',
    wavelength: 220,
    unit: 'mg/L NO3-N',
    equation: 'A220 - 2*A275 = mC + b',
    slope: 1,
    intercept: 0,
    rSquared: 0.996,
    range: { min: 0.1, max: 20 },
    standards: [],
    createdDate: '2026-02-25',
    notes: 'UV düzeltmeli yaklaşım, quartz küvet önerilir'
  },
  calcium_hardness_murexide: {
    name: 'Kalsiyum Sertliği 520nm',
    method: 'calcium_hardness_murexide',
    wavelength: 520,
    unit: 'mg/L CaCO3',
    equation: 'y = 0.002x + 0.01',
    slope: 0.002,
    intercept: 0.01,
    rSquared: 0.995,
    range: { min: 5, max: 250 },
    standards: [],
    createdDate: '2026-02-25',
    notes: 'Murexide/EDTA yaklaşımı'
  },
  magnesium_by_difference: {
    name: 'Magnezyum (Fark Hesabı)',
    method: 'magnesium_by_difference',
    wavelength: 520,
    unit: 'mg/L CaCO3 eşdeğeri',
    equation: 'Mg = TotalHardness - CaHardness',
    slope: 1,
    intercept: 0,
    rSquared: 0.994,
    range: { min: 5, max: 250 },
    standards: [],
    createdDate: '2026-02-25',
    notes: 'Toplam sertlik - kalsiyum farkı'
  }
};

export const INTERVENTION_DICTIONARY_SEEDS = [
  {
    id: 'intervention_dict_fedbatch',
    type: 'fedbatch',
    label: 'Fed-Batch (Besin Takviyesi)',
    requiredParams: ['nutrient', 'amount', 'unit'],
    optionalParams: ['stockId', 'stockConcentrationValue', 'targetValue'],
    approvalLevel: 'operator'
  },
  {
    id: 'intervention_dict_flocculation',
    type: 'flocculation',
    label: 'Flokülasyon',
    requiredParams: ['amount', 'unit'],
    optionalParams: ['stockId', 'durationMin', 'targetValue'],
    approvalLevel: 'review_required'
  },
  {
    id: 'intervention_dict_deflocculation',
    type: 'deflocculation',
    label: 'Deflokülasyon',
    requiredParams: ['amount', 'unit'],
    optionalParams: ['stockId', 'durationMin'],
    approvalLevel: 'review_required'
  },
  {
    id: 'intervention_dict_incident_recovery',
    type: 'incident_recovery',
    label: 'Olay Kurtarma',
    requiredParams: ['reason'],
    optionalParams: ['currentValue', 'targetValue', 'durationMin'],
    approvalLevel: 'review_required'
  }
];

export const ANALYTICAL_QC_PROFILE_SEEDS = [
  {
    id: 'qc_tan_default',
    methodId: 'tan_phenol_hypochlorite_655',
    calibrationPoints: 5,
    minRSquared: 0.995,
    blankFrequency: 'each_batch',
    duplicateFrequency: 'every_10_samples',
    recoveryRangePct: [90, 110],
    driftLimitPct: 5
  },
  {
    id: 'qc_nitrite_default',
    methodId: 'nitrite_griess_543',
    calibrationPoints: 5,
    minRSquared: 0.995,
    blankFrequency: 'each_batch',
    duplicateFrequency: 'every_10_samples',
    recoveryRangePct: [90, 110],
    driftLimitPct: 5
  }
];

export const COLD_CHAIN_EVENT_TEMPLATE_SEEDS = [
  {
    id: 'cold_chain_template_default',
    shipmentId: '',
    timestamp: '',
    temperatureC: null,
    excursionFlag: false,
    durationMin: 0,
    dispositionDecision: 'pending'
  }
];

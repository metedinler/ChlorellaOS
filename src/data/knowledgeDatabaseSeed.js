export const KNOWLEDGE_DB_KEYS = {
  learningTopics: 'chlorellaKnowledgeTopics',
  specialStocks: 'chlorellaSpecialStockLibrary',
  feedingPrograms: 'chlorellaFeedingPrograms',
  spectroMethods: 'chlorellaSpectroMethodLibrary',
  processGuardrails: 'chlorellaProcessGuardrails',
  deliverySpecs: 'chlorellaDeliverySpecs',
  harvestBatches: 'chlorellaHarvestBatches',
  incidentLog: 'chlorellaIncidentLog',
  odCalibrationProfiles: 'chlorellaODCalibrationProfiles',
  interventionDictionary: 'chlorellaInterventionDictionary',
  analyticalQcProfiles: 'chlorellaAnalyticalQCProfiles',
  coldChainEvents: 'chlorellaColdChainEvents'
};

export const LEARNING_TOPIC_SEEDS = [
  {
    id: 'seed_bilgi_mass_balance',
    title: 'Canlı Chlorella Konsantrasyonu: Kütle Denkliği Planı',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    evidenceLevel: 'experimental',
    content: `## Amaç
20 L nihai üründe **≥50 milyon canlı hücre/mL** hedefine, geri dönüşlü flokülasyon + yeniden süspansiyon ile güvenli yaklaşım.

## Kritik Denklem
- Hedef toplam hücre: \(20,000\,mL \times 50,000,000 = 10^{12}\) hücre
- 55 L başlangıç için teorik minimum ortalama: \(10^{12}/55,000 \approx 18.2\) milyon/mL
- Operasyonel güvenlik için önerilen başlangıç ortalaması: **≥25 milyon/mL**

## Operasyon Önerisi
1. Jar test ile CaCl₂ + pH aralığını belirle
2. Flokülasyon (pH ~9.5-10.0)
3. Süpernatant uzaklaştır + yıkama
4. Sitrik asit ile deflokülasyon (pH 7.0-7.5)
5. Nihai standardizasyon (sayım + hacim ayarı)

## Risk Notu
Toplam operasyon süresi kısa tutulmalı; pH şokundan kaçınılmalı; soğuk zincir disiplini korunmalı.`
  },
  {
    id: 'seed_bilgi_od_ranges',
    title: 'OD Kılavuzu: Hücre Yoğunluğu İçin Pratik Referans Aralıkları',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    evidenceLevel: 'experimental',
    content: `## 25 milyon hücre/mL için pratik OD referansı
- **OD600:** yaklaşık 0.50 - 0.85
- **OD680:** yaklaşık 0.60 - 1.20
- **OD750:** yaklaşık 0.40 - 0.70

## Ölçüm Disiplini
- Yüksek absorbanslarda seyreltme kullan
- Mümkünse her laboratuvar kendi OD↔hücre kalibrasyonunu çıkarsın
- Pigment etkisini ayırmak için OD750 takibi özellikle değerlidir`
  },
  {
    id: 'seed_grok_two_phase',
    title: 'İki Evreli Büyüme/Şişirme Programı (NEON-GOLIATH-TITAN)',
    parentId: '',
    format: 'markdown',
    source: 'grok plan.md',
    sourceType: 'chat',
    trustLevel: 'low',
    reviewStatus: 'pending',
    evidenceLevel: 'hypothesis',
    content: `## Fazlar
- **NEON (0-72s):** hızlı bölünme, yüksek büyüme hızı
- **GOLIATH (72-120s):** bölünmeyi baskılayıp hacim artışı hedefi
- **TITAN (120-168s):** yeniden bölünme tetikleme

## Uygulama Notu
Bu yapı üretim planında **faz hedefi/checkpoint** mantığı ile kullanılmalı; her fazın giriş/çıkış kriteri ayrı izlenmelidir.`
  },
  {
    id: 'seed_xgemini_spectro_quality',
    title: 'Su Kalitesi Spektrofotometrik Parametre Paketi',
    parentId: '',
    format: 'markdown',
    source: 'Xgemini su kalitesi analizleri.txt',
    sourceType: 'chat',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    evidenceLevel: 'experimental',
    content: `## Öncelikli Parametreler
- TAN, NH₄-N, NH₃-N
- TP, PO₄-P
- Nitrit, Nitrat
- Alkalinite, Sertlik

## Kayıt Kuralı
Her analiz yöntemi için dalga boyu, lineer aralık, standart hazırlama, blank yaklaşımı ve kalibrasyon eğrisi metadata olarak saklanmalı.`
  },
  {
    id: 'topic_reversible_flocculation_protocol',
    title: 'Geri Dönüşlü Flokülasyon Protokolü (CaCl₂ + pH Shift)',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    evidenceLevel: 'experimental',
    content: `## Çekirdek adımlar
1. Jar test ile CaCl₂ doz aralığını belirle
2. pH 9.5-10.0 bandında flokülasyonu tetikle
3. Üst fazı ayır
4. Sitrik asit ile pH 7.0-7.5 bandında deflokülasyon yap

## Güvenlik sınırları
- pH 10.5 üzerine çıkma
- pH 6.0 altına inme
- Süreci kısa tut (canlılık kaybı riskini azalt)

## Operasyon metrikleri
- flocReopenScore
- resuspensionHomogeneity
- deliveryReadinessScore`
  },
  {
    id: 'topic_ph_risk_ladder',
    title: 'pH Risk Merdiveni ve Müdahale Kararları',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    evidenceLevel: 'experimental',
    content: `## Risk zonları
- 7.0 - 8.5: Güvenli
- 8.5 - 9.2: Tolere edilebilir (yakın takip)
- 9.2 - 10.5: Tehlike (hızlı müdahale)

## Müdahale önerisi
- pH yükseliyorsa: CO₂ artır
- pH düşüyorsa: CO₂ azalt / baz düzeltmesi uygula
- Üre kullanılan sistemlerde pH 9+ bölgesini kalıcı hale getirme`
  },
  {
    id: 'topic_cold_chain_and_delivery_specs',
    title: 'Teslim Garantisi, Over-Pack ve Soğuk Zincir',
    parentId: '',
    format: 'markdown',
    source: 'bilgi.md',
    sourceType: 'internal',
    trustLevel: 'medium',
    reviewStatus: 'pending',
    evidenceLevel: 'experimental',
    content: `## Garanti yaklaşımı
- Teslim anı garantisi: ≥ 50M hücre/mL
- Over-pack hedefi: 55-60M hücre/mL

## Lojistik notları
- +4°C soğuk zincir
- Etiket: Kullanmadan önce çalkalayınız
- Raf ömrü boyunca canlılık trendi izlenmeli`
  }
];

export const SPECIAL_STOCK_LIBRARY = [
  {
    id: 'stock_hcl_0_1m',
    name: 'HCl Stok (0.1M)',
    category: 'pH',
    concentration: '0.1 M',
    preparation: '100 mL HCl (%37) + saf su ile 1 L',
    compatibleInterventions: ['pH', 'pH_stock']
  },
  {
    id: 'stock_citric_20gL',
    name: 'Sitrik Asit Stok 2 (20 g/L)',
    category: 'pH',
    concentration: '20 g/L',
    preparation: '20 g sitrik asit + saf su ile 1 L',
    compatibleInterventions: ['pH', 'pH_stock']
  },
  {
    id: 'stock_nahco3_100gL',
    name: 'Sodyum Bikarbonat 1 (100 g/L)',
    category: 'karbon',
    concentration: '100 g/L',
    preparation: '100 g NaHCO₃ + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage', 'co2']
  },
  {
    id: 'stock_nahco3_10gL',
    name: 'Sodyum Bikarbonat 2 (10 g/L)',
    category: 'karbon',
    concentration: '10 g/L',
    preparation: '10 g NaHCO₃ + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage', 'co2']
  },
  {
    id: 'stock_mkp_50gL',
    name: 'MKP Stok (50 g/L)',
    category: 'besin',
    concentration: '50 g/L',
    preparation: '50 g KH₂PO₄ + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_ure_100gL',
    name: 'Üre Stok (100 g/L)',
    category: 'besin',
    concentration: '100 g/L',
    preparation: '100 g üre + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_kno3_100gL',
    name: 'KNO₃ Stok (100 g/L)',
    category: 'besin',
    concentration: '100 g/L',
    preparation: '100 g KNO₃ + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_dap_100gL',
    name: 'DAP Stok (100 g/L)',
    category: 'besin',
    concentration: '100 g/L',
    preparation: '100 g Diamonyum Fosfat + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_mgso4_75gL',
    name: 'Magnezyum Sülfat Stok (75 g/L)',
    category: 'besin',
    concentration: '75 g/L',
    preparation: '75 g MgSO₄·7H₂O + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_cacl2_36gL',
    name: 'CaCl₂ Stok (36 g/L)',
    category: 'besin',
    concentration: '36 g/L',
    preparation: '36 g CaCl₂·2H₂O + saf su ile 1 L',
    compatibleInterventions: ['fedbatch', 'chemical_dosage', 'flocculation']
  },
  {
    id: 'stock_trace_mix_bg11',
    name: 'BG-11 İz Element Karışımı',
    category: 'iz_element',
    concentration: 'konsantre stok',
    preparation: 'Fe, Mn, Zn, B, Co, Mo mikro bileşenleri + EDTA şelatörü',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_molybdate_1mgmL',
    name: 'Amonyum Molibdat Stok (1 mg/mL)',
    category: 'iz_element',
    concentration: '1 mg/mL',
    preparation: 'Amonyum molibdat + saf su',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_mnso4_1mgmL',
    name: 'MnSO₄ Stok (1 mg/mL)',
    category: 'iz_element',
    concentration: '1 mg/mL',
    preparation: 'Mangan sülfat + saf su',
    compatibleInterventions: ['fedbatch', 'chemical_dosage']
  },
  {
    id: 'stock_nano2_1000mgL',
    name: 'NaNO₂ Standart Stok (1000 mg/L)',
    category: 'analiz_standardi',
    concentration: '1000 mg/L',
    preparation: '0.493 g NaNO₂ + saf su ile 1 L',
    compatibleInterventions: ['chemical_dosage']
  },
  {
    id: 'stock_nh4cl_1000mgL',
    name: 'NH₄Cl Standart Stok (1000 mg/L)',
    category: 'analiz_standardi',
    concentration: '1000 mg/L',
    preparation: '3.819 g NH₄Cl + saf su ile 1 L',
    compatibleInterventions: ['chemical_dosage']
  },
  {
    id: 'stock_kno3_1000mgL',
    name: 'KNO₃ Standart Stok (1000 mg/L)',
    category: 'analiz_standardi',
    concentration: '1000 mg/L',
    preparation: '0.7218 g KNO₃ + saf su ile 1 L',
    compatibleInterventions: ['chemical_dosage']
  },
  {
    id: 'stock_citric_50gL',
    name: 'Sitrik Asit Stok (50 g/L)',
    category: 'pH',
    concentration: '50 g/L',
    preparation: '50 g sitrik asit + saf su ile 1 L',
    compatibleInterventions: ['pH', 'pH_stock', 'deflocculation']
  },
  {
    id: 'stock_phosphoric_10pct',
    name: 'Fosforik Asit Stok (%10)',
    category: 'pH',
    concentration: '%10 (w/v)',
    preparation: '100 g H₃PO₄ eşdeğeri + saf su ile 1 L',
    compatibleInterventions: ['pH', 'pH_stock', 'deflocculation']
  }
];

export const FEEDING_PROGRAM_LIBRARY = [
  {
    id: 'program_two_phase_default',
    name: 'İki Evreli Üretim Planı (NEON/GOLIATH/TITAN)',
    evidenceLevel: 'experimental',
    reviewStatus: 'pending',
    checkpoints: [
      {
        phase: 'NEON',
        startHour: 0,
        endHour: 72,
        objectives: ['Hızlı bölünme', 'Yüksek canlılık >%95', 'Artan OD trendi'],
        entryCriteria: ['pH 7.0-8.2', 'OD750 başlangıç kaydı alınmış olmalı'],
        exitCriteria: ['OD750 ve/veya hücre sayısında artış trendi korunmalı'],
        interventions: ['N/P destek beslemesi', 'CO2 ile pH tamponlama'],
        riskFlags: ['Ani pH yükselişi', 'Azot tükenmesi'],
        fallbackActions: ['Kademeli besleme', 'CO2 artırımı']
      },
      {
        phase: 'GOLIATH',
        startHour: 72,
        endHour: 120,
        objectives: ['Hacim/çap artışı', 'Bölünme baskılanması', 'Stress-yanıt kontrolü'],
        entryCriteria: ['Faz-1 canlılık korunmuş olmalı'],
        exitCriteria: ['Aşırı lizis gözlenmemeli'],
        interventions: ['Kontrollü pH-shift', 'Hafif karıştırma rejimi'],
        riskFlags: ['Asidik şok', 'Ozmotik şok'],
        fallbackActions: ['Geçiş hızını azalt', 'Müdahaleyi geri çek']
      },
      {
        phase: 'TITAN',
        startHour: 120,
        endHour: 168,
        objectives: ['Kontrollü yeniden bölünme', 'Hedef hasat yoğunluğu', 'Son kalite doğrulama'],
        entryCriteria: ['Önceki faz stres hasarı kabul edilebilir seviyede'],
        exitCriteria: ['Hasat kriterleri karşılandı'],
        interventions: ['N-shock', 'pH 8.0-8.2 tetik bandı', 'CO2 dengeleme'],
        riskFlags: ['Aşırı ROS', 'pH aşımı'],
        fallbackActions: ['Müdahaleyi yarım doza indir', 'stabilizasyon bekleme süresi ekle']
      }
    ]
  },
  {
    id: 'program_reversible_floc_delivery',
    name: 'Geri Dönüşlü Flokülasyon + Teslim Garantisi Programı',
    evidenceLevel: 'experimental',
    reviewStatus: 'pending',
    checkpoints: [
      {
        phase: 'FLOCCULATION_PREP',
        startHour: 0,
        endHour: 2,
        objectives: ['Jar test doz doğrulama', 'pH güvenlik bandı doğrulama'],
        entryCriteria: ['Hücre yoğunluğu hasat için yeterli'],
        exitCriteria: ['Hedef flok verimi'],
        interventions: ['CaCl₂ dozlama', 'pH 9.5-10.0 ayarı'],
        riskFlags: ['pH > 10.5', 'canlılık düşüşü'],
        fallbackActions: ['Dozu düşür', 'geçiş süresini uzat']
      },
      {
        phase: 'DEFLOCCULATION',
        startHour: 2,
        endHour: 4,
        objectives: ['Nazik yeniden süspansiyon', 'homojen ürün'],
        entryCriteria: ['Üst faz ayrımı tamam'],
        exitCriteria: ['pH 7.0-7.5 ve homojenlik sağlandı'],
        interventions: ['Sitrik/fosforik asit ile pH geri dönüşü'],
        riskFlags: ['pH < 6.0', 'tam açılmayan flok'],
        fallbackActions: ['Asit dozunu kademeli güncelle', 'karıştırma optimizasyonu']
      }
    ]
  }
];

export const SPECTRO_METHOD_LIBRARY = [
  {
    id: 'tan_phenol_hypochlorite_655',
    parameter: 'TAN',
    name: 'Toplam Amonyak Azotu (Phenol-Hypochlorite)',
    wavelengthNm: 655,
    linearRange: { min: 0.1, max: 5, unit: 'mg/L TAN' },
    blankType: 'reactive_blank',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.998 }
  },
  {
    id: 'tp_molybdenum_blue_880',
    parameter: 'TP',
    name: 'Toplam Fosfor (Persulfate + Molybdenum Blue)',
    wavelengthNm: 880,
    linearRange: { min: 0.1, max: 10, unit: 'mg/L TP' },
    blankType: 'reactive_blank',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.997 }
  },
  {
    id: 'po4_molybdenum_blue_880',
    parameter: 'PO4-P',
    name: 'Ortofosfat (Molybdenum Blue)',
    wavelengthNm: 880,
    linearRange: { min: 0.1, max: 10, unit: 'mg/L PO4-P' },
    blankType: 'reactive_blank',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.998 }
  },
  {
    id: 'nh4_salicylate_655',
    parameter: 'NH4-N',
    name: 'Amonyum (Salicylate)',
    wavelengthNm: 655,
    linearRange: { min: 0.1, max: 5, unit: 'mg/L NH4-N' },
    blankType: 'reactive_blank',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.999 }
  },
  {
    id: 'alkalinity_bcg_630',
    parameter: 'Alkalinite',
    name: 'Alkalinite (Bromocresol Green)',
    wavelengthNm: 630,
    linearRange: { min: 10, max: 500, unit: 'mg/L CaCO3' },
    blankType: 'reactive_blank',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.996 }
  },
  {
    id: 'hardness_calmagite_520',
    parameter: 'Sertlik',
    name: 'Toplam Sertlik (Calmagite/EDTA)',
    wavelengthNm: 520,
    linearRange: { min: 10, max: 500, unit: 'mg/L CaCO3' },
    blankType: 'reactive_blank',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.995 }
  },
  {
    id: 'nitrite_griess_543',
    parameter: 'NO2-N',
    parameterAliases: ['Nitrit', 'NO2'],
    name: 'Nitrit (Griess, Sulfanilamid + NED)',
    wavelengthNm: 543,
    linearRange: { min: 0.01, max: 2, unit: 'mg/L NO2-N' },
    blankType: 'reactive_blank',
    reagentRecipe: ['Sulfanilamid çözeltisi', 'NED çözeltisi'],
    samplePrep: ['Numune filtrasyonu (gerektiğinde)'],
    calcModel: 'Kalibrasyon doğrusu + seyreltme faktörü',
    interferenceNotes: ['Renkli/partiküllü numune için blank düzeltmesi önerilir'],
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.998 }
  },
  {
    id: 'nitrate_uv_220_275',
    parameter: 'NO3-N',
    parameterAliases: ['Nitrat', 'NO3'],
    name: 'Nitrat (UV 220/275 Düzeltmeli)',
    wavelengthNm: 220,
    linearRange: { min: 0.1, max: 20, unit: 'mg/L NO3-N' },
    blankType: 'distilled_water_blank',
    samplePrep: ['Gerekirse filtrasyon', '220/275 düzeltmesi uygulanır'],
    calcModel: 'A220 - 2*A275 düzeltmesi + kalibrasyon doğrusu',
    instrumentNotes: ['UV bölge için quartz küvet önerilir'],
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.996 }
  },
  {
    id: 'calcium_hardness_murexide',
    parameter: 'Ca',
    parameterAliases: ['Calcium', 'Kalsiyum'],
    name: 'Kalsiyum Sertliği (Murexide/EDTA Yaklaşımı)',
    wavelengthNm: 520,
    linearRange: { min: 5, max: 250, unit: 'mg/L CaCO3' },
    blankType: 'reactive_blank',
    samplePrep: ['Yüksek pH tamponu ile hazırlık'],
    calcModel: 'Kalibrasyon doğrusu veya titrimetrik eşdeğer dönüşümü',
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.995 }
  },
  {
    id: 'magnesium_by_difference',
    parameter: 'Mg',
    parameterAliases: ['Magnesium', 'Magnezyum'],
    name: 'Magnezyum (Toplam Sertlik - Kalsiyum Farkı)',
    wavelengthNm: 520,
    linearRange: { min: 5, max: 250, unit: 'mg/L CaCO3 eşdeğeri' },
    blankType: 'reactive_blank',
    calcModel: 'Mg = Total Hardness - Ca Hardness',
    interferenceNotes: ['Önce toplam sertlik ve Ca ölçümü gerekir'],
    defaultCalibration: { slope: 1.0, intercept: 0, rSquared: 0.994 }
  }
];

export const PROCESS_GUARDRAILS = [
  {
    id: 'guardrail_ph_main',
    parameter: 'pH',
    safeRange: { min: 7.0, max: 8.5 },
    cautionRange: { min: 8.5, max: 9.2 },
    dangerRange: { min: 9.2, max: 10.5 },
    recommendedAction: 'CO2 ve besleme hızını kademeli ayarla'
  },
  {
    id: 'guardrail_od750_delivery',
    parameter: 'OD750',
    targetRange: { min: 0.4, max: 0.7 },
    recommendedAction: 'Hasat/teslim öncesi doğrulama ölçümü yap'
  }
];

export const DELIVERY_SPECS = [
  {
    id: 'delivery_default_live',
    product: 'Canlı Chlorella Süspansiyonu',
    guaranteeType: 'deliveryOnly',
    minCellDensity: 50000000,
    overpackTarget: 55000000,
    coldChainRequired: true,
    notes: 'Teslim anı garantisi, +4°C önerilir'
  }
];

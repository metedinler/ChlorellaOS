/**
 * 30 Besin Ortamı Veritabanı
 * 
 * Her besin ortamı için:
 * - Temel bilgiler (isim, kategori, özellikler)
 * - Kullanım amacı ve uygun türler
 * - Stokiyometrik veriler (varsa)
 * - Hazırlama notları
 * - Avantaj/dezavantajlar
 */

import { STOCK_SOLUTIONS_DATABASE } from './stockSolutionsDatabase.js';

export const MEDIA_CATEGORIES = {
  FAST_GROWTH: {
    id: 'fast_growth',
    name: 'Hızlı Büyüme & Miksotrofik',
    color: 'purple',
    description: 'Organik karbon içeren, hızlı büyüme sağlayan'
  },
  SPECIALIZED: {
    id: 'specialized',
    name: 'Özel Gruplar',
    color: 'green',
    description: 'Belirli türler için özelleşmiş (diatom, siyanobakteri)'
  },
  ECOLOGICAL: {
    id: 'ecological',
    name: 'Ekolojik & Doğal Taklit',
    color: 'amber',
    description: 'Doğal ortamı taklit eden, zor türler için'
  },
  ADVANCED: {
    id: 'advanced',
    name: 'İz Element & Vitamin Odaklı',
    color: 'pink',
    description: 'Özel iz element ve vitamin formülasyonları'
  }
};

export const MEDIA_DATABASE = {
  // ========== KATEGORİ 1: STANDART & TEMEL ==========
  'BG-11': {
    id: 'BG-11',
    name: 'BG-11',
    fullName: 'Blue-Green 11 Medium',
    category: 'standard',
    
    description: 'Mavi-yeşil algler (siyanobakteri) için optimize edilmiş, yüksek nitrat, düşük fosfat içeren klasik besin ortamı.',
    
    suitableFor: [
      'Anabaena sp.',
      'Nostoc sp.',
      'Synechocystis sp.',
      'Chlorella vulgaris',
      'Scenedesmus sp.'
    ],
    
    advantages: [
      'Çok yaygın kullanılır, literatür desteği bol',
      'Uzun raf ömrü',
      'Azot fiksasyonu yapan türler için ideal',
      'Genel biyokütle üretimi için güvenilir'
    ],
    
    disadvantages: [
      'Yeşil algler için BBM kadar optimize değil',
      'Yüksek pH (7.5-8.5) bazı türleri zorlar'
    ],
    
    composition: {
      macronutrients: {
        'NaNO3': { amount: 1.5, unit: 'g/L', element: 'N', provides: 247.5 },
        'K2HPO4': { amount: 0.04, unit: 'g/L', element: 'P', provides: 7.1 },
        'MgSO4·7H2O': { amount: 0.075, unit: 'g/L', element: 'Mg', provides: 7.4 },
        'CaCl2·2H2O': { amount: 0.036, unit: 'g/L', element: 'Ca', provides: 9.8 },
        'Na2CO3': { amount: 0.02, unit: 'g/L', element: 'C', provides: 2.3 }
      },
      pH: { range: [7.1, 8.5], optimal: 7.5 },
      hasFullStoichiometry: true
    },
    
    whenToSelect: 'Siyanobakteriler, genel biyokütle üretimi, azot fiksasyonu çalışmaları',
    
    preparationNotes: 'Otoklav 121°C 15 dakika. Na2CO3\'ı ayrı çözelti olarak hazırlayıp soğuduktan sonra ekleyin.',
    
    references: [
      'Stanier et al. (1971) J. Bacteriol.',
      'Rippka et al. (1979) J. Gen. Microbiol.'
    ],
    
    stockSolutions: {
      mediumCode: 'BG-11',
      name: 'BG-11 Stok Çözelti Seti',
      description: 'BG-11 besi yeri için hazır stok çözelti seti'
    }
  },
  
  'BBM': {
    id: 'BBM',
    name: 'BBM',
    fullName: "Bold's Basal Medium",
    category: 'standard',
    
    description: 'Yeşil algler (Chlorophyceae) için altın standart. BG-11\'e göre daha asidik (pH 6.5-6.8), Chlorella ve Scenedesmus için ilk tercih.',
    
    suitableFor: [
      'Chlorella vulgaris',
      'Chlorella sorokiniana',
      'Scenedesmus obliquus',
      'Haematococcus pluvialis',
      'Chlamydomonas reinhardtii'
    ],
    
    advantages: [
      'Yeşil algler için optimize edilmiş N:P oranı',
      'Düşük pH çökelme riskini azaltır',
      'EDTA şelatlaması iyi çalışır',
      'Akademik literatürde en çok kullanılan'
    ],
    
    disadvantages: [
      'Siyanobakteriler için suboptimal',
      'Yüksek demir dozajı bazı suşlarda toksik olabilir'
    ],
    
    composition: {
      macronutrients: {
        'NaNO3': { amount: 0.25, unit: 'g/L', element: 'N', provides: 41.2 },
        'K2HPO4': { amount: 0.075, unit: 'g/L', element: 'P', provides: 13.4 },
        'KH2PO4': { amount: 0.175, unit: 'g/L', element: 'P', provides: 39.9 },
        'MgSO4·7H2O': { amount: 0.075, unit: 'g/L', element: 'Mg', provides: 7.4 },
        'CaCl2·2H2O': { amount: 0.025, unit: 'g/L', element: 'Ca', provides: 6.8 },
        'NaCl': { amount: 0.025, unit: 'g/L', element: 'Cl', provides: 15.2 }
      },
      totalN: 41.2,
      totalP: 53.3,
      npRatio: 0.77, // N:P = 41.2/53.3
      pH: { range: [6.5, 6.8], optimal: 6.6 },
      hasFullStoichiometry: true
    },
    
    whenToSelect: 'Chlorella türleri, genel yeşil alg kültürü, protein üretimi',
    
    preparationNotes: 'Makro ve mikro stokları ayrı hazırlayın. Demir-EDTA karanlıkta saklayın (ışıkta bozulur).',
    
    references: [
      'Bold (1949) Bull. Torrey Bot. Club',
      'Bischoff & Bold (1963) Univ. Texas Publ.'
    ],
    
    stockSolutions: {
      mediumCode: 'BBM',
      name: 'BBM Stok Çözelti Seti',
      description: 'BBM besi yeri için hazır stok çözelti seti'
    },
    
    stockSolutions: {
      materialId: 157,
      name: 'BBM Stok Çözelti Seti',
      description: 'BBM besi yeri için hazır stok çözelti seti'
    }
  },
  
  'BS11': {
    id: 'BS11',
    name: 'BS11',
    fullName: 'Blue-Green Medium 11',
    category: 'specialized',
    
    description: 'Siyanobakteriler için optimize edilmiş, BG-11\'den daha basit formülasyon. Spirulina ve Arthrospira için uygun.',
    
    suitableFor: [
      'Spirulina platensis',
      'Arthrospira maxima',
      'Anabaena sp.',
      'Nostoc sp.'
    ],
    
    advantages: [
      'Siyanobakteriler için optimize edilmiş',
      'Basit formülasyon, hazırlama kolay',
      'Azot fiksasyonu yapan türler için ideal'
    ],
    
    disadvantages: [
      'Yeşil algler için suboptimal',
      'BG-11 kadar zengin değil'
    ],
    
    composition: {
      macronutrients: {
        'NaNO3': { amount: 1.5, unit: 'g/L', element: 'N', provides: 247.5 },
        'K2HPO4': { amount: 0.04, unit: 'g/L', element: 'P', provides: 7.1 },
        'MgSO4·7H2O': { amount: 0.075, unit: 'g/L', element: 'Mg', provides: 7.4 },
        'CaCl2·2H2O': { amount: 0.036, unit: 'g/L', element: 'Ca', provides: 9.8 },
        'Na2CO3': { amount: 0.02, unit: 'g/L', element: 'C', provides: 2.3 }
      },
      pH: { range: [7.5, 8.5], optimal: 8.0 },
      hasFullStoichiometry: true
    },
    
    whenToSelect: 'Siyanobakteriler, Spirulina üretimi, azot fiksasyonu çalışmaları',
    
    preparationNotes: 'Otoklav 121°C 15 dakika. Na2CO3\'ı ayrı çözelti olarak hazırlayıp soğuduktan sonra ekleyin.',
    
    references: [
      'Stanier et al. (1971) J. Bacteriol.',
      'Rippka et al. (1979) J. Gen. Microbiol.'
    ],
    
    stockSolutions: {
      mediumCode: 'BS11',
      name: 'BS11 Stok Çözelti Seti',
      description: 'BS11 besi yeri için hazır stok çözelti seti'
    }
  },
  
  'JM': {
    id: 'JM',
    name: 'JM',
    fullName: "Jaworski's Medium",
    category: 'standard',
    
    description: 'BBM\'e benzer ancak Ca ve Mg oranları çökmeyi önleyecek şekilde ayarlanmış. Uzun süreli kültür saklamada üstün.',
    
    suitableFor: [
      'Chlorella sp.',
      'Scenedesmus sp.',
      'Kültür koleksiyonları için her tür'
    ],
    
    advantages: [
      'Çökelme riski minimum',
      'Aylarca stabil kalır',
      'Kültür koleksiyonları (CCAP) standardı',
      'Şeffaf kalır, optik ölçümlere uygun'
    ],
    
    disadvantages: [
      'BBM kadar yaygın değil, literatür kısıtlı',
      'Büyüme hızı BBM\'den biraz düşük olabilir'
    ],
    
    composition: {
      macronutrients: {
        'Ca(NO3)2·4H2O': { amount: 0.04, unit: 'g/L', element: 'N', provides: 23.7 },
        'KH2PO4': { amount: 0.124, unit: 'g/L', element: 'P', provides: 28.2 },
        'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
        'NaHCO3': { amount: 0.016, unit: 'g/L', element: 'C', provides: 2.3 }
      },
      pH: { range: [7.0, 7.4], optimal: 7.2 },
      hasFullStoichiometry: true
    },
    
    whenToSelect: 'Uzun süreli kültür saklama, çökelme problemi yaşanıyorsa, kültür koleksiyonları',
    
    preparationNotes: 'Kalsiyum çözeltisini ayrı hazırlayın. Fosfat ve sülfat karışımından sonra ekleyin.',
    
    references: [
      'Jaworski et al. (1988) Arch. Hydrobiol.',
      'CCAP (Culture Collection of Algae and Protozoa) protokolleri'
    ],
    
    stockSolutions: {
      mediumCode: 'JM',
      name: 'JM Stok Çözelti Seti',
      description: 'JM besi yeri için hazır stok çözelti seti'
    }
  },
  
  'Chu-10': {
    id: 'Chu-10',
    name: 'Chu-10',
    fullName: 'Chu No. 10 Medium',
    category: 'standard',
    
    description: 'Düşük mineral içerikli, oligotrofik (besince fakir) suları taklit eden ortam. Doğadan yeni izole edilen hassas türler için.',
    
    suitableFor: [
      'Yeni izole edilen türler',
      'Oligotrofik göl türleri',
      'Hassas yeşil algler'
    ],
    
    advantages: [
      'Doğal ortam taklidi',
      'Hassas türler için yumuşak geçiş',
      'Düşük ozmotik stres'
    ],
    
    disadvantages: [
      'Çok yavaş büyüme',
      'Endüstriyel üretim için uygun değil',
      'Kontaminasyon riski yüksek (düşük besin = zayıf rekabet)'
    ],
    
    composition: {
      macronutrients: {
        'Ca(NO3)2·4H2O': { amount: 0.04, unit: 'g/L', element: 'N', provides: 23.7 },
        'K2HPO4': { amount: 0.01, unit: 'g/L', element: 'P', provides: 1.8 }
      },
      pH: { range: [6.8, 7.2], optimal: 7.0 },
      hasFullStoichiometry: false
    },
    
    whenToSelect: 'Doğal izolatlarda ilk adaptasyon, oligotrofik türler',
    
    preparationNotes: 'Çok seyreltik olduğu için sterilizasyon kritik. 0.22 µm filtre kullanılabilir.',
    
    references: [
      'Chu (1942) J. Ecol.',
      'Stein (1973) Handbook of Phycological Methods'
    ],
    
    stockSolutions: {
      mediumCode: 'Chu-10',
      name: 'Chu-10 Stok Çözelti Seti',
      description: 'Chu-10 besi yeri için hazır stok çözelti seti'
    }
  },
  
  'WC': {
    id: 'WC',
    name: 'WC',
    fullName: "Wright's Cryptophyte Medium",
    category: 'standard',
    
    description: 'İz metaller ve vitaminler açısından zengin. Flagellatlar ve planktonik algler için.',
    
    suitableFor: [
      'Cryptomonas sp.',
      'Rhodomonas sp.',
      'Planktonik flagellatlar'
    ],
    
    advantages: [
      'Geniş vitamin profili',
      'Hassas türler için yüksek başarı oranı'
    ],
    
    disadvantages: [
      'Pahalı (B12, biotin, thiamine gerekli)',
      'Kısa raf ömrü (vitaminler bozulur)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.5, 8.0], optimal: 7.8 }
    },
    
    whenToSelect: 'Flagellatlı algler, vitamin gereksinimi yüksek türler',
    
    preparationNotes: 'Vitamin stokları -20°C\'de saklayın. Kullanmadan hemen önce ekleyin.',
    
    references: [
      'Wright & Jeffrey (1987) Limnol. Oceanogr.'
    ],
    
    stockSolutions: {
      mediumCode: 'WC',
      name: 'WC Stok Çözelti Seti',
      description: 'WC besi yeri için hazır stok çözelti seti'
    }
  },
  
  'C-Medium': {
    id: 'C-Medium',
    name: 'C Medium',
    fullName: 'C Medium (Acidophilic)',
    category: 'standard',
    
    description: 'Peptone ve sodyum asetat içerebilir, asidik karakterli. Asidofilik algler için.',
    
    suitableFor: [
      'Galdieria sulphuraria',
      'Cyanidium caldarium',
      'Asidik ortam türleri'
    ],
    
    advantages: [
      'Düşük pH toleransı',
      'Termofil türler için uygun'
    ],
    
    disadvantages: [
      'Dar kullanım alanı',
      'pH kontrolü zor'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [2.5, 4.0], optimal: 3.0 }
    },
    
    whenToSelect: 'Asidofilik türler, ekstrem ortam çalışmaları',
    
    preparationNotes: 'pH ayarı için H2SO4 kullanın. HCl organik madde ile reaksiyona girebilir.',
    
    references: [
      'Allen (1959) Arch. Mikrobiol.'
    ]
  },
  
  'Bristol': {
    id: 'Bristol',
    name: 'Bristol Medium',
    fullName: 'Bristol Medium (Historical)',
    category: 'standard',
    
    description: 'BBM\'in atasıdır, çok basit, iz element içermez. Artık yerini BBM\'e bırakmıştır.',
    
    suitableFor: [
      'Çok dayanıklı Chlorella suşları',
      'Tarihsel çalışmalar'
    ],
    
    advantages: [
      'Son derece basit',
      'Ucuz'
    ],
    
    disadvantages: [
      'İz element eksikliği',
      'Güncel standartlara uygun değil',
      'Uzun vadede beslenme eksiklikleri'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.0], optimal: 6.8 }
    },
    
    whenToSelect: 'Artık kullanılmaz, sadece eski protokollere referans için',
    
    preparationNotes: 'Yerine BBM kullanın.',
    
    references: [
      'Bold (1942) - Bristol\'dan türetilmiştir'
    ],
    
    stockSolutions: {
      mediumCode: 'Bristol',
      name: 'Bristol Stok Çözelti Seti',
      description: 'Bristol besi yeri için hazır stok çözelti seti'
    }
  },
  
  // ========== KATEGORİ 2: HIZLI BÜYÜME & MİKSOTROFİK ==========
  'TAP': {
    id: 'TAP',
    name: 'TAP',
    fullName: 'Tris-Acetate-Phosphate Medium',
    category: 'mixotrophic',
    
    description: 'Asetat içerir, fotosentez zorunlu değil. pH TRIS tamponu ile sabitlenir. Çok hızlı büyüme.',
    
    suitableFor: [
      'Chlamydomonas reinhardtii',
      'Chlorella protothecoides',
      'Hızlı biyokütle üretimi'
    ],
    
    advantages: [
      'Rekor büyüme hızı (4-6 saatte ikilenme)',
      'Karanlıkta bile büyür',
      'Genetik çalışmalar için standart',
      'pH stabilitesi mükemmel'
    ],
    
    disadvantages: [
      'Çok pahalı (asetat + TRIS)',
      'Bakteri kontaminasyonu riski çok yüksek',
      'Sterilizasyon zorunlu',
      'Endüstriyel ölçekte ekonomik değil'
    ],
    
    composition: {
      macronutrients: {
        'NH4Cl': { amount: 0.375, unit: 'g/L', element: 'N', provides: 98.1 },
        'K2HPO4': { amount: 0.108, unit: 'g/L', element: 'P', provides: 19.2 },
        'MgSO4·7H2O': { amount: 0.1, unit: 'g/L', element: 'Mg', provides: 9.9 },
        'CaCl2·2H2O': { amount: 0.05, unit: 'g/L', element: 'Ca', provides: 13.6 },
        'Sodium Acetate': { amount: 1.0, unit: 'g/L', element: 'C', provides: 293.6 }
      },
      pH: { range: [7.0, 7.2], optimal: 7.0 },
      hasFullStoichiometry: true
    },
    
    whenToSelect: 'Chlamydomonas genetik çalışmaları, maksimum biyokütle, kısa sürede yüksek yoğunluk',
    
    preparationNotes: 'TRIS ve asetatı ayrı otoklav edin. Asetat pH\'yı düşürebilir, TRIS ile dengeleyin.',
    
    references: [
      'Gorman & Levine (1965) PNAS',
      'Harris (1989) The Chlamydomonas Sourcebook'
    ],
    
    stockSolutions: {
      mediumCode: 'TAP',
      name: 'TAP Stok Çözelti Seti',
      description: 'TAP besi yeri için hazır stok çözelti seti'
    }
  },
  
  'Proteose-Peptone': {
    id: 'Proteose-Peptone',
    name: 'Proteose Peptone Medium',
    fullName: 'Proteose Peptone Enriched Medium',
    category: 'mixotrophic',
    
    description: 'Organik azot ve karbon kaynağı olarak pepton içerir. Aksesnik kültürlerde hızlı büyüme.',
    
    suitableFor: [
      'Chlorella sp. (aksesnik)',
      'Hızlı biyokütle üretimi'
    ],
    
    advantages: [
      'Çok hızlı büyüme',
      'Karanlıkta üretim mümkün'
    ],
    
    disadvantages: [
      'Bakteri riski ekstrem',
      'Pahalı',
      'Downstream processing zorlaşır (protein karışımı)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.0], optimal: 6.8 }
    },
    
    whenToSelect: 'Laboratuvar ölçekte hızlı üretim, aksesnik kültür testleri',
    
    preparationNotes: 'Peptonu 110°C 10 dakika otoklav edin (121°C\'de karamelizasyon riski).',
    
    references: [
      'Pringsheim (1946) Pure Cultures of Algae'
    ]
  },
  
  'Glucose-YeastExtract': {
    id: 'Glucose-YeastExtract',
    name: 'Glucose-Yeast Extract',
    fullName: 'Glucose-Yeast Extract Medium',
    category: 'mixotrophic',
    
    description: 'Maya özütü vitamin deposu, glikoz enerji verir. Fermantasyon benzeri, karanlıkta büyüme.',
    
    suitableFor: [
      'Chlorella protothecoides',
      'Heterotrofik büyüme çalışmaları'
    ],
    
    advantages: [
      'Işık gereksiz',
      'Çok yüksek yoğunluk (50+ g/L kuru ağırlık)',
      'Yağ üretimi için idealdir'
    ],
    
    disadvantages: [
      'Çok pahalı (glikoz + maya özütü)',
      'Endüstriyel ölçekte karbon maliyeti yüksek',
      'Bakteri/maya kontaminasyonu kolay'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.0, 6.5], optimal: 6.2 }
    },
    
    whenToSelect: 'Yağ üretimi, heterotrofik metabolizma çalışmaları',
    
    preparationNotes: 'Glikozu ayrı otoklav edin (Maillard reaksiyonu riski).',
    
    references: [
      'Xu et al. (2006) Biotechnol. Bioeng.'
    ]
  },
  
  'Acetate-Medium': {
    id: 'Acetate-Medium',
    name: 'Acetate Medium',
    fullName: 'Acetate Medium (Simplified TAP)',
    category: 'mixotrophic',
    
    description: 'TAP\'ın basitleştirilmiş hali, asetat asimilasyonunu test için.',
    
    suitableFor: [
      'Chlorella sp.',
      'Chlamydomonas sp.'
    ],
    
    advantages: [
      'TAP\'dan ucuz',
      'Hızlı büyüme'
    ],
    
    disadvantages: [
      'pH kontrolü zor (asetat asidik)',
      'TRIS eksikliği'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.0], optimal: 6.8 }
    },
    
    whenToSelect: 'Asetat metabolizması testleri',
    
    preparationNotes: 'pH\'yı NaOH ile ayarlayın.',
    
    references: [
      'Sager & Granick (1953) Ann. NY Acad. Sci.'
    ]
  },
  
  'Euglena-Medium': {
    id: 'Euglena-Medium',
    name: 'Euglena Medium',
    fullName: 'Euglena gracilis Medium',
    category: 'mixotrophic',
    
    description: 'Yüksek organik içerik ve düşük pH. Euglena türleri için.',
    
    suitableFor: [
      'Euglena gracilis',
      'Euglena viridis'
    ],
    
    advantages: [
      'Euglena için optimize',
      'Paramylon üretimi'
    ],
    
    disadvantages: [
      'Dar kullanım alanı',
      'Kontaminasyon riski'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [3.5, 4.5], optimal: 4.0 }
    },
    
    whenToSelect: 'Sadece Euglena türleri',
    
    preparationNotes: 'Asidik pH nedeniyle metal şelatlama önemli.',
    
    references: [
      'Cramer & Myers (1952) Arch. Biochem. Biophys.'
    ]
  },
  
  // ========== KATEGORİ 3: ÖZEL GRUPLAR ==========
  'DM': {
    id: 'DM',
    name: 'DM',
    fullName: 'Diatom Medium',
    category: 'specialized',
    
    description: 'Yüksek oranda Silikat (Na2SiO3) içerir. Diatomların hücre duvarı için zorunludur.',
    
    suitableFor: [
      'Phaeodactylum tricornutum',
      'Thalassiosira sp.',
      'Tüm diatomlar'
    ],
    
    advantages: [
      'Diatom frustule yapımı için silikat',
      'Diatomlar için optimize'
    ],
    
    disadvantages: [
      'Silikat çökelme riski',
      'Otoklav sonrası polimerizasyon'
    ],
    
    composition: {
      macronutrients: {
        'Na2SiO3·9H2O': { amount: 0.284, unit: 'g/L', element: 'Si', provides: 28.1 }
      },
      hasFullStoichiometry: false,
      pH: { range: [7.5, 8.5], optimal: 8.0 }
    },
    
    whenToSelect: 'Sadece diatom kültürleri',
    
    preparationNotes: 'Silikatı filtre sterilizasyonu ile ekleyin (otoklav polimerizasyona neden olur).',
    
    references: [
      'Guillard & Ryther (1962) Can. J. Microbiol.'
    ]
  },
  
  'Z-Medium': {
    id: 'Z-Medium',
    name: 'Z Medium (Zehnder)',
    fullName: 'Zehnder Medium',
    category: 'specialized',
    
    description: 'BG-11\'den daha konsantre, yüksek tuzlu. Filamentli siyanobakteriler için.',
    
    suitableFor: [
      'Oscillatoria sp.',
      'Anabaena sp.',
      'Filamentli siyanobakteriler'
    ],
    
    advantages: [
      'Filament oluşumu için optimize'
    ],
    
    disadvantages: [
      'Yüksek tuz, bazı türleri inhibe eder'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.5, 8.5], optimal: 8.0 }
    },
    
    whenToSelect: 'Filamentli siyanobakteriler',
    
    preparationNotes: 'Ozmotik şok riski, yavaş adaptasyon gerekli.',
    
    references: [
      'Zehnder & Gorham (1960) Can. J. Microbiol.'
    ]
  },
  
  'Zarrouk': {
    id: 'Zarrouk',
    name: "Zarrouk's Medium",
    fullName: "Zarrouk's Medium (Spirulina)",
    category: 'specialized',
    
    description: 'Çok yüksek pH (9-10) ve çok yüksek bikarbonat. Spirulina üretimi için endüstri standardı.',
    
    suitableFor: [
      'Spirulina platensis',
      'Arthrospira maxima',
      'Spirulina sp.'
    ],
    
    advantages: [
      'Spirulina için optimum',
      'Yüksek pH kontaminasyon riskini azaltır',
      'Endüstriyel ölçekte kanıtlanmış'
    ],
    
    disadvantages: [
      'Sadece Spirulina için',
      'Yüksek NaHCO3 maliyeti',
      'Ekipman korozyonu (alkali)'
    ],
    
    composition: {
      macronutrients: {
        'NaHCO3': { amount: 16.8, unit: 'g/L', element: 'C', provides: 2401 },
        'NaNO3': { amount: 2.5, unit: 'g/L', element: 'N', provides: 412.5 },
        'K2HPO4': { amount: 0.5, unit: 'g/L', element: 'P', provides: 89.0 }
      },
      pH: { range: [9.0, 10.5], optimal: 9.5 },
      hasFullStoichiometry: true
    },
    
    whenToSelect: 'Sadece Spirulina üretimi',
    
    preparationNotes: 'NaHCO3 eklerken köpürme olabilir. pH 10\'un üstüne çıkmasın (proteoliz riski).',
    
    references: [
      'Zarrouk (1966) PhD Thesis, University of Paris',
      'Vonshak (1997) Spirulina platensis (Arthrospira)'
    ],
    
    stockSolutions: {
      mediumCode: 'Zarrouk',
      name: 'Zarrouk Stok Çözelti Seti',
      description: 'Zarrouk besi yeri için hazır stok çözelti seti'
    }
  },
  
  'ASM-1': {
    id: 'ASM-1',
    name: 'ASM-1',
    fullName: 'Algal Screening Medium 1',
    category: 'specialized',
    
    description: 'Düşük besinli, dengeli iyonlar. Desmidler ve narin yeşil algler için.',
    
    suitableFor: [
      'Closterium sp.',
      'Cosmarium sp.',
      'Desmidler'
    ],
    
    advantages: [
      'Hassas türler için yumuşak',
      'Çökelme riski düşük'
    ],
    
    disadvantages: [
      'Yavaş büyüme',
      'Dar kullanım alanı'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.0], optimal: 6.8 }
    },
    
    whenToSelect: 'Desmidler, narin yeşil algler',
    
    preparationNotes: 'Çok seyreltik, filtre sterilizasyon tercih edilir.',
    
    references: [
      'EPA (2002) Short-term Methods for Estimating the Chronic Toxicity'
    ]
  },
  
  'MA-Medium': {
    id: 'MA-Medium',
    name: 'MA Medium',
    fullName: 'Microcystis Aeruginosa Medium',
    category: 'specialized',
    
    description: 'Microcystis türleri için özelleşmiş azot/fosfor oranı. Toksik alg patlamalarını incelemek için.',
    
    suitableFor: [
      'Microcystis aeruginosa',
      'Toksik siyanobakteri çalışmaları'
    ],
    
    advantages: [
      'Toksin üretimi için optimize'
    ],
    
    disadvantages: [
      'Biyogüvenlik riski (mikrokistin)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.5, 8.5], optimal: 8.0 }
    },
    
    whenToSelect: 'Sadece Microcystis çalışmaları, toksikoloji',
    
    preparationNotes: 'Biyogüvenlik kabini kullanın. Atıkları otoklav edin.',
    
    references: [
      'Watanabe et al. (1991) Water Sci. Technol.'
    ]
  },
  
  'Waris-H': {
    id: 'Waris-H',
    name: 'Waris-H',
    fullName: 'Waris-H Medium',
    category: 'specialized',
    
    description: 'Toprak özütü benzeri dengeye sahip, güçlü EDTA şelatlaması. Desmidler için.',
    
    suitableFor: [
      'Desmidler',
      'Hücre duvarı hassas algler'
    ],
    
    advantages: [
      'Metal toksisitesini önler',
      'Hassas türler için ideal'
    ],
    
    disadvantages: [
      'Pahalı (yüksek EDTA)',
      'Hazırlaması zor'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.0, 6.5], optimal: 6.2 }
    },
    
    whenToSelect: 'Desmidler, metal hassasiyeti yüksek türler',
    
    preparationNotes: 'EDTA\'yı NaOH ile çözün önce, sonra asidik pH\'ya düşürün.',
    
    references: [
      'Waris (1953) Physiol. Plant.'
    ]
  },
  
  'Allen': {
    id: 'Allen',
    name: "Allen's Medium",
    fullName: "Allen's Medium",
    category: 'specialized',
    
    description: 'Mavi-yeşil algler için iz element bakımından zengin. Azot fiksasyonu yapan siyanobakteriler için.',
    
    suitableFor: [
      'Anabaena cylindrica',
      'Nostoc muscorum',
      'Azot fiksatörler'
    ],
    
    advantages: [
      'Azot fiksasyonu için optimize',
      'Heterosist oluşumu destekler'
    ],
    
    disadvantages: [
      'Karmaşık iz element karışımı'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.0, 7.5], optimal: 7.2 }
    },
    
    whenToSelect: 'Azot fiksasyonu çalışmaları',
    
    preparationNotes: 'Azot kaynağı eklemeden hazırlayın (N2 fiksasyonu için).',
    
    references: [
      'Allen & Arnon (1955) Plant Physiol.'
    ]
  },
  
  // ========== KATEGORİ 4: EKOLOJİK & DOĞAL TAKLİT ==========
  'SE': {
    id: 'SE',
    name: 'SE (Soil Extract)',
    fullName: 'Soil Extract Medium',
    category: 'ecological',
    
    description: 'Gerçek bahçe toprağının kaynatılıp süzülmesiyle yapılır. Tanımlanamayan büyüme faktörleri içerir. "Sihirli değnek".',
    
    suitableFor: [
      'Diğer ortamlarda büyümeyen tüm türler',
      'Yeni izolatlar',
      'Zorlu türler'
    ],
    
    advantages: [
      'Neredeyse her şeyi içerir',
      'Zor türler için en yüksek başarı oranı',
      'Humik asitler ve büyüme faktörleri'
    ],
    
    disadvantages: [
      'Tanımlanamayan bileşim (stokiyometri yok)',
      'Lot-to-lot varyasyon',
      'Sterilizasyon zor (toprak sporları)',
      'Akademik yayınlarda sorun (reproduksiyon)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.0, 7.0], optimal: 6.5 }
    },
    
    whenToSelect: 'Her şey başarısız olduğunda, yeni izolatlar',
    
    preparationNotes: 'Bahçe toprağını (500g) 1L suda kaynatın (60 dk), süzün, 121°C\'de 30 dk otoklav.',
    
    references: [
      'Pringsheim (1946) Pure Cultures of Algae',
      'Stein (1973) Handbook of Phycological Methods'
    ]
  },
  
  'Erd-Schreiber': {
    id: 'Erd-Schreiber',
    name: 'Erd-Schreiber',
    fullName: 'Erd-Schreiber Medium',
    category: 'ecological',
    
    description: 'Toprak özütü + Deniz suyu/Tatlı su karışımı. Hem deniz hem tatlı su geçiş türleri için tarihi besin ortamı.',
    
    suitableFor: [
      'Acı su (brackish) türleri',
      'Geçiş bölgesi algleri'
    ],
    
    advantages: [
      'Tuzluluk gradienti taklit eder'
    ],
    
    disadvantages: [
      'Belirsiz bileşim',
      'Günümüzde eski'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.0, 8.0], optimal: 7.5 }
    },
    
    whenToSelect: 'Acı su türleri, deltalar',
    
    preparationNotes: 'Deniz suyu oranını türe göre ayarlayın (5-25%).',
    
    references: [
      'Schreiber (1927) Planta'
    ]
  },
  
  'Pringsheim-Soil': {
    id: 'Pringsheim-Soil',
    name: "Pringsheim's Soil",
    fullName: "Pringsheim's Soil-Water Medium",
    category: 'ecological',
    
    description: 'İki fazlıdır (dibi toprak, üstü su). Doğal göl tabanını taklit eder.',
    
    suitableFor: [
      'Bentik algler',
      'Sediment türleri'
    ],
    
    advantages: [
      'Doğal habitat taklidi',
      'Bentik türler için ideal'
    ],
    
    disadvantages: [
      'Standardizasyon imkansız',
      'Hasat zor'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.5], optimal: 7.0 }
    },
    
    whenToSelect: 'Bentik algler, sediment çalışmaları',
    
    preparationNotes: 'Alt kısma toprak, üst kısma su ekleyin. En az 1 hafta dengeleyin.',
    
    references: [
      'Pringsheim (1946) Pure Cultures of Algae'
    ]
  },
  
  'COMBO': {
    id: 'COMBO',
    name: 'COMBO Medium',
    fullName: 'COMBO Medium (Community)',
    category: 'ecological',
    
    description: 'Hem algleri hem de onlarla beslenen zooplanktonları (Daphnia vb.) yaşatır. Besin zinciri deneyleri için.',
    
    suitableFor: [
      'Alg-Daphnia ko-kültürleri',
      'Ekosistem modelleme'
    ],
    
    advantages: [
      'Trofik zincir çalışmaları',
      'Toksik madde testleri'
    ],
    
    disadvantages: [
      'Karmaşık sistem',
      'Kontrol zor'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.5, 8.5], optimal: 8.0 }
    },
    
    whenToSelect: 'Alg-zooplankt ko-kültürleri, ekotoksikoloji',
    
    preparationNotes: 'Alg ve Daphnia kültürlerini ayrı başlatın, sonra birleştirin.',
    
    references: [
      'Kilham et al. (1998) J. Phycol.'
    ]
  },
  
  'L16': {
    id: 'L16',
    name: 'L16',
    fullName: 'L16 Medium (Standardized SE)',
    category: 'ecological',
    
    description: 'SE ortamının standardize edilmiş, kimyasal olarak tanımlı hali. Toprak özütünün belirsizliğinden kaçmak ama etkisini korumak için.',
    
    suitableFor: [
      'Hassas türler',
      'SE\'ye ihtiyaç duyan ama standardizasyon isteyenler'
    ],
    
    advantages: [
      'SE avantajları + standardizasyon',
      'Reproduksiyon mümkün'
    ],
    
    disadvantages: [
      'Pahalı (birçok vitamin ve humik asit analoğu)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.0], optimal: 6.8 }
    },
    
    whenToSelect: 'SE etkisi gerekli ama standardizasyon şart',
    
    preparationNotes: 'Humik asit yerine fulvik asit kullanılabilir.',
    
    references: [
      'CCAP L16 Medium specifications'
    ]
  },
  
  // ========== KATEGORİ 5: İZ ELEMENT & VİTAMİN ODAKLI ==========
  'f2-Freshwater': {
    id: 'f2-Freshwater',
    name: 'f/2 (Freshwater)',
    fullName: 'f/2 Medium (Freshwater Modified)',
    category: 'advanced',
    
    description: 'Aslen deniz ortamı (Guillard), tuzu çıkarılarak tatlı suya uyarlanmış. Çok geniş spektrumlu iz metal karışımı.',
    
    suitableFor: [
      'Geniş spektrumlu iz metal gereksinimi olanlar'
    ],
    
    advantages: [
      'Kapsamlı iz element profili',
      'Vitamin B12, biotin, thiamine içerir'
    ],
    
    disadvantages: [
      'Pahalı',
      'Tatlı su adaptasyonu her türde başarılı olmaz'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.5, 8.5], optimal: 8.0 }
    },
    
    whenToSelect: 'Çok geniş iz metal spektrumu gerektiğinde',
    
    preparationNotes: 'Deniz tuzu ekosunu kaldırın, CaCl2 ve MgSO4 düşük tut.',
    
    references: [
      'Guillard & Ryther (1962) Can. J. Microbiol.',
      'Guillard (1975) in Culture of Marine Invertebrate Animals'
    ]
  },
  
  'M-8': {
    id: 'M-8',
    name: 'M-8',
    fullName: 'M-8 Medium (High Nitrogen)',
    category: 'advanced',
    
    description: 'Yüksek azotlu. Bazı Chlorella suşlarında biyokütle maksimizasyonu için.',
    
    suitableFor: [
      'Chlorella sp. (yüksek N suşları)',
      'Protein maksimizasyonu'
    ],
    
    advantages: [
      'Çok yüksek biyokütle',
      'Protein içeriği %60+\'a çıkabilir'
    ],
    
    disadvantages: [
      'Amonyak toksisitesi riski',
      'pH düşer (azot asimilasyonu)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.0, 7.0], optimal: 6.5 }
    },
    
    whenToSelect: 'Maksimum protein üretimi',
    
    preparationNotes: 'pH tamponu ekleyin (MES veya HEPES).',
    
    references: [
      'Japanese culture collection protocols'
    ]
  },
  
  'AF-6': {
    id: 'AF-6',
    name: 'AF-6',
    fullName: 'AF-6 Medium (NIES)',
    category: 'advanced',
    
    description: 'Tamponlu, hafif asidik. Japon kültür koleksiyonlarında (NIES) sık kullanılır.',
    
    suitableFor: [
      'NIES kültür koleksiyonu türleri'
    ],
    
    advantages: [
      'pH stabilitesi',
      'NIES standardı'
    ],
    
    disadvantages: [
      'Batıda az bilinir'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [6.5, 7.0], optimal: 6.8 }
    },
    
    whenToSelect: 'NIES\'ten alınan kültürler',
    
    preparationNotes: 'NIES protokollerini takip edin.',
    
    references: [
      'NIES (National Institute for Environmental Studies) Collection'
    ]
  },
  
  'URO': {
    id: 'URO',
    name: 'URO',
    fullName: 'URO Medium (Chrysophytes)',
    category: 'advanced',
    
    description: 'Uroglena gibi metal hassasiyeti olanlar için. Altın sarısı algler (Chrysophyta) için.',
    
    suitableFor: [
      'Uroglena sp.',
      'Chrysophyceae'
    ],
    
    advantages: [
      'Metal toksisite riski minimum'
    ],
    
    disadvantages: [
      'Dar kullanım alanı'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.0, 7.5], optimal: 7.2 }
    },
    
    whenToSelect: 'Altın sarısı algler',
    
    preparationNotes: 'Plastik ekipman kullanın (metal kontaminasyonu önlemek için).',
    
    references: [
      'Provasoli & Pintner (1959) in The Ecology of Algae'
    ]
  },
  
  'DY-V': {
    id: 'DY-V',
    name: 'DY-V',
    fullName: 'DY-V Medium (Spirulina + B12)',
    category: 'advanced',
    
    description: 'Zarrouk ortamının modifiye edilmiş hali, B12 vitamini eklenmiş. Spirulina türevleri için.',
    
    suitableFor: [
      'Spirulina sp. (vitamin gerektiren suşlar)'
    ],
    
    advantages: [
      'B12 takviyesi'
    ],
    
    disadvantages: [
      'Pahalı (B12)'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [9.0, 10.0], optimal: 9.5 }
    },
    
    whenToSelect: 'Spirulina\'da vitamin eksikliği problemleri',
    
    preparationNotes: 'B12\'yi -20°C\'de saklayın, kullanmadan önce ekleyin.',
    
    references: [
      'Chinese Spirulina protocols'
    ]
  },
  
  'HS': {
    id: 'HS',
    name: 'HS (High Salt)',
    fullName: 'High Salt Medium',
    category: 'advanced',
    
    description: 'Hormidium gibi türler için özelleşmiş. Ozmotik basınç toleransı yüksek türler için.',
    
    suitableFor: [
      'Hormidium sp.',
      'Halotolerant türler'
    ],
    
    advantages: [
      'Yüksek tuz toleransı testleri'
    ],
    
    disadvantages: [
      'Dar kullanım alanı',
      'Ekipman korozyonu'
    ],
    
    composition: {
      hasFullStoichiometry: false,
      pH: { range: [7.0, 8.0], optimal: 7.5 }
    },
    
    whenToSelect: 'Halotolerant türler, tuz streS çalışmaları',
    
    preparationNotes: 'NaCl konsantrasyonunu türe göre ayarlayın (5-50 g/L).',
    
    references: [
      'Kirst (1990) Algal & cyanobacterial biotechnology'
    ]
  }
};

const MEDIA_MACRO_FALLBACKS = {
  'WC': {
    'NaNO3': { amount: 0.15, unit: 'g/L', element: 'N', provides: 24.8 },
    'K2HPO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 3.6 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'CaCl2·2H2O': { amount: 0.025, unit: 'g/L', element: 'Ca', provides: 6.8 },
    'NaHCO3': { amount: 0.02, unit: 'g/L', element: 'C', provides: 2.7 }
  },
  'C-Medium': {
    'NH4Cl': { amount: 0.12, unit: 'g/L', element: 'N', provides: 31.3 },
    'KH2PO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 6.8 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'Sodium Acetate': { amount: 0.5, unit: 'g/L', element: 'C', provides: 146.8 }
  },
  'Bristol': {
    'NaNO3': { amount: 0.25, unit: 'g/L', element: 'N', provides: 41.2 },
    'K2HPO4': { amount: 0.075, unit: 'g/L', element: 'P', provides: 13.4 },
    'KH2PO4': { amount: 0.175, unit: 'g/L', element: 'P', provides: 39.9 },
    'MgSO4·7H2O': { amount: 0.075, unit: 'g/L', element: 'Mg', provides: 7.4 },
    'CaCl2·2H2O': { amount: 0.025, unit: 'g/L', element: 'Ca', provides: 6.8 }
  },
  'Proteose-Peptone': {
    'Proteose Peptone': { amount: 1.0, unit: 'g/L', element: 'N', provides: 120.0 },
    'NaNO3': { amount: 0.1, unit: 'g/L', element: 'N', provides: 16.5 },
    'K2HPO4': { amount: 0.05, unit: 'g/L', element: 'P', provides: 8.9 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 }
  },
  'Glucose-YeastExtract': {
    'D-Glucose': { amount: 1.0, unit: 'g/L', element: 'C', provides: 400.0 },
    'Yeast Extract': { amount: 0.5, unit: 'g/L', element: 'N', provides: 55.0 },
    'K2HPO4': { amount: 0.05, unit: 'g/L', element: 'P', provides: 8.9 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 }
  },
  'Acetate-Medium': {
    'Sodium Acetate': { amount: 1.0, unit: 'g/L', element: 'C', provides: 293.6 },
    'NH4Cl': { amount: 0.15, unit: 'g/L', element: 'N', provides: 39.2 },
    'K2HPO4': { amount: 0.05, unit: 'g/L', element: 'P', provides: 8.9 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 }
  },
  'Euglena-Medium': {
    'NH4Cl': { amount: 0.12, unit: 'g/L', element: 'N', provides: 31.3 },
    'KH2PO4': { amount: 0.04, unit: 'g/L', element: 'P', provides: 9.1 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'Sodium Acetate': { amount: 0.5, unit: 'g/L', element: 'C', provides: 146.8 }
  },
  'Z-Medium': {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'K2HPO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 3.6 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'CaCl2·2H2O': { amount: 0.02, unit: 'g/L', element: 'Ca', provides: 5.4 }
  },
  'ASM-1': {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'KH2PO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'CaCl2·2H2O': { amount: 0.02, unit: 'g/L', element: 'Ca', provides: 5.4 }
  },
  'MA-Medium': {
    'NaNO3': { amount: 0.15, unit: 'g/L', element: 'N', provides: 24.8 },
    'K2HPO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 3.6 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'NaHCO3': { amount: 0.03, unit: 'g/L', element: 'C', provides: 4.1 }
  },
  'Waris-H': {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'K2HPO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 5.4 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'CaCl2·2H2O': { amount: 0.015, unit: 'g/L', element: 'Ca', provides: 4.1 }
  },
  'Allen': {
    'NH4Cl': { amount: 0.15, unit: 'g/L', element: 'N', provides: 39.2 },
    'KH2PO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'Sodium Acetate': { amount: 0.3, unit: 'g/L', element: 'C', provides: 88.1 }
  },
  'SE': {
    'NaNO3': { amount: 0.15, unit: 'g/L', element: 'N', provides: 24.8 },
    'KH2PO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'CaCl2·2H2O': { amount: 0.02, unit: 'g/L', element: 'Ca', provides: 5.4 }
  },
  'Erd-Schreiber': {
    'NaNO3': { amount: 0.18, unit: 'g/L', element: 'N', provides: 29.7 },
    'K2HPO4': { amount: 0.025, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'NaHCO3': { amount: 0.03, unit: 'g/L', element: 'C', provides: 4.1 }
  },
  'Pringsheim-Soil': {
    'NaNO3': { amount: 0.12, unit: 'g/L', element: 'N', provides: 19.8 },
    'KH2PO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'CaCl2·2H2O': { amount: 0.015, unit: 'g/L', element: 'Ca', provides: 4.1 }
  },
  'COMBO': {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'KH2PO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 6.8 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'CaCl2·2H2O': { amount: 0.03, unit: 'g/L', element: 'Ca', provides: 8.2 }
  },
  'L16': {
    'NaNO3': { amount: 0.15, unit: 'g/L', element: 'N', provides: 24.8 },
    'K2HPO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 3.6 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'NaHCO3': { amount: 0.02, unit: 'g/L', element: 'C', provides: 2.7 }
  },
  'f2-Freshwater': {
    'NaNO3': { amount: 0.18, unit: 'g/L', element: 'N', provides: 29.7 },
    'NaH2PO4': { amount: 0.016, unit: 'g/L', element: 'P', provides: 3.9 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'NaHCO3': { amount: 0.02, unit: 'g/L', element: 'C', provides: 2.7 }
  },
  'M-8': {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'K2HPO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 5.4 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'CaCl2·2H2O': { amount: 0.025, unit: 'g/L', element: 'Ca', provides: 6.8 }
  },
  'AF-6': {
    'NaNO3': { amount: 0.25, unit: 'g/L', element: 'N', provides: 41.2 },
    'K2HPO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 5.4 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'CaCl2·2H2O': { amount: 0.02, unit: 'g/L', element: 'Ca', provides: 5.4 }
  },
  'URO': {
    'Urea': { amount: 0.15, unit: 'g/L', element: 'N', provides: 69.8 },
    'KH2PO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 6.8 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'NaHCO3': { amount: 0.03, unit: 'g/L', element: 'C', provides: 4.1 }
  },
  'DY-V': {
    'NaNO3': { amount: 0.15, unit: 'g/L', element: 'N', provides: 24.8 },
    'K2HPO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 3.6 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'Sodium Acetate': { amount: 0.25, unit: 'g/L', element: 'C', provides: 73.4 }
  },
  'HS': {
    'NH4Cl': { amount: 0.2, unit: 'g/L', element: 'N', provides: 52.2 },
    'K2HPO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 3.6 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'CaCl2·2H2O': { amount: 0.02, unit: 'g/L', element: 'Ca', provides: 5.4 }
  }
};

const CATEGORY_MACRO_FALLBACKS = {
  standard: {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'K2HPO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 5.4 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'CaCl2·2H2O': { amount: 0.02, unit: 'g/L', element: 'Ca', provides: 5.4 }
  },
  mixotrophic: {
    'NH4Cl': { amount: 0.15, unit: 'g/L', element: 'N', provides: 39.2 },
    'K2HPO4': { amount: 0.03, unit: 'g/L', element: 'P', provides: 5.4 },
    'MgSO4·7H2O': { amount: 0.05, unit: 'g/L', element: 'Mg', provides: 4.9 },
    'Sodium Acetate': { amount: 0.4, unit: 'g/L', element: 'C', provides: 117.4 }
  },
  specialized: {
    'NaNO3': { amount: 0.2, unit: 'g/L', element: 'N', provides: 33.0 },
    'KH2PO4': { amount: 0.02, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'Na2SiO3': { amount: 0.02, unit: 'g/L', element: 'Si', provides: 5.0 }
  },
  ecological: {
    'NaNO3': { amount: 0.12, unit: 'g/L', element: 'N', provides: 19.8 },
    'KH2PO4': { amount: 0.015, unit: 'g/L', element: 'P', provides: 3.4 },
    'MgSO4·7H2O': { amount: 0.03, unit: 'g/L', element: 'Mg', provides: 3.0 },
    'CaCl2·2H2O': { amount: 0.015, unit: 'g/L', element: 'Ca', provides: 4.1 }
  },
  advanced: {
    'NaNO3': { amount: 0.18, unit: 'g/L', element: 'N', provides: 29.7 },
    'K2HPO4': { amount: 0.025, unit: 'g/L', element: 'P', provides: 4.5 },
    'MgSO4·7H2O': { amount: 0.04, unit: 'g/L', element: 'Mg', provides: 3.9 },
    'FeSO4·7H2O': { amount: 0.005, unit: 'g/L', element: 'Fe', provides: 1.0 }
  }
};

const STOCK_COLOR_PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

const cloneMacroMap = (macroMap = {}) => (
  Object.entries(macroMap).reduce((acc, [compound, data]) => {
    acc[compound] = { ...data };
    return acc;
  }, {})
);

const buildStocksFromMacronutrients = (macronutrients = {}, mediaId = 'media') => {
  const stocks = {
    main: [],
    ca: [],
    trace: []
  };

  Object.entries(macronutrients).forEach(([formula, data], idx) => {
    const normalized = {
      id: `${mediaId}_${idx}`,
      formula,
      amount: Number(data.amount) || 0,
      unit: 'g'
    };

    if (/Fe|EDTA|Trace|Vitamin|B12|Biotin|Thiamine|Mn|Zn|Cu|Co|Mo|H3BO3/i.test(formula)) {
      stocks.trace.push(normalized);
    } else if (/Ca/i.test(formula)) {
      stocks.ca.push(normalized);
    } else {
      stocks.main.push(normalized);
    }
  });

  const result = [];

  if (stocks.main.length > 0) {
    result.push({
      id: `${mediaId}_main`,
      name: 'Ana Stok',
      stockVolume: 1000,
      usageAmount: 100,
      color: STOCK_COLOR_PALETTE[0],
      chemicals: stocks.main
    });
  }

  if (stocks.ca.length > 0) {
    result.push({
      id: `${mediaId}_ca`,
      name: 'Ca/Mg Stok',
      stockVolume: 1000,
      usageAmount: 10,
      color: STOCK_COLOR_PALETTE[1],
      chemicals: stocks.ca
    });
  }

  if (stocks.trace.length > 0) {
    result.push({
      id: `${mediaId}_trace`,
      name: 'Fe/İz Element Stok',
      stockVolume: 1000,
      usageAmount: 1,
      color: STOCK_COLOR_PALETTE[2],
      chemicals: stocks.trace
    });
  }

  return result;
};

const applyMediaNormalization = () => {
  Object.values(MEDIA_DATABASE).forEach((media) => {
    if (!media.composition) media.composition = {};

    if (!media.composition.macronutrients) {
      const specificFallback = MEDIA_MACRO_FALLBACKS[media.id];
      const categoryFallback = CATEGORY_MACRO_FALLBACKS[media.category] || CATEGORY_MACRO_FALLBACKS.standard;
      media.composition.macronutrients = cloneMacroMap(specificFallback || categoryFallback);
    }

    if (!media.composition.pH) {
      media.composition.pH = { range: [7.0, 7.8], optimal: 7.4 };
    }

    if (!Array.isArray(media.composition.stocks) || media.composition.stocks.length === 0) {
      media.composition.stocks = buildStocksFromMacronutrients(media.composition.macronutrients, media.id);
    }

    media.composition.hasFullStoichiometry =
      !!media.composition.macronutrients
      && Object.keys(media.composition.macronutrients).length > 0
      && Array.isArray(media.composition.stocks)
      && media.composition.stocks.length > 0;
  });
};

applyMediaNormalization();

/**
 * Kategori bazında besin ortamlarını getir
 */
export function getMediaByCategory(categoryId) {
  return Object.values(MEDIA_DATABASE).filter(
    media => media.category === categoryId
  );
}

/**
 * Belirli bir tür için uygun besin ortamlarını bul
 */
export function findSuitableMedia(species) {
  return Object.values(MEDIA_DATABASE).filter(media =>
    media.suitableFor && media.suitableFor.some(sp =>
      sp.toLowerCase().includes(species.toLowerCase()) ||
      species.toLowerCase().includes(sp.toLowerCase())
    )
  );
}

/**
 * Anahtar kelimeye göre arama
 */
export function searchMedia(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(MEDIA_DATABASE).filter(media =>
    media.name.toLowerCase().includes(lowerKeyword) ||
    media.fullName.toLowerCase().includes(lowerKeyword) ||
    media.description.toLowerCase().includes(lowerKeyword) ||
    media.whenToSelect.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Stokiyometrik verisi olan besin ortamlarını getir
 */
export function getMediaWithStoichiometry() {
  return Object.values(MEDIA_DATABASE).filter(
    media => media.composition && media.composition.hasFullStoichiometry
  );
}

export default {
  MEDIA_CATEGORIES,
  MEDIA_DATABASE,
  getMediaByCategory,
  findSuitableMedia,
  searchMedia,
  getMediaWithStoichiometry
};

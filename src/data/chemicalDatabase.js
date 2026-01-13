/**
 * CHLORELLA VULGARİS - KAPSAMLI KİMYASAL VERİTABANI
 * 
 * Her kimyasalın:
 * - Moleküler formülü ve ağırlığı
 * - Element bazlı kompozisyonu (C, H, O, N, P, K, Mg, Ca, S, Fe, B, Zn, Mn, Cu, Mo)
 * - İyon/Tuz formları
 * - Çözünürlük ve davranış özellikleri
 */

export const ELEMENT_WEIGHTS = {
  H: 1.008,
  C: 12.01,
  N: 14.01,
  O: 16.00,
  Na: 22.99,
  Mg: 24.31,
  P: 30.97,
  S: 32.07,
  Cl: 35.45,
  K: 39.10,
  Ca: 40.08,
  Fe: 55.85,
  Cu: 63.55,
  Zn: 65.38,
  Mo: 95.95,
  Mn: 54.94,
  B: 10.81
};

export const CHEMICALS = {
  // ==================== AZOT KAYNAKLARI ====================
  "Üre": {
    formula: "CO(NH2)2",
    CAS: "57-13-6",
    MW: 60.06,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      C: 1,
      O: 1,
      N: 2,
      H: 4
    },
    elementalMass: {
      C: 20.0,   // %
      O: 26.6,
      N: 46.6,
      H: 6.7
    },
    nitrogen_content: 46.6,  // % N
    ions: null,  // Moleküler form
    behavior: {
      solubility: "Çok yüksek (1080 g/L @ 20°C)",
      pH_effect: "Hidroliz sonrası NH3 → pH yükseltir",
      hydrolysis: "Urease enzimi ile NH3 + CO2'ye dönüşür"
    },
    prices: {
      laboratory: 150,  // TL/kg
      agricultural: 35   // TL/kg
    },
    notes: "Algler üreyi hızlı kullanır. pH düşme riski var, karbonat tamponu gerekebilir."
  },

  "Sodyum Nitrat": {
    formula: "NaNO3",
    CAS: "7631-99-4",
    MW: 84.99,
    grade: ["Laboratory", "Technical"],
    elements: {
      Na: 1,
      N: 1,
      O: 3
    },
    elementalMass: {
      Na: 27.0,
      N: 16.5,
      O: 56.5
    },
    nitrogen_content: 16.5,
    ions: {
      cation: "Na+",
      anion: "NO3-"
    },
    behavior: {
      solubility: "880 g/L @ 20°C",
      pH_effect: "Nötr veya hafif bazik (NO3 tüketimi → pH yükselir)",
      uptake: "Algler tarafından aktif transport ile alınır"
    },
    prices: {
      laboratory: 180,
      technical: 90
    },
    notes: "BBM ve BG-11'in standart azot kaynağı. Pahalı ama güvenilir."
  },

  "Amonyum Sülfat": {
    formula: "(NH4)2SO4",
    CAS: "7783-20-2",
    MW: 132.14,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      N: 2,
      H: 8,
      S: 1,
      O: 4
    },
    elementalMass: {
      N: 21.2,
      H: 6.1,
      S: 24.3,
      O: 48.5
    },
    nitrogen_content: 21.2,
    sulfur_content: 24.3,
    ions: {
      cation: "NH4+ (2)",
      anion: "SO4^2-"
    },
    behavior: {
      solubility: "750 g/L @ 20°C",
      pH_effect: "Asidik (NH4+ → H+ salar)",
      uptake: "NH4+ direkt alınır, enerji tasarrufu"
    },
    prices: {
      laboratory: 120,
      agricultural: 25
    },
    notes: "Ucuz ama pH düşürür. Magnezyum ile birlikte iyi çalışır."
  },

  // ==================== FOSFOR KAYNAKLARI ====================
  "MKP (Monopotasyum Fosfat)": {
    formula: "KH2PO4",
    CAS: "7778-77-0",
    MW: 136.09,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      K: 1,
      H: 2,
      P: 1,
      O: 4
    },
    elementalMass: {
      K: 28.7,
      P: 22.8,
      H: 1.5,
      O: 47.0
    },
    phosphorus_content: 22.8,
    potassium_content: 28.7,
    ions: {
      cation: "K+",
      anion: "H2PO4-"  // pH'a bağlı
    },
    pH_dependent_ions: {
      pH_below_7: "H2PO4-",
      pH_7_to_12: "HPO4^2-",
      pH_above_12: "PO4^3-"
    },
    behavior: {
      solubility: "330 g/L @ 20°C",
      pH_effect: "Hafif asidik (pH ~4.5 @ 0.1M)",
      buffering: "Güçlü tampon (pKa2 = 7.2)"
    },
    prices: {
      laboratory: 620,
      agricultural: 580
    },
    notes: "BBM'de tercih edilen. pH stabilizasyonu sağlar. V2.0 formülünde 2.5g/L kullanılıyor."
  },

  "MAP (Monoamonyum Fosfat)": {
    formula: "NH4H2PO4",
    CAS: "7722-76-1",
    MW: 115.03,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      N: 1,
      H: 6,
      P: 1,
      O: 4
    },
    elementalMass: {
      N: 12.2,
      H: 5.2,
      P: 26.9,
      O: 55.7
    },
    nitrogen_content: 12.2,
    phosphorus_content: 26.9,
    ions: {
      cation: "NH4+",
      anion: "H2PO4-"
    },
    behavior: {
      solubility: "370 g/L @ 20°C",
      pH_effect: "Asidik (pH ~4.0 @ 0.1M)",
      uptake: "Hem N hem P sağlar, çift avantaj"
    },
    prices: {
      laboratory: 615,
      agricultural: 550
    },
    notes: "MKP'den daha asidik. pH 9 krizinde tercih edilir. Hem N hem P verir."
  },

  "DAP (Diamonyum Fosfat)": {
    formula: "(NH4)2HPO4",
    CAS: "7783-28-0",
    MW: 132.06,
    grade: ["Agricultural"],
    elements: {
      N: 2,
      H: 9,
      P: 1,
      O: 4
    },
    elementalMass: {
      N: 21.2,
      H: 6.9,
      P: 23.5,
      O: 48.5
    },
    nitrogen_content: 21.2,
    phosphorus_content: 23.5,
    ions: {
      cation: "NH4+ (2)",
      anion: "HPO4^2-"
    },
    behavior: {
      solubility: "570 g/L @ 20°C",
      pH_effect: "Bazik (pH ~8.0 @ 0.1M)",
      uptake: "Yüksek N:P oranı (2:1 molar)"
    },
    prices: {
      agricultural: 480
    },
    notes: "Hibrit formülasyonda kullanılıyor (Üre + DAP = 7 TL/ton vs 46 TL)."
  },

  "Dipotasyum Fosfat": {
    formula: "K2HPO4",
    CAS: "7758-11-4",
    MW: 174.18,
    grade: ["Laboratory"],
    elements: {
      K: 2,
      H: 1,
      P: 1,
      O: 4
    },
    elementalMass: {
      K: 44.9,
      H: 0.6,
      P: 17.8,
      O: 36.8
    },
    phosphorus_content: 17.8,
    potassium_content: 44.9,
    ions: {
      cation: "K+ (2)",
      anion: "HPO4^2-"
    },
    behavior: {
      solubility: "1600 g/L @ 20°C",
      pH_effect: "Bazik (pH ~9.0 @ 0.1M)",
      buffering: "Tampon görevi"
    },
    prices: {
      laboratory: 850
    },
    notes: "BBM'de MKP ile birlikte pH tamponu olarak kullanılır."
  },

  // ==================== MAGNEZYUM KAYNAKLARI ====================
  "Magnezyum Sülfat": {
    formula: "MgSO4·7H2O",
    CAS: "10034-99-8",
    MW: 246.47,
    grade: ["Laboratory", "Agricultural", "Epsom Salt"],
    elements: {
      Mg: 1,
      S: 1,
      O: 11,
      H: 14
    },
    elementalMass: {
      Mg: 9.9,
      S: 13.0,
      O: 71.4,
      H: 5.7
    },
    magnesium_content: 9.9,
    sulfur_content: 13.0,
    ions: {
      cation: "Mg^2+",
      anion: "SO4^2-"
    },
    behavior: {
      solubility: "710 g/L @ 20°C",
      pH_effect: "Nötr (hafif asidik)",
      role: "Klorofil merkezi, enzim aktivatörü"
    },
    prices: {
      laboratory: 95,
      agricultural: 15,
      epsom: 25
    },
    notes: "Klorofil sentezi için kritik. 7H2O formu en yaygın (Epsom tuzu)."
  },

  "Magnezyum Klorür": {
    formula: "MgCl2·6H2O",
    CAS: "7791-18-6",
    MW: 203.30,
    grade: ["Laboratory"],
    elements: {
      Mg: 1,
      Cl: 2,
      O: 6,
      H: 12
    },
    elementalMass: {
      Mg: 12.0,
      Cl: 34.9,
      H: 5.9,
      O: 47.2
    },
    magnesium_content: 12.0,
    chloride_content: 34.9,
    ions: {
      cation: "Mg^2+",
      anion: "Cl- (2)"
    },
    behavior: {
      solubility: "540 g/L @ 20°C",
      pH_effect: "Hafif asidik",
      notes: "MgSO4'den daha pahalı, genelde tercih edilmez"
    },
    prices: {
      laboratory: 180
    }
  },

  // ==================== KALSIYUM KAYNAKLARI ====================
  "Kalsiyum Klorür": {
    formula: "CaCl2·2H2O",
    CAS: "10035-04-8",
    MW: 147.01,
    grade: ["Laboratory", "Technical"],
    elements: {
      Ca: 1,
      Cl: 2,
      O: 2,
      H: 4
    },
    elementalMass: {
      Ca: 27.3,
      Cl: 48.2,
      H: 2.7,
      O: 21.8
    },
    calcium_content: 27.3,
    chloride_content: 48.2,
    ions: {
      cation: "Ca^2+",
      anion: "Cl- (2)"
    },
    behavior: {
      solubility: "740 g/L @ 20°C",
      pH_effect: "Nötr",
      role: "Hücre duvarı yapısı, sinyal iletimi",
      precipitation_risk: "Fosfat ve sülfat ile çökelti oluşturur"
    },
    prices: {
      laboratory: 110,
      technical: 35
    },
    notes: "Ayrı stokta saklanmalı (B stoğu). Jelleştirme için kullanılır (Na-aljinat çapraz bağlar)."
  },

  "Kalsiyum Nitrat": {
    formula: "Ca(NO3)2·4H2O",
    CAS: "13477-34-4",
    MW: 236.15,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      Ca: 1,
      N: 2,
      O: 10,
      H: 8
    },
    elementalMass: {
      Ca: 17.0,
      N: 11.9,
      H: 3.4,
      O: 67.8
    },
    calcium_content: 17.0,
    nitrogen_content: 11.9,
    ions: {
      cation: "Ca^2+",
      anion: "NO3- (2)"
    },
    behavior: {
      solubility: "1220 g/L @ 20°C",
      pH_effect: "Nötr",
      advantage: "Hem Ca hem N verir"
    },
    prices: {
      laboratory: 250,
      agricultural: 120
    },
    notes: "Fosfat ile çökelti riski daha az. Alternatif Ca kaynağı."
  },

  // ==================== KARBONAT TAMPONLARI ====================
  "Sodyum Karbonat": {
    formula: "Na2CO3",
    CAS: "497-19-8",
    MW: 105.99,
    grade: ["Laboratory", "Technical"],
    elements: {
      Na: 2,
      C: 1,
      O: 3
    },
    elementalMass: {
      Na: 43.4,
      C: 11.3,
      O: 45.3
    },
    ions: {
      cation: "Na+ (2)",
      anion: "CO3^2-"
    },
    behavior: {
      solubility: "220 g/L @ 20°C",
      pH_effect: "Bazik (pH ~11 @ 0.1M)",
      buffering: "CO2 ile birlikte pH tamponu (HCO3-/CO3^2-)",
      warning: "pH 9 krizine neden olabilir!"
    },
    prices: {
      laboratory: 85,
      technical: 20
    },
    notes: "V2.0 formülünde ÇIKARILDI. pH 9 patlamasının ana nedeni. Alternatif: NaHCO3"
  },

  "Sodyum Bikarbonat": {
    formula: "NaHCO3",
    CAS: "144-55-8",
    MW: 84.01,
    grade: ["Food Grade", "Laboratory"],
    elements: {
      Na: 1,
      H: 1,
      C: 1,
      O: 3
    },
    elementalMass: {
      Na: 27.4,
      H: 1.2,
      C: 14.3,
      O: 57.1
    },
    ions: {
      cation: "Na+",
      anion: "HCO3-"
    },
    behavior: {
      solubility: "96 g/L @ 20°C",
      pH_effect: "Hafif bazik (pH ~8.3 @ 0.1M)",
      buffering: "Zayıf tampon, Na2CO3'den güvenli"
    },
    prices: {
      food: 15,
      laboratory: 60
    },
    notes: "Karbonat yerine daha güvenli alternatif."
  },

  // ==================== DEMİR KAYNAKLARI ====================
  "Demir Sülfat": {
    formula: "FeSO4·7H2O",
    CAS: "7782-63-0",
    MW: 278.01,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      Fe: 1,
      S: 1,
      O: 11,
      H: 14
    },
    elementalMass: {
      Fe: 20.1,
      S: 11.5,
      H: 5.1,
      O: 63.3
    },
    iron_content: 20.1,
    sulfur_content: 11.5,
    ions: {
      cation: "Fe^2+",
      anion: "SO4^2-"
    },
    behavior: {
      solubility: "480 g/L @ 20°C",
      pH_effect: "Asidik (Fe^2+ hidrolizi)",
      oxidation: "Fe^2+ → Fe^3+ (oksitlenerek çöker)",
      chelation: "EDTA veya sitrik asit ile şelatlama gerekir"
    },
    prices: {
      laboratory: 95,
      agricultural: 25
    },
    notes: "Şelatlayıcı olmadan pH>7'de çöker. EDTA + Sitrik asit karışımı ideal."
  },

  "Demir Amonyum Sitrat": {
    formula: "FeC6H8O7·NH4",
    CAS: "1185-57-5",
    MW: 262.0,
    grade: ["Laboratory"],
    elements: {
      Fe: 1,
      C: 6,
      H: 12,
      N: 1,
      O: 7
    },
    elementalMass: {
      Fe: 21.3,
      C: 27.5,
      H: 4.6,
      N: 5.3,
      O: 42.7
    },
    iron_content: 21.3,
    behavior: {
      solubility: "Yüksek (şelat formu)",
      pH_effect: "Nötr",
      stability: "pH 3-9 arası stabil",
      advantage: "Oksitlenmeye karşı dirençli"
    },
    prices: {
      laboratory: 450
    },
    notes: "BG-11'de kullanılır. Pahalı ama güvenilir."
  },

  // ==================== ŞELATLAYICILAR ====================
  "EDTA (Disodyum Tuzu)": {
    formula: "C10H14N2Na2O8·2H2O",
    CAS: "6381-92-6",
    MW: 372.24,
    grade: ["Laboratory"],
    elements: {
      C: 10,
      H: 18,
      N: 2,
      Na: 2,
      O: 10
    },
    elementalMass: {
      C: 32.3,
      H: 4.9,
      N: 7.5,
      Na: 12.4,
      O: 43.0
    },
    ions: {
      cation: "Na+ (2)",
      anion: "EDTA^4-"
    },
    behavior: {
      solubility: "110 g/L @ 20°C",
      pH_effect: "Nötr",
      chelation: "Fe, Cu, Zn, Mn, Ca, Mg'yi şelatlar",
      stability: "pH 4-10 arası etkili"
    },
    prices: {
      laboratory: 250
    },
    notes: "Mikro element stoğunda ilk çözündürülmeli (sıcak su). Sonra demiri ekle."
  },

  "Sitrik Asit": {
    formula: "C6H8O7·H2O",
    CAS: "5949-29-1",
    MW: 210.14,
    grade: ["Food Grade", "Laboratory"],
    elements: {
      C: 6,
      H: 10,
      O: 8
    },
    elementalMass: {
      C: 34.3,
      H: 4.8,
      O: 60.9
    },
    behavior: {
      solubility: "1330 g/L @ 20°C",
      pH_effect: "Asidik (pKa 3.1, 4.7, 6.4)",
      chelation: "Orta kuvvet şelatör (EDTA'dan zayıf)",
      buffering: "pH 3-6 arası tampon"
    },
    prices: {
      food: 45,
      laboratory: 80
    },
    notes: "EDTA ile birlikte sinerjik etki. pH düşürücü + antioksidan. Flokülasyonda da kullanılır."
  },

  // ==================== MİKRO ELEMENTLER ====================
  "Borik Asit": {
    formula: "H3BO3",
    CAS: "10043-35-3",
    MW: 61.83,
    grade: ["Laboratory", "Technical"],
    elements: {
      B: 1,
      H: 3,
      O: 3
    },
    elementalMass: {
      B: 17.5,
      H: 4.9,
      O: 77.6
    },
    boron_content: 17.5,
    behavior: {
      solubility: "56 g/L @ 20°C",
      pH_effect: "Hafif asidik (zayıf asit)",
      role: "Hücre duvarı sentezi, çoğalma"
    },
    prices: {
      laboratory: 120,
      technical: 45
    },
    notes: "Mikro stokta 11.4 g/L konsantrasyonda. Çok düşük dozda bile etkili."
  },

  "Çinko Sülfat": {
    formula: "ZnSO4·7H2O",
    CAS: "7446-20-0",
    MW: 287.54,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      Zn: 1,
      S: 1,
      O: 11,
      H: 14
    },
    elementalMass: {
      Zn: 22.7,
      S: 11.2,
      H: 4.9,
      O: 61.2
    },
    zinc_content: 22.7,
    sulfur_content: 11.2,
    ions: {
      cation: "Zn^2+",
      anion: "SO4^2-"
    },
    behavior: {
      solubility: "965 g/L @ 20°C",
      pH_effect: "Asidik",
      role: "Enzim kofaktörü (carbonic anhydrase)"
    },
    prices: {
      laboratory: 180,
      agricultural: 85
    },
    notes: "Mikro stokta 8.8 g/L. Fazlası toksik (>5 ppm serbest Zn^2+)."
  },

  "Mangan Sülfat": {
    formula: "MnSO4·H2O",
    CAS: "10034-96-5",
    MW: 169.01,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      Mn: 1,
      S: 1,
      O: 5,
      H: 2
    },
    elementalMass: {
      Mn: 32.5,
      S: 19.0,
      H: 1.2,
      O: 47.3
    },
    manganese_content: 32.5,
    sulfur_content: 19.0,
    ions: {
      cation: "Mn^2+",
      anion: "SO4^2-"
    },
    behavior: {
      solubility: "520 g/L @ 20°C",
      pH_effect: "Asidik",
      role: "Fotosentez (PSII), O2 evrimi"
    },
    prices: {
      laboratory: 160,
      agricultural: 70
    },
    notes: "Mikro stokta 1.5 g/L. Fotosentez için kritik (O2 salınımı)."
  },

  "Bakır Sülfat": {
    formula: "CuSO4·5H2O",
    CAS: "7758-99-8",
    MW: 249.68,
    grade: ["Laboratory", "Agricultural"],
    elements: {
      Cu: 1,
      S: 1,
      O: 9,
      H: 10
    },
    elementalMass: {
      Cu: 25.5,
      S: 12.8,
      H: 4.0,
      O: 57.7
    },
    copper_content: 25.5,
    sulfur_content: 12.8,
    ions: {
      cation: "Cu^2+",
      anion: "SO4^2-"
    },
    behavior: {
      solubility: "320 g/L @ 20°C",
      pH_effect: "Asidik",
      role: "Elektron transferi (plastocyanin)",
      toxicity: "Yüksek dozda alg öldürücü!"
    },
    prices: {
      laboratory: 140,
      agricultural: 65
    },
    notes: "Mikro stokta 1.6 g/L. ÇOK DİKKAT: Fazlası algleri öldürür (algisit)."
  },

  "Molibden Trioksit": {
    formula: "MoO3",
    CAS: "1313-27-5",
    MW: 143.94,
    grade: ["Laboratory"],
    elements: {
      Mo: 1,
      O: 3
    },
    elementalMass: {
      Mo: 66.7,
      O: 33.3
    },
    molybdenum_content: 66.7,
    behavior: {
      solubility: "Düşük (bazik çözeltide çözünür)",
      pH_effect: "Asidik",
      role: "Nitrat redüktaz enzimi"
    },
    prices: {
      laboratory: 850
    },
    notes: "Çok az gerekir. Amonyum molibdat alternatifi."
  },

  "Amonyum Heptamolibdat": {
    formula: "(NH4)6Mo7O24·4H2O",
    CAS: "12054-85-2",
    MW: 1235.86,
    grade: ["Laboratory"],
    elements: {
      N: 6,
      H: 32,
      Mo: 7,
      O: 28
    },
    elementalMass: {
      N: 6.8,
      H: 2.6,
      Mo: 54.3,
      O: 36.3
    },
    molybdenum_content: 54.3,
    behavior: {
      solubility: "430 g/L @ 20°C",
      pH_effect: "Nötr",
      usage: "Spektrofotometrik fosfor analizi + Mikro element"
    },
    prices: {
      laboratory: 1508  // TL/100g (15,000 test kapasitesi)
    },
    notes: "İki amaçlı: 1) Molibden Mavisi fosfor testi, 2) Mikro element stoğu"
  },

  // ==================== DİĞER TUZLAR ====================
  "Sodyum Klorür": {
    formula: "NaCl",
    CAS: "7647-14-5",
    MW: 58.44,
    grade: ["Laboratory", "Food Grade"],
    elements: {
      Na: 1,
      Cl: 1
    },
    elementalMass: {
      Na: 39.3,
      Cl: 60.7
    },
    sodium_content: 39.3,
    chloride_content: 60.7,
    ions: {
      cation: "Na+",
      anion: "Cl-"
    },
    behavior: {
      solubility: "360 g/L @ 20°C",
      pH_effect: "Nötr",
      role: "Osmotik denge, iyonik güç"
    },
    prices: {
      laboratory: 50,
      food: 5
    },
    notes: "BBM'de 25 mg/L düzeyinde. Tuzluluk stresine dikkat."
  },

  "Sodyum Aljinat": {
    formula: "(C6H7O6Na)n",
    CAS: "9005-38-3",
    MW: "~200,000 (polimer)",
    grade: ["Food Grade", "Laboratory"],
    elements: {
      C: 6,
      H: 7,
      O: 6,
      Na: 1
    },
    behavior: {
      solubility: "Yavaş (ısıtılarak çözülür)",
      pH_effect: "Nötr",
      gelation: "Ca^2+ ile anında jel oluşturur",
      viscosity: "Yüksek (1-2% çözelti kalın)"
    },
    prices: {
      food: 180,  // TL/kg
      laboratory: 450
    },
    notes: "Jelleştirme için kullanılır. %2-3 konsantrasyonda hazırlanır. Müşteri 25kg sıvı sağlıyor."
  }
};

// ==================== HESAPLAMA FONKSİYONLARI ====================

/**
 * Bir kimyasalın element kompozisyonunu hesaplar
 * @param {string} chemicalName - Kimyasal adı
 * @param {number} mass - Miktar (gram)
 * @returns {Object} Element bazlı kütle dağılımı
 */
export function calculateElementalComposition(chemicalName, mass) {
  const chemical = CHEMICALS[chemicalName];
  if (!chemical) {
    throw new Error(`Kimyasal bulunamadı: ${chemicalName}`);
  }

  const composition = {};
  for (const [element, percentage] of Object.entries(chemical.elementalMass)) {
    composition[element] = (mass * percentage) / 100;
  }

  return {
    chemical: chemicalName,
    totalMass: mass,
    composition: composition,
    ions: chemical.ions
  };
}

/**
 * Bir formülasyonun toplam element kompozisyonunu hesaplar
 * @param {Array} recipe - [{name: "Üre", mass: 1.5}, ...]
 * @returns {Object} Toplam element dağılımı
 */
export function calculateRecipeComposition(recipe) {
  const totalComposition = {};
  const ionBalance = { cations: [], anions: [] };

  recipe.forEach(ingredient => {
    const comp = calculateElementalComposition(ingredient.name, ingredient.mass);
    
    // Elementleri topla
    for (const [element, mass] of Object.entries(comp.composition)) {
      totalComposition[element] = (totalComposition[element] || 0) + mass;
    }

    // İyon dengesini kaydet
    const chemical = CHEMICALS[ingredient.name];
    if (chemical.ions) {
      if (chemical.ions.cation) {
        ionBalance.cations.push({
          ion: chemical.ions.cation,
          source: ingredient.name,
          amount: ingredient.mass / chemical.MW
        });
      }
      if (chemical.ions.anion) {
        ionBalance.anions.push({
          ion: chemical.ions.anion,
          source: ingredient.name,
          amount: ingredient.mass / chemical.MW
        });
      }
    }
  });

  return {
    elements: totalComposition,
    ions: ionBalance
  };
}

/**
 * N:P oranını hesaplar (Redfield ile karşılaştırır)
 * @param {Object} composition - Element kompozisyonu
 * @returns {Object} N:P analizi
 */
export function analyzeNPRatio(composition) {
  const N = composition.elements.N || 0;
  const P = composition.elements.P || 0;

  if (P === 0) {
    return {
      ratio: Infinity,
      message: "Fosfor yok! Formülasyon eksik."
    };
  }

  const molarRatio = (N / ELEMENT_WEIGHTS.N) / (P / ELEMENT_WEIGHTS.P);
  const massRatio = N / P;
  const redfieldOptimal = 7.0;  // Kütlesel oran
  const deviation = ((massRatio - redfieldOptimal) / redfieldOptimal) * 100;

  return {
    N_mass: N,
    P_mass: P,
    massRatio: massRatio.toFixed(2),
    molarRatio: molarRatio.toFixed(2),
    redfield: redfieldOptimal,
    deviation: deviation.toFixed(1) + "%",
    assessment: deviation > 20 ? "DENGESİZ - Fosfor birikimi riski" :
                 deviation < -20 ? "DENGESİZ - Azot fazlası" :
                 "DENGEDE"
  };
}

export default CHEMICALS;

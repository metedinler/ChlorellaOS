import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Beaker, TrendingUp, Droplet, Activity, ChevronDown, ChevronRight, Info, Lightbulb, Calculator } from 'lucide-react';

const LearningCenter = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // 16 Risk Senaryosu
  const risks = [
    {
      category: 'Biyolojik Riskler',
      colorClass: {
        title: 'text-red-700',
        icon: 'text-red-600',
        border: 'border-red-500',
        bg: 'bg-red-50'
      },
      items: [
        {
          id: 1,
          name: 'Amonyak Toksisitesi',
          description: 'pH >9 + Üre kullanımında NH₃ serbest kalır ve hücrelere toksik etki gösterir',
          trigger: 'pH yükselmesi + Üre bazlı besiyeri',
          symptoms: ['pH > 9.0', 'Hücre yoğunluğu düşüşü', 'Yeşil renk soluklaşması'],
          solution: 'pH\'yı 7.0-7.5 aralığına çek (HCl ile). Üre yerine nitrat (NaNO₃, KNO₃) kullan.',
          prevention: 'pH izleme + Nitrat bazlı formülasyona geç'
        },
        {
          id: 2,
          name: 'Fotoksidasyon',
          description: 'Aşırı ışık + Düşük hücre yoğunluğu reaktif oksijen türleri (ROS) oluşturur',
          trigger: 'Işık > 10000 lux + Hücre < 5M/mL',
          symptoms: ['Hücreler sarımsı-kahverengi', 'OD680 düşerken OD750 sabit', 'Motilite kaybı'],
          solution: 'Işığı %50 azalt. Vitamin E (5mg/L) veya askorbat (10mg/L) ekle.',
          prevention: 'Başlangıçta 3000-5000 lux, yoğunluk arttıkça 8000 lux\'a çık'
        },
        {
          id: 3,
          name: 'Gece Hipoksisi',
          description: 'Yüksek yoğunlukta (>100M/mL), gece solunumu O₂ tüketir, sabah ölü hücreler bulunur',
          trigger: 'Yoğunluk > 100M/mL + Gece havalandırma yok',
          symptoms: ['Sabah DO < 2 mg/L', 'pH düşmesi (CO₂ birikimi)', 'Hücre lekeli, ölü'],
          solution: 'Gece havalandırmayı %50 düşür ama KAPATMA. DO > 4 mg/L tut.',
          prevention: '24 saat düşük hızda havalandırma (0.1-0.5 vvm)'
        },
        {
          id: 4,
          name: 'Kontaminasyon',
          description: 'Bakteriler, funguslar, protozoa veya diğer algler kültüre bulaşır',
          trigger: 'Sterilizasyon hatası + Açık ortam',
          symptoms: ['Bulanık su', 'Kötü koku', 'Mikroskobik analiz: yabancı organizmalar'],
          solution: 'Kültürü TEHLİKELİ olarak işaretle. Otoklavlayıp at. Tankı %10 bleach ile dezenfekte et.',
          prevention: 'Aseptik teknik + HEPA filtre + Kapalı sistem'
        },
        {
          id: 5,
          name: 'Besin Limitasyonu',
          description: 'Azot (N), fosfor (P) veya demir (Fe) eksikliği büyümeyi durdurur',
          trigger: 'Uzun süre besleme yok + Yüksek yoğunluk',
          symptoms: ['Sarma (N eksikliği)', 'Mor lekeler (P eksikliği)', 'Kloroz (Fe eksikliği)'],
          solution: 'Besin analizi yap (Nitrat, Fosfat, TDS). Eksik besini stok ile tamamla.',
          prevention: 'Haftalık besin takvimi + TDS izleme (800-1200 mg/L)'
        },
        {
          id: 6,
          name: 'pH Dalgalanması',
          description: 'pH < 5.5 veya > 9.5, hücre membran bütünlüğünü bozar',
          trigger: 'CO₂ kesintisi (pH yükselir) veya aşırı CO₂ (pH düşer)',
          symptoms: ['pH < 5.5: Asidik stres', 'pH > 9.5: Amonyak toksisitesi', 'Hücre patlaması'],
          solution: 'pH 7.0-7.5 aralığına getir. CO₂ flow ayarla (0.05-0.2 vvm).',
          prevention: 'Otomatik pH kontrolü + CO₂ regülatörü'
        },
        {
          id: 7,
          name: 'Işık Heterogenitesi',
          description: 'Tankın merkezinde yeterli ışık, kenarlarda az ışık → Eşitsiz büyüme',
          trigger: 'Büyük hacimli tank (>100L) + Tek taraflı aydınlatma',
          symptoms: ['Merkezde yoğun yeşil, kenarlarda soluk', 'OD ölçümleri değişken'],
          solution: 'Karıştırmayı artır. LED panelleri çevre etrafına dağıt.',
          prevention: '360° aydınlatma + Sürekli karıştırma (100-150 rpm)'
        },
        {
          id: 8,
          name: 'Çökelme/Flokülasyon',
          description: 'Zayıf karıştırma → Hücreler dibe çöker → Besin yetersizliği + Işık azalması',
          trigger: 'Karıştırma durdu veya < 50 rpm',
          symptoms: ['Tank dibinde koyu yeşil tabaka', 'Üstte berrak su', 'OD düşüşü'],
          solution: 'Karıştırmayı 100-150 rpm\'e çıkar. Tankı nazikçe eğerek dip çökeltisini dağıt.',
          prevention: 'Sürekli mekanik karıştırma veya havalandırma'
        }
      ]
    },
    {
      category: 'Kimyasal Riskler',
      colorClass: {
        title: 'text-orange-700',
        icon: 'text-orange-600',
        border: 'border-orange-500',
        bg: 'bg-orange-50'
      },
      items: [
        {
          id: 9,
          name: 'Ağır Metal Toksisitesi',
          description: 'Aşırı Cu, Zn, Mn gibi ağır metaller enzim inhibisyonuna neden olur',
          trigger: 'Trace element stoku fazla dozda eklenmiş',
          symptoms: ['Büyüme durması', 'Hücrelerde granül birikimi', 'Klorofil parçalanması'],
          solution: 'Seyreltme yap (1:1 saf su ile). Yeni ortama transfer et (1:10).',
          prevention: 'Trace element stoku dikkatli dozaj (1-2 mL/L)'
        },
        {
          id: 10,
          name: 'Karbon Sınırlaması',
          description: 'CO₂ yetersiz → pH yükselir, büyüme durur (karbon kaynağı yok)',
          trigger: 'CO₂ tüpü boşalmış veya valve kapalı',
          symptoms: ['pH > 8.5-9.0', 'Büyüme platoya ulaşır', 'Hücreler açık yeşil (karbonhidrat az)'],
          solution: 'CO₂ kaynağını kontrol et. 0.1-0.2 vvm CO₂ başlat.',
          prevention: 'CO₂ tüp basıncı haftalık kontrol + Yedek tüp hazır tut'
        },
        {
          id: 11,
          name: 'Osmotik Stres',
          description: 'Aşırı tuzluluk (TDS > 2000 mg/L) hücre büzülmesine yol açar',
          trigger: 'Stok çözeltisi fazla eklendi + Su buharlaşması',
          symptoms: ['Hücreler küçülmüş', 'Membran yapıları bozuk', 'OD680 düşer'],
          solution: 'TDS\'yi 800-1200 mg/L\'ye düşür (1:1 seyreltme). Yeni ortama transfer.',
          prevention: 'TDS metre ile günlük ölçüm + Buharlaşma telafisi'
        },
        {
          id: 12,
          name: 'Vitamin Eksikliği',
          description: 'Uzun süreli kültür (>30 gün), B12 vitamini azalır → Büyüme yavaşlar',
          trigger: 'Vitamin stoku ilk inokulasyonda eklendi, sonra hiç yenilenmedi',
          symptoms: ['Yavaş büyüme (exponential → linear geçiş)', 'Hücre boyutu küçülür'],
          solution: 'Vitamin stoku (B1, B12, Biotin) 2-3 haftada bir yenile (1 mL/L).',
          prevention: 'Vitamin takvimine uy + Her transfer\'de yeni vitamin'
        }
      ]
    },
    {
      category: 'Fiziksel/Operasyonel Riskler',
      colorClass: {
        title: 'text-blue-700',
        icon: 'text-blue-600',
        border: 'border-blue-500',
        bg: 'bg-blue-50'
      },
      items: [
        {
          id: 13,
          name: 'Sıcaklık Şoku',
          description: 'Ani ±5°C değişim, membran akışkanlığını bozar → Hücre patlaması',
          trigger: 'Soğuk su ile seyreltme veya sıcak stok ekleme',
          symptoms: ['Transfer sonrası ani ölüm', 'Hücre debrisler', 'OD680 çöküşü'],
          solution: 'Stok çözeltilerini tank sıcaklığına getir (25°C\'ye kadar beklet). Yavaş transfer.',
          prevention: 'Tüm eklenen sıvılar 20-25°C aralığında olmalı'
        },
        {
          id: 14,
          name: 'Isı Stresi',
          description: '>35°C enzim denatürasyonu, <10°C metabolizma durur',
          trigger: 'Klima arızası veya kış aylarında ısıtma yok',
          symptoms: ['35°C üzeri: Hücreler lizis', '<15°C: Büyüme durdu'],
          solution: '20-30°C aralığına getir. Soğutma: buzlu su banyosu. Isıtma: akvaryum ısıtıcısı.',
          prevention: 'Termostat + Yedek ısıtma/soğutma sistemi'
        },
        {
          id: 15,
          name: 'Mekanik Hasar',
          description: 'Aşırı hızlı karıştırma (>300 rpm) hücre duvarını parçalar',
          trigger: 'Mekanik karıştırıcı yanlış ayarı',
          symptoms: ['Kültür rengi soluklaşır', 'Mikroskopi: parçalanmış hücreler', 'Debris artışı'],
          solution: 'Karıştırmayı 100-150 rpm\'e düşür. Nazik havalandırma ile değiştir.',
          prevention: 'RPM ayarını kontrol et (100-200 rpm optimal)'
        },
        {
          id: 16,
          name: 'Biyofilm Oluşumu',
          description: 'Tank duvarlarında besin-hücre karışımı yapışır → Kontaminasyon + Besin kaybı',
          trigger: 'Tank 60+ gün temizlenmeden kullanılıyor',
          symptoms: ['Duvar yüzeyinde yeşil-kahverengi tabaka', 'TDS tüketimi hızlanır', 'pH düzensiz'],
          solution: 'Tankı boşalt. %10 HCl veya %5 H₂O₂ ile yıka. Saf suyla durula.',
          prevention: 'Her harvest sonrası tank dezenfeksiyonu + 45-60 günde temizlik'
        }
      ]
    }
  ];

  // Analiz Protokolleri (7 metod)
  const analysisProtocols = [
    {
      name: 'Molybdenum Blue (Fosfat - PO₄³⁻)',
      principle: 'Ortofosfat + Molibdat + Asit → Mavi renk kompleksi (880 nm)',
      reagents: [
        'Amonyum Molibdat: (NH₄)₆Mo₇O₂₄ · 4H₂O',
        'Sülfürik Asit: H₂SO₄ (konsantre)',
        'Askorbik Asit: C₆H₈O₆ (indirgeyici)'
      ],
      stockSolution: '10 g (NH₄)₆Mo₇O₂₄ + 100 mL H₂SO₄ (dikkat!) + 1L saf su. Karanlıkta sakla.',
      procedure: [
        '10 mL numune + 1 mL molibdat reagent',
        '1 mL askorbik asit çözeltisi ekle',
        '30 dakika oda sıcaklığında beklet',
        '880 nm\'de absorbans oku',
        'Standart eğri: 0-10 mg/L PO₄³⁻'
      ],
      calibration: 'KH₂PO₄ (136.09 g/mol) ile standart: 0.219 g → 1L (50 mg PO₄³⁻/L stok)'
    },
    {
      name: 'DMAB (Azot - NH₄⁺)',
      principle: 'Amonyum + Salisilik asit + Hipoklorit → İndofenol mavisi (640 nm)',
      reagents: [
        'Salisilik Asit: C₇H₆O₃',
        'Sodyum Hipoklorit: NaOCl (bleach)',
        'DMAB: p-Dimethylaminobenzaldehyde'
      ],
      stockSolution: 'Salisilik: 50 g/L saf su. Hipoklorit: %0.5 NaOCl (bleach 1:10).',
      procedure: [
        '5 mL numune + 0.5 mL salisilik reaktifi',
        '0.5 mL hipoklorit ekle (dikkat: eklediğinde karıştır!)',
        '10 dakika 37°C\'de beklet',
        '640 nm\'de absorbans oku',
        'Standart: (NH₄)₂SO₄ ile 0-5 mg/L NH₄⁺'
      ],
      calibration: '(NH₄)₂SO₄ (132.14 g/mol) ile: 0.382 g → 1L (100 mg NH₄⁺/L stok)'
    },
    {
      name: 'Claude Boyd (Nitrat - NO₃⁻)',
      principle: 'UV absorbans farkı: 220 nm (nitrat) - 275 nm (organik madde düzeltmesi)',
      reagents: ['Sadece saf su (boş referans)'],
      stockSolution: 'Gerek yok (doğrudan ölçüm)',
      procedure: [
        'Numuneyi 0.45 µm filtreden geçir (organik debris kaldır)',
        'Quartiz küvet kullan (UV geçirgenlik)',
        '220 nm absorbans oku (A₂₂₀)',
        '275 nm absorbans oku (A₂₇₅)',
        'Düzeltilmiş Nitrat = A₂₂₀ - (2 × A₂₇₅)',
        'Standart: KNO₃ ile 0-20 mg/L NO₃⁻'
      ],
      calibration: 'KNO₃ (101.10 g/mol) ile: 0.163 g → 1L (100 mg NO₃⁻/L stok)'
    },
    {
      name: 'Lowry (Protein)',
      principle: 'Protein + Cu²⁺ + Folin reagent → Mavi renk (750 nm)',
      reagents: [
        'CuSO₄ · 5H₂O (bakır sülfat)',
        'Na₂CO₃ (karbonat)',
        'Folin-Ciocalteu Reagent (ticari)'
      ],
      stockSolution: 'Copper reagent: 0.5 g CuSO₄ + 1 g Na₂CO₃ + 100 mL saf su',
      procedure: [
        'Hücreleri sonikasyon ile parçala (protein salınımı)',
        '0.5 mL numune + 2.5 mL bakır reaktifi',
        '10 dakika bekle',
        '0.25 mL Folin reaktifi ekle (hızla karıştır!)',
        '30 dakika oda sıcaklığında → 750 nm oku',
        'Standart: BSA (Bovine Serum Albumin) 0-1 mg/mL'
      ],
      calibration: 'BSA (66 kDa) ile standart eğri: 0-100-500-1000 µg/mL'
    },
    {
      name: 'Phenol-Sulfuric Acid (Karbonhidrat)',
      principle: 'Şeker + Fenol + H₂SO₄ → Sarı-turuncu renk (490 nm)',
      reagents: [
        'Fenol: C₆H₅OH (%5 çözelti)',
        'H₂SO₄: Konsantre sülfürik asit (98%)'
      ],
      stockSolution: 'Fenol: 5 g fenol + 100 mL saf su (zehirli! eldiven giy)',
      procedure: [
        '1 mL numune + 1 mL %5 fenol',
        '5 mL konsantre H₂SO₄ YAVAŞÇA ekle (ısınır! dikkat!)',
        '10 dakika buz banyosunda soğut',
        '490 nm\'de absorbans oku',
        'Standart: Glikoz 0-100 µg/mL'
      ],
      calibration: 'D-Glikoz (180.16 g/mol) ile: 0.100 g → 1L (100 mg/L stok)'
    },
    {
      name: 'Parsons & Strickland (Klorofil-a)',
      principle: 'Klorofil + Asetat ekstraksiyonu → 665 nm absorbans',
      reagents: ['Asetat: %90 asetat (CH₃COOH) veya metanol'],
      stockSolution: 'Gerek yok (organik çözücü hazır)',
      procedure: [
        '10 mL kültür → 0.45 µm filtre (membran üzerinde hücreler)',
        'Membranı 10 mL %90 asetat ile ezdir (havanda veya sonikasyon)',
        'Karanlıkta 24 saat 4°C\'de ekstraksiyon',
        'Filtrele → Berrak asetat çözeltisi',
        '665 nm (klorofil-a), 750 nm (debris düzeltmesi) oku',
        'Klorofil-a (mg/L) = 11.0 × (A₆₆₅ - A₇₅₀)'
      ],
      calibration: 'Ticari klorofil-a standardı (Sigma) ile doğrulama'
    },
    {
      name: 'Thoma Lamı Sayımı',
      principle: 'Hemocytometer grid + Mikroskop → Hücre sayısı/mL',
      reagents: ['Sadece kültür (seyreltme gerekiyorsa saf su)'],
      stockSolution: 'Gerek yok',
      procedure: [
        'Kültürü 10x seyrelt (1 mL + 9 mL saf su)',
        'Thoma lamının altına lameli koy (Newton halkaları görünmeli)',
        '10 µL seyreltilmiş kültür → Lam kenarından enjekte et',
        'Mikroskop 400x büyütme → 4 köşe kareyi say (her biri 16 küçük kare)',
        'Ortalama hücre/kare × 10⁴ × seyreltme faktörü = Hücre/mL',
        'Örnek: 25 hücre/kare × 10⁴ × 10 = 2.5 × 10⁶ hücre/mL'
      ],
      calibration: 'Bilinen yoğunluktaki kültür ile doğrulama (OD680 vs Thoma)'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center mb-2">
          <BookOpen className="w-8 h-8 mr-3" />
          <h1 className="text-3xl font-bold">ChlorellaOS Öğrenme Merkezi</h1>
        </div>
        <p className="text-blue-100">
          Chlorella üretiminde karşılaşabileceğiniz riskleri, analiz protokollerini ve çözüm yollarını öğrenin
        </p>
      </div>

      {/* Tab Sistemi */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => toggleSection('risks')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
              expandedSection === 'risks'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Risk Yönetimi (16 Senaryo)
          </button>
          <button
            onClick={() => toggleSection('protocols')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
              expandedSection === 'protocols'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Beaker className="w-5 h-5 mr-2" />
            Analiz Protokolleri (7 Metod)
          </button>
        </div>

        {/* Risk Yönetimi İçeriği */}
        {expandedSection === 'risks' && (
          <div className="p-6">
            {risks.map((category) => (
              <div key={category.category} className="mb-8">
                <h3 className={`text-xl font-bold mb-4 flex items-center ${category.colorClass.title}`}>
                  <Activity className={`w-6 h-6 mr-2 ${category.colorClass.icon}`} />
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((risk) => (
                    <div
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedRisk?.id === risk.id
                          ? `${category.colorClass.border} ${category.colorClass.bg}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <AlertTriangle className={`w-5 h-5 mr-2 ${category.colorClass.icon} flex-shrink-0 mt-1`} />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">{risk.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{risk.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Risk Detay Paneli */}
            {selectedRisk && (
              <div className="mt-6 bg-white border-2 border-blue-500 rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <AlertTriangle className="w-7 h-7 mr-2 text-red-600" />
                    {selectedRisk.name}
                  </h3>
                  <button
                    onClick={() => setSelectedRisk(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <Info className="w-4 h-4 mr-1 text-blue-600" />
                      Tanım:
                    </h4>
                    <p className="text-gray-600">{selectedRisk.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <Activity className="w-4 h-4 mr-1 text-orange-600" />
                      Tetikleyici:
                    </h4>
                    <p className="text-gray-600 bg-orange-50 p-2 rounded">{selectedRisk.trigger}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                      Belirtiler:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 bg-red-50 p-3 rounded">
                      {selectedRisk.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
                      Çözüm:
                    </h4>
                    <p className="text-gray-600 bg-green-50 p-3 rounded font-medium">{selectedRisk.solution}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      Önleme:
                    </h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded">{selectedRisk.prevention}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analiz Protokolleri İçeriği */}
        {expandedSection === 'protocols' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {analysisProtocols.map((protocol, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <Beaker className="w-6 h-6 mr-2 text-blue-600" />
                    {protocol.name}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Prensip:</h4>
                      <p className="text-gray-600 bg-blue-50 p-2 rounded">{protocol.principle}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Reaktifler:</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {protocol.reagents.map((reagent, ridx) => (
                          <li key={ridx}>{reagent}</li>
                        ))}
                      </ul>
                    </div>

                    {protocol.stockSolution && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                          <Beaker className="w-4 h-4 mr-1 text-purple-600" />
                          Stok Çözelti Hazırlama:
                        </h4>
                        <p className="text-gray-600 bg-purple-50 p-2 rounded font-mono text-sm">
                          {protocol.stockSolution}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                        <Calculator className="w-4 h-4 mr-1 text-green-600" />
                        Prosedür:
                      </h4>
                      <ol className="list-decimal list-inside text-gray-600 space-y-1">
                        {protocol.procedure.map((step, sidx) => (
                          <li key={sidx} className="bg-gray-50 p-2 rounded">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {protocol.calibration && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Kalibrasyon:</h4>
                        <p className="text-gray-600 bg-yellow-50 p-2 rounded font-mono text-sm">
                          {protocol.calibration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Başlangıç Mesajı */}
        {!expandedSection && (
          <div className="p-12 text-center text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Üstteki sekmelere tıklayarak öğrenmeye başlayın</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => toggleSection('risks')}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Risk Senaryoları
              </button>
              <button
                onClick={() => toggleSection('protocols')}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <Beaker className="w-5 h-5 mr-2" />
                Analiz Metotları
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningCenter;

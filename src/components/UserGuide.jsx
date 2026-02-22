import React, { useState } from 'react';
import { BookOpen, AlertCircle, CheckCircle, ArrowRight, Info, Zap, Database, Beaker, Activity, BarChart, FileText, Settings, FlaskConical, TrendingUp, Calendar } from 'lucide-react';

const UserGuide = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Genel Bakış', icon: BookOpen },
    { id: 'getting-started', title: 'Başlangıç', icon: Zap },
    { id: 'tabs', title: 'Tüm Sekmeler', icon: Database },
    { id: 'data-flow', title: 'Veri Akışı', icon: Activity },
    { id: 'modeling', title: 'Modelleme İş Akışı', icon: TrendingUp },
    { id: 'tips', title: 'İpuçları', icon: Info }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sol Panel - Navigasyon */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Kullanım Kılavuzu
          </h2>
          <p className="text-sm text-gray-600 mt-1">ChlorellaOS v1.0</p>
        </div>

        <nav className="space-y-1">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {section.title}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Güncellenme:</strong> {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Sağ Panel - İçerik */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'getting-started' && <GettingStartedSection />}
        {activeSection === 'tabs' && <TabsSection />}
        {activeSection === 'data-flow' && <DataFlowSection />}
        {activeSection === 'modeling' && <ModelingWorkflowSection />}
        {activeSection === 'tips' && <TipsSection />}
      </div>
    </div>
  );
};

// Genel Bakış Bölümü
const OverviewSection = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">ChlorellaOS - Genel Bakış</h1>
    
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Sistem Hakkında</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        ChlorellaOS, Chlorella vulgaris mikroalg kültürlerinin üretimi, izlenmesi ve optimizasyonu için 
        tasarlanmış kapsamlı bir yönetim sistemidir. Sistem, kimyasal kütüphane, formülasyon yönetimi, 
        tank operasyonları ve teorik-pratik modelleme yeteneklerini tek bir platformda birleştirir.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Database className="w-5 h-5" />
          15 Ana Sekme
        </h3>
        <p className="text-sm text-blue-800">
          İzleme, besin hesaplama, tank yönetimi, modelleme ve daha fazlası
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          58 Tank Kapasitesi
        </h3>
        <p className="text-sm text-green-800">
          20 kavanoz, 24 şişe, 10 kova, 4 IBC - esnek sistem
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <Beaker className="w-5 h-5" />
          40+ Kimyasal
        </h3>
        <p className="text-sm text-purple-800">
          Detaylı özellikler, iyonlar, besin değerleri, pKa, çözünürlük
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Teorik Modelleme
        </h3>
        <p className="text-sm text-orange-800">
          30 günlük tahmin, ölçüm karşılaştırma, R² uyduruşu
        </p>
      </div>
    </div>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900 mb-1">Önemli Not</h3>
          <p className="text-sm text-yellow-800">
            Tüm veriler tarayıcınızın LocalStorage'ında saklanır. Tarayıcı geçmişini temizleme veya 
            çerezleri silme işlemi verilerinizi kaybettirebilir. Düzenli yedekleme önerilir.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Başlangıç Bölümü
const GettingStartedSection = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Başlangıç Rehberi</h1>

    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
          <h2 className="text-xl font-semibold">Kimyasal Kütüphane (İsteğe Bağlı)</h2>
        </div>
        <p className="text-gray-700 mb-3">
          Sistem 40+ önceden tanımlı kimyasalla gelir. Kendi kimyasallarınızı eklemek isterseniz:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>"Besin Kütüphane" sekmesine gidin</li>
          <li>"Yeni Kimyasal" butonuna tıklayın</li>
          <li>Ad, formül, molar kütle, iyonlar, besin değerleri girin</li>
          <li>TDS katkısı ve çözünürlük bilgilerini ekleyin</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
          <h2 className="text-xl font-semibold">Formülasyon Oluşturma</h2>
        </div>
        <p className="text-gray-700 mb-3">
          Kültür besini formülasyonlarınızı tanımlayın:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>"Formülasyonlar" sekmesine gidin</li>
          <li>"Yeni Formülasyon" ile adlandırılmış formülasyon oluşturun</li>
          <li>Her formülasyon için 10 stoka kadar tanımlayın</li>
          <li>Her stok için:
            <ul className="list-circle list-inside ml-6 mt-1">
              <li>Kimyasal seçimi ve miktarları</li>
              <li>Çözünme hacmi (ilk eriyen su miktarı)</li>
              <li>Final hacim (son tamamlanan hacim)</li>
              <li>Kullanım oranı (ml stok / 1L kültür)</li>
            </ul>
          </li>
          <li>Sistem otomatik TDS ve besin hesaplaması yapar</li>
        </ul>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-900">
            <strong>Örnek:</strong> Ana Stok: 1.5g Üre + 6g MgSO₄ + 0.75g MKP + 1g NaHCO₃ → 300ml suda erit → 1L'ye tamamla → 100ml/L kullanım
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
          <h2 className="text-xl font-semibold">Tank Aktivasyonu</h2>
        </div>
        <p className="text-gray-700 mb-3">
          Kültür başlatmak için tankları aktifleştirin:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>"Tanklar" sekmesine gidin</li>
          <li>Bir tank seçip "Aktifleştir" butonuna tıklayın</li>
          <li>Başlangıç parametrelerini girin:
            <ul className="list-circle list-inside ml-6 mt-1">
              <li>Başlangıç tarihi</li>
              <li>Formülasyon seçimi</li>
              <li>Başlangıç yoğunluğu (M hücre/ml)</li>
              <li>OD680, OD750 değerleri</li>
              <li>pH, sıcaklık, TDS</li>
              <li>Işık saatleri ve yoğunluğu</li>
              <li>CO₂ akış hızı</li>
            </ul>
          </li>
          <li>Bu veriler otomatik olarak modelleme sistemine aktarılır</li>
        </ul>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
          <span className="text-sm text-green-900">
            <strong>Veri Bağlantısı:</strong> Aktivasyon verileri modelleme, hücre sayımı ve tank detay sekmelerinde kullanılabilir hale gelir.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
          <h2 className="text-xl font-semibold">Günlük İzleme</h2>
        </div>
        <p className="text-gray-700 mb-3">
          Kültürlerinizi düzenli olarak izleyin:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>"Hücre Sayımı": Hemositometre ile hücre yoğunluğu, canlılık ölçümü</li>
          <li>"Tank Detay": pH, sıcaklık, DO, iletkenlik, besin takibi</li>
          <li>"Modelleme": Ölçümleri girin, teorik tahminlerle karşılaştırın</li>
          <li>Tüm ölçümler otomatik tarihlendirilir ve kaydedilir</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
          <h2 className="text-xl font-semibold">Analiz ve Raporlama</h2>
        </div>
        <p className="text-gray-700 mb-3">
          Verilerinizi analiz edin ve raporlayın:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>"Modelleme": Teoriye uyduruşu R² ile değerlendirin</li>
          <li>"Grafikler": Zaman serisi görselleştirmeleri</li>
          <li>"Raporlar": Toplu üretim raporları</li>
          <li>"Galeri": Mikroskop görüntüleri ve notlar</li>
        </ul>
      </div>
    </div>
  </div>
);

// Sekmeler Bölümü
const TabsSection = () => {
  const tabs = [
    {
      name: 'İzleme',
      icon: Activity,
      description: 'Tüm tanklara hızlı bakış. Aktif/pasif tank sayıları, mevcut durumlar, kritik uyarılar.',
      features: ['Canlı durum kartları', 'Hızlı filtreleme', 'Özet istatistikler']
    },
    {
      name: 'Besin Yeri',
      icon: Beaker,
      description: 'Besin ortamı hazırlama hesaplayıcısı. Kimyasal seçimi, konsantrasyon hesaplama, TDS ve pH tahmini.',
      features: ['Kimyasal seçici dropdown', 'Otomatik TDS hesabı', 'pH tahmini', 'İyon analizi']
    },
    {
      name: 'Tanklar',
      icon: Database,
      description: 'Tank yönetim merkezi. Aktivasyon, pasifleştirme, split, merge operasyonları.',
      features: ['K/S/V/IBC tanklara kategorize filtreler', 'Tam parametreli aktivasyon', 'Split (2-5 yol)', 'Merge (2+ kaynak)', 'Crash durumu', 'Formülasyon seçimi']
    },
    {
      name: 'Fizibilite',
      icon: BarChart,
      description: 'Ekonomik fizibilite analizi. Maliyet hesaplamaları, karlılık projeksiyonları.',
      features: ['CAPEX/OPEX analizi', 'ROI hesabı', 'Senaryo karşılaştırma']
    },
    {
      name: 'Malzeme',
      icon: Settings,
      description: 'Kimyasal stok takibi ve malzeme yönetimi.',
      features: ['Stok seviyeleri', 'Sipariş takibi', 'Maliyet analizi']
    },
    {
      name: 'Besin Kütüphane',
      icon: BookOpen,
      description: '40+ kimyasal veritabanı. Formül, molar kütle, iyonlar, besin değerleri, pKa, çözünürlük.',
      features: ['Detaylı kimyasal profilleri', 'TDS katkı hesabı', 'İyon kompozisyonu', 'Kategori filtresi']
    },
    {
      name: 'Lab Defteri',
      icon: FileText,
      description: 'Elektronik lab defteri. Notlar, gözlemler, protokoller.',
      features: ['Tarihli kayıtlar', 'Markdown desteği', 'Etiketleme', 'Arama']
    },
    {
      name: 'Üretim Planı',
      icon: Calendar,
      description: 'Üretim çizelgeleme ve kapasite planlama.',
      features: ['Haftalık plan', 'Tank atama', 'Hasat takvimleri']
    },
    {
      name: 'Galeri',
      icon: Activity,
      description: 'Mikroskop görüntüleri ve fotoğraf arşivi.',
      features: ['Tarih/tank etiketleme', 'Zoom görüntüleme', 'Not ekleme']
    },
    {
      name: 'Grafikler',
      icon: TrendingUp,
      description: 'Veri görselleştirme. Büyüme eğrileri, pH trendleri, besin tüketimi grafikleri.',
      features: ['Zaman serisi grafikleri', 'Çoklu tank karşılaştırma', 'Export PNG/SVG']
    },
    {
      name: 'Raporlar',
      icon: FileText,
      description: 'Otomatik rapor üretimi. Günlük/haftalık/aylık raporlar.',
      features: ['PDF export', 'Özelleştirilebilir şablonlar', 'Toplu veri tabloları']
    },
    {
      name: 'Tank Detay',
      icon: Info,
      description: 'Tek tank detaylı izleme. Su kalitesi, besin seviyeleri, pH müdahaleleri.',
      features: ['pH, temp, DO, iletkenlik', 'N/P/Mn takibi', 'pH stok müdahalesi kayıtları', 'Tarihli ölçüm geçmişi']
    },
    {
      name: 'Hücre Sayımı',
      icon: Activity,
      description: 'Hemositometre hücre sayımı. 5 kareli grid, canlı/motil/imotil/ölü kategoriler.',
      features: ['İnteraktif 5x5 grid', 'Otomatik hücre/ml hesabı', 'Canlılık %', 'Tank seçimi ve kayıt']
    },
    {
      name: 'Formülasyonlar',
      icon: FlaskConical,
      description: 'Besin formülasyonu yönetimi. 10 stoka kadar, detaylı stok hazırlama talimatları.',
      features: ['Çoklu formülasyon kaydetme', 'Stok bazlı yapılandırma', 'Kimyasal + miktar seçimi', 'Çözünme/final hacim', 'Kullanım oranı (ml/L)', 'Otomatik TDS ve besin hesabı']
    },
    {
      name: 'Modelleme',
      icon: TrendingUp,
      description: 'Teorik vs pratik kültür modelleme. 30 günlük tahmin, ölçüm karşılaştırma, R² uydurma.',
      features: ['3 kartlı özet (Giriş/C.vulgaris/Çıkış)', 'Monod kinetik modeli', '30 günlük timeline tablo', 'Ölçüm ekleme modal', 'Teoriye uyarla (lineer regresyon)', 'R² goodness-of-fit', 'Sapma % (>10% kırmızı)']
    }
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tüm Sekmeler - Detaylı Açıklamalar</h1>
      
      <div className="space-y-4">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{tab.name}</h3>
                  <p className="text-gray-700 mb-3">{tab.description}</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Özellikler:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {tab.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600">{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Veri Akışı Bölümü
const DataFlowSection = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Veri Akışı ve Bağlantılar</h1>

    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Sistem Veri Mimarisi</h2>
      <p className="text-gray-700 mb-4">
        ChlorellaOS'ta bir bilgi bir yerde girildiğinde tüm sistemde kullanılabilir hale gelir. 
        Bu, veri tekrarını önler ve tutarlılığı garanti eder.
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Besin Kütüphane → Formülasyonlar
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
            <p>Kimyasal kütüphanedeki 40+ kimyasal formülasyon stok hazırlamada kullanılır</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
            <p>Her kimyasalın TDS katkısı, besin içeriği, iyonları otomatik hesaplanır</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
            <p>Formülasyon stok TDS'i ve 1L kültür başına besin miktarları otomatik gösterilir</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-green-600" />
          Formülasyonlar → Tanklar
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
            <p>Tank aktivasyon modalında formülasyon seçilir</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
            <p>Seçilen formülasyonun ID'si tank state'ine kaydedilir</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
            <p>Tank kartlarında formülasyon adı görüntülenir</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Tank Aktivasyonu → Modelleme
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
            <p>Aktivasyon sırasında girilen 11 parametre tank.initialParams'a kaydedilir</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
            <p>Modelleme sekmesi initialParams'tan otomatik yükler: yoğunluk, pH, temp, TDS, OD, ışık, CO₂</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
            <p>Formülasyon ID'si üzerinden N/P besin miktarları hesaplanır</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
            <p>30 günlük teorik büyüme başlangıç değerlerinden başlar</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Hücre Sayımı / Tank Detay → Modelleme
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
            <p>Hücre sayımı verileri (yoğunluk, canlılık) otomatik modelleme ölçümlerine aktarılır</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
            <p>Tank detay ölçümleri (pH, temp, OD) modellemeye senkronize edilir</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
            <p>Ölçümler tank başlangıç tarihine göre gün hesabı ile kaydedilir</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
            <p>Timeline tablosunda yeşil değerler (ölçülen) ile mavi değerler (teorik) yan yana görünür</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-yellow-600" />
          LocalStorage Anahtarları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-yellow-200">
            <code className="font-mono text-xs text-purple-700">tankStates</code>
            <p className="text-gray-600 mt-1">58 tank, aktif/pasif, formülasyon, initialParams</p>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <code className="font-mono text-xs text-purple-700">customFormulations</code>
            <p className="text-gray-600 mt-1">Kullanıcı formülasyonları + stoklar</p>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <code className="font-mono text-xs text-purple-700">cultureModels</code>
            <p className="text-gray-600 mt-1">Tank modelleme verileri, μ, fitted_μ, R²</p>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <code className="font-mono text-xs text-purple-700">cultureMeasurements</code>
            <p className="text-gray-600 mt-1">Günlük ölçümler (yoğunluk, pH, OD, temp)</p>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <code className="font-mono text-xs text-purple-700">cellCountingData</code>
            <p className="text-gray-600 mt-1">Hemositometre sayım sonuçları</p>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <code className="font-mono text-xs text-purple-700">tankDetails</code>
            <p className="text-gray-600 mt-1">Su kalitesi, pH müdahaleleri</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modelleme İş Akışı Bölümü
const ModelingWorkflowSection = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Modelleme İş Akışı</h1>

    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Teorik Model + Pratik Karşılaştırma</h2>
      <p className="text-gray-700 leading-relaxed">
        Modelleme sekmesi, Chlorella vulgaris büyümesini Monod kinetik modeline göre tahmin eder ve 
        gerçek ölçümlerle karşılaştırarak sapma analizi yapar. İsteğe bağlı olarak teorik modeli 
        ölçümlere "uydurabilir" ve R² değeri ile uyumunu gösterebilirsiniz.
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
          Tank Seçimi
        </h3>
        <p className="text-gray-700 mb-3">
          Sol panelden aktif bir tank seçin. Sadece aktif tanklar (status: running) listede görünür.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
          <li>Tank sistemId (örn. SA1, KB2) ve başlangıç tarihi görünür</li>
          <li>Seçilen tank sağ panelde detaylandırılır</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
          3 Kartlı Özet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-900 mb-2">Giriş (Yeşil)</h4>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Formülasyon adı</li>
              <li>• Toplam N (g)</li>
              <li>• Toplam P (g)</li>
              <li>• CO₂ akışı (L/min)</li>
              <li>• Işık (saat/gün)</li>
            </ul>
          </div>
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">C. vulgaris (Mavi)</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Başlangıç yoğunluğu</li>
              <li>• μ (büyüme hızı)</li>
              <li>• CO₂/O₂ katsayıları</li>
              <li>• R² (uydurulmuşsa)</li>
            </ul>
          </div>
          <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
            <h4 className="font-semibold text-yellow-900 mb-2">Çıkış (Sarı)</h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• 30. gün biyokütle (g)</li>
              <li>• O₂ üretimi (g)</li>
              <li>• N tüketimi (g)</li>
              <li>• P tüketimi (g)</li>
              <li>• CO₂ tüketimi (g)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
          Ölçüm Ekleme
        </h3>
        <p className="text-gray-700 mb-3">
          "Ölçüm Ekle" butonuna tıklayarak günlük verileri girin:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
          <li>Gün (0-30, başlangıç tarihine göre)</li>
          <li>Yoğunluk (M hücre/ml) - <strong>zorunlu</strong></li>
          <li>OD680, OD750 - opsiyonel</li>
          <li>pH, sıcaklık - opsiyonel</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <strong>Not:</strong> Hücre Sayımı ve Tank Detay sekmelerinden yapılan ölçümler otomatik buraya aktarılır.
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
          Timeline Tablosu
        </h3>
        <p className="text-gray-700 mb-3">
          30 günlük timeline 2 günlük aralıklarla gösterilir. Her satır:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
          <li><span className="text-blue-600 font-semibold">Mavi değer:</span> Teorik tahmin</li>
          <li><span className="text-green-600 font-semibold">Yeşil değer:</span> Gerçek ölçüm</li>
          <li><span className="text-red-600 font-semibold">Kırmızı renk:</span> %10'dan fazla sapma</li>
        </ul>
        <p className="text-sm text-gray-600 mt-3">
          Sapma % = |(teorik - ölçülen) / teorik| × 100
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
          Teoriye Uyarla (Fit to Theory)
        </h3>
        <p className="text-gray-700 mb-3">
          "Teoriye Uyarla" butonu ölçümlere dayanarak teorik μ'yü optimize eder:
        </p>
        <div className="bg-gray-50 p-4 rounded border border-gray-300 font-mono text-sm mb-3">
          <div>ln(N) = ln(N₀) + μ × t</div>
          <div className="text-gray-600 mt-2">→ Lineer regresyon ile fitted_μ bulunur</div>
          <div className="text-gray-600">→ R² = 1 - (SSres / SStot) hesaplanır</div>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
          <li>En az 2 ölçüm gereklidir</li>
          <li>Fitted μ mavi kartta görüntülenir</li>
          <li>R² değeri model uyumunu gösterir (1.0 = mükemmel)</li>
          <li>"Teoriye Dön" butonu ile orijinal μmax'a geri dönülebilir</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
          Teorik / Pratik Görünüm Değiştir
        </h3>
        <p className="text-gray-700 mb-3">
          "Teorik Model / Pratik Veri" toggle butonu ile görünümü değiştirin:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
          <li><strong>Teorik:</strong> Tüm değerler teorik modelden (mavi)</li>
          <li><strong>Pratik:</strong> Ölçüm varsa yeşil, yoksa mavi gösterilir</li>
        </ul>
      </div>
    </div>

    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900 mb-1">İpucu: En İyi Uygulama</h3>
          <p className="text-sm text-green-800">
            2-3 günde bir düzenli ölçüm yapın. Sapmalar %10'u geçtiğinde formülasyon veya çevre 
            koşullarını gözden geçirin. "Teoriye Uyarla" ile gerçek μ'yü öğrenin ve gelecek 
            kültürlerde başlangıç tahmini olarak kullanın.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// İpuçları Bölümü
const TipsSection = () => (
  <div className="max-w-4xl">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">İpuçları ve En İyi Uygulamalar</h1>

    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Veri Yedekleme
        </h3>
        <p className="text-sm text-blue-800">
          Tarayıcı LocalStorage'ı kullanılıyor. Düzenli olarak tarayıcı geliştirici araçları → 
          Application → Local Storage → kopyalayın ve bir JSON dosyasına kaydedin. Veri kaybını önler.
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Formülasyon Adlandırma
        </h3>
        <p className="text-sm text-green-800">
          Formülasyonlara açıklayıcı isimler verin: "Yüksek N - Hızlı Büyüme", "Düşük P - Yağ Biriktirme" gibi. 
          Bu, tank aktivasyonunda doğru formülasyonu seçmenizi kolaylaştırır.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Tank Split/Merge
        </h3>
        <p className="text-sm text-yellow-800">
          Split sonrası yeni tanklar otomatik "from: kaynak_tank" notu alır. Merge sonrası hedef tank 
          "merged from: [tank1, tank2]" notu alır. sourceFrom alanı takip için kullanılır.
        </p>
      </div>

      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Modelleme Doğruluğu
        </h3>
        <p className="text-sm text-purple-800">
          İlk 3-5 gün günlük, sonraki günler 2 günde bir ölçüm yapın. Eksponansiyel büyüme fazında 
          (0-10 gün) daha sık ölçüm, durağan fazda (20-30 gün) daha az ölçüm yeterlidir.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Crash Durumu
        </h3>
        <p className="text-sm text-red-800">
          Kültür çöktüğünde "Crash Durumu" butonunu kullanın. Tank inaktif hale gelir ama veriler silinmez. 
          Crash nedenini notlara yazın (kontaminasyon, besin eksikliği, pH krizi vb.).
        </p>
      </div>

      <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
        <h3 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
          <Beaker className="w-5 h-5" />
          Kimyasal Stok Hazırlama
        </h3>
        <p className="text-sm text-teal-800">
          Çözünme hacmi (dissolution) kimyasalın tamamen eridiği minimum su miktarıdır. 
          Final hacim daha sonra saf su ile tamamlanır. Örnek: 10g tuz → 300ml'de erit → 1L'ye tamamla.
        </p>
      </div>

      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Hücre Sayımı Hassasiyeti
        </h3>
        <p className="text-sm text-indigo-800">
          Hemositometre 5 karesi her sefer yeniden sayın, 3 tekrar yapın ve ortalamasını alın. 
          %10'dan fazla varyasyon varsa sulandırma oranını değiştirin. İdeal: 20-50 hücre/kare.
        </p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
        <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          R² Yorumlama
        </h3>
        <p className="text-sm text-orange-800">
          R² {'>'} 0.95: Mükemmel uyum | 0.90-0.95: İyi uyum | 0.80-0.90: Kabul edilebilir | 
          {'<'} 0.80: Model uygun değil, koşullar değişken. Düşük R² durumunda ışık, CO₂ veya besin 
          tutarlılığını kontrol edin.
        </p>
      </div>

      <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
        <h3 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Lab Defteri Kullanımı
        </h3>
        <p className="text-sm text-pink-800">
          Önemli gözlemleri (renk değişimi, köpük, tortu, koku) lab defterine not edin. 
          Tank ID ve tarih etiketleri ekleyin. Gelecekteki sorun gidermede bu notlar kritik öneme sahiptir.
        </p>
      </div>

      <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Performans Optimizasyonu
        </h3>
        <p className="text-sm text-gray-700">
          LocalStorage 5-10MB sınırı vardır. 100+ aktif tank veya 1000+ ölçüm sonrası yavaşlama olabilir. 
          Eski inaktif tankları arşivleyin veya export edin. Tarayıcı cache'ini düzenli temizleyin.
        </p>
      </div>
    </div>

    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mt-8">
      <h3 className="text-xl font-bold mb-3">Sorun Giderme Kontrol Listesi</h3>
      <ul className="space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>Tarayıcı konsolu hatalarını kontrol et (F12 → Console)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>LocalStorage verilerinin varlığını doğrula (F12 → Application → Local Storage)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>Sayfa yenileme (Ctrl+R veya Cmd+R) - state sorunlarını çözebilir</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>Kimyasal kütüphanede eksik kimyasal var mı?</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>Tank aktivasyonunda tüm zorunlu alanlar dolduruldu mu?</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>Modelleme için en az 1 aktif tank var mı?</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>"Teoriye Uyarla" için en az 2 ölçüm kaydedildi mi?</span>
        </li>
      </ul>
    </div>
  </div>
);

export default UserGuide;

import React, { useState } from 'react';
import { BookOpen, Microscope, Info, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const CellCountingGuide = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('chambers');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-10 h-10" />
              <div>
                <h2 className="text-3xl font-bold">Hücre Sayım Rehberi</h2>
                <p className="text-cyan-100">Lamlar, Metodoloji ve Sayım Teknikleri</p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex gap-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('chambers')}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === 'chambers'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔬 Lam Karşılaştırması
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === 'methodology'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Sayım Metodolojisi
            </button>
            <button
              onClick={() => setActiveTab('trypanblue')}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === 'trypanblue'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💙 Trypan Blue Boyama
            </button>
            <button
              onClick={() => setActiveTab('motility')}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === 'motility'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏃 Hareketlilik Sayımı
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === 'statistics'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 İstatistiksel Doğruluk
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          {activeTab === 'chambers' && <ChambersComparison />}
          {activeTab === 'methodology' && <CountingMethodology />}
          {activeTab === 'trypanblue' && <TrypanBlueStaining />}
          {activeTab === 'motility' && <MotilityGuide />}
          {activeTab === 'statistics' && <StatisticalAccuracy />}
        </div>
      </div>
    </div>
  );
};

// ============================================
// LAM KARŞILAŞTIRMASI
// ============================================

const ChambersComparison = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">🔬 Sayım Lamları Karşılaştırması</h3>
    
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <th className="p-3 text-left">Lam Tipi</th>
            <th className="p-3 text-left">Derinlik</th>
            <th className="p-3 text-left">Grid Yapısı</th>
            <th className="p-3 text-left">Kullanım Alanı</th>
            <th className="p-3 text-left">Avantaj/Dezavantaj</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold">Thoma</td>
            <td className="p-3">0.1 mm</td>
            <td className="p-3">9 büyük kare (3×3)<br/>Her biri 16 küçük (4×4)</td>
            <td className="p-3">Eritrosit, Chlorella<br/>Genel mikroalgler</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> Basit, hızlı<br/>
              <span className="text-red-600">✗</span> Düşük hassasiyet
            </td>
          </tr>
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold bg-yellow-50">Neubauer (Improved) ⭐</td>
            <td className="p-3">0.1 mm</td>
            <td className="p-3">9 büyük + orta 400 küçük<br/>25 grup × 16 kare</td>
            <td className="p-3">Chlorella, lökosit<br/>Maya, bakteri</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> ALTIN STANDART<br/>
              <span className="text-green-600">✓</span> Yüksek hassasiyet
            </td>
          </tr>
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold">Sedgewick-Rafter</td>
            <td className="p-3">1.0 mm</td>
            <td className="p-3">1000 kare (50×20)<br/>Büyük hacim</td>
            <td className="p-3">Plankton, büyük algler<br/>Düşük yoğunluk</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> Büyük organizmalar<br/>
              <span className="text-red-600">✗</span> Uzun sayım süresi
            </td>
          </tr>
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold">Bürker</td>
            <td className="p-3">0.1 mm</td>
            <td className="p-3">9 büyük kare (3×3)<br/>Özel grid</td>
            <td className="p-3">Eritrosit, lökosit<br/>Bakteriler</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> Kan hücrelerine özel<br/>
              <span className="text-red-600">✗</span> Chlorella için fazla
            </td>
          </tr>
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold">Malassez</td>
            <td className="p-3">0.2 mm</td>
            <td className="p-3">100 kare (10×10)<br/>Basit grid</td>
            <td className="p-3">Hücre süspansiyonları<br/>Sperm sayımı</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> Hızlı<br/>
              <span className="text-red-600">✗</span> Daha az hassas
            </td>
          </tr>
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold">Fuchs-Rosenthal</td>
            <td className="p-3">0.2 mm</td>
            <td className="p-3">16 büyük kare<br/>Derin hacim</td>
            <td className="p-3">Beyin omurilik sıvısı<br/>Düşük hücre sayıları</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> Düşük yoğunluk<br/>
              <span className="text-red-600">✗</span> Chlorella için uygunsuz
            </td>
          </tr>
          <tr className="border-b hover:bg-cyan-50">
            <td className="p-3 font-semibold">Hemocytometer (Generic)</td>
            <td className="p-3">0.1 mm</td>
            <td className="p-3">Çeşitli grid</td>
            <td className="p-3">Genel kullanım</td>
            <td className="p-3">
              <span className="text-green-600">✓</span> Ucuz, yaygın<br/>
              <span className="text-red-600">✗</span> Değişken kalite
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-yellow-800 mb-2">⭐ Chlorella Üretimi İçin Önerilen: Neubauer Improved</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• En yüksek hassasiyet (±10% hata payı)</li>
            <li>• Orta karede 400 küçük kare = istatistiksel güç</li>
            <li>• Profesyonel laboratuvarlarda standart</li>
            <li>• 10⁴-10⁷ cells/mL aralığında ideal</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// SAYIM METODOLOJİSİ
// ============================================

const CountingMethodology = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">📋 Doğru Sayım Metodolojisi</h3>
    
    <div className="grid md:grid-cols-2 gap-6">
      {/* Numune Hazırlama */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          1. Numune Hazırlama
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Karıştırma:</strong> Tanktan numune almadan önce hafifçe karıştırın (çökmeyi önleyin)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Seyreltme:</strong> Yoğunluk {">"} 10⁷ cells/mL ise 1:10 veya 1:100 seyreltme yapın</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Homojenlik:</strong> Seyreltilmiş numuneyi pipetleyerek karıştırın</span>
          </li>
        </ul>
      </div>

      {/* Lamın Doldurulması */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">💧</span>
          2. Lamın Doldurulması
        </h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Lamel Yerleştirme:</strong> Islak lamele lamel kaydırın (Newton halkaları görünmeli)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Yükleme:</strong> Pipet ucunu lamelle lam arası boşluğa değdirin, kılcal etki ile dolsun</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Taşmama:</strong> Fazla örnek hendeklere taşmamalı (yanlış hacim = yanlış sonuç)</span>
          </li>
        </ul>
      </div>

      {/* Sayım Kuralları */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          3. Sayım Kuralları
        </h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Kenar Kuralı:</strong> ÜST ve SOL kenardaki hücreler sayılır, ALT ve SAĞ kenardakiler sayılmaz</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Odak:</strong> 400x büyütme (10x okular + 40x objektif) ideal</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Serpantin:</strong> Sağa git → aşağı in → sola dön (sistematik tarama)</span>
          </li>
        </ul>
      </div>

      {/* Hata Önleme */}
      <div className="bg-red-50 rounded-lg p-6">
        <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          4. Yaygın Hatalar
        </h4>
        <ul className="space-y-2 text-sm text-red-800">
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Hava Kabarcıkları:</strong> Yükleme sırasında hava almış = yeniden yükleyin</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Kuru Lam:</strong> Newton halkaları yok = lamel düzgün yapışmamış</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Tek Kare Sayımı:</strong> ±50% hata! En az 4-5 kare sayın</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// ============================================
// TRYPAN BLUE BOYAMA
// ============================================

const TrypanBlueStaining = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">💙 Trypan Blue Canlılık Boyama</h3>
    
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6">
      <h4 className="text-xl font-bold mb-3">Prensip: Membran Bütünlüğü Testi</h4>
      <p className="text-blue-100">
        Trypan Blue büyük bir moleküldür (961 Da). <strong>Canlı hücreler</strong> sağlam hücre zarı sayesinde 
        boyanın içeri girmesini engeller ve <strong>berrak/şeffaf</strong> görünür. 
        <strong>Ölü hücreler</strong> ise hasarlı zardan boyanın girmesine izin verir ve <strong>koyu mavi</strong> boyanır.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Protokol */}
      <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          Boyama Protokolü
        </h4>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
            <div>
              <strong>Boya Hazırlama:</strong>
              <p className="text-gray-600 mt-1">0.4% Trypan Blue stok çözeltisi (PBS içinde, pH 7.2-7.4)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <strong>Karıştırma:</strong>
              <p className="text-gray-600 mt-1">Hücre süspansiyonu : Trypan Blue = 1:1 (örn. 50 µL + 50 µL)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <strong>İnkübasyon:</strong>
              <p className="text-gray-600 mt-1">Oda sıcaklığında 2-3 dakika bekleyin (fazla bekleme = false positive)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
            <div>
              <strong>Yükleme:</strong>
              <p className="text-gray-600 mt-1">Hemositometreye yükleyin ve hemen sayın (10 dk içinde)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">5</span>
            <div>
              <strong>Sayım:</strong>
              <p className="text-gray-600 mt-1">
                <span className="text-green-600 font-semibold">Berrak hücreler = Canlı</span><br/>
                <span className="text-blue-600 font-semibold">Mavi hücreler = Ölü</span>
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Yorumlama */}
      <div className="space-y-4">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h5 className="font-bold text-green-900 mb-2">✅ Canlı Hücreler (Berrak)</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Hücre zarı bütün</li>
            <li>• Aktif membran pompaları çalışıyor</li>
            <li>• Boya dışarı atılıyor</li>
            <li>• Işık mikroskopunda parlak/şeffaf</li>
            <li>• Chloroplastlar yeşil görünür</li>
          </ul>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <h5 className="font-bold text-blue-900 mb-2">☠️ Ölü Hücreler (Mavi)</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Hücre zarı hasarlı/parçalanmış</li>
            <li>• Membran pompaları çalışmıyor</li>
            <li>• Boya sitoplazma ve çekirdeğe giriyor</li>
            <li>• Koyu mavi boyanma</li>
            <li>• Chloroplastlar soluk/bozulmuş</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h5 className="font-bold text-yellow-800 mb-2">⚠️ Dikkat Edilecekler</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Boya toksiktir, 10 dakikadan fazla bekletmeyin</li>
            <li>• Eski boya stokları yanlış sonuç verir (max 6 ay)</li>
            <li>• pH 7.2-7.4 dışında membran geçirgenliği değişir</li>
            <li>• Aşırı seyreltme canlılığı düşürür</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// HAREKETLİLİK SAYIMI
// ============================================

const MotilityGuide = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">🏃 Hareketlilik Sayımı (Motility)</h3>
    
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
      <h4 className="text-xl font-bold mb-3">Ne Zaman Kullanılır?</h4>
      <p className="text-green-100">
        <strong>Boyasız gözlem</strong> ile hücrelerin hareket kabiliyetini değerlendirmek için. 
        Trypan Blue gibi boyalar hücreyi öldürebileceğinden, <strong>canlı hareket gözlemi</strong> için 
        motility sayımı tercih edilir. Özellikle <strong>flagellalı mikroalgler</strong> ve <strong>spermatozoa</strong> sayımında standart.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Hareketli Hücreler */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">🏃</span>
          Hareketli Hücreler (Motile)
        </h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Aktif Hareket:</strong> Flagella veya sil kullanarak yönlü hareket</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>İlerleme:</strong> Bir noktadan diğerine net translasyon</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Dönme:</strong> Eksen etrafında aktif rotasyon</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Titreşim:</strong> Brownian motion'dan farklı, kontrollü titreşim</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-green-100 rounded">
          <p className="text-xs text-green-700">
            <strong>Örnek:</strong> Chlamydomonas'ın flagella ile yüzmesi, Euglena'nın dönerek hareket etmesi
          </p>
        </div>
      </div>

      {/* Hareketsiz Hücreler */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">🛑</span>
          Hareketsiz Hücreler (Non-Motile)
        </h4>
        <ul className="space-y-2 text-sm text-orange-800">
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Brownian Motion:</strong> Sadece rastgele titreşim (ısıl hareket)</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Akıntı ile Sürüklenme:</strong> Pasif hareket (çevredeki su akımı)</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Sabit Duruş:</strong> Hiç hareket etmiyor veya sadece sallanma</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Ölebilir:</strong> Hareketsiz = muhtemelen ölü veya metabolik yavaşlama</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-orange-100 rounded">
          <p className="text-xs text-orange-700">
            <strong>Dikkat:</strong> Chlorella gibi flagellasız türler doğal olarak hareketsizdir (bu ölü demek değildir!)
          </p>
        </div>
      </div>
    </div>

    {/* Sayım Protokolü */}
    <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
      <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🔬</span>
        Motility Sayım Protokolü
      </h4>
      <ol className="space-y-3 text-sm">
        <li className="flex gap-3">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
          <div>
            <strong>Taze Numune:</strong>
            <p className="text-gray-600 mt-1">Hücreleri strese sokmadan hemen hemositometreye yükleyin (boya yok!)</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
          <div>
            <strong>Isı Kontrolü:</strong>
            <p className="text-gray-600 mt-1">Oda sıcaklığında (25°C) sayın. Soğuk hücreler yavaşlar, sıcak hızlanır.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Gözlem Süresi:</strong>
            <p className="text-gray-600 mt-1">Her hücreyi 5-10 saniye izleyin. Hareket ediyorsa → Motile, etmiyorsa → Non-Motile</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
          <div>
            <strong>Objektif:</strong>
            <p className="text-gray-600 mt-1">400x (10x okular + 40x objektif) ideal. Daha düşük büyütmede hareket fark edilmeyebilir.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">5</span>
          <div>
            <strong>Kayıt:</strong>
            <p className="text-gray-600 mt-1">
              Hareketli/Hareketsiz oranı = <strong>Motility %</strong><br/>
              Örnek: 80 motile + 20 non-motile = 80% motility
            </p>
          </div>
        </li>
      </ol>
    </div>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-yellow-800 mb-2">⚠️ Viability vs Motility Farkı</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Viability (Trypan Blue):</strong> Membran bütünlüğü → Canlı/Ölü ayrımı (boyalı)</p>
            <p><strong>Motility (Boyasız):</strong> Hareket kabiliyeti → Metabolik aktivite göstergesi</p>
            <p className="mt-2 font-semibold">Chlorella için: Viability tercih edilir (flagella yok, hareket etmez)</p>
            <p>Flagellalı algler (Chlamydomonas, Dunaliella) için: Motility daha informatif</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// İSTATİSTİKSEL DOĞRULUK
// ============================================

const StatisticalAccuracy = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">📊 İstatistiksel Doğruluk ve Hata Analizi</h3>
    
    <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6">
      <h4 className="text-xl font-bold mb-3">Neden Birden Fazla Kare Sayılır?</h4>
      <p className="text-purple-100">
        Tek kare sayımı <strong>±50% hata</strong> verebilir! Çünkü hücreler hemositometrede rastgele dağılmaz (Poisson dağılımı). 
        <strong>En az 100-200 hücre</strong> sayarak istatistiksel güvenilirlik elde edilir. 
        Bu genellikle <strong>4-9 büyük kare</strong> sayımı gerektirir.
      </p>
    </div>

    {/* Kare Sayısı vs Hata */}
    <div className="bg-white border-2 border-purple-300 rounded-lg p-6">
      <h4 className="font-bold text-purple-900 mb-4">📉 Kare Sayısı - Hata İlişkisi</h4>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-purple-100">
              <th className="p-3 text-left border">Sayılan Kare</th>
              <th className="p-3 text-left border">Toplam Hücre (tahmini)</th>
              <th className="p-3 text-left border">Standart Hata</th>
              <th className="p-3 text-left border">Güven Aralığı</th>
              <th className="p-3 text-left border">Kullanım</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border hover:bg-purple-50">
              <td className="p-3 border font-semibold">1 kare</td>
              <td className="p-3 border">10-20 hücre</td>
              <td className="p-3 border text-red-600 font-bold">±50%</td>
              <td className="p-3 border text-red-600">Çok düşük</td>
              <td className="p-3 border text-red-600">❌ Kabul edilemez</td>
            </tr>
            <tr className="border hover:bg-purple-50">
              <td className="p-3 border font-semibold">2 kare</td>
              <td className="p-3 border">20-40 hücre</td>
              <td className="p-3 border text-orange-600">±35%</td>
              <td className="p-3 border text-orange-600">Düşük</td>
              <td className="p-3 border text-orange-600">⚠️ Acil durum</td>
            </tr>
            <tr className="border hover:bg-purple-50">
              <td className="p-3 border font-semibold">4 kare</td>
              <td className="p-3 border">40-80 hücre</td>
              <td className="p-3 border text-yellow-600">±25%</td>
              <td className="p-3 border text-yellow-600">Kabul edilebilir</td>
              <td className="p-3 border text-yellow-600">⏱️ Hızlı sayım</td>
            </tr>
            <tr className="border hover:bg-purple-50 bg-green-50">
              <td className="p-3 border font-semibold">5 kare ✅</td>
              <td className="p-3 border">50-100 hücre</td>
              <td className="p-3 border text-green-600 font-bold">±15%</td>
              <td className="p-3 border text-green-600">İyi</td>
              <td className="p-3 border text-green-600">✅ STANDART</td>
            </tr>
            <tr className="border hover:bg-purple-50 bg-blue-50">
              <td className="p-3 border font-semibold">9 kare ⭐</td>
              <td className="p-3 border">100-200 hücre</td>
              <td className="p-3 border text-blue-600 font-bold">±10%</td>
              <td className="p-3 border text-blue-600">Çok iyi</td>
              <td className="p-3 border text-blue-600">⭐ HASSAS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Hesaplama Formülleri */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-3">📐 Temel Formül (Thoma/Neubauer)</h4>
        <div className="bg-white p-4 rounded-lg font-mono text-sm space-y-3">
          <div>
            <p className="text-gray-600 mb-1">Hücre/mL =</p>
            <p className="text-blue-900 text-lg">
              (Toplam Hücre / Sayılan Kare) × 10,000
            </p>
          </div>
          <div className="border-t pt-3">
            <p className="text-gray-600 mb-1">Örnek: 5 karede 150 hücre</p>
            <p className="text-blue-900">
              (150 / 5) × 10,000 = <strong>300,000 cells/mL</strong>
            </p>
          </div>
          <div className="border-t pt-3">
            <p className="text-gray-600 mb-1">Seyreltme varsa:</p>
            <p className="text-blue-900">
              300,000 × 10 (1:10 seyreltme) = <strong>3,000,000 cells/mL</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h4 className="font-bold text-green-900 mb-3">💚 Canlılık (Viability) Hesabı</h4>
        <div className="bg-white p-4 rounded-lg font-mono text-sm space-y-3">
          <div>
            <p className="text-gray-600 mb-1">Viability % =</p>
            <p className="text-green-900 text-lg">
              (Canlı / (Canlı + Ölü)) × 100
            </p>
          </div>
          <div className="border-t pt-3">
            <p className="text-gray-600 mb-1">Örnek: 120 canlı + 30 ölü</p>
            <p className="text-green-900">
              (120 / 150) × 100 = <strong>80% viability</strong>
            </p>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600">
              ✅ {'>'}90% = Mükemmel<br/>
              ⚠️ 70-90% = Kabul edilebilir<br/>
              ❌ {'<'}70% = Kötü (stres/hastalık)
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Kalite Kontrol */}
    <div className="bg-white border-2 border-orange-300 rounded-lg p-6">
      <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Kalite Kontrol Kriterleri
      </h4>
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-orange-50 p-4 rounded">
          <h5 className="font-bold text-orange-800 mb-2">1. Hücre Sayısı</h5>
          <ul className="text-orange-700 space-y-1">
            <li>• Min: 100 hücre toplam</li>
            <li>• İdeal: 200-300 hücre</li>
            <li>• Kare başına: 20-50 hücre</li>
          </ul>
        </div>
        <div className="bg-orange-50 p-4 rounded">
          <h5 className="font-bold text-orange-800 mb-2">2. Tekrar Edilebilirlik</h5>
          <ul className="text-orange-700 space-y-1">
            <li>• İki kamera arasında {'<'}10% fark</li>
            <li>• Duplike sayımlar {'<'}15% fark</li>
            <li>• CV (coefficient of variation) {'<'}15%</li>
          </ul>
        </div>
        <div className="bg-orange-50 p-4 rounded">
          <h5 className="font-bold text-orange-800 mb-2">3. Numune Kalitesi</h5>
          <ul className="text-orange-700 space-y-1">
            <li>• Hava kabarcığı yok</li>
            <li>• Yoğunluk 10⁴-10⁷ cells/mL</li>
            <li>• Taze numune ({'<'}30 dk)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default CellCountingGuide;

# ChlorellaOS - Entegre Mikroalg Biyoproses Yönetim Sistemi

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Status](https://img.shields.io/badge/status-Production--Ready-success)
![License](https://img.shields.io/badge/license-Private-red)

**Chlorella vulgaris ve diğer mikroalgler için tam özellikli laboratuvar ve üretim yönetim platformu**

[Özellikler](#-temel-özellikler) • [Kurulum](#-kurulum) • [Kullanım](#-kullanım-kılavuzu) • [Mimari](#-sistem-mimarisi) • [Dokümantasyon](#-modül-detayları)

</div>

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Temel Özellikler](#-temel-özellikler)
- [Sistem Gereksinimleri](#-sistem-gereksinimleri)
- [Kurulum](#-kurulum)
- [Kullanım Kılavuzu](#-kullanım-kılavuzu)
- [Sistem Mimarisi](#-sistem-mimarisi)
- [Modül Detayları](#-modül-detayları)
- [Veri Modelleri](#-veri-modelleri)
- [Geliştirme](#-geliştirme)
- [Sorun Giderme](#-sorun-giderme)
- [Yol Haritası](#-yol-haritası)

---

## 🎯 Proje Hakkında

**ChlorellaOS**, mikroalg kültürlerinin laboratuvar ve endüstriyel ölçekteki üretimini yönetmek için geliştirilmiş kapsamlı bir web uygulamasıdır. Sistem, besin ortamı formülasyonundan kalibrasyon yönetimine, spektrofotometrik analizlerden ekonomik fizibilite çalışmalarına kadar tüm biyoproses operasyonlarını tek platformda birleştirir.

### 🌟 Neden ChlorellaOS?

- **Tam Entegrasyon**: Tank yönetimi, analiz sonuçları, maliyet hesaplamaları tek bir ekosistemde
- **Bilimsel Doğruluk**: Redfield oranı, Beer-Lambert yasası, lineer regresyon gibi kanıtlanmış metodolojiler
- **Kullanıcı Merkezli**: Yeni başlayan araştırmacıdan endüstriyel operatöre kadar her seviyeye uygun
- **Veri Güvenliği**: LocalStorage tabanlı kalıcı veri, tarayıcı önbellekleme, dışa/içe aktarma
- **Açık Kaynak Ruhu**: Genişletilebilir modüler mimari, topluluk katkılarına açık. Ancakbu sürüm özel kullanım lisansına tabidir. Gelistirme ve katkılar için lütfen iletişime geçin.

---

## ✨ Temel Özellikler

### 🔬 **1. Spektrofotometrik Analiz Sistemi**
- **8 Analiz Metodu**: 
  - Fosfat (880 nm, Molibdat metodu)
  - Amonyum Azotu (425 nm, Nessler reaktifi)
  - Amonyum Azotu (655 nm, Salisilat metodu)
  - Alkalinite (630 nm, Bromkresol green)
  - Sertlik (520 nm, EDTA titrasyonu)
  - Üre (520 nm, Diasetil monoksim)
  - Toplam Amonyak Azotu - TAN (655 nm)
  - Toplam Fosfor (880 nm, Persülfat sindirimi)

- **Kalibrasyon Yönetimi**:
  - CRUD operasyonları (Oluştur, Oku, Güncelle, Sil)
  - Lineer regresyon otomasyonu (y = mx + b)
  - R² kalite değerlendirmesi (mükemmel ≥0.999, iyi ≥0.995)
  - Fabrika ayarlarına sıfırlama
  - Standart nokta yönetimi (5-6 nokta)

- **Çoklu Okuma İstatistiği**:
  - Ortalama konsantrasyon
  - Standart sapma
  - Varyasyon katsayısı (CV%)
  - Aykırı değer uyarıları (CV>10%)

- **Tank Entegrasyonu**:
  - Analiz sonuçlarını doğrudan tank su kalitesi verilerine aktar
  - Otomatik parametre eşleştirme
  - Tarih ve metadata depolama

### 📚 **2. Besin Ortamı Yönetim Sistemi**
- **30 Standart Ortam Kataloğu**:
  - **Standart** (7): BG-11, BBM, JM, Chu-10, WC, C Medium, Bristol
  - **Miksotrof** (5): TAP, Proteose Peptone, Glucose-YE, Acetate, Euglena
  - **Özelleşmiş** (7): DM, Z Medium, Zarrouk, ASM-1, MA, Waris-H, Allen's
  - **Ekolojik** (5): SE, Erd-Schreiber, Pringsheim's Soil, COMBO, L16
  - **Gelişmiş** (6): f/2, M-8, AF-6, URO, DY-V, HS

- **Tam Stokiyometrik Veri** (8 ortam):
  - Makrobesin elementleri (N, P, K, Mg, Ca, S)
  - Mikrobesin elementleri (Fe, Mn, Zn, Cu, Mo, Bo)
  - Elementel katkı hesaplamaları (mg/L)
  - N:P oranları ve Redfield karşılaştırması

- **Arama & Filtreleme**:
  - Anahtar kelime araması
  - Tür bazlı filtreleme (örn: "Chlorella")
  - Kategori bazlı filtreleme
  - Stokiyometri seviyesi filtreleme

### 📊 **3. Stokiyometrik Analiz Aracı**
- **Elementel Breakdown**:
  - 10 makro/mikro element analizi
  - mg/L ve molarite dönüşümleri
  - Görsel bar chart gösterim
  - Hacim ölçeklendirme (0.1-1000 L)

- **N:P Oranı Değerlendirmesi**:
  - Redfield optimal oranı (7.11) karşılaştırma
  - Sapma yüzdesi hesaplama
  - Durum badgeleri (mükemmel/iyi/uyarı/zayıf)
  - Sınırlayıcı besin tahmini

- **İyonik Denge Analizi**:
  - Yüksek sodyum uyarısı (>1000 mg/L)
  - Yüksek klorür uyarısı (>500 mg/L)
  - Düşük magnezyum/kalsiyum/kükürt tespiti
  - Fizyolojik etki açıklamaları

- **Maliyet Analizi**:
  - Kimyasal bazlı maliyet breakdown
  - Toplam ve L başına maliyet
  - ChemicalDatabase entegrasyonu
  - Para birimi desteği (TL, USD, EUR)

### 🎯 **4. Karşılaştırma & Karar Destek Sistemi**
- **Çoklu Ortam Karşılaştırma**:
  - Standart + Özel tarifler birlikte
  - Yan yana element profili
  - N:P oranı karşılaştırma
  - Maliyet farkı analizi

- **Akıllı Scoring Algoritması** (0-10 puan):
  ```
  Toplam Skor = Σ(Kriter Skoru × Ağırlık) / Toplam Ağırlık
  ```
  - **N:P Dengesi**: Redfield yakınlığı
  - **Maliyet Verimliliği**: Düşük kimyasal maliyeti
  - **Hazırlık Kolaylığı**: Az bileşen sayısı
  - **Raf Ömrü**: pH stabilitesi
  - **Büyüme Hızı**: Yüksek azot içeriği

- **Dinamik Öncelik Sistemi**:
  - Her kriter için 1-10 arası slider
  - Kullanım senaryolarına göre özelleştirme
  - Gerçek zamanlı yeniden sıralama

- **Otomatik Öneri Motoru**:
  - En yüksek skorlu ortam vurgulama
  - Gerekçeli öneri açıklamaları
  - Renk kodlu görselleştirme

### 👤 **5. Kullanıcı Sistemi & Kişiselleştirme**
- **Profil Yönetimi**:
  - Deneyim seviyesi (Yeni başlayan/Orta/İleri/Endüstriyel)
  - Birincil hedef (Araştırma/Üretim/Eğitim/Ticari)
  - Hedef türler (çoklu seçim)
  - Oturum istatistikleri

- **Sistem Tercihleri**:
  - Varsayılan hacim/ortam/para birimi
  - Otomatik kayıt aralığı
  - Öğretici ipuçları
  - Kompakt görünüm modu
  - Bildirim ayarları

- **Favoriler Sistemi**:
  - Besin ortamları favorileme
  - Tarif favorileme
  - Tek tık ekleme/çıkarma
  - Kategorize edilmiş görünüm

- **Özel Tarif Oluşturma**:
  - **Kimyasal Formülasyon Editörü**:
    * Bileşen ekleme (formül, miktar, birim, element)
    * 10 element desteği (N, P, K, Mg, Ca, S, Na, Cl, C, Fe)
    * Otomatik elementel katkı hesaplama
    * Moleküler fraksiyonlama
  - Tarif düzenleme/silme
  - Yazar ve zaman damgası
  - Hazırlık notları

- **Kullanım Geçmişi**:
  - Toplam analiz/tank/tarif sayaçları
  - Son kullanılan ortamlar (son 20)
  - En çok kullanılan ortam istatistiği
  - Son aktivite zamanı

- **Kişiselleştirilmiş Öneriler**:
  - Deneyim seviyesi bazlı
  - Kullanım geçmişi bazlı
  - Hedef tür bazlı
  - Öncelik seviyeleri (Yüksek/Orta/Düşük)

- **Veri Yönetimi**:
  - JSON export (tam yedek)
  - JSON import (geri yükleme)
  - Tüm verileri temizleme (çift onay)
  - 5 LocalStorage anahtarı

### 🏭 **6. Tank & Üretim Yönetimi**
- **58 Tank Sistemi**:
  - 20 Kavanoz (1L) - A, B, C, D serileri
  - 24 Şişe (5L) - SA, SB, SC, SD serileri
  - 10 Varil (70L) - VA, VB, VC serileri
  - 4 IBC (1000L) - IBC1-4

- **Su Kalitesi İzleme**:
  - pH, TDS, OD600, TAN, TP
  - Tarihsel veri kaydı
  - Spektrofotometre entegrasyonu
  - Grafik görselleştirme

### 💰 **7. Fizibilite & Ekonomi**
- **Maliyet Analizi**:
  - Hammadde maliyetleri
  - İşletme giderleri
  - Enerji tüketimi
  - Nakit akış projeksiyonu

- **Karlılık Hesaplamaları**:
  - Birim başına maliyet
  - Gelir tahminleri
  - Kâr marjları
  - Geri ödeme süresi

### 📦 **8. Malzeme Envanteri**
- **73 Malzeme Kategorisi**:
  - Büyük ekipman
  - Ölçüm cihazları
  - Tanklar ve konteynerler
  - Kimyasallar (besin elementleri)
  - Lab malzemeleri
  - Test kitleri

- **Stok Yönetimi**:
  - Miktar takibi
  - Birim fiyatları
  - Minimum stok uyarıları
  - Tedarikçi bilgileri

### 📝 **9. Lab Defteri**
- **Günlük Kayıt Sistemi**:
  - İşlem kayıtları
  - Gözlem notları
  - Risk değerlendirmeleri
  - Zaman damgalı girişler

- **Arama & Filtreleme**:
  - Tarih bazlı
  - Kategori bazlı
  - Anahtar kelime araması

### 📈 **10. İzleme & Raporlama**
- **Gerçek Zamanlı Monitoring**:
  - Tank parametreleri
  - Trend grafikleri
  - Uyarı sistemleri

- **Rapor Oluşturma**:
  - PDF export
  - Excel export
  - Özelleştirilebilir şablonlar

---

## 💻 Sistem Gereksinimleri

### Minimum Gereksinimler
- **İşletim Sistemi**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Node.js**: 16.x veya üzeri
- **npm**: 8.x veya üzeri
- **RAM**: 4 GB
- **Disk Alanı**: 500 MB
- **Tarayıcı**: 
  - Chrome 90+
  - Firefox 88+
  - Edge 90+
  - Safari 14+

### Önerilen Sistem
- **Node.js**: 18.x LTS
- **RAM**: 8 GB
- **Disk Alanı**: 1 GB (veri depolama için)
- **Ekran Çözünürlüğü**: 1920x1080 (Full HD)
- **İnternet**: Geliştirme için gerekli (production'da offline çalışır)

---

## 🚀 Kurulum

### Otomatik Kurulum (Windows)

1. **Hızlı Başlat**:
   ```cmd
   start.bat
   ```
   - Otomatik olarak bağımlılıkları kontrol eder
   - `npm install` çalıştırır
   - Dev server'ı başlatır
   - Tarayıcıyı açar (http://localhost:3002)

### Manuel Kurulum

1. **Depoyu Klonla**:
   ```bash
   git clone https://github.com/yourusername/chlorellaOS.git
   cd chlorellaOS
   ```

2. **Bağımlılıkları Yükle**:
   ```bash
   npm install
   ```

3. **Geliştirme Sunucusunu Başlat**:
   ```bash
   npm run dev
   ```

4. **Tarayıcıda Aç**:
   - http://localhost:3002

### Production Build

```bash
npm run build
npm run preview
```

Build çıktıları `dist/` klasöründe oluşturulur.

---

## 📖 Kullanım Kılavuzu

### İlk Kullanım

1. **Profil Oluştur**:
   - "Kullanıcı" sekmesine git
   - Profilinizi doldurun (ad, deneyim, hedef)
   - Tercihleri ayarlayın

2. **Besin Ortamı Keşfet**:
   - "30 Besin Ortamı" sekmesinden kataloğu inceleyin
   - Chlorella için uygun ortamları filtreleyin
   - Detaylı bilgileri modal'da görüntüleyin

3. **Stokiyometrik Analiz Yap**:
   - "Stokiyometri" sekmesine git
   - Ortam seçin (örn: BBM)
   - Hacim girin
   - Elementel breakdown'ı inceleyin
   - N:P oranını Redfield ile karşılaştırın

4. **Karşılaştırma Yap**:
   - "Karşılaştırma" sekmesine git
   - 2-5 ortam seçin
   - Öncelik kriterlerini ayarlayın
   - Önerilen ortamı görün

### Özel Tarif Oluşturma

1. **"Kullanıcı" → "Özel Tarifler"** sekmesine git
2. **"Yeni Tarif"** butonuna tıkla
3. **Temel Bilgileri Doldur**:
   - Tarif adı (örn: "Yüksek N BBM")
   - Açıklama
   - Optimal pH

4. **Kimyasal Bileşenler Ekle**:
   ```
   Formül: NaNO3
   Miktar: 2.0
   Birim: g/L
   Element: N
   [Ekle]
   ```

5. **Hazırlık Notları Yaz**:
   - Otoklav süresi
   - Filtre boyutu
   - Özel uyarılar

6. **Kaydet** ve karşılaştırmada kullan!

### Spektrofotometre Kullanımı

1. **Kalibrasyon Eğrisi Seç**:
   - "Spektrofotometre" sekmesi
   - 8 metottan birini seç

2. **Okuma Yap**:
   - Absorbans değerini gir
   - "Okuma Ekle" tıkla
   - Tekrarla (en az 3 okuma önerilir)

3. **İstatistik İncele**:
   - Ortalama
   - Standart sapma
   - CV% (>10% ise uyarı)

4. **Tank'a Aktar**:
   - Tank ID gir
   - Tarih seç
   - "Tank'a Aktar" tıkla
   - Veri otomatik kaydedilir

---

## 🏗️ Sistem Mimarisi

### Teknoloji Stack'i

```
┌─────────────────────────────────────────┐
│           FRONTEND LAYER                │
├─────────────────────────────────────────┤
│  React 18.2.0 + Hooks                  │
│  Vite 4.4.5 (Build Tool)               │
│  Tailwind CSS 3.3.3 (Styling)          │
│  Lucide React 0.263.1 (Icons)          │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│         COMPONENT LAYER                 │
├─────────────────────────────────────────┤
│  22 Tab Components                      │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│          UTILITY LAYER                  │
├─────────────────────────────────────────┤
│  - calibrationManager.js                │
│  - userManager.js                       │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│           DATA LAYER                    │
├─────────────────────────────────────────┤
│  - mediaDatabase.js (30 media)          │
│  - chemicalDatabase.js (73 chemicals)   │
│  - systemData.js (tanks, formulas)      │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│        PERSISTENCE LAYER                │
├─────────────────────────────────────────┤
│  LocalStorage (8+ keys)                 │
└─────────────────────────────────────────┘
```

### Modüler Yapı

```
chlorellaOS/
├── public/
├── src/
│   ├── components/         # 22 UI Components
│   ├── tabs/              # MonitoringTab
│   ├── data/              # Databases
│   ├── utils/             # Business Logic
│   ├── App.jsx            # Main Container
│   └── main.jsx           # Entry Point
├── start.bat
├── package.json
└── README.md
```

---

## 📦 Modül Detayları

### SpectroCalculator.jsx (800+ satır)

**Amaç**: Spektrofotometrik analizler için tam özellikli arayüz.

**Ana Özellikler**:
- 8 analiz metodu dropdown'ı
- Kalibrasyon eğrisi yönetimi (CRUD)
- Çoklu okuma sistemi
- İstatistik hesaplama (ortalama, stdDev, CV%)
- Tank data transfer

---

### MediaComparisonTool.jsx (500+ satır)

**Amaç**: Çoklu besin ortamı karşılaştırma ve karar destek.

**Scoring Algoritması**:
```javascript
// N:P Oranı Skoru
const npDeviation = Math.abs(npRatio - REDFIELD_NP_RATIO) / REDFIELD_NP_RATIO;
const npScore = Math.max(0, 10 - npDeviation * 20);

// Ağırlıklı Toplam
const weightedScore = Σ(score × weight) / totalWeight;
```

**Custom Recipe Entegrasyonu**:
- Standart + Custom birleşik görünüm
- Dual-section UI (📚 Standart / ⭐ Özel)
- Full stoichiometry filtresi

---

### UserSystemManager.jsx (850+ satır)

**Amaç**: Kullanıcı profili, tercihler, favoriler, özel tarifler.

**Özel Tarif Formatı**:
```javascript
{
  id: 'custom_1735646400000',
  name: 'Yüksek N BBM',
  macronutrients: {
    'NaNO3': { amount: 2.0, unit: 'g/L', element: 'N', provides: 330.0 }
  },
  hasFullStoichiometry: true
}
```

---

## 🗄️ Veri Modelleri

### Calibration Object

```javascript
{
  id: 'phosphate_880nm',
  name: 'Fosfat Analizi (880 nm)',
  wavelength: 880,
  unit: 'mg/L PO4-P',
  slope: 0.0421,
  intercept: 0.0015,
  rSquared: 0.9998,
  standards: [...]
}
```

### Media Object

```javascript
{
  id: 'BBM',
  name: 'BBM',
  fullName: "Bold's Basal Medium",
  composition: {
    macronutrients: {...},
    pH: { optimal: 6.6, range: [6.5, 7.0] },
    hasFullStoichiometry: true
  }
}
```

### Tank Object

```javascript
{
  id: 'A1',
  capacity: 1,
  status: 'active',
  strain: 'Chlorella vulgaris UTEX 395',
  media: 'BBM',
  waterQuality: {...}
}
```

---

## 🛠️ Geliştirme

### Kod Standartları

- **ES6+ Syntax**: Arrow functions, destructuring, spread operator
- **React Hooks**: useState, useEffect, useMemo
- **Tailwind CSS**: Utility-first, responsive classes
- **Comments**: JSDoc style

### Yeni Modül Ekleme

1. Component oluştur: `src/components/YeniModul.jsx`
2. App.jsx'e import et
3. Tab butonu ekle
4. Render logic yaz

---

## 🐛 Sorun Giderme

### Port 3002 Meşgul

```powershell
Get-NetTCPConnection -LocalPort 3002 | Select -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Beyaz Ekran Sorunu

1. Konsolu Aç: F12
2. Hataları Kontrol Et
3. Hard Refresh: Ctrl+Shift+R
4. Cache Temizle: `rm -rf node_modules/.vite`

---

## 🗺️ Yol Haritası

### v2.1 (Q1 2026)
- [ ] Excel/CSV export
- [ ] Grafik kütüphanesi
- [ ] PDF rapor
- [ ] Dark mode

### v2.2 (Q2 2026)
- [ ] Multi-language (TR/EN)
- [ ] MySQL backend
- [ ] REST API
- [ ] Multi-user

### v3.0 (Q4 2026)
- [ ] Machine learning
- [ ] IoT integration
- [ ] Mobile app

---

## 📄 Lisans

Bu proje **Özel Kullanım** lisansı altındadır.

**Copyright © 2025 ChlorellaOS Development Team**

---

## 📞 İletişim

- **Proje**: ChlorellaOS v2.0.0
- **Tarih**: 31 Aralık 2025
- **Durum**: Production-Ready

---

## 📊 İstatistikler

- **Kod Satırı**: 15,000+
- **Component**: 22
- **Besin Ortamı**: 30+ standart + sınırsız custom
- **Spektro Analiz**: 8 metod
- **Tank**: 58 unit
- **LocalStorage**: 8+ keys

---

<div align="center">

**ChlorellaOS** - Bilim, Teknoloji ve Sürdürürebilirlik

Made with ❤️ by Bioprocess Engineering Team

</div>

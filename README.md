# ChlorellaOS
CHLORELLA VULGARIS ENDÜSTRİYEL ÜRETİM VE İMMOBİLİZASYON PROSESİ IZLEME SISTEMI

# ChlorellaOS - Akıllı Üretim İzleme Sistemi

## 🚀 Hızlı Başlangıç

### Otomatik Kurulum (Önerilen)
1. `start.bat` dosyasına çift tıklayın
2. Sistem otomatik olarak:
   - Bağımlılıkları kontrol eder
   - Gerekirse `npm install` çalıştırır
   - Vite dev sunucusunu başlatır
   - Tarayıcıyı açar (http://localhost:3000)

### Manuel Kurulum
```bash
npm install
npm run dev
```

## 📋 Sistem Gereksinimleri
- **Node.js** 16+ (https://nodejs.org)
- **npm** 8+
- Modern tarayıcı (Chrome, Firefox, Edge)

## 🎯 Özellikler

### ✅ 7 Ana Modül
1. **İzleme** - Günlük tank ölçümleri (pH, TDS, OD, TAN, TP)
2. **Besin Yeri** - BBM formülasyonu ve maliyet hesabı
3. **Tanklar** - 58 tank yönetimi (Kavanoz, Şişe, Varil, IBC)
4. **Fizibilite** - Karlılık analizi ve nakit akış projeksiyonu
5. **Malzeme** - 73 malzeme envanteri ve maliyet takibi
6. **Besin Kütüphane** - 6 standart formülasyon (BBM, BS11, JAWORSKI, FACHB, ZARROUK, CUSTOM_BBM)
7. **Lab Defteri** - Günlük işlem, gözlem ve risk kaydı

### 💾 Veri Saklama
- **LocalStorage** ile tarayıcı tabanlı kalıcı veri
- Sayfa yenilense bile veriler kaybolmaz
- Her modül kendi anahtarını kullanır:
  - `chlorellaMonitoring` - İzleme verileri
  - `chlorellaMaterials` - Malzeme envanteri
  - `chlorellaLabJournal` - Lab defteri kayıtları

## 📁 Proje Yapısı
```
chlorellaOS/
├── src/
│   ├── components/      # React componentleri
│   │   ├── BesinYeriKutuphane.jsx
│   │   ├── FeasibilityAnalysis.jsx
│   │   ├── LabJournal.jsx
│   │   ├── MaterialInventory.jsx
│   │   ├── NutrientCalculator.jsx
│   │   └── TankManagement.jsx
│   ├── tabs/
│   │   └── MonitoringTab.jsx
│   ├── data/
│   │   ├── systemData.js           # Tank sistemi, BBM formülleri
│   │   └── systemDataExtended.js   # 6 besin yeri, 73 malzeme
│   ├── App.jsx          # Ana uygulama
│   └── main.jsx         # Entry point
├── start.bat            # Otomatik başlatma scripti
├── package.json
└── README.md
```

## 🔧 Teknolojiler
- **React 18.2.0** - UI framework
- **Vite 4.4.5** - Build tool & dev server
- **Tailwind CSS 3.3.3** - Styling
- **Lucide React 0.263.1** - İkonlar

## 📊 Veri Modelleri

### Tank Sistemi (58 tank)
- 20 Kavanoz (1L) - A, B, C, D serileri
- 24 Şişe (5L) - SA, SB, SC, SD serileri
- 10 Varil (70L) - VA, VB, VC serileri
- 4 IBC (1000L) - IBC1-4

### Besin Yeri Formülasyonları
- **BBM** - Chlorella vulgaris standart
- **BS11** - Synechococcus için
- **JAWORSKI** - Genel amaçlı
- **FACHB** - Çin standart ortamı
- **ZARROUK** - Spirulina (pH 9-10)
- **CUSTOM_BBM** - Optimize edilmiş

### Malzeme Kategorileri (73 item)
- Büyük Ekipman (Mikroskop, Spektrofotometre)
- Ölçüm Cihazları (pH, TDS, Terazi, Refraktometre)
- Tanklar (IBC, Varil, Şişe, Kavanoz)
- Kimyasallar (NaNO3, MKP, MgSO4, Üre, vb.)
- Lab Malzemeleri
- Test Kitleri

## 🚨 Sorun Giderme

### Port 3000 meşgul
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 | Select -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Beyaz ekran sorunu
1. Tarayıcı konsolu açın (F12)
2. Console sekmesinde hata mesajlarını kontrol edin
3. Ctrl+Shift+R ile hard refresh yapın
4. `npm run dev` tekrar çalıştırın

### Vite cache sorunu
```bash
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

## 📝 Geliştirme Notları

### ADDITIVE İlkesi
- Hiçbir özellik silinmez, sadece ekleme yapılır
- Tüm veriler LocalStorage'da korunur
- Backward compatibility sağlanır

### Sonraki Özellikler (Roadmap)
- [ ] Excel export (CSV)
- [ ] Fotoğraf yükleme (Lab Defteri)
- [ ] Grafik & İstatistik (Monitoring)
- [ ] MySQL entegrasyonu
- [ ] PDF rapor oluşturma
- [ ] Çoklu kullanıcı desteği

### ✅ **AŞAMA 8: KULLANICI SİSTEMİ & KİŞİSELLEŞTİRME**

### 📦 Oluşturulan Dosyalar

1. **userManager.js** (400+ satır)
2. **UserSystemManager.jsx** (850+ satır)

---

## 🎯 **Özellikler**

### **1. Kullanıcı Profili Yönetimi**
- **Kullanıcı Adı**: Özelleştirilebilir
- **Deneyim Seviyesi**: 
  * 🌱 Yeni Başlayan
  * 📚 Orta Seviye
  * 🎓 İleri Seviye
  * 🏭 Endüstriyel
- **Birincil Hedef**:
  * 🔬 Araştırma
  * 🏭 Üretim
  * 📚 Eğitim
  * 💼 Ticari
- **Hedef Türler**: Çoklu tür desteği (virgülle ayrılmış)
- **Oturum İstatistikleri**: Toplam oturum, kayıt tarihi, son giriş

### **2. Sistem Tercihleri**
- ⚙️ **Varsayılan Hacim** (0.1-1000 L)
- 🧪 **Varsayılan Besin Ortamı** (BBM, BG-11, JM, TAP, Zarrouk)
- 💰 **Para Birimi** (TL, USD, EUR)
- ⏱️ **Otomatik Kayıt Aralığı** (saniye)
- ✅ **Öğretici İpuçları** (açık/kapalı)
- 📐 **Kompakt Görünüm** (açık/kapalı)
- 🔔 **Bildirimler** (açık/kapalı)

### **3. Favoriler Sistemi**
- ⭐ **Favori Besin Ortamları**: Hızlı erişim için kaydetme
- 💾 **Favori Tarifler**: Özel formülasyonlar
- **Tek tık ekleme/çıkarma**: X butonu ile kaldırma
- **Kategorize edilmiş görünüm**: Ortamlar ve tarifler ayrı bölümler

### **4. Özel Tarif Yönetimi**
- ➕ **Yeni Tarif Oluşturma**:
  * Tarif adı
  * Açıklama
  * Hacim bilgisi
  * Hazırlık notları
- ✏️ **Düzenleme**: Mevcut tarifleri güncelleme
- 🗑️ **Silme**: Onay ile güvenli silme
- 👤 **Yazar Bilgisi**: Kim oluşturdu, ne zaman
- 📅 **Zaman Damgası**: Oluşturma ve değiştirme tarihleri

### **5. Kullanım Geçmişi**
- 📊 **İstatistikler**:
  * Toplam analiz sayısı
  * Oluşturulan tank sayısı
  * Kaydedilen tarif sayısı
- 📜 **Son Kullanılan Ortamlar**: Son 20 ortam listesi
- 📈 **En Çok Kullanılan**: Hangi ortam kaç kez kullanıldı
- ⏰ **Son Aktivite**: En son ne zaman kullanıldı

### **6. Kişiselleştirilmiş Öneriler**
**Akıllı Öneri Motoru** (deneyim seviyesi + kullanım geçmişi + hedefler):

- **Yeni başlayanlar için**: "BBM ve BG-11 gibi standart ortamlarla başlamanızı öneririz"
- **İleri seviye + favori yok**: "Sık kullandığınız ortamları favorilere ekleyin!"
- **10+ analiz yapılmış**: "En çok kullandığınız ortam: BBM (15 kez)"
- **Chlorella hedefi**: "BBM, BG-11 veya JM ortamları Chlorella vulgaris için idealdir"
- **İleri seviye + tarif yok**: "Kendi besin ortamı formülasyonlarınızı kaydedebilirsiniz!"

**Öncelik Seviyeleri**:
- 🔴 **YÜKSEK**: Kırmızı badge, hemen dikkat
- 🔵 **ORTA**: Mavi badge, faydalı bilgi
- ⚪ **DÜŞÜK**: Gri badge, opsiyonel

### **7. Veri Yönetimi**
- 📥 **Dışa Aktarma**: 
  * JSON formatında tam yedek
  * Profil + Tercihler + Favoriler + Tarifler + Geçmiş
  * Dosya adı: `chlorella_backup_YYYY-MM-DD.json`
- 📤 **İçe Aktarma**:
  * JSON dosyası seçimi
  * Otomatik format kontrolü
  * Başarı/hata bildirimleri
- 🗑️ **Tüm Verileri Temizle**:
  * **ÇİFT ONAY** sistemi (2 kez uyarı)
  * GERİ ALINAMAZ işlemi açık belirtme
  * localStorage tamamen temizlenir

---

## 🔗 **LocalStorage Yapısı**

### **5 Ayrı Anahtar**:
```javascript
1. chlorella_user_profile     // Kullanıcı bilgileri
2. chlorella_preferences       // Sistem ayarları
3. chlorella_favorites         // Favori listeler
4. chlorella_custom_recipes    // Özel tarifler
5. chlorella_usage_history     // Kullanım geçmişi
```

### **Otomatik Güncelleme**:
- Her giriş → `lastLogin` güncellenir
- Her aktivite → `totalSessions` artar
- Her analiz → `totalAnalyses` sayacı
- Her tarif → `totalRecipesSaved` kayıt

---

## 📊 **Entegrasyon**

- **App.jsx'e eklendi**: Yeni tab "**Kullanıcı**" (User ikonu)
- **22. tab olarak** aktif (**TOPLAM 22 TAB**)
- **Hata yok** ✅ (derleme başarılı)
- **6 alt bölüm**: Profil, Tercihler, Favoriler, Tarifler, Geçmiş, Veri Yönetimi

---

## 📈 **Kullanım Akışı**

```
1. İlk Giriş → Varsayılan profil oluşturulur
2. Profil Bilgilerini Doldur → Deneyim, hedef, türler
3. Tercihleri Ayarla → Hacim, birim, para birimi
4. Ortam Seç → Favori olarak ekle (⭐)
5. Özel Tarif Oluştur → Kendi formülasyonları kaydet
6. Kullan → Sistem otomatik geçmiş kaydeder
7. Öneriler Al → Akıllı sistem önerilerde bulunur
8. Yedekle → JSON export ile tam backup
```

---

## 🎯 **PROJE ÖZET: 8 AŞAMA TAMAMLANDI**

| # | Aşama | Durum | Dosya | Özellik |
|---|-------|-------|-------|---------|
| 1 | **Sistem Yedeği** | ✅ | backup_20251231/ | 34 dosya yedeklendi |
| 2 | **Spektro - Temel** | ✅ | SpectroCalculatorSimple.jsx | PO4-P, NH4-N |
| 3 | **Spektro - Gelişmiş** | ✅ | calibrationManager.js, SpectroCalculator.jsx | 8 analiz + kalibrasyon CRUD |
| 4 | **Spektro - Tank** | ✅ | SpectroCalculator.jsx | Multi-reading + tank transfer |
| 5 | **30 Medya Katalog** | ✅ | mediaDatabase.js, MediaCatalog.jsx | 30 ortam + arama/filtreleme |
| 6 | **Stokiyometrik Analiz** | ✅ | MediaStoichiometryAnalyzer.jsx | Element breakdown + N:P + maliyet |
| 7 | **Karşılaştırma** | ✅ | MediaComparisonTool.jsx | Scoring + öneri + element matrisi |
| 8 | **Kullanıcı Sistemi** | ✅ | userManager.js, UserSystemManager.jsx | Profil + favoriler + tarifler + geçmiş |

---

## 🏆 **Toplam İstatistikler**

- **Toplam Tab**: 22 sekme
- **Oluşturulan Dosya**: 10+ yeni component/utility
- **Toplam Kod**: 10,000+ satır (yeni kodlar)
- **LocalStorage Key**: 8 anahtar (tanks, calibrations, user profile, preferences, favorites, recipes, history, + diğerleri)
- **Desteklenen Analiz**: 8 spektrofotometrik metod
- **Besin Ortamı**: 30 katalog + sınırsız custom
- **Kişiselleştirme**: Tam profil + tercih + öneri sistemi

---

## 🚀 **ChlorellaOS - HAZIR!**

**Tam fonksiyonel Chlorella biyoproses yönetim sistemi başarıyla tamamlandı!** 

🎉 **Tebrikler - Proje başarıyla bitirildi!**

## 📞 İletişim
- Proje: ChlorellaOS v1.0
- Tarih: 30 Aralık 2025
- Sistem: Production-ready
- Yazar: Zuhtu Mete DINLER @ 2025 Kocaeli / Turkiye

## 📄 Lisans
Bu proje özel kullanım içindir. Tum haklari saklidir. Asla izinsiz kullanmayin.
Bu programin kullanilmasi ucrete tabidir.

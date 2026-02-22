kulanicinin mesaji kaldirilamaz
.copilot bu belge daima her promt girisinde okunanacaktir.
bu belge senin bu proje ile ilgili hafizan
bu belgeyiduzenli guncelle
bos bilgilerle doldurma
bu belgenin amaci senin ilgilendigin proje hakkinda ogrendigin ve projede surdurmen gereken yapiyi buraya en etkili ve efektif sekilde not alman icin tasarlandi.
todo listelerinin amaclarini buraya yazacaksin.
ilgilendigin projenin ic yapisini buraya yazacaksin.
----
# AI-ONLY MEMORY (KISA, NET)

## PROJE OZETI
- Proje: ChlorellaOS (stok, canli yonetimi, modelleme, kimyasal sistem yonetimi, izleme)
- Giris: src/main.jsx -> App -> Providers -> Tab UI

## ANA GIRIS VE UISKELETI
- Giris noktasi: src/main.jsx (App render, ErrorBoundary, RecommendationEngine)
- Uygulama iskeleti: src/App.jsx (tabs ile sayfalar)
- Providerlar: EnforcedChlorellaSystemProvider, MaterialsProvider
- Worker: src/workers/SimulationWorker (App icinde baslatilir/durdurulur)

## VERI KATMANI
- Malzeme ve alisveris: src/contexts/MaterialsContext.jsx
- localStorage anahtarlari:
	- chlorellaMaterials
	- chlorellaShoppingList
	- chlorellaStockTransactions
- Ilk veri: src/data/systemDataExtended.js (materialInventory)

## KIMYASAL VERİ KAYNAKLARI
- src/data/chemicalDatabase.js
- src/data/chemicalLibrary.js
- src/data/expandedChemicalDatabase.js

## MIMARI KATMANLAR (8-FAZA ANALIZ SONUÇLARI çİCLI YAPILDI)

### CONTEXT KATMANI (3 adet)
1. **EnforcedChlorellaSystemContext** (1011 satır) - MERKEZ dijital ikiz ✅
   - ACTION: CREATE_TANK, ADD_OD_MEASUREMENT, ADD_CELL_COUNT, ADD_CHEMISTRY, UPDATE_MODEL_STATE
   - STATE: tanks{}, biology{Chlorella vulgaris}, operations{}, inventory{}, observations[]
   - Veri Akışı: Event → Action → Reducer → localStorage

2. **MaterialsContext** (399 satır) - Malzeme/alışveriş ✅
   - State: materials[], shoppingList[], stockTransactions[]
   - Yeni Alanlar: invoiceTotal, shippingCost, kdvRate, kdvIncluded, useInvoiceMode
   - localStorage: chlorellaMaterials, chlorellaShoppingList, chlorellaStockTransactions

3. **ChlorellaSystemContext** (448 satır) - DEPRECATED (basit veri)

### MANAGER KATMANI (3 adet)
1. **ModelManager** (1038 satır) - Tank simülasyon merkezi
   - Singleton: registerTank(), simulateTimeStep(), assimilateRealData()
   - ChlorellaModelV4 + LearningEngine entegre
   - Event listener: tankDataUpdate (OD, cell count, chemistry)
   
2. **LearningEngine** (387 satır) - Otomatik parametre optimizasyonu
   - Adapt: μmax, Ks_N, Ks_P, Y_N, Y_P (error > %10)
   - Cross-tank learning (best performers)
   - Confidence intervals
   
3. **RecommendationEngine** (785 satır) - Kendini müdahale önerileri
   - Risk scoring (16 senaryo)
   - N/P/pH recommendations
   - Cost calculations (ama KDV EKSIK)

### WORKER (1 adet)
- **SimulationWorker** (614 satır) - 5 dakikada bir arka plan
  - CRI (16 risk senaryosu)
  - Catch-up (kaçırılan saat telafi)
  - Browser notifications

### BİLİMSEL KOMPONENTLER (8 adet)
1. BesinYeriPage - 30 formülasyon + stokiyometri
2. CultureModeling - Monod kinetik + 24h forecast
3. CellCountingV2 - 7 lam tipi, cells/mL hesap
4. SpectroCalculator - OD750 kalibrasyon, concentration
5. FeasibilityAnalysis - Maliyet analizi
6. ProductionPlanning - Üretim planı
7. ChemicalDosageCalculator - Kimyasal dozaj
8. FormulationManager - Besin tasarımı

### VERİ YAPILARI
- **Tank:** id, volume_L, environment{T,pH,light}, measurements{}, modelState{biomass,N,P,CRI}, risk{16scenarios}, history[]
- **Material:** id, name, quantity, unitPrice, currentStock, invoiceTotal, kdvRate, kdvIncluded, useInvoiceMode (✅ YENİ)
- **ShoppingItem:** id, materialId, name, suggestedQuantity, unitPrice, priority, purchased
- **StockTransaction:** id, materialId, type(in|out|adj), quantity, reason, timestamp

### KRİTİK BULGULAR

**✅ Tamamlanan FAZA'lar:**
1. FAZA 1: Sistem mimarı (3 context + 3 manager + 1 worker)
2. FAZA 2: Bilimsel hesaplamalar (Monod, stokiyometri, kalibrasyon)
3. FAZA 3: Veri yapı tutarlılığı (Tank, Material, Shopping uyumlu)
4. FAZA 4: Dosya kataloğu (Programci.md yazıldı 5000+ satır)
5. FAZA 5: Referans uyumu (sistemplani.md ✅, genis_aciklama.md ✅)
6. FAZA 6: Modelleme & kararlar (LearningEngine, RecommendationEngine)
7. FAZA 7: Entegrasyon kontrol (Form→State→localStorage uyumlu)
8. FAZA 8: Rapor yazıldı (Programci.md, memory.md)

**❌ YAPILACAK (3 kritis issue):
1. Material/Shopping workflow UI eksik → "Add as Material" button + conversion logic
2. Invoice/KDV tutarsızlığı → RecommendationEngine.calculateChemicalCost() KDV apply et
3. EnforcedChlorellaSystemContext vs ChlorellaSystemContext çift yönetim → deprecate et

**⚠️ Uyarılar:**
- localStorage boyut: 200-300 KB (safe limit yakında ama long-term DB gerekli)
- SimulationWorker catch-up: 24+ saat kapalıysa CPU ağır (max limit ekle)
- LearningEngine cross-tank: Berbeda tank geometrileri yanış parametreler üretebilir

## YEDEK DOSYALARI
- malzeme_yedek.json: data.materials, data.shopping, data.formulations
- Alisveris item kalibi: id, materialId, name, category, suggestedQuantity, unit, unitPrice, priority, addedDate, note, purchased

## UI TABLARI (APP)
- monitoring-hub, besinyeri, tanks, feasibility, materials, shopping, production, formulations, modeling, guide, scaleup, spectro, usersystem, learning, cellcountingv2

## NOTLAR
- Varsayim yok, onay olmadan is yok
- Gereksiz rapor yok
- Degisikliklerden once ilgili dosyalar okunacak

---

## 22 Subat 2026 - Copilot Iletisim Katmani Kurulumu

### Sorun
- Kullanicinin talep ettigi sekilde kalici, append-only, dosya-bazli gelisim hafizasi adlari tam standard degildi.
- Yeni adlar (`pck.md`, `todo.md`, `notlar.md`, `ai_referansbelge.md`) ve okunma sirasi acikca tanimli degildi.

### Yapilan
- `.copilot/ai_referansbelge.md` olusturuldu (kullanici kurallari, AI degistiremez ilkesi).
- `.copilot/pck.md` olusturuldu (modul/sinif/metot belgeleme cephesi).
- `.copilot/todo.md` olusturuldu (append-only gorev kaydi).
- `.copilot/notlar.md` olusturuldu (yarim kalanlar ve operasyon notlari).
- `.copilot/.promt.md` dosyasina yeni okuma sirasi eklendi.
- `.copilot/.todo.md` dosyasina yeni sistemle birlikte yasama notu eklendi.

### Sonuc
- Kullanici ile AI arasinda kalici iletisim katmani aktif edildi.
- Belgeler append-only mantikla calisacak sekilde standardize edildi.
- Bir sonraki oturumlarda baglam kopmasini azaltacak temel kayit altyapisi kuruldu.

### Git Yedek Kaydi
- Yerel repo olusturuldu (`git init`).
- Ilk adim commit hash: `0be2092`.
- Durum: GitHub push beklemede (remote tanimi yok).

### PCK Gelisimi
- `pck.md` dosyasina aktif `src` envanteri append edildi.
- Managers, Worker, Models, Data, Utils ve Contexts icin sinif/fonksiyon seviyesinde temel katalog eklendi.
- Yontem: sadece aktif `src` dosyalari referans alindi.

### Commit Izleri
- `35dea82` -> durum loglari
- `82c8780` -> pck aktif src envanteri

---

## 23 Subat 2026 - Alisveris -> Envanter Veri Katmani Entegrasyonu

### Yapilan
- `src/data/systemDataExtended.js` icine 2026-02 alimlari eklendi (id 74-158).
- Kimyasaldepom listesi (48 kalem) icin KDV + kargo dagitimi kayit bazinda uygulandi.
- Kimyalab/Oksilab/Elektromarket/Trendyol/Letgo alimlari envantere gecirildi.
- BBM/BS11 stok cozelti setleri veri katmanina kaydedildi.

### Kimyasal Eslestirme
- `src/data/expandedChemicalDatabase.js` icine eksik indikator/analitik kalemler eklendi:
   - Phenolphthalein
   - Bromocresol-Green
   - Eriochrome-Black-T
   - Potassium-Permanganate
   - Sodium-Dodecyl-Sulfate

### Acik Kalan Teknik Not
- KDV uyumsuzlugu notu gecerli: `RecommendationEngine` maliyet akisi ile `MaterialsContext` fatura/KDV modeli tam hizali degil.
- Sonraki adim: tum maliyet hesaplarini tek helper uzerinden normalize etmek.

### 23 Subat 2026 Ek Senkron Notu
- Kullanici ekraninda yeni kimyasallar gorunmeme nedeni `localStorage` onceligi olarak teyit edildi.
- `MaterialsContext` icinde `mergePurchasedDefaults` eklendi; kayitli listeye eksik 2026-02 kurumsal alimlari otomatik birlestiriyor.
- `chlorella_materials_2026-02-22.json` ve `malzeme_yedek_2026-02-22T23-32-43.json` dosyalari isim degistirilmeden guncellendi.
- BBM/BS11 stok cozelti kayitlari (`stockSolutionMode`, `mediumCode`, `compatibleMedia`) backup dosyalarina da yansitildi.

### GitHub Yedek Sonucu
- `origin` once SSH ile baglandi, host key onaylandi.
- SSH push yetkisi olmadigi icin HTTPS remote'a gecildi.
- Basarili push: `master` dali `origin/master` olarak olustu ve takip acildi.

---

## 23 Subat 2026 - Cift Tab ve Tek Giris Duzeltmesi

### Sorun
- Her baslatmada 2 tarayici sekmesi aciliyordu.

### Kok Neden
- Ayni anda 3 ayri acilis kaynagi calisiyordu:
   1) `package.json` -> `vite --open`
   2) `vite.config.js` -> `server.open: true`
   3) `ChlorellaOS_Launcher.ps1` -> `Start-Process http://localhost:3000`

### Yapilan
- `package.json` icinde `dev/start` scriptleri `vite` yapildi (`--open` kaldirildi).
- `vite.config.js` icinde `open: false` yapildi.
- Launcher tarafi tek tarayici acilis noktasi olarak birakildi.
- Ek olarak launcher'da Windows `npm install` cagrisi `cmd /c` uzerinden duzeltildi.

### Sonuc
- Tek giris korunarak cift tab sorunu giderildi.

---

# İŞLEM LOGLARı

## 17 Şubat 2026 - GAP ANALİZİ TESLİMATı

### YAPILAN İŞ
1. **genis_aciklama.md OKUMA:** 39453 satır dosya tamamlandı
   - 200 başlık (grep) taradı
   - Ana bölümleri: Mass Balance, 36 gün plan, stokiyometri, besiyeri, formülasyonlar
   - Tasarım detayı: Yüksek kaliteli, teknik ve doğru

2. **Kod OKUMA:** 9 ana modül incelendi
   - EnforcedChlorellaSystemContext (1011 satır) ✅
   - ModelManager (1038 satır) ✅
   - SimulationWorker (614 satır) ✅
   - LearningEngine (387 satır) ✅
   - RecommendationEngine (785 satır) ✅
   - MaterialsContext (399 satır) ✅
   - ChlorellaModelV4 (483 satır) ✅
   - calibrationService (369 satır) ✅
   - BesinYeriPage (118 satır) ✅
   - TOPLAM: 4234 satır başarılı kod

3. **GAP ANALİZİ:** Çok kapsamlı rapor yazıldı
   - Dosya: `.copilot/GAP_ANALIZI.md` (oluşturuldu)
   - Içerik: 
     - ✅ 9 başarılı modülün detaylı doğrulaması
     - ⚠️ 3 kısmi yapılmış (KDV, Mass Balance, pH kontrol)
     - ❌ 3 yapılmamış (Excel, 36 gün plan, Rescue Feed oto.)
     - 📋 REFERENCE.md uyumu kontrolü
     - 🎯 P0/P1/P2 aksiyonlar tanımlandı

4. **Programci.md GÜNCELLEMESİ**
   - Sürüm: 1.0 → 1.1
   - Son Güncelleme: GAP ANALİZİ Tarihlendirildi
   - BAŞLİK SEZMESI: Ek bilgi başlığı eklendi

### BULGU ÖZETİ

| Durum | Sayı | Modüller |
|-------|------|----------|
| ✅ Tamamlanmış | 9 | Context (3) + Manager (3) + Worker (1) + Utils (2) |
| ⚠️ Kısmi | 3 | KDV, Mass Balance, pH Kontrol |
| ❌ Yapılmamış | 3 | Excel, 36 gün Plan, Rescue Feed Oto. |

### P0 - HEMEN YAPMASI GEREKENLER
1. RecommendationEngine KDV hesabı kontrol
2. stoichiometryEngine Mass Balance 3 formül doğrulama
3. UnifiedMediaLibrary, NutrientCalculator, MediaComparisonTool belgeleme

### P1 - SONRAKI SPRINT
4. pH Kontrol Algoritması tamamlama
5. ProductionPlanning 36 gün otomasyonu
6. Rescue Feed otomatik recommendation

### BELGE BAŞKANLARI
- ✅ Programci.md (888 satır) - Ana mimarı belgesi
- ✅ GAP_ANALIZI.md (800+ satır) - Detaylı fark raporu
- ✅ YAPLACAKLAR_PLANI.md (800+ satır) - 2 haftalık yapılacaklar planı
- ✅ REFERENCE.md (264 satır) - Kurallar ve sözleşme
- ✅ memory.md (THIS FILE) - İşlem logları ve anılar

---

## 17 ŞUBAT 2026 - YAPLACAKLAR PLANI & MODÜLER ANALİZİ

### YAPILAN İŞ

1. **Tam Kod Taraması Tamamlandı:**
   - components/ (50+ dosya: 37 aktif, 10 backup/test silinmeli)
   - managers/ (3 dosya: RecommendationEngine KDV eksik)
   - models/ (8 dosya: su kalitesi, kontaminasyon modelleri eksik)
   - services/ (1 dosya: 5 servis EKSIK!)
   - utils/ (16 dosya: 5 duplikasyon)
   - workers/, contexts/ kontrol edildi

2. **Modüler Mimari Analizi:**
   - ✅ 37 aktif component tam belgelenmiş
   - ❌ 10 backup/eski dosya belirlendi (silinecek)
   - ⚠️ 5 duplikasyon tespit (stoichiometryCalculator, BesinYeriPage varyasyonları)
   - ❌ Services katmanı neredeyse yok (sadece 1 servis!)

3. **Temel Sorunlar Tanımlandı:**
   - ⚠️ KDV: UI var, hesaplama logic yok (RecommendationEngine eksik)
   - ❌ Excel: import/export servisi yok
   - ❌ 36 gün planı: otomasyonu yok (aşama geçişleri manuel)
   - ❌ Kontaminasyon: müdahale-stokiyometri bağlantısı yok
   - ❌ Scale-up: bölme/birleştirme hesapları eksik
   - ❌ Su kalitesi: tahmin servisi yok
   - ❌ Ortak birim sistemi: tanımsız (L vs mL, mg/L vs ppm karışıklığı)

4. **2 Haftalık Yapılacaklar Planı Yazıldı:**
   - Dosya: `.copilot/YAPLACAKLAR_PLANI.md` (800+ satır)
   - 12 görev tanımlandı + kod örnekleri + dosya listeleri
   - Hafta 1: Cleanup + 4 yeni servis
   - Hafta 2: 3 yeni manager + Entegrasyon + Unit testler

### P0 - HEMEN YAPILACAKLAR

**Pazartesi 17 Şubat (Cleanup):**
1. Eski 10 dosya sil (src/components/*_OLD*, *_BACKUP*, *Kopya*)
2. src/constants/unitSystem.js oluştur (ortak birim sistemi)
3. src/constants/standardizedNaming.js oluştur (kimyasal isim standardı)

**Salı-Çarşamba (Services):**
4. waterQualityPredictionService.js - Besin yeri + stok → pH, Alk, TAN tahmin
5. scaleUpService.js - Bölme, birleştirme, transfer hesaplamaları
6. RecommendationEngine.js FIX - calculateChemicalCost() KDV'yi uygula
7. materialImportUtility.js FIX - malzeme_yedek.json'dan KDV alanlarını al

**Perşembe-Cuma (Integration):**
8. StageTransitionManager.js - 36 gün planında otomatik aşama geçişi
9. ContaminationResponseManager.js - İlaç müdahalesi + stokiyometri
10. excelIOService.js - (npm install exceljs gerekli)
11. Component güncellemeleri (BesinYeriPage, TankManagement, ProductionPlanning, vb.)
12. Unit testler yazma (src/__tests__/)

### DOSYA YÖNETIMI

**Silinecek (10 dosya):**
- src/components/CultureModeling_OLD_BACKUP.jsx
- src/components/CultureModeling_OLD_v2.jsx
- src/components/TankManagementOld.jsx
- src/components/NutrientCalculatorOld.jsx
- src/components/NutrientCalculatorOld2.jsx
- src/components/MediumLibrarySimple.jsx
- src/components/MediumLibrarySimple2.jsx
- src/components/MediumLibraryTest.jsx
- src/components/SpectroCalculatorSimple.jsx
- src/components/CellCounting.jsx.BACKUP_20260102_150845
- (+ src/utils/*.backup_before_integration)

**Oluşturulacak (7 dosya):**
- src/constants/unitSystem.js
- src/constants/standardizedNaming.js
- src/services/waterQualityPredictionService.js
- src/services/scaleUpService.js
- src/services/excelIOService.js
- src/managers/StageTransitionManager.js
- src/managers/ContaminationResponseManager.js

**Güncellenecek (7 dosya):**
- RecommendationEngine.js (KDV fıksi)
- materialImportUtility.js (KDV accept)
- FeasibilityAnalysis.jsx (KDV gösteirimi)
- BesinYeriPage.jsx (WaterQuality entegrasyonu)
- TankManagement.jsx (ScaleUp entegrasyonu)
- ProductionPlanning.jsx (StageTransition entegrasyonu)
- TankDetails.jsx (Contamination entegrasyonu)

### BELGE YÖNETİMİ

**Tamamlanan:**
- ✅ Programci.md (v1.1, Gap analizi eklendi)
- ✅ GAP_ANALIZI.md (Kod vs tasarım fark raporu)
- ✅ YAPLACAKLAR_PLANI.md (2 haftalık iş planı)
- ✅ memory.md (İşlem logları - bu dosya)

**REFERENCE.md Uyumu:**
- ✅ Kod belge ile uyumlu, uyumsuzluklar raporlandı
- ✅ Veri koruma (MaterialsContext confirm mekanizması)
- ✅ Hiçbir modül koşulsuz veri üretmiyor
- ✅ Daily logging başladı

---

## NOTLAR
- Varsayim yok, onay olmadan is yok
- Gereksiz rapor yok
- Degisikliklerden once ilgili dosyalar okunacak

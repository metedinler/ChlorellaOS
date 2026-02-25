# ChlorellaOS Sayfa Bazlı Veri Aktarım Planı

Tarih: 25 Şubat 2026
Hazırlayan: GitHub Copilot (GPT-5.3-Codex)
Referans Plan: `inceleme.md` (özellikle Bölüm 8 ve 11)

## 1) Amaç
Bu doküman, kodu baştan değiştirmek yerine **veritabanı/local storage içeriklerini güncelleyerek** hangi sayfada ne değişeceğini net gösterir:
- Sayfada **şu an ne var**
- Belgeden hangi veri **hangi DB anahtarına** yazılacak
- Veri yazılınca sayfada **ne görünür/çalışır olacak**
- Gerekirse **çok küçük kod dokunuşu** gerekip gerekmediği

## 2) Kaynak Belgelerden Toplanan Ana Veri Havuzu
- `Yeni klasör/grok plan.md`
  - NEON / GOLIATH / TITAN fazları
  - faz bazlı checkpoint, giriş-çıkış kriterleri, müdahale önerileri
- `Yeni klasör/Xgemini su kalitesi analizleri.txt`
  - nitrit/nitrat/NH4/TAN/PO4 vb. yöntem detayları
  - dalga boyu, blank, kalibrasyon, hesap yaklaşımı
- `bılgı.md`
  - kütle dengesi, teslim garanti stratejisi
  - flokülasyon/deflokülasyon operasyon sınırları (pH/CaCl2)
  - OD600/680/750 yorumlama ve risk pencereleri
  - olay/kurtarma (kesinti, pH çökmesi, şok önleme)

---

## 3) Sayfa Bazlı “Şu An vs Veri Eklenince” Matrisi

| Sayfa (UI) | Şu an | Eklenecek veri (DB anahtarı) | Veri eklenince olacak | Değişiklik tipi |
|---|---|---|---|---|
| İzleme Merkezi | pH/OD vb. canlı kayıtlar ve grafikler var | `chlorellaMonitoringRecords` içine `ODratio680_750`, `estimatedCellCountFromOD`, `riskBand` | Risk bandı daha anlamlı olur, OD oranına göre kalite takibi görünür | Çoğunlukla veri güncellemesi |
| Spektrofotometre | Ölçüm + kalibrasyon akışı var | `chlorellaSpectroMethodLibrary`, `chlorella_calibrations`, `chlorellaSpectroCalibrationDb` içine nitrit/nitrat/Ca/Mg method+kalibrasyon | Yeni parametreler doğrudan seçilebilir/hesaplanabilir hale gelir | Veri + çok küçük alan gösterimi olabilir |
| Üretim Planı | Plan oluşturma/izleme mevcut | `productionPlans` içine `deliveryGuaranteeType`, `overpackTarget`, `coldChainRequired`, kayıp varsayımları | Planlar artık “teslim garantisi + raf ömrü” odaklı yönetilir | Veri güncellemesi |
| Tanklar | Tank bazlı operasyon ve detaylar mevcut | `tankDetails` içine `operationBatches`, `shelfLifeObservations`, garanti metrikleri; `tankInterventions` yeni müdahale tipleri | Tank geçmişi süreç bazlı (flok/deflok) ve denetlenebilir olur | Veri + küçük enum/genişletme |
| Öğrenme Merkezi | seed + kullanıcı içeriği merge çalışıyor | `chlorellaKnowledgeTopics`, `learningCenterTopics` içine yeni konu paketleri + `trustLevel/reviewStatus` | Konular doğrulama etiketiyle gelir, operasyonel rehberlik netleşir | Veri + küçük metadata görünümü |
| Besin Yeri / Formülasyonlar | Reçete ve formül yönetimi var | `customFormulations`, `chlorellaSpecialStockLibrary` içine faz bazlı besleme ve flok/deflok reçeteleri | Faza göre hazır reçete seçimi artar, manuel giriş azalır | Veri güncellemesi |
| Malzeme / Alışveriş | Malzeme ve liste yönetimi var | `chlorellaMaterials`, `chlorellaShoppingList`, `chlorellaStockTransactions` içine reaktif/sarf, min stok seviyeleri | Belgelerdeki operasyon setleri satın alma/stok akışına bağlanır | Veri güncellemesi |
| Kullanıcı | tercih ayarları var | `chlorella_user_profile`, `chlorella_preferences` içine garanti modu, OD öncelik dalga boyu, eşik ayarları | Operatör bazlı kontrol profili oluşur | Veri güncellemesi |

---

## 4) Sayfalara Aktarılacak Konu Paketleri (Belge → DB)

## 4.1 Öğrenme Merkezi
Aktarılacak başlıklar:
- `topic_mass_balance_delivery_guarantee`
- `topic_reversible_flocculation_protocol`
- `topic_od_interpretation_600_680_750`
- `topic_ph_risk_ladder`
- `topic_cold_chain_and_shelf_life`

Hedef DB:
- `chlorellaKnowledgeTopics`
- `learningCenterTopics`

Beklenen görünür fark:
- Sadece metin artışı değil, içeriklerin “onay durumu/güven seviyesi” ile ayrışması.

## 4.2 Spektrofotometre
Aktarılacak yöntemler:
- Nitrit (543 nm)
- Nitrat (220/275 düzeltmeli UV)
- NH3 fraksiyon hesap notu (TAN + pH + sıcaklık)
- Ca/Mg sertlik fark yaklaşımı

Hedef DB:
- `chlorellaSpectroMethodLibrary`
- `chlorella_calibrations`
- `chlorellaSpectroCalibrationDb`

Beklenen görünür fark:
- Method listesi genişler, kalibrasyon kapsamı artar, daha az manuel workaround gerekir.

## 4.3 Üretim Planı + Günlük Plan
Aktarılacak içerik:
- NEON/GOLIATH/TITAN faz hedefleri
- checkpoint, giriş/çıkış kriterleri
- risk ve fallback aksiyonları

Hedef DB:
- `chlorellaFeedingPrograms`
- `chlorellaDailyStagePlans`
- `chlorellaDailyStageManualChecks`
- `chlorellaDailyStageDailyChecks`

Beklenen görünür fark:
- “Faz planı” ile “günlük görev” arasındaki köprü netleşir.

## 4.4 Tank ve İzleme
Aktarılacak içerik:
- flok/deflok batch geçmişi
- müdahale türleri ve before/after metrikleri
- teslim hazırlık skoru ve risk bandı

Hedef DB:
- `tankDetails`
- `tankInterventions`
- `chlorellaMonitoringRecords`

Beklenen görünür fark:
- Tank olayları karar-destek için daha okunabilir olur.

---

## 5) “Sadece DB Güncellemesi mi?” sorusunun net cevabı
Evet, bu planın %85-90’ı **kod refaktörü gerektirmeden DB içerik güncellemesi** ile yapılır.

Küçük kod dokunuşu gerekebilecek düşük kapsamlı noktalar:
1. Yeni metadata alanlarını (örn. `reviewStatus`, `trustLevel`) bazı kartlarda göstermek.
2. Yeni müdahale tipleri için etiket/renk eşlemesi eklemek.
3. Yeni ölçüm alanları için bazı tablo sütunlarını görünür yapmak.

Not: Bunlar mimari değişiklik değil, mevcut bileşenlerde küçük görüntüleme genişletmeleridir.

---

## 6) Uygulama Sırası (inceleme.md planına uyumlu)

### Faz A (Hızlı)
1. Öğrenme başlıklarını `draft`/`pending` etiketli seed olarak ekle.
2. Spectro method + calibration kayıtlarını nitrit/nitrat/Ca/Mg ile genişlet.
3. `program_two_phase_default` kaydını NEON/GOLIATH/TITAN detaylarıyla güncelle.

### Faz B (Orta)
4. Faz checkpoint’lerini günlük plan kayıtlarına dönüştür (DB yazımı).
5. Production plan kayıtlarına teslim garantisi metadata’sı ekle.

### Faz C (Yönetişim)
6. İçeriklere `reviewStatus/evidenceLevel/trustLevel` alanlarını zorunlu uygula.
7. Onaysız reçetelerin otomatik operasyon akışına bağlanmasını engelle.

---

## 7) Hangi dosya/sayfada ne görmeyi beklemeliyim?
- İzleme merkezi: risk odaklı yeni metrik satırları
- Spektrofotometre: method listesinde yeni parametreler
- Üretim planı: teslim/garanti metadata alanları dolu planlar
- Öğrenme merkezi: güven etiketi olan konu kartları
- Tank detayları: müdahale ve batch geçmişinde daha zengin kayıtlar

Bu görünüm farkları, esas olarak **arkaya yazılan veri setinin zenginleşmesinden** kaynaklanır.

---

## 8) Sonuç
Senin istediğin şekilde: ana iş **kod değiştirmek değil, veritabanı kayıtlarını inceleme planına göre zenginleştirmek**.

- Önce veri/seed güncellemesi yapılır.
- Sonra gerekiyorsa çok küçük UI alan gösterimleri eklenir.
- Böylece sistem, belge bilgisini operasyonel olarak kullanır hale gelir.

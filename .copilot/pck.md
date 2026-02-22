# PROGRAMCININ CEBKITABI (pck.md)

Kural: Append-only. Satir silinmez, yalnizca yeni kayit eklenir.

## Amaç
- Moduller, siniflar, metotlar ve sorumluluklarin tek yerde izlenmesi.
- Bir sonraki programcinin neyin nerede oldugunu hizli anlamasi.
- Islem yapildikca ilgili modul kaydina tarihli ekleme yapilmasi.

## Kayit Formati
- Tarih:
- Dosya:
- Modul/Sinif:
- Metot/Fonksiyonlar:
- Amac:
- Degisiklik:
- Etki:

---

## 2026-02-22 Baslangic Envanteri

### 1) Uygulama giris ve iskelet
- Dosya: `src/main.jsx`
  - Modul: uygulama girisi
  - Amac: React uygulamasini baslatmak, `App` ve providerlari yuklemek
- Dosya: `src/App.jsx`
  - Modul: tab tabanli ana uygulama kabugu
  - Amac: ekranlar arasi gecis ve ana veri akisinin cati yonetimi

### 2) Context katmani
- Dosya: `src/contexts/EnforcedChlorellaSystemContext.jsx`
  - Modul: merkez sistem durumu yonetimi
  - Amac: tank, biyoloji, kimya ve model state akisinin tek kaynaktan yonetimi
- Dosya: `src/contexts/MaterialsContext.jsx`
  - Modul: malzeme ve alisveris state yonetimi
  - Amac: stok, alisveris listesi, stok hareketleri, fatura/KDV alanlari

### 3) Manager katmani
- Dosya: `src/managers/ModelManager.js`
  - Sinif/Modul: ModelManager
  - Amac: tank simulasyonlari, gercek veri asimilasyonu, model zaman adimi
- Dosya: `src/managers/LearningEngine.js`
  - Sinif/Modul: LearningEngine
  - Amac: model parametrelerini hata geri bildirimi ile optimize etmek
- Dosya: `src/managers/RecommendationEngine.js`
  - Sinif/Modul: RecommendationEngine
  - Amac: risk skorlama ve mudahale/oneriler

### 4) Worker katmani
- Dosya: `src/workers/SimulationWorker.js`
  - Modul: arka plan simulasyon iscisi
  - Amac: periyodik simulasyon, catch-up hesap, bildirim ve risk guncelleme

### 5) Veri katmani
- Dosya: `src/data/chemicalDatabase.js`
- Dosya: `src/data/chemicalLibrary.js`
- Dosya: `src/data/expandedChemicalDatabase.js`
  - Modul: kimyasal kaynaklar
  - Amac: kimyasal maddeler, ozellikler ve hesap girdileri icin referans veri

### 6) Bu oturum degisikligi
- Degisiklik: Copilot iletisim katmani dosyalari olusturuldu (`ai_referansbelge.md`, `todo.md`, `notlar.md`, `pck.md`).
- Etki: gelistirme sureci ve bilgi devri icin izlenebilir altyapi kuruldu.

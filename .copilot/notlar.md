# NOTLAR (APPEND-ONLY)

Kural: Bu dosyada satir silinmez; sadece yeni not eklenir.

## 2026-02-22
- Yeni sistem kurulumu baslatildi.
- Yarım kalan is olursa bu dosyada "yarim kalan" etiketi ile kayit acilacak.
- Git push her adimda hedeflenir; push engeli olursa commit ile yerel yedek zorunludur.

## 2026-02-22 EK NOT
- Yerel git deposu baslatildi ve ilk commit alindi: `0be2092`.
- GitHub'a gonderim adimi icin remote henüz tanimli degil.

## 2026-02-22 EK NOT-2
- Durum/log commit alindi: `35dea82`.
- PCK envanter commit alindi: `82c8780`.

## 2026-02-22 EK NOT-3
- SSH ile push denemesi `Permission denied (publickey)` nedeniyle basarisiz oldu.
- `origin` HTTPS'e cevrildi: `https://github.com/metedinler/ChlorellaOS.git`
- Push basarili: `master -> origin/master`

## 2026-02-23 EK NOT
- Cift tab nedeni: `package.json (vite --open)` + `vite.config.js (open:true)` + `launcher Start-Process`.
- Duzeltme: `package.json` scriptlerinden `--open` kaldirildi, `vite.config.js` icin `open:false` yapildi.
- Son durum: tarayici acilisi sadece launcher uzerinden.

## 2026-02-23 EK NOT-2
- `alisveris listelerim.txt (1)` kaynagi envantere islenmeye baslandi ve 2026-02 tarihli yeni kayitlar `src/data/systemDataExtended.js` icine eklendi.
- 1. kimyasaldepom listesinde KDV (%20) + kargo (993 TL) kalemlere paylastirildi (`shippingCost: 20.69` / kalem).
- Kimyalab/Oksilab/Elektromarket/Trendyol/Letgo kalemleri eklenirken KDV dahil-dahil degil bilgisi kayit bazinda ayristirildi.
- BBM/BS11 stok kayitlari `Besi Yeri Stok` kategorisinde veri katmanina eklendi.
- Onceki AI KDV uyarisi dogrulandi: `RecommendationEngine` tarafinda maliyet hesabi KDV ile her zaman tutarli degil; sonraki fazda cost pipeline teklestirilmeli.

## 2026-02-23 EK NOT-3
- Gorunurluk kok nedeni dogrulandi: UI, `systemDataExtended.js` yerine once `localStorage/chlorellaMaterials` verisini kullaniyor.
- Duzeltme: `MaterialsContext` icine otomatik birlestirme eklendi; kayitli veride eksik kalan 2026-02 kurumsal alimlari otomatik append ediyor.
- Kullanici talebi dogrultusunda 2 yedek dosya isimleri korunarak guncellendi:
	- `chlorella_materials_2026-02-22.json`
	- `C:/Users/mete/Downloads/malzeme_yedek_2026-02-22T23-32-43.json`
- BBM/BS11 kayitlari stok cozelti akisina uygun metadata ile guncellendi (`stockSolutionMode`, `mediumCode`, `compatibleMedia`).

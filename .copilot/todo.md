# TODO (APPEND-ONLY)

Kural: Bu dosyada satir silinmez. Tamamlanan isler `bitti` olarak kapanir.

## 2026-02-22
- [acik] Copilot iletisim katmani dosyalarini standartlastir (`ai_referansbelge.md`, `pck.md`, `memory.md`, `todo.md`, `notlar.md`)
- [acik] Her ise baslarken okunacak belge sirasini netlestir ve is akisina ekle
- [acik] Git adim bazli yedekleme ritmi kur (degisiklik -> stage -> commit)

## 2026-02-22 DURUM GUNCELLEME
- [bitti] Copilot iletisim katmani dosyalari olusturuldu.
- [bitti] Okuma sirasi `.copilot/.promt.md` dosyasina eklendi.
- [devam] GitHub push adimi bekliyor (uzak depo bilgisi gerekli olabilir).
- [log] Yerel yedek commit: `0be2092`

## 2026-02-22 DURUM GUNCELLEME-2
- [bitti] `pck.md` icine aktif `src` modullerinin sinif/fonksiyon envanteri eklendi.
- [devam] Kalan adim: GitHub remote bagla ve push.

## 2026-02-22 DURUM GUNCELLEME-3
- [bitti] GitHub remote baglandi (`origin`).
- [bitti] Commitler GitHub'a push edildi (`master -> origin/master`).

## 2026-02-23 CALISTIRMA SISTEMI GUNCELLEME
- [bitti] Tek giris noktasi `start.bat -> ChlorellaOS_Launcher.ps1` olarak korundu.
- [bitti] Cift tab sorunu giderildi (Vite auto-open kapatildi, acilis launcher'da tek kaynaga indirildi).
- [bitti] Launcher `npm install` cagri yolu Windows uyumlu hale getirildi (`cmd /c npm ...`).

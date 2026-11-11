# Hotline Biro Umum — Dashboard

Dashboard Layanan Terpadu Hotline Biro Umum Setjen MPR RI.

- **Frontend:** file statis di repository ini (GitHub Pages).
- **Backend:** Google Apps Script (`Kode.gs`), dipanggil lewat `fetch()` ke URL `/exec`.

## Struktur

```
index.html      halaman dashboard (satu halaman, navigasi tanpa muat ulang)
css/style.css   tampilan, termasuk mode gelap
js/config.js    ← ISI GAS_URL di sini
js/app.js       logika dashboard
```

## Satu-satunya yang perlu diubah

Buka `js/config.js`, ganti `GAS_URL` dengan URL Web App Apps Script yang berakhiran `/exec`.

## Tautan langsung ke tiket

`https://USERNAME.github.io/hotline-biro-umum/?tiket=BU-00001/001` membuka detail sub-tiket setelah login. Link ini dipakai otomatis di notifikasi WhatsApp.

Panduan lengkap: `PANDUAN-INSTALASI.md`.

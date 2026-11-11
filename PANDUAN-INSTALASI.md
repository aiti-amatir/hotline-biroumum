# Panduan Instalasi — Hotline Biro Umum (Apps Script + GitHub Pages)

Mulai versi ini aplikasi dibagi dua:

| Bagian | Tempat | Isi |
|---|---|---|
| **Backend** | Google Apps Script (terikat ke Google Sheet) | `Kode.gs` saja. Melayani robot WhatsApp (webhook Fonnte) dan API dashboard. |
| **Frontend** | GitHub Pages | `index.html`, `css/`, `js/` dari file **hotline-biro-umum.zip** |

Robot WhatsApp, data di Google Sheet, Script Properties, dan pengaturan Fonnte **tidak berubah**. URL webhook Fonnte tetap sama.

---

## Bagian A — Perbarui backend (Apps Script)

1. Buka Google Sheet "Hotline Biro Umum — Database" → **Ekstensi → Apps Script**.
2. Buka file **Kode.gs**, hapus seluruh isinya, tempel isi **Kode.gs** yang baru, lalu simpan.
3. **Hapus** file `Index`, `Stylesheet`, dan `JavaScript` di Apps Script (klik ⋮ di samping nama file → Hapus). Tampilan dashboard sekarang ada di GitHub, jadi file itu tidak dipakai lagi.
   - Belum pernah memasang? Ikuti dulu Langkah 1–5 di `PANDUAN_SETUP.md` (Sheet, `setupAppEnvironment`, Fonnte, Groq, Script Properties, `aktifkanSuperAdmin`), tetapi lewati bagian menambah tiga file HTML.
4. Terbitkan ulang:
   - **Sudah pernah deploy:** **Terapkan (Deploy) → Kelola deployment → ✏️ → Versi: Versi baru → Terapkan**. URL `/exec` tetap sama.
   - **Belum pernah:** **Terapkan → Deployment baru → ⚙️ Aplikasi web**, *Jalankan sebagai*: **Saya**, *Yang memiliki akses*: **Siapa saja**, lalu **Terapkan**.
5. Salin **URL aplikasi web** (berakhiran `/exec`).
6. Uji: tempel URL itu di browser. Harus muncul teks seperti
   `{"success":true,"data":{"aplikasi":"Hotline Biro Umum API",...},"message":"API aktif"}`.
   Kalau yang muncul halaman login Google, ubah akses menjadi **Siapa saja**.

> ⚠️ Setiap kali `Kode.gs` diubah, ulangi langkah 4 (Versi baru). Tanpa itu, perubahan tidak berlaku.

---

## Bagian B — Siapkan frontend

1. Ekstrak **hotline-biro-umum.zip**, misalnya ke `Documents\hotline-biro-umum`.
2. Buka `js\config.js` dengan Notepad, ganti baris:
   ```js
   const GAS_URL = 'https://script.google.com/macros/s/XXXX/exec';
   ```
   dengan URL `/exec` dari Bagian A langkah 5. Simpan.

> URL `/exec` aman berada di repository publik. Semua data tetap dilindungi login (username/nomor WA + password + OTP) yang diperiksa di server.

---

## Bagian C — Unggah ke GitHub Pages

### C1. Pasang Git (sekali saja)

- **Windows:** unduh dari https://git-scm.com/download/win, pasang dengan pilihan bawaan. Buka **PowerShell**.
- **Mac:** buka Terminal, ketik `git --version`; bila belum ada, macOS menawarkan pemasangan.

Cek: `git --version` → muncul nomor versi.

### C2. Akun GitHub & identitas Git (sekali saja)

1. Daftar di https://github.com. Username akan menjadi bagian alamat: `USERNAME.github.io`.
2. Di terminal:
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "email-akun-github@contoh.com"
   ```

### C3. Buat repository

github.com → tombol **+** → **New repository**:
- Nama: `hotline-biro-umum`
- **Public** (wajib untuk GitHub Pages gratis)
- **Jangan** centang README, .gitignore, atau license

### C4. Masuk ke folder yang BENAR

Folder kerjanya adalah folder hasil ekstraksi ZIP, **yang langsung berisi `index.html`**.

```powershell
cd "$HOME\Documents\hotline-biro-umum"
dir
```

Yang harus terlihat:

```
css\
js\
index.html
PANDUAN-INSTALASI.md
README.md
```

❗ Kalau yang terlihat justru satu folder lagi bernama `hotline-biro-umum`, masuk dulu ke dalamnya (`cd hotline-biro-umum`), lalu `dir` lagi. Jangan lanjut sebelum `index.html` terlihat.

> 💡 Cara cepat Windows: buka folder itu di File Explorer, klik address bar, ketik `powershell`, Enter.

### C5. Kirim ke GitHub (satu per satu)

```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/hotline-biro-umum.git
git push -u origin main
```

- Perhatikan **titik** di `git add .`
- Saat `git push` meminta **Password**, yang dimasukkan adalah **Personal Access Token**, bukan password akun. Saat ditempel, layar tetap kosong; itu normal. Tekan Enter.
- Membuat token: https://github.com/settings/tokens → **Generate new token (classic)** → centang **repo** → **Generate** → salin `ghp_...` (hanya tampil sekali).

Berhasil bila muncul `Writing objects: 100%` dan `* [new branch] main -> main`.

### C6. Aktifkan GitHub Pages

Repository → **Settings → Pages**:

| Kolom | Nilai |
|---|---|
| Source | Deploy from a branch |
| Branch | `main` · `/ (root)` |
| Enforce HTTPS | ✅ |

Klik **Save**, tunggu 1–2 menit, lalu muat ulang. Alamat dashboard:
**https://USERNAME.github.io/hotline-biro-umum/**

---

## Bagian D — Hubungkan link notifikasi WhatsApp

Link di pesan WhatsApp untuk admin sekarang menuju GitHub Pages, misalnya
`https://USERNAME.github.io/hotline-biro-umum/?tiket=BU-00001/001`.

- **Otomatis:** buka dashboard GitHub Pages lalu login sebagai **Super Admin**. Bila pengaturan `LINK_DASHBOARD` masih kosong, alamat halaman disimpan sendiri dan muncul pesan *"Alamat dashboard disimpan…"*.
- **Manual:** dashboard → **Robot AI → Operasional → Alamat dashboard untuk link notifikasi**, isi alamat GitHub Pages, lalu simpan. Bisa juga di tab **Pengaturan** di Google Sheet, baris `LINK_DASHBOARD`.

---

## Bagian E — Uji coba

1. Buka alamat GitHub Pages → login **superadmin** + password.
2. Daftarkan admin bagian di **Admin Terdaftar** bila belum.
3. Dari HP lain kirim "halo" ke nomor WA Biro Umum → robot membalas format.
4. Buat satu permintaan sampai tiket terbentuk → admin Biro Umum menerima WA berisi link → link membuka detail tiket di dashboard setelah login.

---

## Memperbarui tampilan nanti

Ubah file di folder yang sama, lalu:

```bash
git add .
git commit -m "Perbarui dashboard"
git push
```

GitHub Pages memperbarui dalam 1–2 menit. Bila masih tampil versi lama, tekan **Ctrl+Shift+R**.

---

## Masalah yang sering muncul

| Gejala | Penyebab | Yang dilakukan |
|---|---|---|
| Login: "Alamat API belum diatur" | `GAS_URL` di `js/config.js` belum diisi | Isi, lalu `git add .` → `git commit -m "isi GAS_URL"` → `git push` |
| Login: "Balasan server bukan JSON" | Akses deploy bukan **Siapa saja**, atau URL bukan `/exec` | Perbaiki deploy (Bagian A langkah 4) atau URL |
| Login: "Koneksi ke server gagal" | URL salah ketik / internet | Cek URL dengan membukanya di browser (Bagian A langkah 6) |
| Perubahan `Kode.gs` tidak berlaku | Belum deploy versi baru | Kelola deployment → ✏️ → Versi baru |
| Situs 404 | `index.html` tidak di root repository | Lihat repository di github.com; bila terlihat folder, push ulang dari folder yang berisi `index.html` |
| Tampilan tanpa warna/tata letak | Folder `css/`, `js/` tidak ikut | Jangan unggah lewat "Upload files"; gunakan `git push` dari terminal |
| Link di WA kosong | `LINK_DASHBOARD` belum diisi | Bagian D |
| Robot tidak membalas | Webhook Fonnte / deploy | Webhook Fonnte = URL `/exec` yang sama; Autoread **On**; akses **Siapa saja** |
| `Password authentication is not supported` | GitHub menolak password akun | Gunakan Personal Access Token (C5) |

'use strict';
/**
 * ============================================================
 *  HOTLINE BIRO UMUM — Frontend (SPA)
 *  Prinsip: data dimuat sekali per sesi (dashMuatAwal), lalu
 *  navigasi, filter, pencarian, dan kalender berjalan lokal (0 ms).
 *  Aksi admin diperbarui di layar seketika (optimistis) dan
 *  disinkronkan ke server di latar belakang.
 * ============================================================
 */

// ════════════════════════════════════════════════════════
// 1. KONFIGURASI
// ════════════════════════════════════════════════════════
const MENU = {
  beranda:    { label: 'Beranda', ikon: 'bi-grid-1x2', grup: 'Utama' },
  tiket:      { label: 'Tiket Masuk', ikon: 'bi-inbox', grup: 'Operasional', pendek: 'Tiket' },
  pertanyaan: { label: 'Pertanyaan Robot', ikon: 'bi-patch-question', grup: 'Operasional', pendek: 'Pertanyaan' },
  permintaan: { label: 'Permintaan', ikon: 'bi-clipboard-check', grup: 'Operasional' },
  semua:      { label: 'Semua Sub-tiket', ikon: 'bi-diagram-3', grup: 'Operasional', pendek: 'Sub-tiket' },
  kalender:   { label: 'Kalender & Jadwal', ikon: 'bi-calendar-check', grup: 'Operasional', pendek: 'Kalender' },
  riwayat:    { label: 'Riwayat', ikon: 'bi-clock-history', grup: 'Operasional' },
  master:     { label: 'Data Master', ikon: 'bi-database', grup: 'Pengaturan' },
  admin:      { label: 'Admin Terdaftar', ikon: 'bi-people', grup: 'Pengaturan', pendek: 'Admin' },
  robot:      { label: 'Robot AI', ikon: 'bi-robot', grup: 'Pengaturan' },
  ujicoba:    { label: 'Uji Coba Robot', ikon: 'bi-chat-dots', grup: 'Pengaturan', pendek: 'Uji Coba' },
  percakapan: { label: 'Riwayat Percakapan', ikon: 'bi-chat-left-text', grup: 'Pengaturan', pendek: 'Percakapan' },
  profil:     { label: 'Profil', ikon: 'bi-person-circle', grup: null }
};
const MENU_PERAN = {
  'Super Admin':  ['beranda', 'tiket', 'pertanyaan', 'semua', 'kalender', 'riwayat', 'master', 'admin', 'robot', 'ujicoba', 'percakapan'],
  'Biro Umum':    ['beranda', 'tiket', 'pertanyaan', 'semua', 'kalender', 'riwayat'],
  'BMN':          ['beranda', 'permintaan', 'kalender', 'riwayat'],
  'Angkutan':     ['beranda', 'permintaan', 'kalender', 'riwayat', 'master'],
  'Pemeliharaan': ['beranda', 'permintaan', 'kalender', 'riwayat'],
  'Pengamanan':   ['beranda', 'permintaan', 'riwayat']
};
// Navigasi bawah HP: [kiri, kiri, TENGAH, kanan] + Profil
const NAV_BAWAH = {
  'Super Admin':  ['beranda', 'pertanyaan', 'tiket', 'kalender'],
  'Biro Umum':    ['beranda', 'pertanyaan', 'tiket', 'kalender'],
  'BMN':          ['beranda', 'kalender', 'permintaan', 'riwayat'],
  'Angkutan':     ['beranda', 'kalender', 'permintaan', 'riwayat'],
  'Pemeliharaan': ['beranda', 'kalender', 'permintaan', 'riwayat'],
  'Pengamanan':   ['beranda', null, 'permintaan', 'riwayat']
};
const HAL_EDIT = ['admin', 'master', 'robot', 'ujicoba'];   // tidak digambar ulang saat sinkron latar
const AKHIR = ['Selesai', 'Dibatalkan'];
const MENUNGGU = ['Menunggu Persetujuan', 'Menunggu Persetujuan Ulang'];
const WARNA_STATUS = {
  'Open': 't-biru', 'In Progress': 't-oranye', 'Selesai': 't-hijau', 'Dibatalkan': 't-merah',
  'Menunggu Persetujuan': 't-kuning', 'Menunggu Persetujuan Ulang': 't-kuning', 'Disetujui': 't-toska',
  'Menunggu Penerusan': 't-kuning', 'Diteruskan': 't-biru', 'Menunggu': 't-kuning', 'Dijawab': 't-hijau'
};
const WARNA_BAGIAN = { Pemeliharaan: '#2f5bea', Angkutan: '#0e9f6e', BMN: '#d97706', Pengamanan: '#dc2626' };
const IKON_BAGIAN = { Pemeliharaan: 'bi-tools', Angkutan: 'bi-car-front', BMN: 'bi-building', Pengamanan: 'bi-shield-check' };
const LABEL_PENGATURAN = {
  PERAN: 'Peran & tugas robot', GAYA_BAHASA: 'Gaya bahasa', BATASAN: 'Batasan', KALIMAT_RAGU: 'Kalimat saat robot ragu',
  BOT_AKTIF: 'Robot aktif', FORWARD_OTOMATIS: 'Forward otomatis oleh robot', NOMOR_BIRO_UMUM: 'Nomor WA Biro Umum (Fonnte)',
  LINK_DASHBOARD: 'Alamat dashboard untuk link notifikasi', LOGO_URL: 'Alamat gambar logo', HARI_CEK_GANDA: 'Rentang cek laporan ganda (hari)',
  JUMLAH_RIWAYAT: 'Jumlah pesan yang diingat robot', BATAS_PENGETAHUAN: 'Batas pengetahuan per pesan (karakter)',
  MODEL_AI: 'Model AI utama', MODEL_CADANGAN: 'Model AI cadangan', SIGAP_SPREADSHEET_ID: 'ID spreadsheet SIGAP TANGGAP', SIGAP_NAMA_SHEET: 'Nama sheet SIGAP TANGGAP'
};
const KELOMPOK_ROBOT = {
  kepribadian: ['PERAN', 'GAYA_BAHASA', 'BATASAN', 'KALIMAT_RAGU'],
  operasional: ['BOT_AKTIF', 'FORWARD_OTOMATIS', 'NOMOR_BIRO_UMUM', 'LINK_DASHBOARD', 'LOGO_URL', 'HARI_CEK_GANDA', 'JUMLAH_RIWAYAT', 'BATAS_PENGETAHUAN', 'MODEL_AI', 'MODEL_CADANGAN', 'SIGAP_SPREADSHEET_ID', 'SIGAP_NAMA_SHEET']
};
const PILIHAN_PENGATURAN = { BOT_AKTIF: ['YA', 'TIDAK'], FORWARD_OTOMATIS: ['TIDAK', 'YA'] };
const PANJANG_PENGATURAN = ['PERAN', 'GAYA_BAHASA', 'BATASAN', 'KALIMAT_RAGU'];
const CDN = {
  xlsx: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  jspdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  autotable: 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'
};
const BATAS_TAMPIL = 60;

// ════════════════════════════════════════════════════════
// 2. STATE & PENYIMPANAN LOKAL
// ════════════════════════════════════════════════════════
const S = {
  token: null, data: null, hal: 'beranda', filter: {}, batas: {}, tertunda: 0, sinkron: false, timer: null,
  gen: 0, perluUlang: false, janjiSinkron: null,
  kal: { bulan: null, pilih: null }, robotTab: 'kepribadian', masterTab: null,
  uji: { riwayat: [], draf: null, chat: [] }, loginKode: '', loginPaksa: false
};

function ambilLS(k, json) {
  try { const v = localStorage.getItem(k); return json ? (v ? JSON.parse(v) : null) : v; } catch (e) { return null; }
}
function simpanLS(k, v) {
  try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { /* penuh / diblokir */ }
}
function hapusLS(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } }
function simpanCacheData() { if (S.data) simpanLS('bu_data', S.data); }

// ════════════════════════════════════════════════════════
// 3. KOMUNIKASI SERVER
// ════════════════════════════════════════════════════════
/**
 * Memanggil fungsi di Kode.gs (Google Apps Script) lewat fetch ke URL /exec.
 * Body dikirim sebagai text/plain agar browser tidak mengirim CORS preflight
 * (Apps Script tidak melayani OPTIONS). Semua fungsi mengembalikan { success, data, message }.
 */
const BATAS_WAKTU_API = 60000;
function api(fn, ...args) {
  if (!GAS_URL || /XXXX/.test(GAS_URL)) {
    return Promise.reject(new Error('Alamat API belum diatur. Isi GAS_URL di js/config.js dengan URL /exec dari Apps Script.'));
  }
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const jam = ctrl ? setTimeout(() => ctrl.abort(), BATAS_WAKTU_API) : null;
  return fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ api: fn, args }),
    redirect: 'follow',
    signal: ctrl ? ctrl.signal : undefined
  })
    .then(res => {
      if (!res.ok) throw new Error('Server membalas HTTP ' + res.status + '.');
      return res.text();
    })
    .then(teks => {
      let r;
      try { r = JSON.parse(teks); } catch (e) {
        throw new Error('Balasan server bukan JSON. Pastikan deploy Apps Script: Execute as "Me", akses "Anyone", lalu GAS_URL berakhiran /exec.');
      }
      if (r && r.success) return r.data;
      const pesan = (r && r.message) || 'Terjadi kesalahan.';
      if (/Sesi habis/.test(pesan)) sesiHabis();
      throw new Error(pesan);
    }, e => {
      if (e && /Server membalas|bukan JSON/.test(e.message)) throw e;
      if (e && e.name === 'AbortError') throw new Error('Server terlalu lama merespons. Coba lagi.');
      throw new Error(navigator.onLine === false ? 'Tidak ada koneksi internet.' : 'Koneksi ke server gagal. Periksa GAS_URL dan akses deploy "Anyone".');
    })
    .finally(() => { if (jam) clearTimeout(jam); });
}

/**
 * Super Admin yang membuka dashboard dari GitHub Pages: bila LINK_DASHBOARD masih kosong,
 * alamat halaman ini disimpan otomatis supaya link di notifikasi WA langsung benar.
 */
function isiLinkDashboardOtomatis() {
  const d = S.data || {};
  if (S._linkDiisi || !Array.isArray(d.pengaturan) || !/^https:$/.test(location.protocol)) return;
  const baris = d.pengaturan.find(p => p.kunci === 'LINK_DASHBOARD');
  if (!baris || String(baris.nilai || '').trim()) return;
  S._linkDiisi = true;
  const alamat = location.origin + location.pathname.replace(/index\.html?$/i, '');
  api('dashSimpanPengaturan', S.token, { LINK_DASHBOARD: alamat })
    .then(() => { baris.nilai = alamat; simpanCacheData(); toast('Alamat dashboard disimpan untuk link notifikasi WA.'); })
    .catch(() => { S._linkDiisi = false; });
}

/**
 * Memuat seluruh data dashboard (satu panggilan). diam = tanpa mengganggu layar.
 * Data server yang dimuat sebelum aksi terakhir dianggap basi: dibuang lalu dimuat ulang,
 * agar tidak menimpa perubahan yang baru saja dilakukan admin.
 */
function segarkan(diam) {
  if (!S.token) return Promise.reject(new Error('Belum masuk.'));
  if (S.sinkron) { S.perluUlang = true; return S.janjiSinkron; }
  S.sinkron = true;
  S.perluUlang = false;
  const gen = S.gen;
  tandaiSinkron();
  S.janjiSinkron = api('dashMuatAwal', S.token).then(d => {
    S.sinkron = false;
    const basi = gen !== S.gen || S.tertunda > 0;
    if (!basi) {
      const pertama = !S.data || !document.body.classList.contains('masuk');
      S.data = d;
      simpanCacheData();
      if (pertama) tampilAplikasi(); else renderUlang();
      isiLinkDashboardOtomatis();
    }
    tandaiSinkron();
    if ((basi || S.perluUlang) && S.tertunda === 0) setTimeout(() => segarkan(true).catch(() => {}), 200);
  }).catch(e => {
    S.sinkron = false;
    tandaiSinkron();
    if (!diam) toast(e.message, 'galat');
    throw e;
  });
  return S.janjiSinkron;
}

function tandaiSinkron() {
  const sibuk = S.sinkron || S.tertunda > 0;
  ['ikonSegar'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('berputar', sibuk); });
  document.querySelectorAll('.ikon-segar-hp').forEach(el => el.classList.toggle('berputar', sibuk));
  const ind = document.getElementById('indikatorSinkron');
  if (ind) ind.textContent = S.tertunda > 0 ? 'Menyimpan…' : S.sinkron ? 'Menyinkronkan…' : '';
}

/**
 * Aksi optimistis: layar diperbarui seketika, server dipanggil di latar.
 * Jika server menolak, data dikembalikan ke kondisi sebelum aksi.
 */
function optimis({ lokal, server, sukses }) {
  const cadangan = JSON.stringify(S.data);
  S.gen++;
  try { if (lokal) lokal(S.data); } catch (e) { console.warn(e); }
  simpanCacheData();
  renderUlang(true);
  if (sukses) toast(sukses, 'sukses');
  S.tertunda++;
  tandaiSinkron();
  return api(...server).then(hasil => {
    S.tertunda--;
    tandaiSinkron();
    segarkan(true).catch(() => {});
    return hasil;
  }).catch(e => {
    S.tertunda--;
    S.data = JSON.parse(cadangan);
    simpanCacheData();
    renderUlang(true);
    tandaiSinkron();
    toast('Gagal disimpan: ' + e.message, 'galat');
    throw e;
  });
}

// Pantau perubahan dari WA / admin lain: cek versi ringan tiap 40 detik
function mulaiPantau() {
  clearInterval(S.timer);
  S.timer = setInterval(cekVersi, 40000);
}
function cekVersi() {
  if (!S.token || !S.data || S.sinkron || document.hidden) return;
  api('dashVersi', S.token).then(v => { if (v && v.versi !== S.data.versi) segarkan(true).catch(() => {}); }).catch(() => {});
}

// ════════════════════════════════════════════════════════
// 4. UTILITAS
// ════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
function esc(s) {
  return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function hariIni() { return ymd(new Date()); }
function keTanggal(v) {
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { const p = v.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  const d = new Date(v); return isNaN(d) ? null : d;
}
function tglPendek(v) { const d = keTanggal(v); return d ? d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear() : (v || '-'); }
function tglPanjang(v) { const d = keTanggal(v); return d ? HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear() : (v || '-'); }
function jamDari(v) { const d = keTanggal(v); return d && !/^\d{4}-\d{2}-\d{2}$/.test(v) ? String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0') : ''; }
function waktuLengkap(v) { const j = jamDari(v); return tglPendek(v) + (j ? ' · ' + j + ' WIB' : ''); }
function ymdDari(v) { const d = keTanggal(v); return d ? ymd(d) : ''; }
function samaBulan(v) { const d = keTanggal(v), k = new Date(); return d && d.getMonth() === k.getMonth() && d.getFullYear() === k.getFullYear(); }
function keJamInput(w) { const m = String(w || '').match(/(\d{1,2})[.:](\d{2})/); return m ? m[1].padStart(2, '0') + ':' + m[2] : ''; }
function rentangTgl(r) {
  if (!r || !r.tanggal_mulai) return '';
  return tglPanjang(r.tanggal_mulai) + (r.tanggal_selesai && r.tanggal_selesai !== r.tanggal_mulai ? ' – ' + tglPanjang(r.tanggal_selesai) : '');
}
function pil(status, kecil) { return `<span class="pil ${kecil ? 'kecil ' : ''}${WARNA_STATUS[status] || 't-biru'}">${esc(status || '-')}</span>`; }
function chipBagian(b) { return `<span class="chip"><span class="bul" style="background:${WARNA_BAGIAN[b] || '#888'}"></span>${esc(b)}</span>`; }
function judulSub(s) { const r = s.rincian || {}; return r.nama_acara || s.ringkasan || r.ringkasan || s.jenis || '-'; }
function lokasiSub(s) { const r = s.rincian || {}; return r.tempat ? (s.bagian === 'Angkutan' ? 'Tujuan: ' : '') + r.tempat : ''; }
function jadwalSub(s) { const r = s.rincian || {}; return r.tanggal_mulai ? tglPendek(r.tanggal_mulai) + (r.tanggal_selesai && r.tanggal_selesai !== r.tanggal_mulai ? ' – ' + tglPendek(r.tanggal_selesai) : '') : ''; }
function ringkasRincian(r) {
  if (!r) return '-';
  const b = [];
  if (r.ringkasan) b.push(r.ringkasan);
  if (r.nama_acara) b.push('Acara: ' + r.nama_acara);
  if (r.tempat) b.push((r.bagian === 'Angkutan' ? 'Tujuan: ' : 'Tempat: ') + r.tempat);
  if (r.tanggal_mulai) b.push('Tanggal: ' + rentangTgl(r));
  if (r.waktu) b.push('Waktu: ' + r.waktu);
  if (r.jumlah) b.push('Jumlah: ' + r.jumlah);
  if (r.driver) b.push('Driver: ' + r.driver);
  if (r.mobil) b.push('Mobil: ' + r.mobil);
  return b.join('\n');
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function salin(o) { return JSON.parse(JSON.stringify(o)); }
function peran() { return S.data ? S.data.profil.bagian : ''; }
function pusat() { return ['Super Admin', 'Biro Umum'].includes(peran()); }
function menuSaya() { return MENU_PERAN[peran()] || ['beranda']; }
function daftarSub() { return (S.data && S.data.sub) || []; }
function cariSub(no) { return daftarSub().find(s => s.no === no); }
function cariTiket(no) { return ((S.data && S.data.tiket) || []).find(t => t.no === no); }
function mintaBatal(s) { return /^BATAL/.test(s.permintaan || ''); }
function adaPermintaanStaf(s) { return !!s.permintaan && !AKHIR.includes(s.status); }
function perluTindakan(s) {
  if (AKHIR.includes(s.status)) return false;
  if (adaPermintaanStaf(s)) return true;
  if (s.bagian === 'BMN' || s.bagian === 'Angkutan') return MENUNGGU.includes(s.status) || s.status === 'Disetujui';
  return s.status === 'Open';
}
function waLink(n) { return 'https://wa.me/' + String(n || '').replace(/[^0-9]/g, ''); }

// ════════════════════════════════════════════════════════
// 5. TOAST & MODAL
// ════════════════════════════════════════════════════════
function toast(teks, jenis) {
  const w = $('toastWadah');
  const el = document.createElement('div');
  const ikon = jenis === 'sukses' ? 'bi-check-circle-fill' : jenis === 'galat' ? 'bi-exclamation-octagon-fill' : 'bi-info-circle-fill';
  el.className = 'toast-item ' + (jenis || 'info');
  el.setAttribute('role', jenis === 'galat' ? 'alert' : 'status');
  el.innerHTML = `<i class="bi ${ikon}"></i><div>${esc(teks)}</div>`;
  w.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; setTimeout(() => el.remove(), 260); }, jenis === 'galat' ? 5200 : 3000);
}

let fokusSebelum = null;
function bukaModal(judul, isi, kaki, opsi) {
  fokusSebelum = document.activeElement;
  $('modalJudul').textContent = judul;
  $('modalIsi').innerHTML = isi;
  $('modalKaki').innerHTML = kaki || '';
  const kotak = document.querySelector('.modal-kotak');
  kotak.classList.toggle('lebar', !!(opsi && opsi.lebar));
  $('modal').classList.remove('tersembunyi');
  $('modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const f = $('modalIsi').querySelector('[autofocus], .input, .area, .pilih'); if (f && !(opsi && opsi.tanpaFokus)) f.focus(); }, 60);
}
function tutupModal() {
  $('modal').classList.add('tersembunyi');
  $('modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  $('modalIsi').innerHTML = '';     // buang elemen lama agar ID form tidak dobel
  $('modalKaki').innerHTML = '';
  if (fokusSebelum && fokusSebelum.focus && document.contains(fokusSebelum)) fokusSebelum.focus();
}

// ════════════════════════════════════════════════════════
// 6. TEMA
// ════════════════════════════════════════════════════════
function gantiTema() {
  const baru = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', baru);
  simpanLS('bu_tema', baru);
  document.querySelectorAll('[data-aksi="tema"] i').forEach(i => { i.className = 'bi ' + (baru === 'dark' ? 'bi-sun' : 'bi-moon-stars'); });
}

// ════════════════════════════════════════════════════════
// 7. LOGIN (nomor + password + OTP WhatsApp)
// ════════════════════════════════════════════════════════
function tampilLogin() {
  document.body.classList.remove('masuk');
  $('layarMuat').classList.add('tersembunyi');
  $('aplikasi').classList.add('tersembunyi');
  $('layarLogin').classList.remove('tersembunyi');
  ulangLogin();
}
function ulangLogin() {
  $('formLogin1').classList.remove('tersembunyi');
  $('loginPilih').classList.add('tersembunyi');
  $('formLogin2').classList.add('tersembunyi');
  $('lgOtp').value = '';
}
function login1(paksa) {
  const nomor = $('lgNomor').value.trim(), pw = $('lgPw').value;
  if (!nomor || pw.length < 8) { toast('Isi nomor WhatsApp/username dan password (minimal 8 karakter).', 'galat'); return; }
  const btn = $('btnMasuk');
  btn.disabled = true; btn.innerHTML = '<span class="berputar"><i class="bi bi-arrow-repeat"></i></span> Memeriksa…';
  api('masukLangkah1', nomor, pw, !!paksa).then(r => {
    btn.disabled = false; btn.textContent = 'Masuk';
    $('formLogin1').classList.add('tersembunyi');
    if (r.status === 'PILIH') {
      $('teksPilih').textContent = 'Admin ' + r.bagian + ' (' + r.namaLain + ') masih masuk. Satu bagian hanya boleh dipakai satu admin. Jika dilanjutkan, akun tersebut akan dikeluarkan.';
      $('loginPilih').classList.remove('tersembunyi');
      return;
    }
    $('loginPilih').classList.add('tersembunyi');
    if (r.status === 'MASUK') { masukDenganToken(r.token); return; }   // Super Admin: tanpa OTP
    S.loginKode = r.kode;
    $('teksKode').textContent = r.teks;
    $('menitKode').textContent = r.menit;
    const wa = $('linkWa');
    wa.classList.toggle('tersembunyi', !r.nomorBiroUmum);
    if (r.nomorBiroUmum) wa.href = 'https://wa.me/' + r.nomorBiroUmum + '?text=' + encodeURIComponent(r.teks);
    $('formLogin2').classList.remove('tersembunyi');
    $('lgOtp').focus();
  }).catch(e => { btn.disabled = false; btn.textContent = 'Masuk'; toast(e.message, 'galat'); });
}
function login2() {
  const otp = $('lgOtp').value.trim();
  if (!/^\d{6}$/.test(otp)) { toast('Masukkan 6 angka OTP.', 'galat'); return; }
  const btn = $('btnOtp');
  btn.disabled = true; btn.textContent = 'Memverifikasi…';
  api('masukLangkah2', S.loginKode, otp).then(r => masukDenganToken(r.token))
    .catch(e => toast(e.message, 'galat'))
    .finally(() => { btn.disabled = false; btn.textContent = 'Verifikasi'; });
}
function masukDenganToken(token) {
  S.token = token;
  simpanLS('bu_tok', token);
  hapusLS('bu_data');
  $('lgPw').value = '';
  $('layarLogin').classList.add('tersembunyi');
  $('layarMuat').classList.remove('tersembunyi');
  return segarkan(false).catch(e => { toast(e.message, 'galat'); $('layarMuat').classList.add('tersembunyi'); $('layarLogin').classList.remove('tersembunyi'); });
}
function keluar() {
  const tok = S.token;
  if (tok) api('keluarDashboard', tok).catch(() => {});
  bersihkanSesi();
  tampilLogin();
  toast('Anda sudah keluar.', 'info');
}
function sesiHabis() {
  if (!S.token) return;
  bersihkanSesi();
  tampilLogin();
  toast('Sesi berakhir. Silakan masuk lagi.', 'info');
}
function bersihkanSesi() {
  S.token = null; S.data = null; S.filter = {}; S.batas = {};
  hapusLS('bu_tok'); hapusLS('bu_data'); hapusLS('bu_hal');
  clearInterval(S.timer);
  tutupModal();
}

// ════════════════════════════════════════════════════════
// 8. KERANGKA APLIKASI & NAVIGASI (instan, tanpa server)
// ════════════════════════════════════════════════════════
function tampilAplikasi() {
  document.body.classList.add('masuk');
  $('layarMuat').classList.add('tersembunyi');
  $('layarLogin').classList.add('tersembunyi');
  $('aplikasi').classList.remove('tersembunyi');
  const p = S.data.profil;
  $('avatarHuruf').textContent = (p.nama || p.bagian || 'A').trim().charAt(0).toUpperCase();
  $('akunNama').textContent = p.nama || p.bagian;
  $('akunBagian').textContent = p.bagian + (p.nomor ? ' · ' + p.nomor : '');
  if (S.data.app && S.data.app.logo) document.querySelectorAll('.logo-box').forEach(el => { el.innerHTML = `<img src="${esc(S.data.app.logo)}" alt="Logo">`; });
  const tema = document.documentElement.getAttribute('data-theme');
  document.querySelectorAll('[data-aksi="tema"] i').forEach(i => { i.className = 'bi ' + (tema === 'dark' ? 'bi-sun' : 'bi-moon-stars'); });
  susunNav();
  const simpanan = ambilLS('bu_hal');
  navigasi(menuSaya().includes(simpanan) || simpanan === 'profil' ? simpanan : 'beranda');
  mulaiPantau();
  bukaTautanAwal();
}

/** Link dari notifikasi WA: ?tiket=BU-00001/001 (atau #BU-00001/001) membuka detail sub-tiket. */
function tautanAwal() {
  let k = '';
  try { k = new URLSearchParams(location.search).get('tiket') || decodeURIComponent(location.hash.replace(/^#\/?/, '')); } catch (e) { k = ''; }
  return String(k || '').trim().replace(/^\/+/, '').toUpperCase();
}
const BUKA_AWAL = tautanAwal();
function bersihkanTautan() {
  try { if (location.search || location.hash) history.replaceState(null, '', location.pathname); } catch (e) { /* abaikan */ }
}
function bukaTautanAwal() {
  const k = BUKA_AWAL;
  if (k) bersihkanTautan();
  if (!k || S._tautanDibuka) return;
  S._tautanDibuka = true;
  if (/^BU-\d{5}\/\d{3}$/.test(k)) {
    if (cariSub(k)) { navigasi(pusat() ? 'semua' : 'permintaan'); bukaSub(k); }
  } else if (/^BU-\d{5}$/.test(k) && pusat() && cariTiket(k)) {
    navigasi('tiket'); bukaTiket(k);
  }
}

function hitungBadge(hal) {
  const d = S.data || {};
  if (hal === 'tiket') return (d.tiket || []).filter(t => t.status === 'Menunggu Penerusan').length;
  if (hal === 'pertanyaan') return (d.pertanyaan || []).filter(q => q.status === 'Menunggu').length;
  if (hal === 'permintaan') return daftarSub().filter(perluTindakan).length;
  return 0;
}

function susunNav() {
  const menu = menuSaya();
  let html = '', grup = '';
  menu.forEach(id => {
    const m = MENU[id];
    if (m.grup !== grup) { grup = m.grup; html += `<div class="nav-grup">${esc(grup)}</div>`; }
    const n = hitungBadge(id);
    html += `<button class="nav-item${S.hal === id ? ' aktif' : ''}" data-aksi="nav" data-hal="${id}" ${S.hal === id ? 'aria-current="page"' : ''}>
      <i class="bi ${m.ikon}"></i><span>${esc(m.label)}</span>${n ? `<span class="jml">${n}</span>` : ''}</button>`;
  });
  $('navSamping').innerHTML = html;

  const bawah = NAV_BAWAH[peran()] || ['beranda'];
  let nb = '';
  bawah.forEach((id, i) => {
    if (!id || !menu.includes(id)) return;
    const m = MENU[id], n = hitungBadge(id), aktif = S.hal === id ? ' aktif' : '';
    if (i === 2) {
      nb += `<button class="nb-item nb-tengah${aktif}" data-aksi="nav" data-hal="${id}" aria-label="${esc(m.label)}"><span class="bulat"><i class="bi ${m.ikon}"></i></span><span>${esc(m.pendek || m.label)}</span>${n ? `<span class="titik">${n}</span>` : ''}</button>`;
    } else {
      nb += `<button class="nb-item${aktif}" data-aksi="nav" data-hal="${id}"><i class="bi ${m.ikon}"></i><span>${esc(m.pendek || m.label)}</span>${n ? `<span class="titik">${n}</span>` : ''}</button>`;
    }
  });
  const lainAktif = S.hal === 'profil' || !bawah.includes(S.hal);
  nb += `<button class="nb-item${lainAktif ? ' aktif' : ''}" data-aksi="nav" data-hal="profil"><i class="bi bi-person-circle"></i><span>Profil</span></button>`;
  $('navBawah').innerHTML = nb;
}

/** Navigasi SPA: hanya menampilkan/menyembunyikan section (0 ms). */
function navigasi(hal, filterAwal) {
  if (hal !== 'profil' && !menuSaya().includes(hal)) hal = 'beranda';
  S.hal = hal;
  simpanLS('bu_hal', hal);
  if (filterAwal) S.filter[hal] = Object.assign(filterDefault(hal), filterAwal);
  document.querySelectorAll('.hal').forEach(s => s.classList.toggle('aktif', s.dataset.hal === hal));
  $('judulHal').textContent = MENU[hal].label;
  document.title = MENU[hal].label + ' · Hotline Biro Umum';
  susunNav();
  renderHal(hal, true);
  $('menuAkun').classList.add('tersembunyi');
  window.scrollTo(0, 0);
}

/** Gambar ulang setelah data berubah. Halaman isian tidak digambar ulang saat sinkron latar. */
function renderUlang(paksa) {
  if (!S.data) return;
  susunNav();
  if (!paksa && HAL_EDIT.includes(S.hal)) return;
  renderHal(S.hal, false);
}

const HALAMAN = {};
function renderHal(hal, penuh) {
  const sec = document.querySelector(`.hal[data-hal="${hal}"]`);
  const h = HALAMAN[hal];
  if (!sec || !h) return;
  if (penuh || !sec.dataset.siap) {
    sec.innerHTML = h.kerangka ? h.kerangka() : '<div data-isi></div>';
    sec.dataset.siap = '1';
  }
  const isi = sec.querySelector('[data-isi]');
  if (isi && h.isi) isi.innerHTML = h.isi();
  if (h.setelah) h.setelah();
}
function renderIsi() { renderHal(S.hal, false); }

// ════════════════════════════════════════════════════════
// 9. BERANDA
// ════════════════════════════════════════════════════════
function kpi(angka, label, ikon, warna, ke, filter) {
  return `<button class="kpi" data-aksi="kpi" data-hal="${ke}" data-filter='${esc(JSON.stringify(filter || {}))}'>
    <span class="kpi-ikon ${warna}"><i class="bi ${ikon}"></i></span>
    <span><span class="kpi-angka d-block">${angka}</span><span class="kpi-label d-block">${esc(label)}</span></span></button>`;
}
function notifSub(s) {
  const r = s.rincian || {};
  const ikonWarna = MENUNGGU.includes(s.status) ? 't-kuning' : adaPermintaanStaf(s) ? 't-merah' : s.status === 'Disetujui' ? 't-toska' : 't-biru';
  const ket = adaPermintaanStaf(s) ? (mintaBatal(s) ? 'Permintaan pembatalan dari staf' : 'Permintaan perubahan dari staf')
    : s.status === 'Disetujui' ? 'Perlu diisi form pencatatan' : MENUNGGU.includes(s.status) ? 'Menunggu persetujuan Anda' : 'Belum diproses';
  return `<li><button class="notif" data-aksi="buka-sub" data-id="${esc(s.no)}">
    <span class="notif-ikon ${ikonWarna}"><i class="bi ${IKON_BAGIAN[s.bagian] || 'bi-clipboard'}"></i></span>
    <span class="notif-isi"><span class="notif-judul d-block">${esc(s.no)} · ${esc(judulSub(s))}</span><span class="notif-sub d-block">${esc(ket)}${s.nama ? ' · ' + esc(s.nama) : ''}</span></span>
    <span class="notif-kanan">${pil(s.status, true)}<span class="meta">${r.tanggal_mulai ? esc(tglPendek(r.tanggal_mulai)) : esc(tglPendek(s.waktuTiket || s.diperbarui))}</span></span>
  </button></li>`;
}
function notifTiket(t) {
  return `<li><button class="notif" data-aksi="buka-tiket" data-id="${esc(t.no)}">
    <span class="notif-ikon t-kuning"><i class="bi bi-inbox"></i></span>
    <span class="notif-isi"><span class="notif-judul d-block">${esc(t.no)} · ${esc(t.jenis)}</span><span class="notif-sub d-block">${esc(t.nama)} (${esc(t.unit)}) · Rekomendasi: ${esc(t.rekomendasi.join(', ') || '-')}</span></span>
    <span class="notif-kanan">${pil(t.status, true)}<span class="meta">${esc(waktuLengkap(t.waktu))}</span></span>
  </button></li>`;
}
function notifTanya(q) {
  return `<li><button class="notif" data-aksi="jawab" data-id="${esc(q.id)}">
    <span class="notif-ikon t-ungu"><i class="bi bi-patch-question"></i></span>
    <span class="notif-isi"><span class="notif-judul d-block">Robot bertanya · ${esc(q.nama || q.nomor)}</span><span class="notif-sub d-block">${esc(q.tanya)}</span></span>
    <span class="notif-kanan">${pil(q.status, true)}<span class="meta">${esc(waktuLengkap(q.waktu))}</span></span>
  </button></li>`;
}

HALAMAN.beranda = {
  isi() {
    const d = S.data, p = d.profil, b = p.bagian, sub = daftarSub(), hi = hariIni();
    const nama = p.nama || ('Admin ' + b);
    const jam = new Date().getHours();
    const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
    let kartuKpi = '', notif = '', judulNotif = 'Perlu Tindakan', ringkas = [];
    const jadwalHariIni = acaraTanggal(hi);

    if (pusat()) {
      const tiket = d.tiket || [];
      const menunggu = tiket.filter(t => t.status === 'Menunggu Penerusan');
      const tanya = (d.pertanyaan || []).filter(q => q.status === 'Menunggu');
      const aktif = sub.filter(s => !AKHIR.includes(s.status));
      const tiketHariIni = tiket.filter(t => ymdDari(t.waktu) === hi);
      const selesaiBulan = sub.filter(s => s.status === 'Selesai' && samaBulan(s.diperbarui));
      kartuKpi = `<div class="grid-kpi lima">
        ${kpi(tiketHariIni.length, 'Tiket hari ini', 'bi-envelope-paper', 't-biru', 'tiket', { status: 'Semua', dari: hi, sampai: hi })}
        ${kpi(menunggu.length, 'Menunggu penerusan', 'bi-hourglass-split', 't-kuning', 'tiket', { status: 'Menunggu Penerusan' })}
        ${kpi(tanya.length, 'Pertanyaan robot', 'bi-patch-question', 't-ungu', 'pertanyaan', {})}
        ${kpi(aktif.length, 'Sedang diproses bagian', 'bi-tools', 't-oranye', 'semua', { status: 'aktif' })}
        ${kpi(selesaiBulan.length, 'Selesai bulan ini', 'bi-check2-circle', 't-hijau', 'riwayat', { status: 'Selesai' })}</div>`;
      notif = tanya.slice(0, 5).map(notifTanya).join('') + menunggu.slice(0, 8).map(notifTiket).join('');
      if (d.app.forwardOtomatis) ringkas.push('Forward otomatis aktif: robot langsung meneruskan permintaan ke bagian terkait.');
      ringkas.push(`${tiketHariIni.length} tiket masuk hari ini, ${menunggu.length} menunggu diteruskan, dan ${aktif.length} sub-tiket masih diproses di bagian.`);
      const perBagian = {};
      aktif.forEach(s => { perBagian[s.bagian] = (perBagian[s.bagian] || 0) + 1; });
      const teratas = Object.entries(perBagian).sort((a, c) => c[1] - a[1])[0];
      if (teratas) ringkas.push(`Beban terbanyak saat ini ada di ${teratas[0]} (${teratas[1]} sub-tiket aktif).`);
      if (tanya.length) ringkas.push(`${tanya.length} pertanyaan robot menunggu jawaban; staf terkait sedang menunggu kabar.`);
    } else {
      const tindakan = sub.filter(perluTindakan);
      const selesaiBulan = sub.filter(s => s.status === 'Selesai' && samaBulan(s.diperbarui));
      const permintaanStaf = sub.filter(adaPermintaanStaf);
      if (b === 'BMN' || b === 'Angkutan') {
        const menunggu = sub.filter(s => MENUNGGU.includes(s.status));
        const disetujui = sub.filter(s => s.status === 'Disetujui');
        kartuKpi = `<div class="grid-kpi lima">
          ${kpi(menunggu.length, 'Menunggu persetujuan', 'bi-hourglass-split', 't-kuning', 'permintaan', { status: 'menunggu' })}
          ${kpi(disetujui.length, 'Perlu pencatatan', 'bi-pencil-square', 't-toska', 'permintaan', { status: 'Disetujui' })}
          ${kpi(jadwalHariIni.length, 'Jadwal hari ini', 'bi-calendar-event', 't-biru', 'kalender', {})}
          ${kpi(permintaanStaf.length, 'Batal / ubah dari staf', 'bi-arrow-repeat', 't-merah', 'permintaan', { status: 'staf' })}
          ${kpi(selesaiBulan.length, 'Selesai bulan ini', 'bi-check2-circle', 't-hijau', 'riwayat', { status: 'Selesai' })}</div>`;
        ringkas.push(`${menunggu.length} permintaan menunggu persetujuan dan ${disetujui.length} perlu diisi form pencatatan.`);
      } else {
        const open = sub.filter(s => s.status === 'Open'), proses = sub.filter(s => s.status === 'In Progress');
        kartuKpi = `<div class="grid-kpi ${b === 'Pemeliharaan' ? 'lima' : 'empat'}">
          ${kpi(open.length, 'Open', 'bi-folder2-open', 't-biru', 'permintaan', { status: 'Open' })}
          ${kpi(proses.length, 'Sedang dikerjakan', 'bi-tools', 't-oranye', 'permintaan', { status: 'In Progress' })}
          ${b === 'Pemeliharaan' ? kpi(jadwalHariIni.length, 'Jadwal hari ini', 'bi-calendar-event', 't-toska', 'kalender', {}) : ''}
          ${kpi(permintaanStaf.length, 'Batal / ubah dari staf', 'bi-arrow-repeat', 't-merah', 'permintaan', { status: 'staf' })}
          ${kpi(selesaiBulan.length, 'Selesai bulan ini', 'bi-check2-circle', 't-hijau', 'riwayat', { status: 'Selesai' })}</div>`;
        ringkas.push(`${open.length} permintaan belum dikerjakan dan ${proses.length} sedang dikerjakan.`);
      }
      if (permintaanStaf.length) ringkas.push(`${permintaanStaf.length} permintaan pembatalan/perubahan dari staf perlu ditinjau; status tidak berubah sampai Anda mengubahnya.`);
      if (jadwalHariIni.length) ringkas.push(`Ada ${jadwalHariIni.length} kegiatan terjadwal hari ini.`);
      notif = tindakan.slice(0, 10).map(notifSub).join('');
    }

    const punyaKalender = menuSaya().includes('kalender');
    const panelJadwal = punyaKalender ? `<div class="kartu">
        <div class="kartu-kepala"><h3><i class="bi bi-list-task"></i> Jadwal hari ini <span class="jumlah-pil">${jadwalHariIni.length}</span></h3>
        <button class="tombol kecil garis" data-aksi="nav" data-hal="kalender">Kalender</button></div>
        ${daftarJadwal(jadwalHariIni, 'Tidak ada kegiatan hari ini.')}</div>` : '';

    return `
      <div class="sapaan-hp"><div class="kecil">${salam},</div><div class="besar">${esc(nama)}</div><span class="peran">${esc(b)}</span></div>
      <div class="sapaan-laptop"><h2>Halo, ${esc(nama)}</h2><p>Ringkasan layanan Hotline Biro Umum · ${esc(b)} · ${esc(tglPanjang(hi))}</p></div>
      ${kartuKpi}
      <div class="grid-beranda ${panelJadwal ? 'dua' : ''}">
        <div class="kartu">
          <div class="kartu-kepala"><h3><i class="bi bi-bell"></i> ${judulNotif}</h3>${notif ? '' : ''}</div>
          ${notif ? `<ul class="daftar-notif">${notif}</ul>` : `<div class="kosong"><i class="bi bi-check2-all"></i>Semua sudah ditangani. Tidak ada yang perlu tindakan.</div>`}
        </div>
        <div class="d-grid gap-3 align-content-start">
          ${panelJadwal}
          <div class="kartu ringkasan"><i class="bi bi-stars"></i><div><div class="fw-bold mb-1">Ringkasan otomatis</div><p>${ringkas.map(esc).join(' ')}</p></div></div>
        </div>
      </div>`;
  }
};

// ════════════════════════════════════════════════════════
// 10. FILTER BERSAMA
// ════════════════════════════════════════════════════════
function filterDefault(hal) {
  if (hal === 'tiket') return { q: '', status: 'Menunggu Penerusan', bagian: '', dari: '', sampai: '' };
  if (hal === 'riwayat') return { q: '', status: 'akhir', bagian: '', dari: '', sampai: '' };
  if (hal === 'pertanyaan') return { q: '', status: 'Menunggu' };
  return { q: '', status: 'aktif', bagian: '', dari: '', sampai: '' };
}
function F(hal) { if (!S.filter[hal]) S.filter[hal] = filterDefault(hal); return S.filter[hal]; }
function cocokTeks(q, bagian) { if (!q) return true; const k = q.toLowerCase(); return bagian.some(x => String(x || '').toLowerCase().includes(k)); }
function dalamRentang(tgl, dari, sampai) { if (!dari && !sampai) return true; if (!tgl) return false; return (!dari || tgl >= dari) && (!sampai || tgl <= sampai); }
function barFilter(hal, opsi) {
  const f = F(hal);
  return `<div class="bar-filter">
    <div class="input-ikon cari"><i class="bi bi-search"></i><input class="input" data-filter="q" data-hal="${hal}" value="${esc(f.q)}" placeholder="${esc(opsi.cari)}" aria-label="Cari"></div>
    ${opsi.bagian ? `<select class="pilih" data-filter="bagian" data-hal="${hal}" aria-label="Filter bagian"><option value="">Semua bagian</option>${S.data.bagianList.map(b => `<option ${f.bagian === b ? 'selected' : ''}>${b}</option>`).join('')}</select>` : ''}
    ${opsi.tanggal !== false ? `<div class="rentang"><input type="date" class="input" data-filter="dari" data-hal="${hal}" value="${esc(f.dari)}" aria-label="Dari tanggal"><span>–</span><input type="date" class="input" data-filter="sampai" data-hal="${hal}" value="${esc(f.sampai)}" aria-label="Sampai tanggal"></div>` : ''}
    <button class="tombol garis" data-aksi="reset-filter" data-hal="${hal}">Reset</button>
  </div>`;
}
function tabStatus(hal, daftar, nilai) {
  return `<div class="tab-pil" role="tablist">${daftar.map(([v, label, n]) =>
    `<button role="tab" class="${nilai === v ? 'aktif' : ''}" aria-selected="${nilai === v}" data-aksi="tab-status" data-hal="${hal}" data-nilai="${esc(v)}">${esc(label)}${n !== undefined ? ' (' + n + ')' : ''}</button>`).join('')}</div>`;
}
function tombolLebih(hal, total) {
  const batas = S.batas[hal] || BATAS_TAMPIL;
  return total > batas ? `<div class="lebih"><button class="tombol garis" data-aksi="lebih" data-hal="${hal}">Tampilkan ${Math.min(BATAS_TAMPIL, total - batas)} lagi</button></div>` : '';
}
function tombolEkspor(hal) {
  return `<button class="tombol garis kecil" data-aksi="ekspor" data-hal="${hal}" data-format="xlsx"><i class="bi bi-file-earmark-excel"></i> Excel</button>
    <button class="tombol garis kecil" data-aksi="ekspor" data-hal="${hal}" data-format="pdf"><i class="bi bi-file-earmark-pdf"></i> PDF</button>`;
}

// ════════════════════════════════════════════════════════
// 11. TIKET MASUK (Biro Umum & Super Admin)
// ════════════════════════════════════════════════════════
function tiketTersaring() {
  const f = F('tiket');
  return (S.data.tiket || []).filter(t =>
    (f.status === 'Semua' || t.status === f.status) &&
    (!f.bagian || t.rekomendasi.includes(f.bagian) || daftarSub().some(s => s.tiket === t.no && s.bagian === f.bagian)) &&
    dalamRentang(ymdDari(t.waktu), f.dari, f.sampai) &&
    cocokTeks(f.q, [t.no, t.nama, t.unit, t.jenis, t.deskripsi, t.nomor]));
}
HALAMAN.tiket = {
  kerangka() {
    return `<div class="kepala-hal"><div><h2>Tiket Masuk</h2><div class="sub">${S.data.app.forwardOtomatis ? 'Forward otomatis aktif — daftar ini untuk dipantau.' : 'Periksa rekomendasi robot, lalu teruskan ke bagian.'}</div></div>
      <div class="aksi-kepala">${tombolEkspor('tiket')}</div></div>
      <div data-isi></div>`;
  },
  isi() {
    const semua = S.data.tiket || [], f = F('tiket');
    const hit = st => semua.filter(t => st === 'Semua' || t.status === st).length;
    const daftar = tiketTersaring(), batas = S.batas.tiket || BATAS_TAMPIL, tampil = daftar.slice(0, batas);
    const baris = tampil.map(t => `<tr data-aksi="buka-tiket" data-id="${esc(t.no)}">
      <td><div class="sel-utama">${esc(t.no)}</div><div class="sel-sub">${esc(waktuLengkap(t.waktu))}</div></td>
      <td><div class="sel-utama">${esc(t.nama)}</div><div class="sel-sub">${esc(t.unit)}</div></td>
      <td class="sel-batas"><div class="sel-utama">${esc(t.jenis)}</div><div class="sel-sub">${esc(t.deskripsi)}</div></td>
      <td><div class="d-flex flex-wrap gap-1">${(t.rekomendasi.length ? t.rekomendasi : ['-']).map(b => b === '-' ? '-' : chipBagian(b)).join('')}</div></td>
      <td>${pil(t.status)}</td>
      <td><div class="aksi-baris"><button class="ikon-tombol" data-aksi="buka-tiket" data-id="${esc(t.no)}" aria-label="Lihat ${esc(t.no)}"><i class="bi bi-eye"></i></button></div></td></tr>`).join('');
    const kartu = tampil.map(t => `<button class="kartu-item" data-aksi="buka-tiket" data-id="${esc(t.no)}">
      <div class="ki-atas"><span class="ki-no">${esc(t.no)}</span>${pil(t.status, true)}</div>
      <div class="ki-judul">${esc(t.jenis)}</div>
      <div class="ki-baris"><i class="bi bi-person"></i><span>${esc(t.nama)} · ${esc(t.unit)}</span></div>
      <div class="ki-baris"><i class="bi bi-calendar3"></i><span>${esc(waktuLengkap(t.waktu))}</span></div>
      <div class="ki-baris"><i class="bi bi-diagram-3"></i><span>${esc(t.rekomendasi.join(', ') || '-')}</span></div>
      <div class="ki-ket">${esc(t.deskripsi)}</div></button>`).join('');
    return `${tabStatus('tiket', [['Menunggu Penerusan', 'Menunggu', hit('Menunggu Penerusan')], ['Diteruskan', 'Diteruskan', hit('Diteruskan')], ['Selesai', 'Selesai', hit('Selesai')], ['Dibatalkan', 'Dibatalkan', hit('Dibatalkan')], ['Semua', 'Semua', semua.length]], f.status)}
      <div class="kartu">${barFilter('tiket', { cari: 'Cari nomor tiket, nama, unit, deskripsi…', bagian: true })}
        <div class="jumlah-hasil">${daftar.length} tiket</div>
        ${daftar.length ? `<div class="hanya-laptop tabel-wadah"><table class="tabel"><thead><tr><th>Tiket</th><th>Pemohon</th><th>Permintaan</th><th>Rekomendasi</th><th>Status</th><th></th></tr></thead><tbody>${baris}</tbody></table></div>
        <div class="hanya-hp daftar-kartu">${kartu}</div>${tombolLebih('tiket', daftar.length)}` : '<div class="kosong"><i class="bi bi-inbox"></i>Tidak ada tiket untuk filter ini.</div>'}
      </div>`;
  }
};

function bukaTiket(no) {
  const t = cariTiket(no);
  if (!t) { toast('Tiket tidak ditemukan. Coba muat ulang.', 'galat'); return; }
  const subs = daftarSub().filter(s => s.tiket === t.no);
  const bisaTeruskan = t.status === 'Menunggu Penerusan' && !S.data.app.forwardOtomatis;
  const isi = `
    <div class="d-flex flex-wrap gap-2 mb-3">${pil(t.status)}${t.rekomendasi.map(chipBagian).join('')}</div>
    <div class="detail-blok"><div class="detail-judul">Pemohon</div>
      <dl class="detail-baris"><dt>Nama</dt><dd>${esc(t.nama)}</dd><dt>Unit kerja</dt><dd>${esc(t.unit)}</dd>
      <dt>WhatsApp</dt><dd><a href="${waLink(t.nomor)}" target="_blank" rel="noopener">${esc(t.nomor)}</a></dd><dt>Masuk</dt><dd>${esc(waktuLengkap(t.waktu))}</dd></dl></div>
    <div class="detail-blok"><div class="detail-judul">Permintaan</div><div class="detail-kotak"><b>${esc(t.jenis)}</b>\n${esc(t.deskripsi)}</div></div>
    ${t.rincian.length ? `<div class="detail-blok"><div class="detail-judul">Rincian dari robot</div>${t.rincian.map(r => `<div class="detail-kotak mb-2"><b>${esc(r.bagian)}</b>\n${esc(ringkasRincian(r))}</div>`).join('')}</div>` : ''}
    ${subs.length ? `<div class="detail-blok"><div class="detail-judul">Sub-tiket</div><div class="d-grid gap-2">${subs.map(s => `<button class="jadwal-item" data-aksi="buka-sub" data-id="${esc(s.no)}"><span class="garis-bagian" style="background:${WARNA_BAGIAN[s.bagian]}"></span><span class="jadwal-isi"><span class="atas"><b>${esc(s.no)}</b>${pil(s.status, true)}</span><span class="lokasi">${esc(s.bagian)}${s.permintaan ? ' · ' + esc(s.permintaan) : ''}</span></span><i class="bi bi-chevron-right"></i></button>`).join('')}</div></div>` : ''}
    ${bisaTeruskan ? `<div class="detail-blok"><div class="detail-judul">Teruskan ke bagian</div>
      <div class="centang-grup" id="pilihBagian">${S.data.bagianList.map(b => `<label class="centang ${t.rekomendasi.includes(b) ? 'rekom' : ''}"><input type="checkbox" value="${b}" ${t.rekomendasi.includes(b) ? 'checked' : ''}><span>${b}</span>${t.rekomendasi.includes(b) ? '<span class="rk">AI</span>' : ''}</label>`).join('')}</div>
      <div class="bantu">Centang yang ditandai AI adalah rekomendasi robot. Boleh memilih lebih dari satu bagian.</div></div>` : ''}`;
  const kaki = bisaTeruskan ? `<button class="tombol garis" data-aksi="tutup-modal">Tutup</button><button class="tombol utama" data-aksi="teruskan" data-id="${esc(t.no)}"><i class="bi bi-send"></i> Teruskan</button>` : '';
  bukaModal(t.no, isi, kaki, { lebar: true, tanpaFokus: true });
}

function teruskan(no) {
  const pilih = [...document.querySelectorAll('#pilihBagian input:checked')].map(i => i.value);
  if (!pilih.length) { toast('Centang minimal satu bagian.', 'galat'); return; }
  tutupModal();
  optimis({
    sukses: 'Diteruskan ke ' + pilih.join(', ') + '. Admin bagian dikabari lewat WhatsApp.',
    lokal: d => {
      const t = d.tiket.find(x => x.no === no);
      t.status = 'Diteruskan';
      pilih.forEach(b => {
        if (d.sub.some(s => s.tiket === no && s.bagian === b && s.status !== 'Dibatalkan')) return;
        const r = t.rincian.find(x => x.bagian === b) || { bagian: b, ringkasan: t.deskripsi };
        d.sub.unshift({ no: no + '/…', tiket: no, bagian: b, ringkasan: r.ringkasan || t.deskripsi, rincian: r, status: ['BMN', 'Angkutan'].includes(b) ? 'Menunggu Persetujuan' : 'Open',
          catatan: '', permintaan: '', oleh: 'Anda', diperbarui: new Date().toISOString(), nama: t.nama, unit: t.unit, jenis: t.jenis, deskripsi: t.deskripsi, nomorPemohon: t.nomor, waktuTiket: t.waktu });
      });
    },
    server: ['dashTeruskan', S.token, no, pilih]
  }).catch(() => {});
}

// ════════════════════════════════════════════════════════
// 12. PERTANYAAN ROBOT
// ════════════════════════════════════════════════════════
HALAMAN.pertanyaan = {
  kerangka() {
    return `<div class="kepala-hal"><div><h2>Pertanyaan Robot</h2><div class="sub">Robot tidak yakin dan meminta penjelasan. Jawaban Anda menjadi pengetahuan baru, lalu robot otomatis melanjutkan percakapan dengan staf.</div></div></div><div data-isi></div>`;
  },
  isi() {
    const f = F('pertanyaan'), semua = S.data.pertanyaan || [];
    const daftar = semua.filter(q => (f.status === 'Semua' || q.status === f.status));
    return `${tabStatus('pertanyaan', [['Menunggu', 'Menunggu', semua.filter(q => q.status === 'Menunggu').length], ['Dijawab', 'Dijawab', semua.filter(q => q.status === 'Dijawab').length], ['Semua', 'Semua', semua.length]], f.status)}
      <div class="kartu">${daftar.length ? `<ul class="daftar-notif">${daftar.slice(0, 200).map(notifTanya).join('')}</ul>` : '<div class="kosong"><i class="bi bi-chat-square-heart"></i>Tidak ada pertanyaan.</div>'}</div>`;
  }
};
function bukaPertanyaan(id) {
  const q = (S.data.pertanyaan || []).find(x => x.id === id);
  if (!q) return;
  const menunggu = q.status === 'Menunggu';
  const isi = `<div class="d-flex gap-2 mb-3">${pil(q.status)}<span class="chip">${esc(waktuLengkap(q.waktu))}</span></div>
    <div class="detail-blok"><div class="detail-judul">Staf</div><dl class="detail-baris"><dt>Nama</dt><dd>${esc(q.nama || '-')}</dd><dt>WhatsApp</dt><dd><a href="${waLink(q.nomor)}" target="_blank" rel="noopener">${esc(q.nomor)}</a></dd></dl></div>
    <div class="detail-blok"><div class="detail-judul">Pesan staf</div><div class="detail-kotak">${esc(q.pesan)}</div></div>
    <div class="detail-blok"><div class="detail-judul">Pertanyaan robot</div><div class="peringatan biru"><i class="bi bi-robot"></i><span>${esc(q.tanya)}</span></div></div>
    ${menunggu ? `<label class="label" for="jawabanAdmin">Jawaban Anda</label><textarea id="jawabanAdmin" class="area" placeholder="Tulis jawaban yang juga berguna untuk pertanyaan serupa ke depannya" autofocus></textarea>
      <div class="bantu">Jawaban disimpan ke Pengetahuan robot, lalu robot langsung membalas staf.</div>`
      : `<div class="detail-blok"><div class="detail-judul">Jawaban admin</div><div class="detail-kotak">${esc(q.jawaban)}</div></div>`}`;
  bukaModal('Pertanyaan ' + q.id, isi, menunggu ? `<button class="tombol garis" data-aksi="tutup-modal">Batal</button><button class="tombol utama" data-aksi="kirim-jawaban" data-id="${esc(q.id)}"><i class="bi bi-send"></i> Kirim jawaban</button>` : '');
}
function kirimJawaban(id) {
  const j = ($('jawabanAdmin') || {}).value || '';
  if (!j.trim()) { toast('Jawaban masih kosong.', 'galat'); return; }
  tutupModal();
  optimis({
    sukses: 'Jawaban terkirim. Robot melanjutkan percakapan dengan staf.',
    lokal: d => { const q = d.pertanyaan.find(x => x.id === id); q.status = 'Dijawab'; q.jawaban = j.trim(); q.dijawab = new Date().toISOString(); },
    server: ['dashJawabPertanyaan', S.token, id, j.trim()]
  }).catch(() => {});
}

// ════════════════════════════════════════════════════════
// 13. DAFTAR SUB-TIKET (Permintaan, Semua Sub-tiket, Riwayat)
// ════════════════════════════════════════════════════════
function tglSub(s) { return (s.rincian && s.rincian.tanggal_mulai) || ymdDari(s.waktuTiket || s.diperbarui); }
function subTersaring(hal) {
  const f = F(hal);
  return daftarSub().filter(s => {
    if (f.status === 'aktif' && AKHIR.includes(s.status)) return false;
    if (f.status === 'akhir' && !AKHIR.includes(s.status)) return false;
    if (f.status === 'menunggu' && !MENUNGGU.includes(s.status)) return false;
    if (f.status === 'staf' && !adaPermintaanStaf(s)) return false;
    if (f.status === 'tindakan' && !perluTindakan(s)) return false;
    if (!['aktif', 'akhir', 'menunggu', 'staf', 'tindakan', 'Semua'].includes(f.status) && s.status !== f.status) return false;
    if (f.bagian && s.bagian !== f.bagian) return false;
    if (!dalamRentang(tglSub(s), f.dari, f.sampai)) return false;
    const r = s.rincian || {};
    return cocokTeks(f.q, [s.no, s.nama, s.unit, s.ringkasan, s.deskripsi, r.tempat, r.nama_acara, r.driver, r.mobil, s.bagian]);
  });
}
function opsiTabSub(hal) {
  const sub = daftarSub(), b = peran(), n = fn => sub.filter(fn).length;
  if (hal === 'riwayat') return [['akhir', 'Semua', n(s => AKHIR.includes(s.status))], ['Selesai', 'Selesai', n(s => s.status === 'Selesai')], ['Dibatalkan', 'Dibatalkan', n(s => s.status === 'Dibatalkan')]];
  const daftar = [['aktif', 'Aktif', n(s => !AKHIR.includes(s.status))]];
  if (hal === 'permintaan') daftar.push(['tindakan', 'Perlu tindakan', n(perluTindakan)]);
  const statusBagian = hal === 'semua' ? ['Open', 'In Progress', 'Menunggu Persetujuan', 'Disetujui'] : (S.data.statusSub[b] || []).filter(x => !AKHIR.includes(x));
  statusBagian.forEach(st => daftar.push([st, st, n(s => s.status === st)]));
  daftar.push(['staf', 'Batal/ubah staf', n(adaPermintaanStaf)]);
  daftar.push(['Semua', 'Semua', sub.length]);
  return daftar;
}
function halamanSub(hal, judul, sub) {
  return {
    kerangka() {
      return `<div class="kepala-hal"><div><h2>${judul}</h2><div class="sub">${sub()}</div></div><div class="aksi-kepala">${tombolEkspor(hal)}</div></div><div data-isi></div>`;
    },
    isi() {
      const f = F(hal), daftar = subTersaring(hal), batas = S.batas[hal] || BATAS_TAMPIL, tampil = daftar.slice(0, batas);
      const tampilBagian = pusat();
      const baris = tampil.map(s => {
        const r = s.rincian || {};
        return `<tr data-aksi="buka-sub" data-id="${esc(s.no)}">
          <td><div class="sel-utama">${esc(s.no)}</div><div class="sel-sub">Masuk ${esc(tglPendek(s.waktuTiket || s.diperbarui))}</div></td>
          ${tampilBagian ? `<td>${chipBagian(s.bagian)}</td>` : ''}
          <td><div class="sel-utama">${esc(s.nama || '-')}</div><div class="sel-sub">${esc(s.unit || '')}</div></td>
          <td class="sel-batas"><div class="sel-utama">${esc(judulSub(s))}</div><div class="sel-sub">${esc(lokasiSub(s) || s.deskripsi)}</div></td>
          <td><div class="sel-utama">${esc(jadwalSub(s) || '-')}</div><div class="sel-sub">${esc(r.waktu || '')}</div></td>
          <td><div class="d-flex flex-column align-items-start gap-1">${pil(s.status)}${adaPermintaanStaf(s) ? `<span class="pil kecil t-merah">${mintaBatal(s) ? 'Minta batal' : 'Minta ubah'}</span>` : ''}</div></td>
          <td><div class="aksi-baris"><button class="ikon-tombol" data-aksi="buka-sub" data-id="${esc(s.no)}" aria-label="Lihat ${esc(s.no)}"><i class="bi bi-eye"></i></button></div></td></tr>`;
      }).join('');
      const kartu = tampil.map(s => {
        const r = s.rincian || {};
        return `<button class="kartu-item" data-aksi="buka-sub" data-id="${esc(s.no)}">
          <div class="ki-atas"><span class="ki-no">${esc(s.no)}</span>${pil(s.status, true)}${tampilBagian ? chipBagian(s.bagian) : ''}</div>
          <div class="ki-judul">${esc(judulSub(s))}</div>
          ${r.tempat ? `<div class="ki-baris"><i class="bi bi-geo-alt"></i><span>${esc(lokasiSub(s))}</span></div>` : ''}
          <div class="ki-baris"><i class="bi bi-person"></i><span>${esc(s.nama || '-')}${s.unit ? ' · ' + esc(s.unit) : ''}</span></div>
          ${r.tanggal_mulai ? `<div class="ki-baris"><i class="bi bi-calendar3"></i><span>${esc(jadwalSub(s))}${r.waktu ? ' · ' + esc(r.waktu) : ''}</span></div>` : ''}
          <div class="ki-ket">${esc(s.deskripsi)}</div>
          ${adaPermintaanStaf(s) ? `<div class="ki-peringatan"><i class="bi bi-exclamation-triangle"></i> ${esc(s.permintaan)}</div>` : ''}</button>`;
      }).join('');
      return `${tabStatus(hal, opsiTabSub(hal), f.status)}
        <div class="kartu">${barFilter(hal, { cari: 'Cari nomor, pemohon, tempat, acara…', bagian: tampilBagian })}
          <div class="jumlah-hasil">${daftar.length} sub-tiket</div>
          ${daftar.length ? `<div class="hanya-laptop tabel-wadah"><table class="tabel"><thead><tr><th>Sub-tiket</th>${tampilBagian ? '<th>Bagian</th>' : ''}<th>Pemohon</th><th>Permintaan</th><th>Jadwal</th><th>Status</th><th></th></tr></thead><tbody>${baris}</tbody></table></div>
          <div class="hanya-hp daftar-kartu">${kartu}</div>${tombolLebih(hal, daftar.length)}` : '<div class="kosong"><i class="bi bi-clipboard-check"></i>Tidak ada data untuk filter ini.</div>'}
        </div>`;
    }
  };
}
HALAMAN.permintaan = halamanSub('permintaan', 'Permintaan', () => {
  const b = peran();
  return b === 'BMN' || b === 'Angkutan' ? 'Setujui atau tolak permintaan, lalu isi form pencatatan.' : 'Perbarui status pekerjaan. Staf dikabari saat status Selesai.';
});
HALAMAN.semua = halamanSub('semua', 'Semua Sub-tiket', () => 'Pantau proses di setiap bagian.');
HALAMAN.riwayat = halamanSub('riwayat', 'Riwayat Permintaan', () => 'Permintaan yang sudah selesai atau dibatalkan.');

// ---------- Detail sub-tiket & aksi per peran ----------
function bukaSub(no) {
  const s = cariSub(no);
  if (!s) { toast('Sub-tiket tidak ditemukan. Coba muat ulang.', 'galat'); return; }
  const b = peran(), r = s.rincian || {}, akhir = AKHIR.includes(s.status), sementara = /…$/.test(s.no);
  let aksiIsi = '', kaki = '';
  if (!sementara && b === s.bagian) {
    if (b === 'Pemeliharaan' || b === 'Pengamanan') {
      if (!akhir) {
        const opsi = S.data.statusSub[b].filter(o => o !== 'Dibatalkan' || mintaBatal(s));
        aksiIsi = `<div class="detail-blok"><div class="detail-judul">Ubah status</div>
          <div class="segmen" id="segmenStatus">${opsi.map(o => `<button type="button" class="${o === s.status ? 'aktif' : ''}" data-aksi="pilih-status" data-nilai="${esc(o)}">${esc(o)}</button>`).join('')}</div>
          ${mintaBatal(s) ? '' : '<div class="bantu">Pilihan Dibatalkan muncul bila staf meminta pembatalan.</div>'}
          <label class="label" for="catatanStatus">Catatan <span class="opsional">(opsional)</span></label><input id="catatanStatus" class="input" value="${esc(s.catatan)}" placeholder="Mis. teknisi menuju lokasi"></div>`;
        kaki = `${b === 'Pemeliharaan' ? `<button class="tombol garis" data-aksi="pencatatan" data-id="${esc(s.no)}"><i class="bi bi-pencil-square"></i> ${r.tercatat ? 'Ubah pencatatan' : 'Isi pencatatan'}</button>` : ''}
          <button class="tombol utama" data-aksi="simpan-status" data-id="${esc(s.no)}"><i class="bi bi-check2"></i> Simpan status</button>`;
      }
    } else {
      const tombol = [];
      if (MENUNGGU.includes(s.status)) {
        tombol.push(`<button class="tombol bahaya" data-aksi="tolak" data-id="${esc(s.no)}"><i class="bi bi-x-circle"></i> Tolak</button>`);
        tombol.push(`<button class="tombol utama" data-aksi="setuju" data-id="${esc(s.no)}"><i class="bi bi-check2-circle"></i> Setujui</button>`);
      }
      if (s.status === 'Disetujui') tombol.push(`<button class="tombol utama" data-aksi="pencatatan" data-id="${esc(s.no)}"><i class="bi bi-pencil-square"></i> Isi pencatatan</button>`);
      if (s.status === 'Selesai') tombol.push(`<button class="tombol garis" data-aksi="pencatatan" data-id="${esc(s.no)}"><i class="bi bi-pencil-square"></i> Ubah pencatatan</button>`);
      if (b === 'BMN' && s.status !== 'Dibatalkan') tombol.push(`<button class="tombol garis" data-aksi="ubah-jadwal" data-id="${esc(s.no)}"><i class="bi bi-calendar2-week"></i> Ubah jadwal</button>`);
      if (!akhir && (b === 'BMN' || mintaBatal(s))) tombol.push(`<button class="tombol garis" data-aksi="batalkan" data-id="${esc(s.no)}"><i class="bi bi-slash-circle"></i> Batalkan</button>`);
      kaki = tombol.join('');
    }
  }
  const isi = `
    <div class="d-flex flex-wrap gap-2 mb-3">${pil(s.status)}${chipBagian(s.bagian)}${r.tercatat ? '<span class="pil kecil t-hijau"><i class="bi bi-journal-check"></i> Tercatat</span>' : ''}</div>
    ${sementara ? '<div class="peringatan biru mb-3"><i class="bi bi-arrow-repeat"></i><span>Sedang dibuat di server. Nomor sub-tiket akan muncul sebentar lagi.</span></div>' : ''}
    ${adaPermintaanStaf(s) ? `<div class="peringatan mb-3"><i class="bi bi-exclamation-triangle"></i><span><b>Permintaan staf:</b> ${esc(s.permintaan)}</span></div>` : ''}
    <div class="detail-blok"><div class="detail-judul">Pemohon</div>
      <dl class="detail-baris"><dt>Nama</dt><dd>${esc(s.nama || '-')}</dd><dt>Unit kerja</dt><dd>${esc(s.unit || '-')}</dd>
      ${s.nomorPemohon ? `<dt>WhatsApp</dt><dd><a href="${waLink(s.nomorPemohon)}" target="_blank" rel="noopener">${esc(s.nomorPemohon)}</a></dd>` : ''}
      <dt>Tiket</dt><dd>${esc(s.tiket)} · ${esc(waktuLengkap(s.waktuTiket))}</dd></dl></div>
    <div class="detail-blok"><div class="detail-judul">Permintaan</div><div class="detail-kotak"><b>${esc(s.jenis)}</b>\n${esc(s.deskripsi)}</div></div>
    <div class="detail-blok"><div class="detail-judul">Rincian ${esc(s.bagian)}</div><div class="detail-kotak">${esc(ringkasRincian(r))}</div></div>
    ${s.catatan ? `<div class="detail-blok"><div class="detail-judul">Catatan</div><div class="detail-kotak">${esc(s.catatan)}</div></div>` : ''}
    ${aksiIsi}
    <div class="bantu">Diperbarui ${esc(waktuLengkap(s.diperbarui))}${s.oleh ? ' · diteruskan oleh ' + esc(s.oleh) : ''}</div>`;
  bukaModal(s.no, isi, kaki, { lebar: true, tanpaFokus: true });
}

function simpanStatus(no) {
  const btn = document.querySelector('#segmenStatus .aktif');
  const status = btn ? btn.dataset.nilai : '';
  const catatan = ($('catatanStatus') || {}).value || '';
  const s = cariSub(no);
  if (!status || (status === s.status && catatan === s.catatan)) { tutupModal(); return; }
  tutupModal();
  optimis({
    sukses: status === 'Selesai' && s.status !== 'Selesai' ? 'Status Selesai. Pemohon dikabari lewat WhatsApp.' : 'Status diperbarui menjadi ' + status + '.',
    lokal: d => { const x = d.sub.find(y => y.no === no); x.status = status; x.catatan = catatan; x.diperbarui = new Date().toISOString(); },
    server: ['dashUbahStatusSub', S.token, no, status, catatan]
  }).catch(() => {});
}

function setujui(no) {
  tutupModal();
  optimis({
    sukses: 'Disetujui. Pemohon dikabari lewat WhatsApp.',
    lokal: d => { const x = d.sub.find(y => y.no === no); x.status = 'Disetujui'; x.diperbarui = new Date().toISOString(); },
    server: ['dashKeputusanSub', S.token, no, 'setuju', '']
  }).catch(() => {});
  setTimeout(() => formPencatatan(no), 250);   // langsung lanjut ke form pencatatan
}

function formTolak(no) {
  const s = cariSub(no);
  const isi = `<p class="teks-redup mb-2">Alasan dikirim apa adanya ke ${esc(s.nama || 'pemohon')} lewat WhatsApp.</p>
    <label class="label" for="alasanTolak">Alasan penolakan</label>
    <textarea id="alasanTolak" class="area" placeholder="Mis. pada tanggal dan jam tersebut ruangan sudah dipakai" autofocus></textarea>
    <div class="detail-blok mt-3"><div class="detail-judul">Pratinjau pesan ke staf</div><div class="detail-kotak" id="pratinjauTolak"></div></div>`;
  bukaModal('Tolak ' + no, isi, `<button class="tombol garis" data-aksi="tutup-modal">Batal</button><button class="tombol bahaya" data-aksi="kirim-tolak" data-id="${esc(no)}"><i class="bi bi-x-circle"></i> Tolak & kirim</button>`);
  const perbarui = () => { const a = $('alasanTolak').value.trim().replace(/\.$/, ''); $('pratinjauTolak').textContent = `Permintaan Layanan Anda dengan nomor ${s.tiket} tidak dapat dipenuhi karena ${a || '…'}.`; };
  $('alasanTolak').addEventListener('input', perbarui);
  perbarui();
}
function kirimTolak(no) {
  const a = $('alasanTolak').value.trim();
  if (!a) { toast('Alasan penolakan wajib diisi.', 'galat'); $('alasanTolak').focus(); return; }
  tutupModal();
  optimis({
    sukses: 'Permintaan ditolak. Pemohon, Biro Umum, dan bagian terkait dikabari.',
    lokal: d => { const x = d.sub.find(y => y.no === no); x.status = 'Dibatalkan'; x.catatan = 'Ditolak: ' + a; },
    server: ['dashKeputusanSub', S.token, no, 'tolak', a]
  }).catch(() => {});
}

function formBatal(no) {
  const s = cariSub(no);
  const isi = `${mintaBatal(s) ? `<div class="peringatan mb-3"><i class="bi bi-exclamation-triangle"></i><span>${esc(s.permintaan)}</span></div>` : '<div class="peringatan merah mb-3"><i class="bi bi-exclamation-octagon"></i><span>Pembatalan oleh BMN dikabarkan ke pemohon, Biro Umum, dan bagian terkait.</span></div>'}
    <label class="label" for="alasanBatal">Alasan <span class="opsional">(opsional)</span></label><input id="alasanBatal" class="input" placeholder="Mis. sesuai permintaan staf">`;
  bukaModal('Batalkan ' + no + '?', isi, `<button class="tombol garis" data-aksi="tutup-modal">Kembali</button><button class="tombol bahaya" data-aksi="kirim-batal" data-id="${esc(no)}">Ya, batalkan</button>`);
}
function kirimBatal(no) {
  const a = ($('alasanBatal') || {}).value || '';
  tutupModal();
  optimis({
    sukses: 'Sub-tiket dibatalkan.',
    lokal: d => { const x = d.sub.find(y => y.no === no); x.status = 'Dibatalkan'; if (a) x.catatan = a; },
    server: ['dashKeputusanSub', S.token, no, 'batal', a.trim()]
  }).catch(() => {});
}

function formUbahJadwal(no) {
  const s = cariSub(no), r = s.rincian || {};
  const isi = `<div class="grid-form dua">
      <div><label class="label" for="ujTanggal">Tanggal</label><input id="ujTanggal" type="date" class="input" value="${esc(r.tanggal_mulai || '')}"></div>
      <div><label class="label" for="ujWaktu">Waktu</label><input id="ujWaktu" type="time" class="input" value="${esc(keJamInput(r.waktu))}"></div></div>
    <label class="label" for="ujTempat">Tempat</label>${pilihTempat('ujTempat', r.tempat)}
    <div class="bantu">Perubahan dikirim ke pemohon, Biro Umum, dan bagian lain pada tiket yang sama.</div>`;
  bukaModal('Ubah jadwal ' + no, isi, `<button class="tombol garis" data-aksi="tutup-modal">Batal</button><button class="tombol utama" data-aksi="kirim-ubah-jadwal" data-id="${esc(no)}">Simpan & kabari</button>`);
}
function kirimUbahJadwal(no) {
  const ubah = {};
  const t = $('ujTanggal').value, w = $('ujWaktu').value, tp = nilaiTempat('ujTempat');
  const r = cariSub(no).rincian || {};
  if (t && t !== r.tanggal_mulai) ubah.tanggal_mulai = t;
  if (w && w !== keJamInput(r.waktu)) ubah.waktu = w.replace(':', '.');
  if (tp && tp !== r.tempat) ubah.tempat = tp;
  if (!Object.keys(ubah).length) { toast('Belum ada yang diubah.', 'info'); return; }
  tutupModal();
  optimis({
    sukses: 'Jadwal diubah. Pemohon dan bagian terkait dikabari.',
    lokal: d => { const x = d.sub.find(y => y.no === no); Object.assign(x.rincian, ubah); if (ubah.tanggal_mulai && (!x.rincian.tanggal_selesai || x.rincian.tanggal_selesai < ubah.tanggal_mulai)) x.rincian.tanggal_selesai = ubah.tanggal_mulai; },
    server: ['dashUbahJadwalSub', S.token, no, ubah]
  }).catch(() => {});
}

// ---------- Form pencatatan (pilihan/dropdown) ----------
function opsiTempat() { return ((S.data.master && S.data.master.tempat) || []).filter(t => t.aktif !== 'TIDAK'); }
function pilihTempat(id, nilai) {
  const daftar = opsiTempat().map(t => t.nama);
  if (!daftar.length) return `<input id="${id}" class="input" value="${esc(nilai || '')}" placeholder="Nama tempat">`;
  const ada = !nilai || daftar.includes(nilai);
  return `<select id="${id}" class="pilih" data-aksi-ubah="tempat-lain">
      <option value="">— Pilih tempat —</option>${daftar.map(n => `<option ${n === nilai ? 'selected' : ''}>${esc(n)}</option>`).join('')}
      ${!ada ? `<option selected>${esc(nilai)}</option>` : ''}<option value="__lain">Lainnya (ketik sendiri)…</option></select>
    <input id="${id}Lain" class="input mt-2 tersembunyi" placeholder="Ketik nama tempat">`;
}
function nilaiTempat(id) {
  const el = $(id);
  if (!el) return '';
  if (el.tagName === 'SELECT' && el.value === '__lain') return ($(id + 'Lain').value || '').trim();
  return (el.value || '').trim();
}

function formPencatatan(no) {
  const s = cariSub(no);
  if (!s) return;
  const b = s.bagian, r = s.rincian || {};
  let isi;
  if (b === 'Angkutan') {
    const driver = ((S.data.master || {}).driver || []).filter(x => x.aktif !== 'TIDAK');
    const mobil = ((S.data.master || {}).mobil || []).filter(x => x.aktif !== 'TIDAK');
    const labelMobil = m => m.nama + (m.nopol ? ' · ' + m.nopol : '');
    isi = `<p class="teks-redup">${esc(s.nama)} · ${esc(judulSub(s))}</p>
      <div class="grid-form dua">
        <div><label class="label" for="pcDriver">Driver</label><select id="pcDriver" class="pilih" data-cek="1"><option value="">— Pilih driver —</option>${driver.map(x => `<option ${x.nama === r.driver ? 'selected' : ''}>${esc(x.nama)}</option>`).join('')}</select></div>
        <div><label class="label" for="pcMobil">Mobil</label><select id="pcMobil" class="pilih" data-cek="1"><option value="">— Pilih mobil —</option>${mobil.map(x => `<option ${labelMobil(x) === r.mobil ? 'selected' : ''}>${esc(labelMobil(x))}</option>`).join('')}</select></div>
        <div><label class="label" for="pcMulai">Tanggal mulai</label><input id="pcMulai" type="date" class="input" data-cek="1" value="${esc(r.tanggal_mulai || '')}"></div>
        <div><label class="label" for="pcSelesai">Tanggal selesai</label><input id="pcSelesai" type="date" class="input" data-cek="1" value="${esc(r.tanggal_selesai || r.tanggal_mulai || '')}"></div>
        <div><label class="label" for="pcWaktu">Waktu berangkat</label><input id="pcWaktu" type="time" class="input" value="${esc(keJamInput(r.waktu))}"></div>
        <div><label class="label" for="pcJumlah">Jumlah orang</label><input id="pcJumlah" type="number" min="1" class="input" value="${esc(String(r.jumlah || '').replace(/[^0-9]/g, ''))}"></div></div>
      <label class="label" for="pcTempat">Tujuan</label><input id="pcTempat" class="input" list="daftarTujuan" value="${esc(r.tempat || '')}" placeholder="Kota / alamat tujuan">
      <datalist id="daftarTujuan">${opsiTempat().map(t => `<option value="${esc(t.nama)}">`).join('')}</datalist>
      ${!driver.length || !mobil.length ? '<div class="peringatan mt-3"><i class="bi bi-info-circle"></i><span>Daftar driver/mobil masih kosong. Isi dulu di menu Data Master.</span></div>' : ''}
      <div id="infoBentrok" class="mt-3"></div>`;
  } else {
    const jenis = r.jenis_kegiatan || (b === 'BMN' && !r.nama_acara && !r.tempat ? 'lainnya' : 'acara');
    isi = `<p class="teks-redup">${esc(s.nama)} · ${esc(judulSub(s))}</p>
      <label class="label" for="pcJenis">Jenis layanan</label>
      <select id="pcJenis" class="pilih" data-aksi-ubah="jenis-pencatatan"><option value="acara" ${jenis === 'acara' ? 'selected' : ''}>Acara / kegiatan</option><option value="lainnya" ${jenis === 'lainnya' ? 'selected' : ''}>Lainnya</option></select>
      <div id="blokAcara" class="${jenis === 'acara' ? '' : 'tersembunyi'}">
        <label class="label" for="pcAcara">Nama acara</label><input id="pcAcara" class="input" value="${esc(r.nama_acara || '')}" placeholder="Mis. Rapat Koordinasi Persidangan">
        <div class="grid-form dua">
          <div><label class="label" for="pcMulai">Tanggal</label><input id="pcMulai" type="date" class="input" data-cek="1" value="${esc(r.tanggal_mulai || '')}"></div>
          <div><label class="label" for="pcWaktu">Waktu</label><input id="pcWaktu" type="time" class="input" value="${esc(keJamInput(r.waktu))}"></div></div>
        <label class="label" for="pcTempat">Tempat</label>${pilihTempat('pcTempat', r.tempat)}
        <label class="label" for="pcJumlah">Jumlah peserta <span class="opsional">(jika ada)</span></label><input id="pcJumlah" type="number" min="1" class="input" value="${esc(String(r.jumlah || '').replace(/[^0-9]/g, ''))}">
        <div id="infoBentrok" class="mt-3"></div>
      </div>
      <div id="blokLainnya" class="${jenis === 'lainnya' ? '' : 'tersembunyi'}"><div class="peringatan biru mt-3"><i class="bi bi-info-circle"></i><span>${b === 'BMN' ? 'Layanan lainnya langsung ditandai selesai.' : 'Pencatatan disimpan tanpa jadwal kalender.'}</span></div></div>`;
  }
  const label = b === 'Pemeliharaan' ? 'Simpan pencatatan' : 'Simpan & selesai';
  bukaModal('Pencatatan ' + s.no, isi, `<button class="tombol garis" data-aksi="tutup-modal">Nanti</button><button class="tombol utama" data-aksi="kirim-pencatatan" data-id="${esc(s.no)}"><i class="bi bi-check2"></i> ${label}</button>`, { lebar: true });
  $('modalIsi').addEventListener('input', () => cekBentrok(s.no));
  $('modalIsi').addEventListener('change', () => cekBentrok(s.no));
  cekBentrok(s.no);
}

/** Peringatan bentrok jadwal dihitung di browser (instan). */
function tumpang(a1, a2, b1, b2) { return a1 && b1 && a1 <= (b2 || b1) && b1 <= (a2 || a1); }
function cekBentrok(no) {
  const kotak = $('infoBentrok');
  if (!kotak) return;
  const s = cariSub(no), mulai = ($('pcMulai') || {}).value, selesai = ($('pcSelesai') || {}).value || mulai;
  if (!mulai) { kotak.innerHTML = ''; return; }
  const lain = daftarSub().filter(x => x.no !== no && x.bagian === s.bagian && x.status !== 'Dibatalkan' && x.rincian && tumpang(mulai, selesai, x.rincian.tanggal_mulai, x.rincian.tanggal_selesai));
  let bentrok = [];
  if (s.bagian === 'Angkutan') {
    const drv = $('pcDriver').value, mbl = $('pcMobil').value;
    bentrok = lain.filter(x => (drv && x.rincian.driver === drv) || (mbl && x.rincian.mobil === mbl))
      .map(x => `${x.no}: ${x.rincian.driver === drv ? 'driver ' + drv : 'mobil ' + mbl} sudah terjadwal ${jadwalSub(x)}`);
  } else {
    const tp = nilaiTempat('pcTempat').toLowerCase();
    if (tp) bentrok = lain.filter(x => String(x.rincian.tempat || '').toLowerCase() === tp).map(x => `${x.no}: ${x.rincian.tempat} dipakai ${jadwalSub(x)}${x.rincian.waktu ? ' pukul ' + x.rincian.waktu : ''} (${judulSub(x)})`);
  }
  kotak.innerHTML = bentrok.length ? `<div class="peringatan merah"><i class="bi bi-exclamation-octagon"></i><span><b>Jadwal bertabrakan:</b><br>${bentrok.map(esc).join('<br>')}</span></div>` : '';
}

function kirimPencatatan(no) {
  const s = cariSub(no), b = s.bagian;
  const ambil = id => (($(id) || {}).value || '').trim();
  let f;
  if (b === 'Angkutan') {
    f = { driver: ambil('pcDriver'), mobil: ambil('pcMobil'), tanggal_mulai: ambil('pcMulai'), tanggal_selesai: ambil('pcSelesai'), tempat: ambil('pcTempat'), waktu: ambil('pcWaktu').replace(':', '.'), jumlah: ambil('pcJumlah') };
    const kurang = [['driver', 'driver'], ['mobil', 'mobil'], ['tanggal_mulai', 'tanggal mulai'], ['tempat', 'tujuan'], ['waktu', 'waktu berangkat'], ['jumlah', 'jumlah orang']].filter(k => !f[k[0]]).map(k => k[1]);
    if (kurang.length) { toast('Lengkapi: ' + kurang.join(', ') + '.', 'galat'); return; }
    if (f.tanggal_selesai && f.tanggal_selesai < f.tanggal_mulai) { toast('Tanggal selesai tidak boleh sebelum tanggal mulai.', 'galat'); return; }
  } else {
    const jenis = ambil('pcJenis');
    f = { jenis };
    if (jenis === 'acara') {
      Object.assign(f, { nama_acara: ambil('pcAcara'), tanggal_mulai: ambil('pcMulai'), waktu: ambil('pcWaktu').replace(':', '.'), tempat: nilaiTempat('pcTempat'), jumlah: ambil('pcJumlah') });
      const kurang = [['nama_acara', 'nama acara'], ['tanggal_mulai', 'tanggal'], ['waktu', 'waktu'], ['tempat', 'tempat']].filter(k => !f[k[0]]).map(k => k[1]);
      if (kurang.length) { toast('Lengkapi: ' + kurang.join(', ') + '.', 'galat'); return; }
    }
  }
  tutupModal();
  const selesai = b === 'BMN' || b === 'Angkutan';
  optimis({
    sukses: selesai ? 'Pencatatan tersimpan. Status menjadi Selesai.' : 'Pencatatan tersimpan dan tampil di kalender.',
    lokal: d => {
      const x = d.sub.find(y => y.no === no);
      Object.keys(f).forEach(k => { if (k !== 'jenis' && f[k]) x.rincian[k] = f[k]; });
      if (f.jenis) x.rincian.jenis_kegiatan = f.jenis;
      if (x.rincian.tanggal_mulai && (!x.rincian.tanggal_selesai || x.rincian.tanggal_selesai < x.rincian.tanggal_mulai)) x.rincian.tanggal_selesai = x.rincian.tanggal_mulai;
      x.rincian.tercatat = true;
      if (selesai) x.status = 'Selesai';
    },
    server: ['dashSimpanPencatatan', S.token, no, f]
  }).catch(() => {});
}

// ════════════════════════════════════════════════════════
// 14. KALENDER & JADWAL HARI INI
// ════════════════════════════════════════════════════════
function petaAcara() {
  const peta = {};
  daftarSub().forEach(s => {
    const r = s.rincian || {};
    if (s.status === 'Dibatalkan' || !r.tanggal_mulai) return;
    const awal = keTanggal(r.tanggal_mulai), akhir = keTanggal(r.tanggal_selesai || r.tanggal_mulai);
    if (!awal) return;
    for (let d = new Date(awal), i = 0; d <= akhir && i < 31; d.setDate(d.getDate() + 1), i++) {
      const k = ymd(d);
      (peta[k] = peta[k] || []).push(s);
    }
  });
  Object.values(peta).forEach(a => a.sort((x, y) => keJamInput(x.rincian.waktu).localeCompare(keJamInput(y.rincian.waktu))));
  return peta;
}
function acaraTanggal(k) { return petaAcara()[k] || []; }
function daftarJadwal(list, kosong) {
  if (!list.length) return `<div class="kosong"><i class="bi bi-calendar2-check"></i>${esc(kosong)}</div>`;
  return `<div class="jadwal-daftar">${list.map(s => {
    const r = s.rincian || {};
    return `<button class="jadwal-item" data-aksi="buka-sub" data-id="${esc(s.no)}">
      <span class="garis-bagian" style="background:${WARNA_BAGIAN[s.bagian]}"></span>
      <span class="jadwal-isi"><span class="atas"><b>${esc(s.no)}</b>${pil(s.status, true)}${pusat() ? chipBagian(s.bagian) : ''}</span>
        <span class="judul d-block">${esc(judulSub(s))}${r.waktu ? ' — ' + esc(r.waktu) : ''}</span>
        <span class="lokasi d-block">${esc(lokasiSub(s) || s.unit || '')}${r.driver ? ' · ' + esc(r.driver) : ''}${r.mobil ? ' · ' + esc(r.mobil) : ''}</span></span>
      <i class="bi bi-chevron-right"></i></button>`;
  }).join('')}</div>`;
}
HALAMAN.kalender = {
  kerangka() { return `<div class="kepala-hal"><div><h2>Kalender & Jadwal</h2><div class="sub">Kegiatan yang tercatat dan permintaan yang sudah memiliki tanggal.</div></div></div><div data-isi></div>`; },
  isi() {
    if (!S.kal.bulan) { const k = new Date(); S.kal.bulan = new Date(k.getFullYear(), k.getMonth(), 1); }
    if (!S.kal.pilih) S.kal.pilih = hariIni();
    const peta = petaAcara(), bln = S.kal.bulan, th = bln.getFullYear(), bl = bln.getMonth(), hi = hariIni();
    const awal = (new Date(th, bl, 1).getDay() + 6) % 7, jml = new Date(th, bl + 1, 0).getDate();
    let sel = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(h => `<div class="kal-hari">${h}</div>`).join('');
    for (let i = 0; i < awal; i++) sel += '<div class="kal-tgl kosong-sel" aria-hidden="true"></div>';
    for (let t = 1; t <= jml; t++) {
      const k = ymd(new Date(th, bl, t)), acara = peta[k] || [];
      const warna = [...new Set(acara.map(s => WARNA_BAGIAN[s.bagian]))].slice(0, 3);
      sel += `<button class="kal-tgl${k === hi ? ' hari-ini' : ''}${k === S.kal.pilih ? ' dipilih' : ''}" data-aksi="kal-pilih" data-tgl="${k}" aria-label="${esc(tglPanjang(k))}, ${acara.length} kegiatan">
        <span>${t}</span><span class="kal-titik">${warna.map(w => `<span style="background:${pusat() ? w : 'var(--utama)'}"></span>`).join('')}</span></button>`;
    }
    const pilih = peta[S.kal.pilih] || [];
    const legenda = pusat() ? S.data.bagianList.filter(b => b !== 'Pengamanan' || daftarSub().some(s => s.bagian === b && s.rincian && s.rincian.tanggal_mulai)).map(chipBagian).join('') : '<span class="chip"><span class="bul" style="background:var(--utama)"></span>Ada jadwal</span>';
    return `<div class="grid-kalender">
      <div class="kartu">
        <div class="kartu-kepala"><h3><i class="bi bi-calendar3"></i> Kalender kegiatan</h3>
          <div class="d-flex gap-1"><button class="ikon-tombol" data-aksi="kal-geser" data-arah="-1" aria-label="Bulan sebelumnya"><i class="bi bi-chevron-left"></i></button>
          <button class="tombol kecil garis" data-aksi="kal-hari-ini">Hari ini</button>
          <button class="ikon-tombol" data-aksi="kal-geser" data-arah="1" aria-label="Bulan berikutnya"><i class="bi bi-chevron-right"></i></button></div></div>
        <div class="kal-bulan">${BULAN[bl]} ${th}</div>
        <div class="kal-grid">${sel}</div>
        <div class="kal-legenda">${legenda}</div>
      </div>
      <div class="kartu">
        <div class="kartu-kepala"><h3><i class="bi bi-list-task"></i> ${S.kal.pilih === hi ? 'Jadwal hari ini' : esc(tglPanjang(S.kal.pilih))} <span class="jumlah-pil">${pilih.length}</span></h3></div>
        ${daftarJadwal(pilih, 'Tidak ada kegiatan pada tanggal ini.')}
      </div></div>`;
  }
};

// ════════════════════════════════════════════════════════
// 15. DATA MASTER, ADMIN, ROBOT (Super Admin / Angkutan)
// ════════════════════════════════════════════════════════
const KOLOM_MASTER = {
  Tempat: [['nama', 'Nama tempat', 'teks'], ['lokasi', 'Lokasi / lantai', 'teks'], ['kapasitas', 'Kapasitas', 'angka'], ['aktif', 'Aktif', ['YA', 'TIDAK']]],
  Driver: [['nama', 'Nama driver', 'teks'], ['nomor', 'Nomor WA', 'teks'], ['aktif', 'Aktif', ['YA', 'TIDAK']]],
  Mobil:  [['nama', 'Nama / jenis', 'teks'], ['nopol', 'Nomor polisi', 'teks'], ['kapasitas', 'Kapasitas', 'angka'], ['aktif', 'Aktif', ['YA', 'TIDAK']]]
};
function selEdit(k, v, tipe) {
  if (Array.isArray(tipe)) return `<select class="pilih" data-k="${k}">${tipe.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  if (tipe === 'area') return `<textarea class="area" data-k="${k}">${esc(v)}</textarea>`;
  if (tipe === 'pw') return `<input type="password" class="input" data-k="${k}" value="${esc(v)}" placeholder="${v ? '(tidak diubah)' : 'password baru'}" autocomplete="new-password">`;
  if (tipe === 'tgl') return `<input type="date" class="input" data-k="${k}" value="${esc(v)}">`;
  if (tipe === 'angka') return `<input type="number" min="0" class="input" data-k="${k}" value="${esc(v)}">`;
  return `<input class="input" data-k="${k}" value="${esc(v)}">`;
}
function tabelEdit(id, kolom, rows) {
  return `<div class="tabel-wadah"><table class="tabel-edit" id="${id}"><thead><tr>${kolom.map(k => `<th>${esc(k[1])}</th>`).join('')}<th></th></tr></thead>
    <tbody>${rows.map(r => `<tr data-id="${esc(r.id || '')}">${kolom.map(k => `<td>${selEdit(k[0], r[k[0]] === undefined ? '' : r[k[0]], k[2])}</td>`).join('')}
      <td><button class="ikon-tombol" data-aksi="hapus-baris" aria-label="Hapus baris"><i class="bi bi-trash3 text-danger"></i></button></td></tr>`).join('')}</tbody></table></div>`;
}
function bacaTabelEdit(id) {
  return [...document.querySelectorAll('#' + id + ' tbody tr')].map(tr => {
    const o = { id: tr.dataset.id || '' };
    tr.querySelectorAll('[data-k]').forEach(el => { o[el.dataset.k] = el.value.trim(); });
    return o;
  });
}
function tambahBaris(id, kolom) {
  const tb = document.querySelector('#' + id + ' tbody');
  const tr = document.createElement('tr');
  tr.dataset.id = '';
  tr.innerHTML = kolom.map(k => `<td>${selEdit(k[0], Array.isArray(k[2]) ? k[2][0] : '', k[2])}</td>`).join('') + '<td><button class="ikon-tombol" data-aksi="hapus-baris" aria-label="Hapus baris"><i class="bi bi-trash3 text-danger"></i></button></td>';
  tb.appendChild(tr);
  const f = tr.querySelector('.input'); if (f) f.focus();
}

HALAMAN.master = {
  kerangka() {
    const jenis = peran() === 'Super Admin' ? ['Tempat', 'Driver', 'Mobil'] : ['Driver', 'Mobil'];
    if (!jenis.includes(S.masterTab)) S.masterTab = jenis[0];
    return `<div class="kepala-hal"><div><h2>Data Master</h2><div class="sub">Pilihan yang muncul di form pencatatan.</div></div></div>
      <div class="kartu"><div class="tab-garis">${jenis.map(j => `<button class="${S.masterTab === j ? 'aktif' : ''}" data-aksi="master-tab" data-nilai="${j}">${j}</button>`).join('')}</div><div data-isi></div></div>`;
  },
  isi() {
    const j = S.masterTab, rows = (S.data.master && S.data.master[j.toLowerCase()]) || [];
    return `<div class="kartu-isi">${tabelEdit('tMaster', KOLOM_MASTER[j], rows)}
      <div class="baris-tombol"><button class="tombol garis" data-aksi="tambah-master"><i class="bi bi-plus-lg"></i> Tambah ${j.toLowerCase()}</button>
      <button class="tombol utama" data-aksi="simpan-master"><i class="bi bi-check2"></i> Simpan</button></div></div>`;
  }
};
function simpanMaster() {
  const j = S.masterTab, rows = bacaTabelEdit('tMaster').filter(r => r.nama);
  optimis({
    sukses: 'Data ' + j.toLowerCase() + ' tersimpan.',
    lokal: d => { d.master[j.toLowerCase()] = rows.map(r => Object.assign({ aktif: 'YA' }, r)); },
    server: ['dashSimpanMaster', S.token, j, rows]
  }).catch(() => {});
}

const KOLOM_ADMIN = [['bagian', 'Bagian', ['Biro Umum', 'Pemeliharaan', 'Angkutan', 'BMN', 'Pengamanan']], ['nama', 'Nama', 'teks'], ['nomor', 'Nomor WA', 'teks'], ['password', 'Password', 'pw'], ['mulai', 'Berlaku mulai', 'tgl'], ['sampai', 'Berlaku sampai', 'tgl'], ['aktif', 'Aktif', ['YA', 'TIDAK']]];
HALAMAN.admin = {
  kerangka() {
    return `<div class="kepala-hal"><div><h2>Admin Terdaftar</h2><div class="sub">Admin yang bertugas minggu ini. Hanya admin dalam masa berlaku yang menerima notifikasi WA dan bisa login.</div></div></div>
      <div class="kartu"><div data-isi></div></div>`;
  },
  isi() {
    return `<div class="kartu-isi"><div class="peringatan biru mb-3"><i class="bi bi-info-circle"></i><span>Password minimal 8 karakter. Biarkan kolom bertanda "(tidak diubah)" untuk memakai password lama. Untuk pergantian mingguan, tambahkan baris baru dengan tanggal berlaku minggu depan.</span></div>
      ${tabelEdit('tAdmin', KOLOM_ADMIN, S.data.admin || [])}
      <div class="baris-tombol"><button class="tombol garis" data-aksi="tambah-admin"><i class="bi bi-person-plus"></i> Tambah admin</button><button class="tombol utama" data-aksi="simpan-admin"><i class="bi bi-check2"></i> Simpan</button></div></div>
      <div class="kartu-isi" style="border-top:1px solid var(--garis)">
        <h3 class="fw-bold mb-1" style="font-size:16px">Password Super Admin</h3>
        <p class="teks-redup mb-2">Super Admin login dengan username, tanpa OTP. Ganti password secara berkala.</p>
        <div class="grid-form dua">
          <div><label class="label" for="pwLama">Password lama</label><input id="pwLama" type="password" class="input" autocomplete="current-password"></div>
          <div></div>
          <div><label class="label" for="pwBaru">Password baru</label><input id="pwBaru" type="password" class="input" autocomplete="new-password" minlength="8"></div>
          <div><label class="label" for="pwUlang">Ulangi password baru</label><input id="pwUlang" type="password" class="input" autocomplete="new-password"></div>
        </div>
        <div class="baris-tombol"><button class="tombol utama" data-aksi="ganti-pw-sa"><i class="bi bi-key"></i> Ganti password</button></div>
      </div>`;
  }
};
function gantiPasswordSuperAdmin() {
  const lama = $('pwLama').value, baru = $('pwBaru').value, ulang = $('pwUlang').value;
  if (!lama || !baru) { toast('Isi password lama dan password baru.', 'galat'); return; }
  if (baru.length < 8) { toast('Password baru minimal 8 karakter.', 'galat'); return; }
  if (baru !== ulang) { toast('Ulangan password baru tidak sama.', 'galat'); return; }
  api('dashGantiPasswordSuperAdmin', S.token, lama, baru).then(() => {
    ['pwLama', 'pwBaru', 'pwUlang'].forEach(id => { $(id).value = ''; });
    toast('Password Super Admin diganti.', 'sukses');
  }).catch(e => toast(e.message, 'galat'));
}
function simpanAdmin() {
  const rows = bacaTabelEdit('tAdmin').filter(r => r.nomor || r.nama);
  const pendek = rows.find(r => r.password && !/^•+$/.test(r.password) && r.password.length < 8);
  if (pendek) { toast('Password minimal 8 karakter (' + (pendek.nama || pendek.nomor) + ').', 'galat'); return; }
  optimis({
    sukses: 'Daftar admin tersimpan.',
    lokal: d => { d.admin = rows.map(r => Object.assign({}, r, { password: r.password ? '••••••' : '' })); },
    server: ['dashSimpanAdmin', S.token, rows]
  }).catch(() => {});
}

function nilaiPengaturan(k) { const r = (S.data.pengaturan || []).find(x => x.kunci === k); return r ? r.nilai : ''; }
function ketPengaturan(k) { const r = (S.data.pengaturan || []).find(x => x.kunci === k); return r ? r.ket : ''; }
HALAMAN.robot = {
  kerangka() {
    const tabs = [['kepribadian', 'Kepribadian'], ['operasional', 'Operasional'], ['template', 'Template pesan'], ['pengetahuan', 'Pengetahuan']];
    return `<div class="kepala-hal"><div><h2>Robot AI</h2><div class="sub">Instruksi dasar, pengaturan, template pesan, dan pengetahuan robot. Berlaku ±1–5 menit setelah disimpan.</div></div></div>
      <div class="kartu"><div class="tab-garis">${tabs.map(t => `<button class="${S.robotTab === t[0] ? 'aktif' : ''}" data-aksi="robot-tab" data-nilai="${t[0]}">${t[1]}</button>`).join('')}</div><div data-isi></div></div>`;
  },
  isi() {
    const t = S.robotTab;
    if (t === 'pengetahuan') {
      return `<div class="kartu-isi"><div class="peringatan biru mb-3"><i class="bi bi-info-circle"></i><span>Robot hanya menjawab dari daftar ini. Baris berisi [ISI: …] tidak dipakai robot sampai diisi.</span></div>
        ${tabelEdit('tPeng', [['kategori', 'Kategori', 'teks'], ['topik', 'Topik / pertanyaan', 'teks'], ['isi', 'Jawaban / isi', 'area'], ['aktif', 'Aktif', ['YA', 'TIDAK']], ['sumber', 'Sumber', 'teks']], S.data.pengetahuan || [])}
        <div class="baris-tombol"><button class="tombol garis" data-aksi="tambah-pengetahuan"><i class="bi bi-plus-lg"></i> Tambah baris</button><button class="tombol utama" data-aksi="simpan-pengetahuan"><i class="bi bi-check2"></i> Simpan</button></div></div>`;
    }
    const kunci = t === 'template' ? (S.data.pengaturan || []).filter(r => /^TPL_/.test(r.kunci)).map(r => r.kunci) : KELOMPOK_ROBOT[t];
    const field = kunci.map(k => {
      const v = nilaiPengaturan(k), lbl = LABEL_PENGATURAN[k] || k.replace('TPL_', 'Template ').replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
      const kepala = `<label class="label" for="set_${k}">${esc(lbl)} <span class="opsional">— ${esc(ketPengaturan(k))}</span></label>`;
      if (PILIHAN_PENGATURAN[k]) return kepala + `<select id="set_${k}" class="pilih" data-set="${k}">${PILIHAN_PENGATURAN[k].map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
      if (PANJANG_PENGATURAN.includes(k) || t === 'template') return kepala + `<textarea id="set_${k}" class="area" data-set="${k}" rows="4">${esc(v)}</textarea>`;
      return kepala + `<input id="set_${k}" class="input" data-set="${k}" value="${esc(v)}">`;
    }).join('');
    return `<div class="kartu-isi">${t === 'template' ? '<div class="peringatan biru mb-2"><i class="bi bi-info-circle"></i><span>Teks dalam kurung kurawal seperti {tiket} diisi otomatis. Jangan dihapus.</span></div>' : ''}
      <div class="grid-form ${t === 'operasional' ? 'dua' : ''}">${field}</div>
      ${t === 'operasional' && S.data.webhookUrl ? `<label class="label">Alamat webhook untuk Fonnte</label><div class="detail-kotak"><code>${esc(S.data.webhookUrl)}</code></div>` : ''}
      <div class="baris-tombol"><button class="tombol utama" data-aksi="simpan-pengaturan"><i class="bi bi-check2"></i> Simpan</button></div></div>`;
  }
};
function simpanPengaturan() {
  const obj = {};
  document.querySelectorAll('[data-set]').forEach(el => { obj[el.dataset.set] = el.value.trim(); });
  optimis({
    sukses: 'Pengaturan tersimpan.',
    lokal: d => { Object.keys(obj).forEach(k => { const r = d.pengaturan.find(x => x.kunci === k); if (r) r.nilai = obj[k]; }); if ('FORWARD_OTOMATIS' in obj) d.app.forwardOtomatis = obj.FORWARD_OTOMATIS === 'YA'; },
    server: ['dashSimpanPengaturan', S.token, obj]
  }).catch(() => {});
}
function simpanPengetahuan() {
  const rows = bacaTabelEdit('tPeng').filter(r => r.topik || r.isi);
  optimis({
    sukses: rows.length + ' baris pengetahuan tersimpan.',
    lokal: d => { d.pengetahuan = rows; },
    server: ['dashSimpanPengetahuan', S.token, rows]
  }).catch(() => {});
}

// ---------- Uji coba robot ----------
HALAMAN.ujicoba = {
  kerangka() {
    return `<div class="kepala-hal"><div><h2>Uji Coba Robot</h2><div class="sub">Coba robot tanpa WhatsApp. Tidak ada pesan terkirim dan tiket tidak disimpan.</div></div></div>
      <div class="kartu overflow-hidden"><div id="chatUji" class="chat"></div>
        <div class="kirim-chat"><textarea id="pesanUji" class="area" rows="1" placeholder="Ketik pesan seperti staf… (Shift+Enter untuk baris baru)"></textarea>
          <button class="tombol utama" data-aksi="kirim-uji" aria-label="Kirim"><i class="bi bi-send"></i></button></div>
        <div class="d-flex gap-2 px-3 pb-3"><button class="tombol garis kecil" data-aksi="tempel-format">Tempel format</button><button class="tombol garis kecil" data-aksi="ulang-uji">Ulang percakapan</button></div></div>`;
  },
  setelah() { gambarChat(); }
};
function gambarChat() {
  const c = $('chatUji');
  if (!c) return;
  c.innerHTML = S.uji.chat.length ? S.uji.chat.map(g => `<div class="gelembung ${g.dari}">${esc(g.teks)}${g.meta ? `<span class="m">${esc(g.meta)}</span>` : ''}</div>`).join('')
    : '<div class="kosong"><i class="bi bi-chat-dots"></i>Mulai dengan "halo" atau tempel format pengisian.</div>';
  c.scrollTop = c.scrollHeight;
}
function kirimUji() {
  const el = $('pesanUji'), t = el.value.trim();
  if (!t) return;
  el.value = '';
  S.uji.chat.push({ dari: 'staf', teks: t });
  S.uji.chat.push({ dari: 'robot', teks: '…' });
  gambarChat();
  api('dashSimulasi', S.token, t, S.uji.riwayat, S.uji.draf).then(r => {
    S.uji.chat.pop();
    S.uji.chat.push({ dari: 'robot', teks: r.balasan, meta: 'aksi: ' + r.aksi + (r.catatan ? ' — ' + r.catatan : '') });
    S.uji.draf = r.draf;
    S.uji.riwayat.push({ r: 'user', t: t }, { r: 'model', t: r.balasan });
    S.uji.riwayat = S.uji.riwayat.slice(-Number(nilaiPengaturan('JUMLAH_RIWAYAT') || 8));
    gambarChat();
  }).catch(e => { S.uji.chat.pop(); S.uji.chat.push({ dari: 'robot', teks: '⚠ ' + e.message }); gambarChat(); });
}

HALAMAN.percakapan = {
  kerangka() { return `<div class="kepala-hal"><div><h2>Riwayat Percakapan</h2><div class="sub">200 pesan terakhir antara staf dan robot.</div></div></div><div data-isi></div>`; },
  isi() {
    const r = S.data.percakapan || [];
    return `<div class="kartu">${r.length ? `<ul class="daftar-notif">${r.map(x => `<li class="notif" style="cursor:default">
      <span class="notif-ikon ${x.dari === 'Robot' ? 't-biru' : x.dari === 'Admin' ? 't-ungu' : 't-hijau'}"><i class="bi ${x.dari === 'Robot' ? 'bi-robot' : 'bi-person'}"></i></span>
      <span class="notif-isi"><span class="notif-judul d-block">${esc(x.dari)} · ${esc(x.nama || x.nomor)}</span><span class="d-block" style="white-space:pre-wrap;color:var(--teks-2)">${esc(x.pesan)}</span></span>
      <span class="notif-kanan"><span class="meta">${esc(waktuLengkap(x.waktu))}</span>${x.aksi ? `<span class="chip">${esc(x.aksi)}</span>` : ''}</span></li>`).join('')}</ul>` : '<div class="kosong"><i class="bi bi-chat"></i>Belum ada percakapan.</div>'}</div>`;
  }
};

// ---------- Profil (HP) ----------
HALAMAN.profil = {
  isi() {
    const p = S.data.profil, lain = menuSaya().filter(id => !(NAV_BAWAH[p.bagian] || []).includes(id));
    const tema = document.documentElement.getAttribute('data-theme');
    return `<div class="kartu mb-3"><div class="profil-kepala"><span class="avatar">${esc((p.nama || p.bagian).charAt(0).toUpperCase())}</span>
      <div><div class="fw-bold fs-5">${esc(p.nama || p.bagian)}</div><div class="teks-redup">${esc(p.bagian)}${p.nomor ? ' · ' + esc(p.nomor) : ''}</div></div></div></div>
      ${lain.length ? `<div class="kartu mb-3"><ul class="menu-daftar">${lain.map(id => `<li><button data-aksi="nav" data-hal="${id}"><i class="bi ${MENU[id].ikon}"></i>${esc(MENU[id].label)}${hitungBadge(id) ? `<span class="pil kecil t-merah ms-2">${hitungBadge(id)}</span>` : ''}<i class="bi bi-chevron-right"></i></button></li>`).join('')}</ul></div>` : ''}
      <div class="kartu"><ul class="menu-daftar">
        <li><button data-aksi="tema"><i class="bi ${tema === 'dark' ? 'bi-sun' : 'bi-moon-stars'}"></i>${tema === 'dark' ? 'Mode terang' : 'Mode gelap'}<i class="bi bi-chevron-right"></i></button></li>
        <li><button data-aksi="segarkan"><i class="bi bi-arrow-clockwise"></i>Muat ulang data<i class="bi bi-chevron-right"></i></button></li>
        <li><button data-aksi="keluar" class="text-danger"><i class="bi bi-box-arrow-left text-danger"></i>Keluar<i class="bi bi-chevron-right"></i></button></li></ul></div>`;
  }
};

// ════════════════════════════════════════════════════════
// 16. EKSPOR EXCEL & PDF (pustaka dimuat hanya saat dibutuhkan)
// ════════════════════════════════════════════════════════
function muatSkrip(src) {
  return new Promise((ok, gagal) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => gagal(new Error('Gagal memuat pustaka ekspor. Periksa koneksi internet.'));
    document.head.appendChild(s);
  });
}
function dataEkspor(hal) {
  if (hal === 'tiket') {
    const kepala = ['No Tiket', 'Waktu Masuk', 'Nama', 'Unit Kerja', 'Nomor WA', 'Jenis Layanan', 'Deskripsi', 'Rekomendasi', 'Status'];
    return { kepala, baris: tiketTersaring().map(t => [t.no, waktuLengkap(t.waktu), t.nama, t.unit, t.nomor, t.jenis, t.deskripsi, t.rekomendasi.join(', '), t.status]) };
  }
  const kepala = ['No Sub Tiket', 'Bagian', 'Pemohon', 'Unit Kerja', 'Permintaan', 'Tanggal', 'Waktu', 'Tempat/Tujuan', 'Jumlah', 'Nama Acara', 'Driver', 'Mobil', 'Status', 'Catatan', 'Permintaan Staf'];
  return {
    kepala, baris: subTersaring(hal).map(s => {
      const r = s.rincian || {};
      return [s.no, s.bagian, s.nama, s.unit, s.ringkasan, jadwalSub(s), r.waktu || '', r.tempat || '', r.jumlah || '', r.nama_acara || '', r.driver || '', r.mobil || '', s.status, s.catatan, s.permintaan];
    })
  };
}
function ekspor(hal, format) {
  const { kepala, baris } = dataEkspor(hal);
  if (!baris.length) { toast('Tidak ada data untuk diunduh.', 'info'); return; }
  const nama = 'Hotline-BiroUmum_' + MENU[hal].label.replace(/\s+/g, '-') + '_' + hariIni();
  toast('Menyiapkan file…', 'info');
  if (format === 'xlsx') {
    muatSkrip(CDN.xlsx).then(() => {
      const ws = XLSX.utils.aoa_to_sheet([kepala].concat(baris));
      ws['!cols'] = kepala.map((k, i) => ({ wch: Math.min(48, Math.max(k.length, ...baris.slice(0, 200).map(b => String(b[i] || '').length)) + 2) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, nama + '.xlsx');
    }).catch(e => toast(e.message, 'galat'));
  } else {
    muatSkrip(CDN.jspdf).then(() => muatSkrip(CDN.autotable)).then(() => {
      const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      doc.setFontSize(13);
      doc.text('Hotline Biro Umum — ' + MENU[hal].label, 36, 36);
      doc.setFontSize(9);
      doc.text('Diunduh ' + tglPanjang(hariIni()) + ' · ' + baris.length + ' data · ' + peran(), 36, 52);
      doc.autoTable({ head: [kepala], body: baris, startY: 64, styles: { fontSize: 7.5, cellPadding: 3, overflow: 'linebreak' }, headStyles: { fillColor: [47, 91, 234] }, margin: { left: 36, right: 36 } });
      doc.save(nama + '.pdf');
    }).catch(e => toast(e.message, 'galat'));
  }
}

// ════════════════════════════════════════════════════════
// 17. PENDENGAR KEJADIAN (satu pintu untuk semua klik)
// ════════════════════════════════════════════════════════
const AKSI = {
  'nav': el => navigasi(el.dataset.hal),
  'kpi': el => navigasi(el.dataset.hal, JSON.parse(el.dataset.filter || '{}')),
  'tema': () => { gantiTema(); if (S.hal === 'profil') renderIsi(); },
  'keluar': () => keluar(),
  'segarkan': () => segarkan(false).then(() => toast('Data terbaru dimuat.', 'sukses')).catch(() => {}),
  'menu-akun': () => $('menuAkun').classList.toggle('tersembunyi'),
  'tutup-modal': () => tutupModal(),
  'lihat-pw': el => { const i = $('lgPw'); i.type = i.type === 'password' ? 'text' : 'password'; el.innerHTML = `<i class="bi ${i.type === 'password' ? 'bi-eye' : 'bi-eye-slash'}"></i>`; },
  'login-ulang': () => ulangLogin(),
  'login-paksa': () => { $('formLogin1').classList.remove('tersembunyi'); $('loginPilih').classList.add('tersembunyi'); login1(true); },
  'buka-sub': el => bukaSub(el.dataset.id),
  'buka-tiket': el => bukaTiket(el.dataset.id),
  'jawab': el => bukaPertanyaan(el.dataset.id),
  'kirim-jawaban': el => kirimJawaban(el.dataset.id),
  'teruskan': el => teruskan(el.dataset.id),
  'pilih-status': el => { el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('aktif', b === el)); },
  'simpan-status': el => simpanStatus(el.dataset.id),
  'setuju': el => setujui(el.dataset.id),
  'tolak': el => formTolak(el.dataset.id),
  'kirim-tolak': el => kirimTolak(el.dataset.id),
  'batalkan': el => formBatal(el.dataset.id),
  'kirim-batal': el => kirimBatal(el.dataset.id),
  'ubah-jadwal': el => formUbahJadwal(el.dataset.id),
  'kirim-ubah-jadwal': el => kirimUbahJadwal(el.dataset.id),
  'pencatatan': el => formPencatatan(el.dataset.id),
  'kirim-pencatatan': el => kirimPencatatan(el.dataset.id),
  'tab-status': el => { F(el.dataset.hal).status = el.dataset.nilai; S.batas[el.dataset.hal] = BATAS_TAMPIL; renderIsi(); },
  'reset-filter': el => { S.filter[el.dataset.hal] = filterDefault(el.dataset.hal); S.batas[el.dataset.hal] = BATAS_TAMPIL; renderHal(S.hal, true); },
  'lebih': el => { S.batas[el.dataset.hal] = (S.batas[el.dataset.hal] || BATAS_TAMPIL) + BATAS_TAMPIL; renderIsi(); },
  'ekspor': el => ekspor(el.dataset.hal, el.dataset.format),
  'kal-geser': el => { const b = S.kal.bulan; S.kal.bulan = new Date(b.getFullYear(), b.getMonth() + Number(el.dataset.arah), 1); renderIsi(); },
  'kal-pilih': el => { S.kal.pilih = el.dataset.tgl; renderIsi(); },
  'kal-hari-ini': () => { const k = new Date(); S.kal.bulan = new Date(k.getFullYear(), k.getMonth(), 1); S.kal.pilih = hariIni(); renderIsi(); },
  'robot-tab': el => { S.robotTab = el.dataset.nilai; renderHal('robot', true); },
  'master-tab': el => { S.masterTab = el.dataset.nilai; renderHal('master', true); },
  'tambah-master': () => tambahBaris('tMaster', KOLOM_MASTER[S.masterTab]),
  'simpan-master': () => simpanMaster(),
  'tambah-admin': () => tambahBaris('tAdmin', KOLOM_ADMIN),
  'simpan-admin': () => simpanAdmin(),
  'ganti-pw-sa': () => gantiPasswordSuperAdmin(),
  'tambah-pengetahuan': () => tambahBaris('tPeng', [['kategori', '', 'teks'], ['topik', '', 'teks'], ['isi', '', 'area'], ['aktif', '', ['YA', 'TIDAK']], ['sumber', '', 'teks']]),
  'simpan-pengetahuan': () => simpanPengetahuan(),
  'simpan-pengaturan': () => simpanPengaturan(),
  'hapus-baris': el => el.closest('tr').remove(),
  'kirim-uji': () => kirimUji(),
  'ulang-uji': () => { S.uji = { riwayat: [], draf: null, chat: [] }; gambarChat(); },
  'tempel-format': () => { $('pesanUji').value = 'Nama : \nUnit Kerja : \nJenis Layanan : \nDeskripsi : '; $('pesanUji').focus(); }
};

function pasangPendengar() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-aksi]');
    if (!el) {
      if (!e.target.closest('#menuAkun')) $('menuAkun').classList.add('tersembunyi');
      return;
    }
    const fn = AKSI[el.dataset.aksi];
    if (!fn) return;
    if (el.tagName === 'A' && el.getAttribute('href')) return;    // tautan WA dibiarkan
    e.preventDefault();
    if (el.dataset.aksi !== 'menu-akun') $('menuAkun').classList.add('tersembunyi');
    fn(el);
  });
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) tutupModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('modal').classList.contains('tersembunyi')) tutupModal();
    if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'pesanUji') { e.preventDefault(); kirimUji(); }
  });
  // Filter lokal dengan jeda (debounce) — tanpa ke server
  const terapkan = debounce(el => {
    F(el.dataset.hal)[el.dataset.filter] = el.value;
    S.batas[el.dataset.hal] = BATAS_TAMPIL;
    if (S.hal === el.dataset.hal) renderIsiTanpaFilter(el.dataset.hal);
  }, 200);
  document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.filter) terapkan(e.target); });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset && t.dataset.filter && t.tagName !== 'INPUT') terapkan(t);
    if (t.dataset && t.dataset.aksiUbah === 'tempat-lain') { const lain = $(t.id + 'Lain'); if (lain) lain.classList.toggle('tersembunyi', t.value !== '__lain'); if (t.value === '__lain') lain.focus(); }
    if (t.dataset && t.dataset.aksiUbah === 'jenis-pencatatan') { $('blokAcara').classList.toggle('tersembunyi', t.value !== 'acara'); $('blokLainnya').classList.toggle('tersembunyi', t.value !== 'lainnya'); }
  });
  $('formLogin1').addEventListener('submit', e => { e.preventDefault(); login1(false); });
  $('formLogin2').addEventListener('submit', e => { e.preventDefault(); login2(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cekVersi(); });
}

/** Saat mengetik di filter, hanya daftar yang digambar ulang agar kursor tidak hilang. */
function renderIsiTanpaFilter(hal) {
  const sec = document.querySelector(`.hal[data-hal="${hal}"]`);
  const aktif = document.activeElement;
  const id = aktif && aktif.dataset ? aktif.dataset.filter : null;
  const posisi = aktif && 'selectionStart' in aktif ? aktif.selectionStart : null;
  renderHal(hal, false);
  if (id) {
    const baru = sec.querySelector(`[data-filter="${id}"]`);
    if (baru) { baru.focus(); try { if (posisi !== null) baru.setSelectionRange(posisi, posisi); } catch (e) { /* tipe date */ } }
  }
}

// ════════════════════════════════════════════════════════
// 18. MULAI
// ════════════════════════════════════════════════════════
function mulai() {
  pasangPendengar();
  S.token = ambilLS('bu_tok');
  const cache = ambilLS('bu_data', true);
  if (S.token && cache && cache.profil) {
    // Tampilkan data terakhir seketika, lalu perbarui dari server di latar
    S.data = cache;
    tampilAplikasi();
    segarkan(true).catch(() => {});
  } else if (S.token) {
    segarkan(false).catch(() => tampilLogin());
  } else {
    tampilLogin();
  }
}
document.addEventListener('DOMContentLoaded', mulai);

# PRD: Badminton Match Tracker

> Versi 1.0 | Oktober 2026
> Dokumen ini ditulis agar bisa langsung dipakai sebagai instruksi untuk membangun web app. Bagian bertanda **[WAJIB]** harus dipenuhi di MVP.

---

## 1. Ringkasan

Web app responsif (mobile-first) untuk mencatat pemain, mengacak pasangan dan lawan secara otomatis, mencatat skor, dan melanjutkan ke ronde berikutnya. Cocok dipakai saat mabar (main bareng) agar pembagian lawan adil dan skor tercatat rapi.

## 2. Tujuan

- Menghilangkan pembagian pasangan manual yang sering memicu perdebatan.
- Mencatat skor dengan cepat dan mudah dikoreksi.
- Bisa dipakai di HP saat di lapangan.

**Bukan tujuan (v1):** login multi-user, turnamen berbasis bagan, statistik jangka panjang, backend/server.

## 3. Target Pengguna

Penyelenggara atau peserta mabar yang memakai HP di pinggir lapangan. Satu orang biasanya yang memegang aplikasi.

## 4. Rekomendasi Teknis

Boleh diganti sesuai preferensi agent, selama kebutuhan di dokumen ini terpenuhi.

- Frontend saja (tanpa backend), single page app.
- Stack disarankan: React + Vite + Tailwind CSS, atau HTML/CSS/JS murni.
- Penyimpanan: `localStorage` (lihat bagian 8).
- Bahasa antarmuka: Indonesia.
- Tidak butuh library state besar; cukup state lokal/context.

## 5. Alur Utama

1. **Setup:** pilih mode (Ganda/Tunggal), input nama pemain satu per satu, lalu tekan **Mulai**.
2. **Pengacakan:** sistem mengacak pemain menjadi match-match ronde 1.
3. **Match:** user membuka tiap match, mengatur skor dengan tombol ▲ dan ▼, lalu menekan **Selesai**.
4. **Akhir ronde:** setelah semua match selesai, tampil ringkasan ronde dengan pilihan:
   - **Acak ulang & lanjut ronde berikutnya**
   - **Selesai** (lihat rekap)
5. **Rekap:** daftar semua match dan skor dari seluruh ronde, plus klasemen pemain.

## 6. Kebutuhan Fungsional

### 6.1 Input Pemain **[WAJIB]**

- Tambah nama lewat input teks dan tombol **Tambah** (atau tekan Enter).
- Hapus atau edit nama sebelum mulai.
- Validasi:
  - Nama tidak boleh kosong (abaikan spasi di awal/akhir).
  - Nama tidak boleh duplikat (tidak peka huruf besar/kecil).
  - Minimal 4 pemain untuk mode Ganda, minimal 2 untuk mode Tunggal.
  - Maksimal 30 pemain.
- Tombol **Mulai** nonaktif sampai validasi terpenuhi.

### 6.2 Pengacakan Match **[WAJIB]**

- **Ganda:** pemain diacak lalu dikelompokkan per 4 menjadi Tim A (2 orang) vs Tim B (2 orang).
- **Tunggal:** pemain diacak lalu dipasangkan per 2 (1 vs 1).
- **Jumlah pemain tidak habis dibagi:** sisanya masuk daftar **Istirahat**. Di ronde berikutnya, pemain yang sebelumnya istirahat diprioritaskan main.
- Setiap ronde baru diacak ulang, dengan upaya menghindari pasangan atau lawan yang sama persis dengan ronde sebelumnya (jika memungkinkan; jika tidak mungkin, tetap lanjut).
- Gunakan algoritma shuffle yang benar (Fisher-Yates), bukan `sort(() => Math.random() - 0.5)`.

Contoh jumlah match per ronde:

| Jumlah pemain | Mode Ganda | Mode Tunggal |
|---|---|---|
| 8 | 2 match, 0 istirahat | 4 match, 0 istirahat |
| 9 | 2 match, 1 istirahat | 4 match, 1 istirahat |
| 10 | 2 match, 2 istirahat | 5 match, 0 istirahat |
| 12 | 3 match, 0 istirahat | 6 match, 0 istirahat |

### 6.3 Skor **[WAJIB]**

- Setiap tim punya skor dengan tombol **▲** (+1) dan **▼** (−1).
- Skor minimum 0 (tidak bisa negatif).
- Tombol cukup besar untuk disentuh di HP (minimal 44×44px). Skor ditampilkan dengan angka besar.
- Opsional: target skor (default 21) yang menandai pemenang. Skor tetap bisa dikoreksi setelah mencapai target.
- Match yang sudah selesai masih bisa dibuka dan dikoreksi lewat **Edit skor**.

### 6.4 Status Match **[WAJIB]**

Alur status: `belum_main` → `sedang_main` → `selesai`.

- Status berubah menjadi `sedang_main` saat skor pertama diubah atau match dibuka.
- Status menjadi `selesai` saat user menekan **Selesai**.
- Tombol **Lanjut ronde** aktif hanya jika semua match di ronde aktif berstatus `selesai`.

### 6.5 Rekap & Riwayat

- Daftar match per ronde beserta skor akhir. **[WAJIB]**
- Klasemen sederhana per pemain: jumlah menang, kalah, dan total poin. (v1.1)
- Tombol **Mulai sesi baru** dengan dialog konfirmasi sebelum menghapus data. **[WAJIB]**

### 6.6 Penyimpanan **[WAJIB]**

- Seluruh state sesi tersimpan otomatis di `localStorage` setiap ada perubahan, agar tidak hilang saat halaman di-refresh.
- Saat halaman dibuka, jika ada sesi tersimpan, langsung pulihkan ke layar terakhir.
- Bungkus akses `localStorage` dengan try/catch.

## 7. Layar Utama

| Layar | Isi |
|---|---|
| Setup | Pilih mode, input dan daftar pemain, tombol Mulai |
| Daftar Match | Kartu match per ronde, daftar Istirahat, status tiap match |
| Detail Skor | Dua tim, skor besar, ▲ ▼, tombol Selesai |
| Akhir Ronde | Ringkasan ronde, tombol Acak ulang & lanjut / Selesai |
| Rekap | Riwayat match dan klasemen pemain |

## 8. Model Data (usulan)

```json
{
  "mode": "ganda",
  "targetSkor": 21,
  "pemain": [{ "id": "p1", "nama": "Andi" }],
  "ronde": [
    {
      "nomor": 1,
      "match": [
        {
          "id": "r1m1",
          "timA": ["p1", "p2"],
          "timB": ["p3", "p4"],
          "skorA": 0,
          "skorB": 0,
          "status": "belum_main"
        }
      ],
      "istirahat": ["p9"]
    }
  ],
  "rondeAktif": 1,
  "layar": "daftar_match"
}
```

## 9. Aturan Bisnis

- Satu pemain hanya boleh ada di satu match dalam satu ronde.
- Pengacakan tidak boleh mengubah match yang sudah berstatus `selesai`.
- Skor yang diedit setelah match selesai harus ikut memperbarui klasemen.
- Mengubah daftar pemain tidak diizinkan setelah sesi dimulai (v1).

## 10. Kebutuhan Non-Fungsional

- **Responsif:** mobile-first, nyaman dari lebar 360px sampai desktop. Tidak ada scroll horizontal.
- **Performa:** halaman termuat < 2 detik di jaringan 4G.
- **Usability:** tombol minimal 44×44px, kontras jelas, bisa dipakai satu tangan.
- **Aksesibilitas:** tombol ▲ ▼ punya label (`aria-label`) seperti "Tambah skor Tim A".
- **Kompatibilitas:** Chrome, Safari, Firefox versi terbaru.
- **Bahasa:** Indonesia.

## 11. Kriteria Penerimaan (acceptance criteria)

- [ ] Memasukkan 8 pemain dan memilih Ganda menghasilkan 2 match, dengan setiap pemain muncul tepat sekali.
- [ ] Memasukkan 9 pemain pada mode Ganda menghasilkan 2 match dan 1 pemain di daftar Istirahat.
- [ ] Nama kosong atau duplikat ditolak dengan pesan yang jelas.
- [ ] Tombol ▼ pada skor 0 tidak membuat skor negatif.
- [ ] Tombol **Lanjut ronde** nonaktif sampai semua match berstatus Selesai.
- [ ] Setelah **Acak ulang & lanjut**, pemain yang istirahat di ronde sebelumnya ikut bermain.
- [ ] Refresh halaman tidak menghilangkan data sesi.
- [ ] Match yang sudah selesai bisa diedit skornya.
- [ ] Layout tetap rapi di lebar 360px dan di desktop.
- [ ] **Mulai sesi baru** meminta konfirmasi sebelum menghapus data.

## 12. Metrik Keberhasilan

- Waktu dari buka web sampai match pertama tersusun < 1 menit untuk 8 pemain.
- Pengguna bisa menyelesaikan satu ronde tanpa panduan tambahan.
- Tidak ada kehilangan data saat refresh.

## 13. Rilis Bertahap

| Rilis | Cakupan |
|---|---|
| **MVP** | Setup pemain, pengacakan, skor ▲▼, lanjut ronde, simpan di localStorage |
| **v1.1** | Klasemen, target skor, riwayat sesi |
| **v2** | Akun, simpan di server, bagikan link, mode turnamen |

## 14. Asumsi (karena belum dijawab)

Agent boleh memakai asumsi berikut dan menandainya jelas di antarmuka atau README:

1. Mode default adalah **Ganda**, dengan opsi mode Tunggal.
2. Pemain sisa dibagi lewat sistem **istirahat bergilir** (yang istirahat diprioritaskan main di ronde berikutnya).
3. Skor dihitung **manual** tanpa aturan resmi (tanpa deuce atau selisih 2 poin). Target skor opsional, default 21.
4. Data cukup tersimpan di **perangkat yang sama** (localStorage).
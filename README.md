# Bultang Match Tracker

Web app responsif (mobile-first) untuk mabar badminton: input pemain, acak pasangan otomatis,
catat skor dengan tombol ▲ ▼, lanjut ronde, dan lihat rekap + klasemen.

Spesifikasi lengkap ada di [`PRD_Badminton_Match_Tracker.md`](./PRD_Badminton_Match_Tracker.md).

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run build      # build produksi
```

## Perintah penting

| Perintah | Fungsi |
|---|---|
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run test` | Jalankan seluruh unit + UI test |
| `npm run test:watch` | Mode watch |
| `npm run build` | Typecheck lalu build produksi |

## Struktur

```
src/
  domain/          # logika murni (tanpa React) — diuji pada seam domain
    shuffle.ts     # Fisher-Yates
    validation.ts  # validasi nama & syarat jumlah pemain
    pairing.ts     # pengacakan match, aturan istirahat, anti-pasangan berulang
    score.ts       # ubah skor, status match, pemenang target skor
    standings.ts   # klasemen menang/kalah/poin
    session.ts     # reducer state sesi (alur layar)
  components/      # lima layar utama
  storage.ts       # pembungkus localStorage (try/catch + validasi struktur)
  test/harness.ts  # helper untuk UI test
```

## Seam pengujian

Sepakat dengan pemilik PRD, test ditulis di dua seam:

1. **Domain** — fungsi murni di `src/domain/*.test.ts` (pengacakan, skor, status, klasemen,
   reducer sesi) plus `src/storage.test.ts`.
2. **UI** — perilaku yang terlihat lewat `src/App.setup.test.tsx` dan `src/App.skor.test.tsx`
   (validasi input, alur ronde, tombol nonaktif, konfirmasi sesi baru, pemulihan refresh).

## Asumsi (PRD bagian 14)

1. Mode default **Ganda**, opsi **Tunggal** tersedia di layar Setup.
2. Pemain sisa memakai **istirahat bergilir**: yang istirahat diprioritaskan main di ronde
   berikutnya.
3. Skor dihitung **manual** — tanpa deuce/selisih 2. Target skor default 21 bersifat opsional
   dan hanya menandai pemenang; skor tetap bisa dikoreksi setelah match selesai.
4. Data hanya tersimpan di **perangkat yang sama** (`localStorage`, kunci `bultang.sesi.v1`).
5. **Interpretasi alur akhir ronde:** setelah match terakhir diselesaikan aplikasi kembali ke
   daftar match, tombol **Lanjut ronde** baru aktif, lalu layar *Ringkasan Ronde* menawarkan
   **Acak ulang & lanjut ronde berikutnya** / **Selesai** (lihat rekap). Ini memenuhi kriteria
   "tombol Lanjut ronde nonaktif sampai semua match Selesai" sekaligus alur ringkasan di PRD §5.
6. **Klasemen** (PRD §6.5, rilis v1.1) ikut diimplementasikan karena dipakai di layar Rekap.
   *Poin* = total skor tim tempat pemain bermain; match yang belum selesai tidak dihitung.

## Catatan implementasi

- Stack: React 19 + Vite + TypeScript + Tailwind CSS 4 + Vitest/Testing Library.
- Pengacakan memakai Fisher-Yates dengan percobaan berulang: kandidat dinilai dari jumlah
  pasangan/lawan yang sama dengan ronde sebelumnya, lalu kandidat terbaik dipakai. Bila tidak
  mungkin dihindari (mis. 8 pemain ganda), ronde tetap dibuat.
- Aksesibilitas: tombol ▲ ▼ punya `aria-label` ("Tambah skor Tim A"), kontrol sentuh
  minimal 44 px, kontras jelas, satu tangan.
- Responsif: mobile-first dari lebar 360 px sampai desktop, tanpa scroll horizontal.

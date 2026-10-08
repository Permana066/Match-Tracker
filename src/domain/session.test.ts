import { describe, expect, it } from 'vitest'
import { pesanHapusPemain, reducer, sesiAwal } from './session'
import type { Sesi } from './types'

const punyaPemain = (jumlah: number, tambahan: Partial<Sesi> = {}): Sesi => {
  let s = sesiAwal()
  for (let i = 1; i <= jumlah; i++) {
    s = reducer(s, { type: 'tambah_pemain', nama: `Pemain ${i}` })
  }
  return { ...s, ...tambahan }
}

const mulai = (jumlah: number, mode: Sesi['mode'] = 'ganda'): Sesi =>
  reducer({ ...punyaPemain(jumlah), mode }, { type: 'mulai' })

const selesaikanSemuaMatch = (s: Sesi): Sesi => {
  let sekarang = s
  for (;;) {
    const ronde = sekarang.ronde[sekarang.rondeAktif - 1]
    const belum = ronde.match.find((m) => m.status !== 'selesai')
    if (!belum) return sekarang
    sekarang = reducer(sekarang, { type: 'buka_match', id: belum.id })
    sekarang = reducer(sekarang, { type: 'ubah_skor', tim: 'A', delta: 1 })
    sekarang = reducer(sekarang, { type: 'selesaikan_match' })
  }
}

describe('reducer — setup pemain', () => {
  it('menambahkan pemain dengan id unik', () => {
    const s = reducer(reducer(sesiAwal(), { type: 'tambah_pemain', nama: 'Andi' }), {
      type: 'tambah_pemain',
      nama: 'Budi',
    })
    expect(s.pemain.map((p) => p.nama)).toEqual(['Andi', 'Budi'])
    expect(new Set(s.pemain.map((p) => p.id)).size).toBe(2)
  })

  it('menghapus pemain sebelum sesi dimulai', () => {
    const s = reducer(punyaPemain(3), { type: 'hapus_pemain', id: 'p2' })
    expect(s.pemain.map((p) => p.nama)).toEqual(['Pemain 1', 'Pemain 3'])
  })

  it('mengedit nama pemain sebelum sesi dimulai', () => {
    const s = reducer(punyaPemain(2), { type: 'edit_pemain', id: 'p1', nama: 'Andi' })
    expect(s.pemain[0].nama).toBe('Andi')
  })
})

describe('reducer — kelola pemain di tengah sesi', () => {
  it('mengizinkan menambah pemain setelah sesi dimulai', () => {
    const s = reducer(mulai(4), { type: 'tambah_pemain', nama: 'Datang Terlambat' })
    expect(s.pemain.map((p) => p.nama)).toContain('Datang Terlambat')
    expect(s.pemain).toHaveLength(5)
  })

  it('menempatkan pemain baru di istirahat ronde aktif, bukan di match', () => {
    const s = reducer(mulai(4), { type: 'tambah_pemain', nama: 'Baru' })
    const id = s.pemain[4].id
    expect(s.ronde[0].istirahat).toEqual([id])
    const yangMain = s.ronde[0].match.flatMap((m) => [...m.timA, ...m.timB])
    expect(yangMain).not.toContain(id)
  })

  it('pemain baru ikut bermain pada ronde berikutnya', () => {
    let s = mulai(8)
    s = reducer(s, { type: 'tambah_pemain', nama: 'Baru' })
    const id = s.pemain[8].id
    s = reducer(selesaikanSemuaMatch(s), { type: 'ronde_berikutnya' })
    const diMatch = s.ronde[1].match.flatMap((m) => [...m.timA, ...m.timB])
    expect(diMatch).toContain(id)
    expect(s.ronde[1].istirahat).not.toContain(id)
  })

  it('mengedit nama pemain di tengah sesi', () => {
    const s = reducer(mulai(4), { type: 'edit_pemain', id: 'p1', nama: 'Andi Saputra' })
    expect(s.pemain[0].nama).toBe('Andi Saputra')
  })

  it('menolak menghapus pemain yang masih terdaftar di match belum selesai', () => {
    const s = mulai(4)
    expect(pesanHapusPemain(s, 'p1')).toMatch(/belum selesai/)
    expect(reducer(s, { type: 'hapus_pemain', id: 'p1' }).pemain).toHaveLength(4)
  })

  it('mengizinkan menghapus pemain yang sedang istirahat dan mengarsipkannya', () => {
    const s = mulai(5)
    const istirahat = s.ronde[0].istirahat[0]
    expect(istirahat).toBeDefined()

    const setelah = reducer(s, { type: 'hapus_pemain', id: istirahat })
    expect(setelah.pemain).toHaveLength(4)
    expect(setelah.arsipPemain.map((p) => p.id)).toEqual([istirahat])
    expect(setelah.ronde[0].istirahat).not.toContain(istirahat)
  })

  it('mempertahankan nama pemain terhapus untuk match lama', () => {
    const s = mulai(5)
    const istirahat = s.ronde[0].istirahat[0]
    const nama = s.pemain.find((p) => p.id === istirahat)!.nama
    const setelah = reducer(s, { type: 'hapus_pemain', id: istirahat })
    expect(setelah.arsipPemain.map((p) => p.nama)).toEqual([nama])
    expect(setelah.pemain.some((p) => p.id === istirahat)).toBe(false)
  })

  it('menolak menghapus pemain sampai di bawah jumlah minimum mode', () => {
    const s = selesaikanSemuaMatch(mulai(4))
    expect(pesanHapusPemain(s, 'p1')).toMatch(/Minimal 4/)
    expect(reducer(s, { type: 'hapus_pemain', id: 'p1' }).pemain).toHaveLength(4)
  })

  it('mengizinkan menghapus pemain setelah match ronde ini selesai', () => {
    const s = selesaikanSemuaMatch(mulai(5))
    const istirahat = s.ronde[0].istirahat[0]
    const pemainMatch = s.ronde[0].match[0].timA[0]
    expect(pesanHapusPemain(s, pemainMatch)).toBeNull()

    const setelah = reducer(s, { type: 'hapus_pemain', id: pemainMatch })
    expect(setelah.pemain.map((p) => p.id)).not.toContain(pemainMatch)
    expect(setelah.arsipPemain.map((p) => p.id)).toContain(pemainMatch)
    expect(setelah.ronde[0].istirahat).toEqual([istirahat])
  })

  it('id pemain baru tidak bentrok dengan id yang sudah diarsipkan', () => {
    let s = selesaikanSemuaMatch(mulai(5))
    s = reducer(s, { type: 'hapus_pemain', id: 'p5' })
    s = reducer(s, { type: 'tambah_pemain', nama: 'Pengganti' })

    expect(s.pemain.map((p) => p.id)).not.toContain('p5')
    const semuaId = [...s.pemain, ...s.arsipPemain].map((p) => p.id)
    expect(new Set(semuaId).size).toBe(semuaId.length)
    expect(s.pemain.map((p) => p.id)).toContain('p6')
  })

  it('pesan hapus kosong sebelum sesi dimulai', () => {
    expect(pesanHapusPemain(punyaPemain(4), 'p1')).toBeNull()
  })
})

describe('reducer — memulai sesi', () => {
  it('membuat ronde 1 dan berpindah ke layar daftar_match', () => {
    const s = mulai(8)
    expect(s.layar).toBe('daftar_match')
    expect(s.ronde).toHaveLength(1)
    expect(s.ronde[0].match).toHaveLength(2)
    expect(s.rondeAktif).toBe(1)
  })

  it('menyimpan pilihan mode dan target skor', () => {
    const s = reducer({ ...punyaPemain(2), mode: 'tunggal', targetSkor: 21 }, { type: 'mulai' })
    expect(s.mode).toBe('tunggal')
    expect(s.targetSkor).toBe(21)
  })
})

describe('reducer — alur match', () => {
  it('membuka match menuju layar detail_skor dan menandai sedang_main', () => {
    const s = reducer(mulai(8), { type: 'buka_match', id: 'r1m1' })
    expect(s.layar).toBe('detail_skor')
    expect(s.matchAktif).toBe('r1m1')
    expect(s.ronde[0].match[0].status).toBe('sedang_main')
  })

  it('mengubah skor match yang sedang dibuka', () => {
    let s = reducer(mulai(8), { type: 'buka_match', id: 'r1m1' })
    s = reducer(s, { type: 'ubah_skor', tim: 'A', delta: 1 })
    s = reducer(s, { type: 'ubah_skor', tim: 'B', delta: 1 })
    expect(s.ronde[0].match[0]).toMatchObject({ skorA: 1, skorB: 1, status: 'sedang_main' })
  })

  it('skor tidak pernah menjadi negatif', () => {
    let s = reducer(mulai(8), { type: 'buka_match', id: 'r1m1' })
    s = reducer(s, { type: 'ubah_skor', tim: 'A', delta: -1 })
    s = reducer(s, { type: 'ubah_skor', tim: 'A', delta: -1 })
    expect(s.ronde[0].match[0].skorA).toBe(0)
  })

  it('menyelesaikan match dan kembali ke daftar_match', () => {
    let s = reducer(mulai(8), { type: 'buka_match', id: 'r1m1' })
    s = reducer(s, { type: 'selesaikan_match' })
    expect(s.layar).toBe('daftar_match')
    expect(s.matchAktif).toBeNull()
    expect(s.ronde[0].match[0].status).toBe('selesai')
  })

  it('menuju akhir_ronde saat seluruh match ronde sudah selesai', () => {
    const s = selesaikanSemuaMatch(mulai(8))
    expect(s.layar).toBe('akhir_ronde')
  })

  it('masih mengizinkan koreksi skor match yang sudah selesai', () => {
    let s = selesaikanSemuaMatch(mulai(8))
    s = reducer(s, { type: 'buka_match', id: 'r1m1' })
    expect(s.ronde[0].match[0].status).toBe('selesai')
    s = reducer(s, { type: 'ubah_skor', tim: 'A', delta: -1 })
    expect(s.ronde[0].match[0].skorA).toBe(0)
    expect(s.ronde[0].match[0].status).toBe('selesai')
  })
})

describe('reducer — lanjut ronde', () => {
  it('tidak bisa menuju akhir ronde sebelum semua match selesai', () => {
    const s = mulai(8)
    expect(s.ronde[0].match.some((m) => m.status !== 'selesai')).toBe(true)
    const lanjut = reducer(s, { type: 'ke_akhir_ronde' })
    expect(lanjut.layar).toBe('daftar_match')
  })

  it('ronde berikutnya dibuat ulang dan pemain istirahat ikut bermain', () => {
    const r1 = selesaikanSemuaMatch(mulai(9))
    const istirahatR1 = r1.ronde[0].istirahat
    expect(istirahatR1).toHaveLength(1)

    const r2 = reducer(r1, { type: 'ronde_berikutnya' })
    expect(r2.ronde).toHaveLength(2)
    expect(r2.rondeAktif).toBe(2)
    expect(r2.ronde[1].istirahat).not.toContain(istirahatR1[0])
    expect(r2.ronde[1].match.every((m) => m.status === 'belum_main')).toBe(true)
  })

  it('ronde 1 yang sudah selesai tidak berubah saat ronde baru dibuat', () => {
    const s = selesaikanSemuaMatch(mulai(8))
    const r1Sebelum = JSON.stringify(s.ronde[0])
    const setelah = reducer(s, { type: 'ronde_berikutnya' })
    expect(JSON.stringify(setelah.ronde[0])).toBe(r1Sebelum)
  })
})

describe('reducer — akhir sesi', () => {
  it('menuju layar rekap', () => {
    const s = selesaikanSemuaMatch(mulai(8))
    expect(reducer(s, { type: 'lihat_rekap' }).layar).toBe('rekap')
  })

  it('mulai sesi baru mengosongkan seluruh data', () => {
    const s = reducer(selesaikanSemuaMatch(mulai(8)), { type: 'sesi_baru' })
    expect(s).toEqual(sesiAwal())
  })
})

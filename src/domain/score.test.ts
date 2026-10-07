import { describe, expect, it } from 'vitest'
import { bukaMatch, pemenang, rondeSelesai, selesaikanMatch, ubahSkor } from './score'
import type { Match } from './types'

const match = (ubah: Partial<Match> = {}): Match => ({
  id: 'r1m1',
  timA: ['p1', 'p2'],
  timB: ['p3', 'p4'],
  skorA: 0,
  skorB: 0,
  status: 'belum_main',
  ...ubah,
})

describe('ubahSkor', () => {
  it('menambah skor tim A dan tim B satu per satu', () => {
    expect(ubahSkor(match(), 'A', 1).skorA).toBe(1)
    expect(ubahSkor(match(), 'B', 1).skorB).toBe(1)
  })

  it('tidak menurunkan skor di bawah 0', () => {
    const hasil = ubahSkor(match({ skorA: 0 }), 'A', -1)
    expect(hasil.skorA).toBe(0)
  })

  it('mengubah status menjadi sedang_main saat skor pertama diubah', () => {
    expect(ubahSkor(match(), 'A', 1).status).toBe('sedang_main')
  })

  it('mempertahankan status selesai saat skor selesai diedit', () => {
    const hasil = ubahSkor(match({ status: 'selesai', skorA: 21 }), 'A', -1)
    expect(hasil.status).toBe('selesai')
    expect(hasil.skorA).toBe(20)
  })
})

describe('bukaMatch', () => {
  it('menandai sedang_main saat match belum dimainkan dibuka', () => {
    expect(bukaMatch(match()).status).toBe('sedang_main')
  })

  it('tidak menurunkan status match yang sudah selesai', () => {
    expect(bukaMatch(match({ status: 'selesai' })).status).toBe('selesai')
  })
})

describe('selesaikanMatch', () => {
  it('menandai match berstatus selesai', () => {
    expect(selesaikanMatch(match({ status: 'sedang_main' })).status).toBe('selesai')
  })
})

describe('pemenang', () => {
  it('belum ada pemenang sebelum skor target tercapai', () => {
    expect(pemenang(match({ skorA: 20, skorB: 15 }), 21)).toBeNull()
  })

  it('menandai pemenang begitu skor target tercapai', () => {
    expect(pemenang(match({ skorA: 21, skorB: 15 }), 21)).toBe('A')
    expect(pemenang(match({ skorA: 15, skorB: 21 }), 21)).toBe('B')
  })

  it('skor target yang lebih tinggi tetap menang', () => {
    expect(pemenang(match({ skorA: 22, skorB: 21 }), 21)).toBe('A')
  })

  it('seri saat skor sama meski sudah melewati target', () => {
    expect(pemenang(match({ skorA: 22, skorB: 22 }), 21)).toBeNull()
  })
})

describe('rondeSelesai', () => {
  it('false bila masih ada match yang belum selesai', () => {
    expect(
      rondeSelesai({
        nomor: 1,
        istirahat: [],
        match: [match({ status: 'selesai' }), match({ id: 'r1m2' })],
      }),
    ).toBe(false)
  })

  it('true bila semua match berstatus selesai', () => {
    expect(
      rondeSelesai({
        nomor: 1,
        istirahat: [],
        match: [match({ status: 'selesai' }), match({ id: 'r1m2', status: 'selesai' })],
      }),
    ).toBe(true)
  })
})

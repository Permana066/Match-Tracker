import { describe, expect, it } from 'vitest'
import { buatRonde } from './pairing'
import type { Ronde } from './types'

const pemain = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`)

const pasangan = (r: Ronde) =>
  r.match.map((m) => [...m.timA, ...m.timB].sort().join('|'))

const semuaPemain = (r: Ronde) => [
  ...r.match.flatMap((m) => [...m.timA, ...m.timB]),
  ...r.istirahat,
]

const urutNatural = (ids: readonly string[]) =>
  [...ids].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))

describe('buatRonde — jumlah match dan istirahat sesuai tabel PRD', () => {
  const kasus: Array<[number, 'ganda' | 'tunggal', number, number]> = [
    [8, 'ganda', 2, 0],
    [9, 'ganda', 2, 1],
    [10, 'ganda', 2, 2],
    [12, 'ganda', 3, 0],
    [8, 'tunggal', 4, 0],
    [9, 'tunggal', 4, 1],
    [10, 'tunggal', 5, 0],
    [12, 'tunggal', 6, 0],
  ]

  it.each(kasus)('%i pemain mode %s → %i match, %i istirahat', (n, mode, match, istirahat) => {
    const r = buatRonde(1, pemain(n), mode)
    expect(r.match).toHaveLength(match)
    expect(r.istirahat).toHaveLength(istirahat)
  })
})

describe('buatRonde — setiap pemain muncul tepat sekali', () => {
  it.each([8, 9, 10, 11, 12, 13])('%i pemain mode ganda', (n) => {
    const r = buatRonde(1, pemain(n), 'ganda')
    expect(urutNatural(semuaPemain(r))).toEqual(pemain(n))
  })

  it.each([2, 3, 5, 7])('%i pemain mode tunggal', (n) => {
    const r = buatRonde(1, pemain(n), 'tunggal')
    expect(urutNatural(semuaPemain(r))).toEqual(pemain(n))
  })
})

describe('buatRonde — komposisi tim', () => {
  it('ganda memasangkan 2 vs 2', () => {
    const r = buatRonde(1, pemain(8), 'ganda')
    for (const m of r.match) {
      expect(m.timA).toHaveLength(2)
      expect(m.timB).toHaveLength(2)
    }
  })

  it('tunggal memasangkan 1 vs 1', () => {
    const r = buatRonde(1, pemain(6), 'tunggal')
    for (const m of r.match) {
      expect(m.timA).toHaveLength(1)
      expect(m.timB).toHaveLength(1)
    }
  })

  it('semua match berstatus belum_main', () => {
    const r = buatRonde(1, pemain(8), 'ganda')
    expect(r.match.every((m) => m.status === 'belum_main')).toBe(true)
  })
})

describe('buatRonde — istirahat bergilir', () => {
  it('pemain yang istirahat di ronde sebelumnya diprioritaskan main', () => {
    const daftar = pemain(9)
    const r1 = buatRonde(1, daftar, 'ganda')
    expect(r1.istirahat).toHaveLength(1)

    const r2 = buatRonde(2, daftar, 'ganda', r1)
    expect(r2.istirahat).not.toContain(r1.istirahat[0])
  })

  it('tetap menghasilkan daftar istirahat yang valid di ronde berikutnya', () => {
    const daftar = pemain(9)
    const r1 = buatRonde(1, daftar, 'ganda')
    const r2 = buatRonde(2, daftar, 'ganda', r1)
    expect(r2.match).toHaveLength(2)
    expect(r2.istirahat).toHaveLength(1)
    expect([...semuaPemain(r2)].sort()).toEqual(daftar)
  })
})

describe('buatRonde — menghindari pasangan/lawan yang sama dengan ronde sebelumnya', () => {
  it('tidak mengulang pasangan yang sama saat masih memungkinkan', () => {
    const daftar = ['p1', 'p2', 'p3', 'p4']
    const r1 = buatRonde(1, daftar, 'tunggal')
    const kena = pasangan(r1)

    for (let coba = 0; coba < 20; coba++) {
      const r2 = buatRonde(2, daftar, 'tunggal', r1)
      expect(pasangan(r2).some((p) => kena.includes(p))).toBe(false)
    }
  })

  it('tetap melanjutkan meski menghindari pasangan tidak mungkin', () => {
    const daftar = pemain(8)
    const r1 = buatRonde(1, daftar, 'ganda')
    const r2 = buatRonde(2, daftar, 'ganda', r1)
    expect(r2.match).toHaveLength(2)
    expect([...semuaPemain(r2)].sort()).toEqual(daftar)
  })
})

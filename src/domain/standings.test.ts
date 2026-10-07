import { describe, expect, it } from 'vitest'
import { klasemen } from './standings'
import type { Match, Pemain, Ronde } from './types'

const daftarPemain: Pemain[] = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eka'].map((nama, i) => ({
  id: `p${i + 1}`,
  nama,
}))

const match = (ubah: Partial<Match> & Pick<Match, 'id'>): Match => ({
  timA: ['p1', 'p2'],
  timB: ['p3', 'p4'],
  skorA: 0,
  skorB: 0,
  status: 'selesai',
  ...ubah,
})

const ronde = (...match: Match[]): Ronde => ({ nomor: 1, match, istirahat: ['p5'] })

const cari = (baris: ReturnType<typeof klasemen>, id: string) => baris.find((b) => b.id === id)!

describe('klasemen', () => {
  it('mencatat menang dan kalah dari match yang sudah selesai', () => {
    const hasil = klasemen([ronde(match({ id: 'r1m1', skorA: 21, skorB: 15 }))], daftarPemain)

    expect(cari(hasil, 'p1')).toMatchObject({ menang: 1, kalah: 0 })
    expect(cari(hasil, 'p3')).toMatchObject({ menang: 0, kalah: 1 })
  })

  it('menjumlahkan total poin yang dicetak tim tempat pemain bermain', () => {
    const hasil = klasemen(
      [ronde(match({ id: 'r1m1', skorA: 21, skorB: 15 }), match({ id: 'r1m2', skorA: 10, skorB: 21, timA: ['p5', 'p1'], timB: ['p2', 'p3'] }))],
      daftarPemain,
    )

    expect(cari(hasil, 'p1').poin).toBe(21 + 10)
    expect(cari(hasil, 'p3').poin).toBe(15 + 21)
  })

  it('match yang belum selesai tidak dihitung', () => {
    const hasil = klasemen(
      [ronde(match({ id: 'r1m1', status: 'sedang_main', skorA: 21, skorB: 0 }))],
      daftarPemain,
    )
    expect(cari(hasil, 'p1')).toMatchObject({ menang: 0, kalah: 0, poin: 0 })
  })

  it('memperbarui klasemen saat skor match selesai diedit', () => {
    const sebelum = klasemen([ronde(match({ id: 'r1m1', skorA: 21, skorB: 15 }))], daftarPemain)
    expect(cari(sebelum, 'p1').menang).toBe(1)

    const sesudah = klasemen(
      [ronde(match({ id: 'r1m1', skorA: 15, skorB: 21 }))],
      daftarPemain,
    )
    expect(cari(sesudah, 'p1')).toMatchObject({ menang: 0, kalah: 1 })
    expect(cari(sesudah, 'p3').menang).toBe(1)
  })

  it('pemain yang istirahat tetap muncul dengan nilai 0', () => {
    const hasil = klasemen([ronde(match({ id: 'r1m1', skorA: 21, skorB: 15 }))], daftarPemain)
    expect(cari(hasil, 'p5')).toMatchObject({ menang: 0, kalah: 0, poin: 0 })
  })

  it('diurutkan dari menang terbanyak, lalu poin terbanyak', () => {
    const hasil = klasemen(
      [
        {
          nomor: 1,
          istirahat: [],
          match: [
            match({ id: 'r1m1', timA: ['p1'], timB: ['p2'], skorA: 21, skorB: 5 }),
            match({ id: 'r1m2', timA: ['p3'], timB: ['p4'], skorA: 11, skorB: 5 }),
          ],
        },
      ],
      daftarPemain,
    )

    expect(hasil.map((b) => b.id).slice(0, 2)).toEqual(['p1', 'p3'])
    expect(cari(hasil, 'p1').poin).toBeGreaterThan(cari(hasil, 'p3').poin)
    expect(hasil.map((b) => b.id)).toContain('p5')
  })
})

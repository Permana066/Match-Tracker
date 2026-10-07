import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'

const angka = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

describe('shuffle', () => {
  it('mengembalikan semua elemen input tepat sekali (permutasi)', () => {
    const hasil = shuffle(angka(10))
    expect(hasil).toHaveLength(10)
    expect([...hasil].sort((a, b) => a - b)).toEqual(angka(10))
  })

  it('tidak mengubah array input', () => {
    const input = angka(10)
    const salinan = [...input]
    shuffle(input)
    expect(input).toEqual(salinan)
  })

  it('benar-benar mengacak, bukan sekadar mempertahankan urutan', () => {
    const urutanAwal = new Set<string>()
    for (let i = 0; i < 200; i++) {
      urutanAwal.add(shuffle(angka(8)).join(','))
    }
    expect(urutanAwal.size).toBeGreaterThan(1)
  })
})

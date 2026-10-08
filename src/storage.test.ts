import { beforeEach, describe, expect, it } from 'vitest'
import { KUNCI_SESI, muatSesi, simpanSesi } from './storage'
import { sesiAwal } from './domain/session'
import type { Sesi } from './domain/types'

const sesiContoh = (): Sesi => ({
  ...sesiAwal(),
  pemain: [{ id: 'p1', nama: 'Andi' }],
  ronde: [
    {
      nomor: 1,
      istirahat: ['p2'],
      match: [{ id: 'r1m1', timA: ['p1'], timB: ['p2'], skorA: 21, skorB: 15, status: 'selesai' }],
    },
  ],
  rondeAktif: 1,
  layar: 'daftar_match',
})

describe('penyimpanan sesi', () => {
  beforeEach(() => localStorage.clear())

  it('menyimpan dan memulihkan sesi apa adanya', () => {
    const sesi = sesiContoh()
    simpanSesi(sesi)
    expect(muatSesi()).toEqual(sesi)
  })

  it('mengembalikan null bila belum ada sesi tersimpan', () => {
    expect(muatSesi()).toBeNull()
  })

  it('mengembalikan null bila data rusak, tanpa melempar error', () => {
    localStorage.setItem(KUNCI_SESI, '{rusak')
    expect(muatSesi()).toBeNull()
  })

  it('mengembalikan null bila struktur data tidak sesuai', () => {
    localStorage.setItem(KUNCI_SESI, JSON.stringify({ mode: 'ganda' }))
    expect(muatSesi()).toBeNull()
  })

  it('memulihkan sesi lama yang belum punya arsipPemain', () => {
    const sesi = sesiContoh()
    const lama: Record<string, unknown> = { ...sesi }
    delete lama.arsipPemain
    localStorage.setItem(KUNCI_SESI, JSON.stringify(lama))
    expect(muatSesi()).toEqual({ ...sesi, arsipPemain: [] })
  })

  it('tetap aman saat localStorage tidak bisa diakses', () => {
    const asli = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    expect(() => simpanSesi(sesiContoh())).not.toThrow()
    Storage.prototype.setItem = asli
  })
})

import { describe, expect, it } from 'vitest'
import { pesanValidasiMulai, validasiNamaBaru } from './validation'

const daftar = ['Andi', 'Budi']

describe('validasiNamaBaru', () => {
  it('menerima nama baru dan memangkas spasi di awal/akhir', () => {
    const hasil = validasiNamaBaru('  Cahya  ', daftar)
    expect(hasil).toEqual({ ok: true, nama: 'Cahya' })
  })

  it('menolak nama kosong', () => {
    const hasil = validasiNamaBaru('   ', daftar)
    expect(hasil).toEqual({ ok: false, pesan: 'Nama tidak boleh kosong.' })
  })

  it('menolak nama duplikat tanpa memperhatikan huruf besar/kecil', () => {
    const hasil = validasiNamaBaru('aNDI', daftar)
    expect(hasil).toEqual({ ok: false, pesan: 'Nama "Andi" sudah terdaftar.' })
  })
})

describe('pesanValidasiMulai', () => {
  it('mengizinkan 4 pemain pada mode ganda', () => {
    expect(pesanValidasiMulai(4, 'ganda')).toBeNull()
  })

  it('menolak kurang dari 4 pemain pada mode ganda', () => {
    expect(pesanValidasiMulai(3, 'ganda')).toBe('Minimal 4 pemain untuk mode Ganda.')
  })

  it('mengizinkan 2 pemain pada mode tunggal', () => {
    expect(pesanValidasiMulai(2, 'tunggal')).toBeNull()
  })

  it('menolak kurang dari 2 pemain pada mode tunggal', () => {
    expect(pesanValidasiMulai(1, 'tunggal')).toBe('Minimal 2 pemain untuk mode Tunggal.')
  })

  it('mengizinkan tepat 30 pemain pada kedua mode', () => {
    expect(pesanValidasiMulai(30, 'ganda')).toBeNull()
    expect(pesanValidasiMulai(30, 'tunggal')).toBeNull()
  })

  it('menolak lebih dari 30 pemain', () => {
    expect(pesanValidasiMulai(31, 'ganda')).toBe('Maksimal 30 pemain.')
  })
})

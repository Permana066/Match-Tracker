import type { Mode } from './types'

export const MAKSIMAL_PEMAIN = 30

const MINIMAL: Record<Mode, number> = { ganda: 4, tunggal: 2 }

export type HasilValidasiNama = { ok: true; nama: string } | { ok: false; pesan: string }

export function validasiNamaBaru(input: string, daftar: readonly string[]): HasilValidasiNama {
  const nama = input.trim()
  if (!nama) {
    return { ok: false, pesan: 'Nama tidak boleh kosong.' }
  }
  const kembar = daftar.find((n) => n.toLowerCase() === nama.toLowerCase())
  if (kembar !== undefined) {
    return { ok: false, pesan: `Nama "${kembar}" sudah terdaftar.` }
  }
  return { ok: true, nama }
}

export function pesanValidasiMulai(jumlah: number, mode: Mode): string | null {
  if (jumlah > MAKSIMAL_PEMAIN) return `Maksimal ${MAKSIMAL_PEMAIN} pemain.`
  if (jumlah < MINIMAL[mode]) {
    return mode === 'ganda'
      ? 'Minimal 4 pemain untuk mode Ganda.'
      : 'Minimal 2 pemain untuk mode Tunggal.'
  }
  return null
}

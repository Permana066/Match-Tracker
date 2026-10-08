import type { Match, Pemain, Ronde, Sesi, StatusMatch } from './domain/types'

export const KUNCI_SESI = 'bultang.sesi.v1'

const objek = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const daftarString = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string')

const daftarPemain = (v: unknown): v is Pemain[] =>
  Array.isArray(v) && v.every((x) => objek(x) && typeof x.id === 'string' && typeof x.nama === 'string')

const STATUS: StatusMatch[] = ['belum_main', 'sedang_main', 'selesai']

const daftarMatch = (v: unknown): v is Match[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      objek(x) &&
      typeof x.id === 'string' &&
      daftarString(x.timA) &&
      daftarString(x.timB) &&
      typeof x.skorA === 'number' &&
      typeof x.skorB === 'number' &&
      STATUS.includes(x.status as StatusMatch),
  )

const daftarRonde = (v: unknown): v is Ronde[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      objek(x) && typeof x.nomor === 'number' && daftarMatch(x.match) && daftarString(x.istirahat),
  )

type SesiTersimpan = Omit<Sesi, 'arsipPemain'> & { arsipPemain?: Pemain[] }

function apakahSesi(v: unknown): v is SesiTersimpan {
  if (!objek(v)) return false
  return (
    (v.mode === 'ganda' || v.mode === 'tunggal') &&
    typeof v.targetSkor === 'number' &&
    daftarPemain(v.pemain) &&
    (v.arsipPemain === undefined || daftarPemain(v.arsipPemain)) &&
    daftarRonde(v.ronde) &&
    typeof v.rondeAktif === 'number' &&
    typeof v.layar === 'string' &&
    (v.matchAktif === null || typeof v.matchAktif === 'string')
  )
}

export function simpanSesi(sesi: Sesi): void {
  try {
    localStorage.setItem(KUNCI_SESI, JSON.stringify(sesi))
  } catch {
    // localStorage penuh atau tidak tersedia — sesi tetap hidup di memori.
  }
}

export function muatSesi(): Sesi | null {
  try {
    const mentah = localStorage.getItem(KUNCI_SESI)
    if (!mentah) return null
    const data: unknown = JSON.parse(mentah)
    return apakahSesi(data) ? { ...data, arsipPemain: data.arsipPemain ?? [] } : null
  } catch {
    return null
  }
}

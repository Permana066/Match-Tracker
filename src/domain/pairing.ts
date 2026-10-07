import { shuffle } from './shuffle'
import type { Match, Mode, Ronde } from './types'

const KAPASITAS: Record<Mode, number> = { ganda: 4, tunggal: 2 }
const UKURAN_TIM: Record<Mode, number> = { ganda: 2, tunggal: 1 }
const PERCOBAAN = 120

const kunci = (a: string, b: string) => [a, b].sort().join('|')

function laranganSebelumnya(rondeSebelumnya?: Ronde): Set<string> {
  const set = new Set<string>()
  for (const m of rondeSebelumnya?.match ?? []) {
    const anggota = [...m.timA, ...m.timB]
    for (let i = 0; i < anggota.length; i++) {
      for (let j = i + 1; j < anggota.length; j++) {
        set.add(kunci(anggota[i], anggota[j]))
      }
    }
  }
  return set
}

function jumlahPelanggaran(urutan: readonly string[], kapasitas: number, larangan: Set<string>): number {
  if (larangan.size === 0) return 0
  const jumlahMain = Math.floor(urutan.length / kapasitas) * kapasitas
  let pelanggaran = 0
  for (let i = 0; i < jumlahMain; i += kapasitas) {
    const blok = urutan.slice(i, i + kapasitas)
    for (let a = 0; a < blok.length; a++) {
      for (let b = a + 1; b < blok.length; b++) {
        if (larangan.has(kunci(blok[a], blok[b]))) pelanggaran++
      }
    }
  }
  return pelanggaran
}

function susunMatch(urutan: readonly string[], mode: Mode, nomor: number): Match[] {
  const kapasitas = KAPASITAS[mode]
  const ukuranTim = UKURAN_TIM[mode]
  const jumlahMain = Math.floor(urutan.length / kapasitas) * kapasitas
  const match: Match[] = []
  for (let i = 0; i < jumlahMain; i += kapasitas) {
    const blok = urutan.slice(i, i + kapasitas)
    match.push({
      id: `r${nomor}m${match.length + 1}`,
      timA: blok.slice(0, ukuranTim),
      timB: blok.slice(ukuranTim),
      skorA: 0,
      skorB: 0,
      status: 'belum_main',
    })
  }
  return match
}

export function buatRonde(
  nomor: number,
  pemain: readonly string[],
  mode: Mode,
  rondeSebelumnya?: Ronde,
  rng: () => number = Math.random,
): Ronde {
  const kapasitas = KAPASITAS[mode]
  const prioritas = rondeSebelumnya?.istirahat ?? []
  const utama = pemain.filter((p) => !prioritas.includes(p))
  const larangan = laranganSebelumnya(rondeSebelumnya)

  let kandidatTerbaik: string[] = []
  let skorTerbaik = Number.POSITIVE_INFINITY

  for (let coba = 0; coba < PERCOBAAN; coba++) {
    const kandidat = [...shuffle(prioritas, rng), ...shuffle(utama, rng)]
    const skor = jumlahPelanggaran(kandidat, kapasitas, larangan)
    if (skor < skorTerbaik) {
      skorTerbaik = skor
      kandidatTerbaik = kandidat
      if (skor === 0) break
    }
  }

  const match = susunMatch(kandidatTerbaik, mode, nomor)
  const main = new Set(match.flatMap((m) => [...m.timA, ...m.timB]))
  return { nomor, match, istirahat: pemain.filter((p) => !main.has(p)) }
}

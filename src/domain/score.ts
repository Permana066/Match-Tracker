import type { Match, Ronde, StatusMatch } from './types'

export type Tim = 'A' | 'B'

const naikStatus = (status: StatusMatch): StatusMatch =>
  status === 'belum_main' ? 'sedang_main' : status

export function ubahSkor(match: Match, tim: Tim, delta: number): Match {
  const kunciSkor = tim === 'A' ? 'skorA' : 'skorB'
  const skorBaru = Math.max(0, match[kunciSkor] + delta)
  const berubah = skorBaru !== match[kunciSkor]
  return {
    ...match,
    [kunciSkor]: skorBaru,
    status: berubah ? naikStatus(match.status) : match.status,
  }
}

export function bukaMatch(match: Match): Match {
  return { ...match, status: naikStatus(match.status) }
}

export function selesaikanMatch(match: Match): Match {
  return { ...match, status: 'selesai' }
}

export function pemenang(match: Match, targetSkor: number): Tim | null {
  if (match.skorA >= targetSkor && match.skorA > match.skorB) return 'A'
  if (match.skorB >= targetSkor && match.skorB > match.skorA) return 'B'
  return null
}

export function rondeSelesai(ronde: Ronde): boolean {
  return ronde.match.every((m) => m.status === 'selesai')
}

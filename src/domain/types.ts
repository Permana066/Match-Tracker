export type Mode = 'ganda' | 'tunggal'

export type StatusMatch = 'belum_main' | 'sedang_main' | 'selesai'

export type Layar = 'setup' | 'daftar_match' | 'detail_skor' | 'akhir_ronde' | 'rekap'

export interface Pemain {
  id: string
  nama: string
}

export interface Match {
  id: string
  timA: string[]
  timB: string[]
  skorA: number
  skorB: number
  status: StatusMatch
}

export interface Ronde {
  nomor: number
  match: Match[]
  istirahat: string[]
}

export interface Sesi {
  mode: Mode
  targetSkor: number
  pemain: Pemain[]
  ronde: Ronde[]
  rondeAktif: number
  layar: Layar
  matchAktif: string | null
}

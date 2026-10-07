import { buatRonde } from './pairing'
import { bukaMatch, rondeSelesai, selesaikanMatch, ubahSkor, type Tim } from './score'
import type { Match, Mode, Pemain, Sesi } from './types'
import { MAKSIMAL_PEMAIN, pesanValidasiMulai } from './validation'

export type Aksi =
  | { type: 'set_mode'; mode: Mode }
  | { type: 'set_target_skor'; targetSkor: number }
  | { type: 'tambah_pemain'; nama: string }
  | { type: 'hapus_pemain'; id: string }
  | { type: 'edit_pemain'; id: string; nama: string }
  | { type: 'mulai' }
  | { type: 'buka_match'; id: string }
  | { type: 'tutup_match' }
  | { type: 'ubah_skor'; tim: Tim; delta: number }
  | { type: 'selesaikan_match' }
  | { type: 'ke_akhir_ronde' }
  | { type: 'ronde_berikutnya' }
  | { type: 'lihat_rekap' }
  | { type: 'ke_daftar_match' }
  | { type: 'sesi_baru' }

export function sesiAwal(): Sesi {
  return {
    mode: 'ganda',
    targetSkor: 21,
    pemain: [],
    ronde: [],
    rondeAktif: 0,
    layar: 'setup',
    matchAktif: null,
  }
}

const sudahDimulai = (sesi: Sesi) => sesi.ronde.length > 0

const idBaru = (pemain: readonly Pemain[]): string => {
  const tertinggi = pemain.reduce(
    (maks, p) => Math.max(maks, Number(p.id.replace(/^p/, '')) || 0),
    0,
  )
  return `p${tertinggi + 1}`
}

function ubahMatch(sesi: Sesi, id: string, ubah: (match: Match) => Match): Sesi {
  return {
    ...sesi,
    ronde: sesi.ronde.map((ronde, i) =>
      i === sesi.rondeAktif - 1
        ? { ...ronde, match: ronde.match.map((m) => (m.id === id ? ubah(m) : m)) }
        : ronde,
    ),
  }
}

export function reducer(sesi: Sesi, aksi: Aksi): Sesi {
  switch (aksi.type) {
    case 'set_mode':
      return sudahDimulai(sesi) ? sesi : { ...sesi, mode: aksi.mode }

    case 'set_target_skor':
      return sudahDimulai(sesi) ? sesi : { ...sesi, targetSkor: aksi.targetSkor }

    case 'tambah_pemain':
      if (sudahDimulai(sesi) || sesi.pemain.length >= MAKSIMAL_PEMAIN) return sesi
      return { ...sesi, pemain: [...sesi.pemain, { id: idBaru(sesi.pemain), nama: aksi.nama }] }

    case 'hapus_pemain':
      return sudahDimulai(sesi)
        ? sesi
        : { ...sesi, pemain: sesi.pemain.filter((p) => p.id !== aksi.id) }

    case 'edit_pemain':
      return sudahDimulai(sesi)
        ? sesi
        : {
            ...sesi,
            pemain: sesi.pemain.map((p) => (p.id === aksi.id ? { ...p, nama: aksi.nama } : p)),
          }

    case 'mulai': {
      if (pesanValidasiMulai(sesi.pemain.length, sesi.mode)) return sesi
      return {
        ...sesi,
        ronde: [buatRonde(1, sesi.pemain.map((p) => p.id), sesi.mode)],
        rondeAktif: 1,
        layar: 'daftar_match',
        matchAktif: null,
      }
    }

    case 'buka_match': {
      const ronde = sesi.ronde[sesi.rondeAktif - 1]
      if (!ronde?.match.some((m) => m.id === aksi.id)) return sesi
      return { ...ubahMatch(sesi, aksi.id, bukaMatch), layar: 'detail_skor', matchAktif: aksi.id }
    }

    case 'tutup_match':
      return sesi.matchAktif ? { ...sesi, layar: 'daftar_match', matchAktif: null } : sesi

    case 'ubah_skor':
      return sesi.matchAktif
        ? ubahMatch(sesi, sesi.matchAktif, (m) => ubahSkor(m, aksi.tim, aksi.delta))
        : sesi

    case 'selesaikan_match': {
      if (!sesi.matchAktif) return sesi
      const setelah = ubahMatch(sesi, sesi.matchAktif, selesaikanMatch)
      const ronde = setelah.ronde[setelah.rondeAktif - 1]
      return {
        ...setelah,
        matchAktif: null,
        layar: rondeSelesai(ronde) ? 'akhir_ronde' : 'daftar_match',
      }
    }

    case 'ke_akhir_ronde': {
      const ronde = sesi.ronde[sesi.rondeAktif - 1]
      if (!ronde || !rondeSelesai(ronde)) return sesi
      return { ...sesi, layar: 'akhir_ronde', matchAktif: null }
    }

    case 'ronde_berikutnya': {
      const sekarang = sesi.ronde[sesi.rondeAktif - 1]
      if (!sekarang || !rondeSelesai(sekarang)) return sesi
      const nomor = sesi.ronde.length + 1
      return {
        ...sesi,
        ronde: [...sesi.ronde, buatRonde(nomor, sesi.pemain.map((p) => p.id), sesi.mode, sekarang)],
        rondeAktif: nomor,
        layar: 'daftar_match',
        matchAktif: null,
      }
    }

    case 'lihat_rekap':
      return { ...sesi, layar: 'rekap', matchAktif: null }

    case 'ke_daftar_match':
      return { ...sesi, layar: 'daftar_match', matchAktif: null }

    case 'sesi_baru':
      return sesiAwal()
  }
}

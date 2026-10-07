import { useState } from 'react'
import { pemenang, type Tim } from '../domain/score'
import { rondeAktif, type Aksi } from '../domain/session'
import type { Sesi } from '../domain/types'
import { KELAS_KARTU, KELAS_TOMBOL_SEKUNDER, KELAS_TOMBOL_UTAMA, LABEL_STATUS } from '../ui'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
  nama: (id: string) => string
}

function PanelTim({
  judul,
  anggota,
  skor,
  nonaktif,
  onUbah,
  namaTim,
}: {
  judul: string
  anggota: string[]
  skor: number
  nonaktif: boolean
  onUbah: (delta: 1 | -1) => void
  namaTim: Tim
}) {
  return (
    <section className={KELAS_KARTU} aria-label={`Tim ${namaTim}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{judul}</p>
      <p className="mb-3 font-medium">{anggota.join(', ')}</p>
      <p
        data-testid={`skor-tim-${namaTim.toLowerCase()}`}
        className="mb-4 text-center text-7xl font-black tabular-nums text-slate-900"
      >
        {skor}
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          aria-label={`Kurangi skor Tim ${namaTim}`}
          disabled={nonaktif}
          onClick={() => onUbah(-1)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-300 bg-white text-2xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ▼
        </button>
        <button
          type="button"
          aria-label={`Tambah skor Tim ${namaTim}`}
          disabled={nonaktif}
          onClick={() => onUbah(1)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-2xl font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ▲
        </button>
      </div>
    </section>
  )
}

export function SkorScreen({ sesi, dispatch, nama }: Props) {
  const [editAktif, setEditAktif] = useState(false)
  const ronde = rondeAktif(sesi)!
  const match = ronde.match.find((m) => m.id === sesi.matchAktif)
  if (!match) return null

  const indeks = ronde.match.findIndex((m) => m.id === match.id)
  const terkunci = match.status === 'selesai' && !editAktif
  const menang = pemenang(match, sesi.targetSkor)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-500">Ronde {ronde.nomor}</p>
          <h1 className="text-2xl font-bold">Match {indeks + 1}</h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {LABEL_STATUS[match.status]}
        </span>
      </header>

      {terkunci && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Match sudah selesai. Tekan <strong>Edit skor</strong> bila ingin mengoreksi.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <PanelTim
          namaTim="A"
          judul="Tim A"
          anggota={match.timA.map(nama)}
          skor={match.skorA}
          nonaktif={terkunci}
          onUbah={(delta) => dispatch({ type: 'ubah_skor', tim: 'A', delta })}
        />
        <PanelTim
          namaTim="B"
          judul="Tim B"
          anggota={match.timB.map(nama)}
          skor={match.skorB}
          nonaktif={terkunci}
          onUbah={(delta) => dispatch({ type: 'ubah_skor', tim: 'B', delta })}
        />
      </div>

      <p role="status" className="min-h-6 text-center font-semibold text-teal-800">
        {menang ? `Tim ${menang} mencapai target skor ${sesi.targetSkor}` : ''}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => dispatch({ type: 'tutup_match' })}
          className={`${KELAS_TOMBOL_SEKUNDER} flex-1`}
        >
          Kembali
        </button>
        {match.status === 'selesai' && (
          <button
            type="button"
            onClick={() => setEditAktif(true)}
            disabled={editAktif}
            className={`${KELAS_TOMBOL_SEKUNDER} flex-1`}
          >
            Edit skor
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'selesaikan_match' })}
          className={`${KELAS_TOMBOL_UTAMA} flex-1`}
        >
          Selesai
        </button>
      </div>
    </div>
  )
}

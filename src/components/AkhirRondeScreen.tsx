import { pemenang } from '../domain/score'
import { rondeAktif, type Aksi } from '../domain/session'
import type { Sesi } from '../domain/types'
import { KELAS_KARTU, KELAS_TOMBOL_SEKUNDER, KELAS_TOMBOL_UTAMA } from '../ui'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
  nama: (id: string) => string
}

export function AkhirRondeScreen({ sesi, dispatch, nama }: Props) {
  const ronde = rondeAktif(sesi)!

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {ronde.match.length} match · {ronde.istirahat.length} istirahat
        </p>
        <h1 className="text-2xl font-bold">Ringkasan Ronde {ronde.nomor}</h1>
      </header>

      <ul className="flex flex-col gap-3">
        {ronde.match.map((m, i) => {
          const menang = pemenang(m, sesi.targetSkor)
          return (
            <li key={m.id} className={KELAS_KARTU}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Match {i + 1}
                  </p>
                  <p className="truncate font-medium">{m.timA.map(nama).join(', ')}</p>
                  <p className="truncate font-medium">{m.timB.map(nama).join(', ')}</p>
                </div>
                <p className="shrink-0 text-3xl font-black tabular-nums text-teal-700 dark:text-teal-300">
                  {m.skorA}–{m.skorB}
                </p>
              </div>
              {menang && (
                <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Dimenangkan Tim {menang}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {ronde.istirahat.length > 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Istirahat: {ronde.istirahat.map(nama).join(', ')}. Pemain istirahat diprioritaskan main
          di ronde berikutnya.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'ronde_berikutnya' })}
          className={`${KELAS_TOMBOL_UTAMA} w-full text-lg`}
        >
          Acak ulang &amp; lanjut ronde berikutnya
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'lihat_rekap' })}
          className={`${KELAS_TOMBOL_SEKUNDER} w-full`}
        >
          Selesai
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ke_daftar_match' })}
          className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Lihat daftar match
        </button>
      </div>
    </div>
  )
}

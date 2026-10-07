import { rondeAktif, type Aksi } from '../domain/session'
import { rondeSelesai } from '../domain/score'
import type { Sesi } from '../domain/types'
import { KELAS_KARTU, KELAS_TOMBOL_SEKUNDER, KELAS_TOMBOL_UTAMA, LABEL_STATUS } from '../ui'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
  nama: (id: string) => string
}

export function DaftarMatchScreen({ sesi, dispatch, nama }: Props) {
  const ronde = rondeAktif(sesi)!
  const lengkap = rondeSelesai(ronde)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Ronde {ronde.nomor}</h1>
        <p className="text-sm font-medium text-slate-500">
          {ronde.match.length} match · mode {sesi.mode}
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {ronde.match.map((m, i) => (
          <li key={m.id}>
            <article className={KELAS_KARTU}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold">Match {i + 1}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    m.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : m.status === 'sedang_main'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {LABEL_STATUS[m.status]}
                </span>
              </div>

              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tim A</p>
                    <p className="truncate font-medium">{m.timA.map(nama).join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tim B</p>
                    <p className="truncate font-medium">{m.timB.map(nama).join(', ')}</p>
                  </div>
                </div>
                <p
                  data-testid={`skor-akhir-${m.id}`}
                  className="shrink-0 text-4xl font-black tabular-nums text-teal-700"
                >
                  {m.skorA}–{m.skorB}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Buka match ${i + 1}`}
                onClick={() => dispatch({ type: 'buka_match', id: m.id })}
                className={`${KELAS_TOMBOL_SEKUNDER} w-full`}
              >
                Buka
              </button>
            </article>
          </li>
        ))}
      </ul>

      {ronde.istirahat.length > 0 && (
        <section className={KELAS_KARTU} aria-labelledby="judul-istirahat">
          <h2 id="judul-istirahat" className="mb-2 text-lg font-bold">
            Istirahat
          </h2>
          <p className="text-sm text-slate-600">
            {ronde.istirahat.map(nama).join(', ')} — diprioritaskan main di ronde berikutnya.
          </p>
        </section>
      )}

      <button
        type="button"
        disabled={!lengkap}
        onClick={() => dispatch({ type: 'ke_akhir_ronde' })}
        className={`${KELAS_TOMBOL_UTAMA} w-full text-lg`}
      >
        Lanjut ronde
      </button>
      {!lengkap && (
        <p className="-mt-3 text-center text-sm text-slate-500">
          Selesaikan semua match dulu untuk melanjutkan.
        </p>
      )}
    </div>
  )
}

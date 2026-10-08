import type { Sesi } from '../domain/types'
import type { Aksi } from '../domain/session'
import { pesanValidasiMulai } from '../domain/validation'
import { KELAS_KARTU, KELAS_TOMBOL_UTAMA, LABEL_MODE } from '../ui'
import { KelolaPemain } from './KelolaPemain'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
}

export function SetupScreen({ sesi, dispatch }: Props) {
  const pesanMulai = pesanValidasiMulai(sesi.pemain.length, sesi.mode)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <section className={KELAS_KARTU}>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Mode permainan
          </legend>
          <div className="flex gap-3">
            {(Object.keys(LABEL_MODE) as Array<keyof typeof LABEL_MODE>).map((mode) => (
              <label
                key={mode}
                className={`min-h-11 flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center font-semibold shadow-sm ${
                  sesi.mode === mode
                    ? 'border-teal-700 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-900/60 dark:text-teal-300'
                    : 'border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  className="sr-only"
                  checked={sesi.mode === mode}
                  onChange={() => dispatch({ type: 'set_mode', mode })}
                />
                {LABEL_MODE[mode]}
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="target-skor" className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">
          Target skor (opsional)
        </label>
        <input
          id="target-skor"
          type="number"
          min={1}
          max={99}
          value={sesi.targetSkor}
          onChange={(e) => dispatch({ type: 'set_target_skor', targetSkor: Number(e.target.value) })}
          className="mb-1 h-11 w-24 rounded-xl border border-slate-300 bg-transparent px-3 text-center text-lg font-semibold dark:border-slate-600"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Skor tetap bisa dikoreksi, aturan deuce tidak dipakai.
        </p>
      </section>

      <KelolaPemain sesi={sesi} dispatch={dispatch} konteks="setup" />

      <section className={KELAS_KARTU}>
        <p role="status" className="mb-3 text-sm font-medium text-amber-700 dark:text-amber-400">
          {pesanMulai ?? 'Semua syarat terpenuhi. Tekan Mulai untuk mengacak match.'}
        </p>
        <button
          type="button"
          disabled={pesanMulai !== null}
          onClick={() => dispatch({ type: 'mulai' })}
          className={`${KELAS_TOMBOL_UTAMA} w-full text-lg`}
        >
          Mulai
        </button>
      </section>
    </div>
  )
}

import type { Aksi } from '../domain/session'
import { TombolTema } from './TombolTema'

interface Props {
  dispatch: (aksi: Aksi) => void
}

export function BerandaScreen({ dispatch }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-emerald-400/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_30px,rgba(255,255,255,0.05)_30px_31px)]"
      />

      <div className="relative z-10 flex w-full justify-end px-4 pt-4">
        <TombolTema />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        {/* <p className="mb-5 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
          Bulutangkis
        </p> */}
        <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
          Match Tracker <br />
          Bulutangkis
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-50/85 sm:text-base">
          Acak pasangan, catat skor tiap ronde, dan lihat rekap + klasemen — semua dari satu
          layar.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ke_setup' })}
          className="mt-9 w-full max-w-xs rounded-2xl bg-white px-8 py-3.5 min-h-12 text-lg font-bold text-teal-900 shadow-lg shadow-black/20 transition hover:bg-emerald-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Mulai
        </button>
        {/* <p className="mt-6 text-xs text-white/50">Data tersimpan di perangkat ini saja.</p> */}
      </main>
    </div>
  )
}

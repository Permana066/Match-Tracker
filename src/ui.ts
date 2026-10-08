import type { StatusMatch } from './domain/types'

export const LABEL_STATUS: Record<StatusMatch, string> = {
  belum_main: 'Belum main',
  sedang_main: 'Sedang main',
  selesai: 'Selesai',
}

export const LABEL_MODE = { ganda: 'Ganda', tunggal: 'Tunggal' } as const

export const KELAS_TOMBOL_UTAMA =
  'min-h-11 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:hover:bg-teal-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-400'

export const KELAS_TOMBOL_SEKUNDER =
  'min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:text-slate-500'

export const KELAS_KARTU =
  'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900'

import { useEffect, useState } from 'react'
import { muatTema, terapkanTema, type Tema } from '../theme'

const KELAS =
  'flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'

export function TombolTema() {
  const [tema, setTema] = useState<Tema>(() => muatTema())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'gelap')
  }, [tema])

  const gelap = tema === 'gelap'

  const ganti = () => {
    const berikutnya: Tema = gelap ? 'terang' : 'gelap'
    terapkanTema(berikutnya)
    setTema(berikutnya)
  }

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={gelap ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={gelap ? 'Mode terang' : 'Mode gelap'}
      className={KELAS}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        {gelap ? (
          <>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  )
}

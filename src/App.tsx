import { useEffect, useMemo, useReducer } from 'react'
import { DaftarMatchScreen } from './components/DaftarMatchScreen'
import { RekapScreen } from './components/RekapScreen'
import { SetupScreen } from './components/SetupScreen'
import { SkorScreen } from './components/SkorScreen'
import { AkhirRondeScreen } from './components/AkhirRondeScreen'
import { reducer, sesiAwal } from './domain/session'
import { muatSesi, simpanSesi } from './storage'

export default function App() {
  const [sesi, dispatch] = useReducer(reducer, undefined, () => muatSesi() ?? sesiAwal())

  useEffect(() => {
    simpanSesi(sesi)
  }, [sesi])

  const nama = useMemo(() => {
    const peta = new Map(sesi.pemain.map((p) => [p.id, p.nama]))
    return (id: string) => peta.get(id) ?? id
  }, [sesi.pemain])

  const ronde = sesi.ronde[sesi.rondeAktif - 1]
  const matchDibuka = ronde?.match.find((m) => m.id === sesi.matchAktif)

  const layar = () => {
    switch (sesi.layar) {
      case 'daftar_match':
        return ronde ? (
          <DaftarMatchScreen sesi={sesi} dispatch={dispatch} nama={nama} />
        ) : (
          <SetupScreen sesi={sesi} dispatch={dispatch} />
        )
      case 'detail_skor':
        return matchDibuka ? (
          <SkorScreen key={matchDibuka.id} sesi={sesi} dispatch={dispatch} nama={nama} />
        ) : (
          <SetupScreen sesi={sesi} dispatch={dispatch} />
        )
      case 'akhir_ronde':
        return <AkhirRondeScreen sesi={sesi} dispatch={dispatch} nama={nama} />
      case 'rekap':
        return <RekapScreen sesi={sesi} dispatch={dispatch} />
      default:
        return <SetupScreen sesi={sesi} dispatch={dispatch} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
            
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight text-teal-800">Bultang Match Tracker</p>
            <p className="text-xs text-slate-500">Acak pasangan, catat skor, lihat rekap.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Yakin ingin menghapus seluruh data sesi dan memulai dari awal?',
                )
              ) {
                dispatch({ type: 'sesi_baru' })
              }
            }}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Mulai sesi baru
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{layar()}</main>

      <footer className="px-4 py-4 text-center text-xs text-slate-400">
        Data tersimpan di perangkat ini saja (localStorage).
      </footer>
    </div>
  )
}

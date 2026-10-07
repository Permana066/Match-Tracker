import { klasemen } from '../domain/standings'
import type { Aksi } from '../domain/session'
import type { Sesi } from '../domain/types'
import { KELAS_KARTU, KELAS_TOMBOL_UTAMA } from '../ui'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
  nama: (id: string) => string
}

export function RekapScreen({ sesi, dispatch, nama }: Props) {
  const tabel = klasemen(sesi.ronde, sesi.pemain)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Rekap</h1>

      <section className={KELAS_KARTU}>
        <h2 className="mb-3 text-lg font-bold">Klasemen</h2>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="py-2 pr-2 font-bold">
                  Pemain
                </th>
                <th scope="col" className="py-2 px-2 text-center font-bold">
                  Main
                </th>
                <th scope="col" className="py-2 px-2 text-center font-bold">
                  Menang
                </th>
                <th scope="col" className="py-2 px-2 text-center font-bold">
                  Kalah
                </th>
                <th scope="col" className="py-2 pl-2 text-center font-bold">
                  Poin
                </th>
              </tr>
            </thead>
            <tbody>
              {tabel.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="py-2 pr-2 text-left font-semibold text-slate-700">
                    {b.nama}
                  </th>
                  <td className="py-2 px-2 text-center tabular-nums">{b.menang + b.kalah}</td>
                  <td className="py-2 px-2 text-center tabular-nums">{b.menang}</td>
                  <td className="py-2 px-2 text-center tabular-nums">{b.kalah}</td>
                  <td className="py-2 pl-2 text-center font-bold tabular-nums">{b.poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Poin adalah total skor tim tempat pemain bermain. Match yang belum selesai tidak dihitung.
        </p>
      </section>

      {sesi.ronde.map((ronde) => (
        <section key={ronde.nomor} className={KELAS_KARTU}>
          <h2 className="mb-3 text-lg font-bold">Ronde {ronde.nomor}</h2>
          <ul className="flex flex-col gap-2">
            {ronde.match.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-400">Match {i + 1}</p>
                  <p className="truncate text-sm font-medium">
                    {m.timA.map(nama).join(', ')}
                  </p>
                  <p className="truncate text-sm font-medium">
                    {m.timB.map(nama).join(', ')}
                  </p>
                </div>
                <p className="shrink-0 text-xl font-black tabular-nums text-teal-700">
                  {m.skorA}–{m.skorB}
                </p>
              </li>
            ))}
          </ul>
          {ronde.istirahat.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Istirahat:{' '}
              {ronde.istirahat.map(nama).join(', ')}
            </p>
          )}
        </section>
      ))}

      <button
        type="button"
        onClick={() => dispatch({ type: 'ke_daftar_match' })}
        className={`${KELAS_TOMBOL_UTAMA} w-full`}
      >
        Kembali ke daftar match
      </button>
    </div>
  )
}

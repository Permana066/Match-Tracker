import { useState, type FormEvent } from 'react'
import type { Sesi } from '../domain/types'
import type { Aksi } from '../domain/session'
import { pesanValidasiMulai, validasiNamaBaru } from '../domain/validation'
import { KELAS_KARTU, KELAS_TOMBOL_SEKUNDER, KELAS_TOMBOL_UTAMA, LABEL_MODE } from '../ui'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
}

export function SetupScreen({ sesi, dispatch }: Props) {
  const [namaInput, setNamaInput] = useState('')
  const [idEdit, setIdEdit] = useState<string | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)

  const sedangEdit = idEdit !== null
  const pesanMulai = pesanValidasiMulai(sesi.pemain.length, sesi.mode)

  const simpan = (event: FormEvent) => {
    event.preventDefault()
    const lain = sesi.pemain.filter((p) => p.id !== idEdit).map((p) => p.nama)
    const hasil = validasiNamaBaru(namaInput, lain)
    if (!hasil.ok) {
      setPesan(hasil.pesan)
      return
    }
    if (sedangEdit) {
      dispatch({ type: 'edit_pemain', id: idEdit, nama: hasil.nama })
      setIdEdit(null)
    } else {
      dispatch({ type: 'tambah_pemain', nama: hasil.nama })
    }
    setNamaInput('')
    setPesan(null)
  }

  const batalEdit = () => {
    setIdEdit(null)
    setNamaInput('')
    setPesan(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <section className={KELAS_KARTU}>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-slate-600">Mode permainan</legend>
          <div className="flex gap-3">
            {(Object.keys(LABEL_MODE) as Array<keyof typeof LABEL_MODE>).map((mode) => (
              <label
                key={mode}
                className={`min-h-11 flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center font-semibold shadow-sm ${
                  sesi.mode === mode
                    ? 'border-teal-700 bg-teal-50 text-teal-800'
                    : 'border-slate-300 bg-white text-slate-600'
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

        <label htmlFor="target-skor" className="mb-1 block text-sm font-semibold text-slate-600">
          Target skor (opsional)
        </label>
        <input
          id="target-skor"
          type="number"
          min={1}
          max={99}
          value={sesi.targetSkor}
          onChange={(e) => dispatch({ type: 'set_target_skor', targetSkor: Number(e.target.value) })}
          className="mb-1 h-11 w-24 rounded-xl border border-slate-300 px-3 text-center text-lg font-semibold"
        />
        <p className="text-sm text-slate-500">
          Skor tetap bisa dikoreksi, aturan deuce tidak dipakai.
        </p>
      </section>

      <section className={KELAS_KARTU}>
        <h2 className="mb-3 text-lg font-bold">Pemain ({sesi.pemain.length}/30)</h2>

        <form onSubmit={simpan} noValidate className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="nama-pemain" className="mb-1 block text-sm font-semibold text-slate-600">
              Nama pemain
            </label>
            <input
              id="nama-pemain"
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              placeholder="Contoh: Andi"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-base"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className={KELAS_TOMBOL_UTAMA}>
              {sedangEdit ? 'Simpan' : 'Tambah'}
            </button>
            {sedangEdit && (
              <button type="button" onClick={batalEdit} className={KELAS_TOMBOL_SEKUNDER}>
                Batal
              </button>
            )}
          </div>
        </form>

        {pesan && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {pesan}
          </p>
        )}

        {sesi.pemain.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {sesi.pemain.map((p) => (
              <li
                key={p.id}
                className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate font-medium">{p.nama}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${p.nama}`}
                    onClick={() => {
                      setIdEdit(p.id)
                      setNamaInput(p.nama)
                      setPesan(null)
                    }}
                    className="min-h-11 rounded-lg px-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus ${p.nama}`}
                    onClick={() => dispatch({ type: 'hapus_pemain', id: p.id })}
                    className="min-h-11 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Belum ada pemain. Tambahkan minimal 4 nama.</p>
        )}
      </section>

      <section className={KELAS_KARTU}>
        <p role="status" className="mb-3 text-sm font-medium text-amber-700">
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

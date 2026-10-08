import { useState, type FormEvent } from 'react'
import type { Pemain, Sesi } from '../domain/types'
import { pesanHapusPemain, type Aksi } from '../domain/session'
import { MAKSIMAL_PEMAIN, validasiNamaBaru } from '../domain/validation'
import { KELAS_KARTU, KELAS_TOMBOL_SEKUNDER, KELAS_TOMBOL_UTAMA } from '../ui'

interface Props {
  sesi: Sesi
  dispatch: (aksi: Aksi) => void
  konteks: 'setup' | 'sesi'
}

export function KelolaPemain({ sesi, dispatch, konteks }: Props) {
  const [namaInput, setNamaInput] = useState('')
  const [idEdit, setIdEdit] = useState<string | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)

  const sedangEdit = idEdit !== null
  const penuh = sesi.pemain.length >= MAKSIMAL_PEMAIN

  const simpan = (event: FormEvent) => {
    event.preventDefault()
    if (penuh && !sedangEdit) {
      setPesan(`Maksimal ${MAKSIMAL_PEMAIN} pemain.`)
      return
    }
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

  const hapus = (pemain: Pemain) => {
    const alasan = pesanHapusPemain(sesi, pemain.id)
    if (alasan) {
      setPesan(alasan)
      return
    }
    if (idEdit === pemain.id) {
      setIdEdit(null)
      setNamaInput('')
    }
    dispatch({ type: 'hapus_pemain', id: pemain.id })
    setPesan(null)
  }

  return (
    <section className={KELAS_KARTU}>
      <h2 className="mb-3 text-lg font-bold">
        {konteks === 'sesi' ? 'Kelola pemain' : 'Pemain'} ({sesi.pemain.length}/{MAKSIMAL_PEMAIN})
      </h2>

      {konteks === 'sesi' && (
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Pemain baru langsung masuk daftar Istirahat ronde ini dan diprioritaskan main di ronde
          berikutnya.
        </p>
      )}

      <form onSubmit={simpan} noValidate className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="nama-pemain" className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Nama pemain
          </label>
          <input
            id="nama-pemain"
            value={namaInput}
            onChange={(e) => setNamaInput(e.target.value)}
            placeholder="Contoh: Andi"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 text-base dark:border-slate-600"
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
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
          {pesan}
        </p>
      )}

      {sesi.pemain.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {sesi.pemain.map((p) => (
            <li
              key={p.id}
              className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800"
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
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-900/60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-label={`Hapus ${p.nama}`}
                  onClick={() => hapus(p)}
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  Hapus
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Belum ada pemain. Tambahkan minimal 4 nama.
        </p>
      )}
    </section>
  )
}

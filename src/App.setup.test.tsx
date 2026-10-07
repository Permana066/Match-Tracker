import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { KUNCI_SESI } from './storage'
import { inputNama, mulaiSesi, tambahBanyak, tambahPemain } from './test/harness'

beforeEach(() => localStorage.clear())

describe('layar setup — input pemain', () => {
  it('menambahkan pemain lewat tombol Tambah', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await tambahPemain(pengguna, 'Andi')
    expect(screen.getByRole('listitem')).toHaveTextContent('Andi')
  })

  it('menambahkan pemain dengan menekan Enter', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await pengguna.type(inputNama(), 'Budi{Enter}')
    expect(screen.getByRole('listitem')).toHaveTextContent('Budi')
  })

  it('menolak nama kosong dengan pesan yang jelas', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await pengguna.click(screen.getByRole('button', { name: 'Tambah' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nama tidak boleh kosong.')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('menolak nama duplikat tanpa memperhatikan huruf besar/kecil', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await tambahPemain(pengguna, 'Andi')
    await tambahPemain(pengguna, 'aNDI')
    expect(await screen.findByRole('alert')).toHaveTextContent('sudah terdaftar')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('bisa mengedit nama sebelum mulai', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await tambahPemain(pengguna, 'Andi')
    await pengguna.click(screen.getByRole('button', { name: 'Edit Andi' }))
    const kolom = screen.getByLabelText('Nama pemain')
    await pengguna.clear(kolom)
    await pengguna.type(kolom, 'Andi Saputra')
    await pengguna.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('listitem')).toHaveTextContent('Andi Saputra')
  })

  it('bisa menghapus nama sebelum mulai', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await tambahBanyak(pengguna, ['Andi', 'Budi'])
    await pengguna.click(screen.getByRole('button', { name: 'Hapus Andi' }))
    expect(screen.queryByRole('listitem', { name: /Andi/ })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('Budi')
  })
})

describe('layar setup — validasi tombol Mulai', () => {
  it('nonaktif sampai minimal 4 pemain pada mode Ganda', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    const tombolMulai = screen.getByRole('button', { name: 'Mulai' })
    expect(tombolMulai).toBeDisabled()

    await tambahBanyak(pengguna, ['P1', 'P2', 'P3'])
    expect(tombolMulai).toBeDisabled()

    await tambahPemain(pengguna, 'P4')
    expect(tombolMulai).toBeEnabled()
  })

  it('mengaktifkan Mulai dengan 2 pemain setelah mode Tunggal dipilih', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await tambahBanyak(pengguna, ['P1', 'P2'])
    expect(screen.getByRole('button', { name: 'Mulai' })).toBeDisabled()

    await pengguna.click(screen.getByRole('radio', { name: 'Tunggal' }))
    expect(screen.getByRole('button', { name: 'Mulai' })).toBeEnabled()
  })

  it('menampilkan pesan kekurangan pemain', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await tambahBanyak(pengguna, ['P1', 'P2', 'P3'])
    expect(await screen.findByText('Minimal 4 pemain untuk mode Ganda.')).toBeInTheDocument()
  })
})

describe('layar setup — memulai sesi', () => {
  it('8 pemain mode Ganda menghasilkan 2 match dengan tiap pemain tepat sekali', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    const nama = ['Aldi', 'Bagas', 'Citra', 'Dewi', 'Eka', 'Fajar', 'Gani', 'Hana']
    await mulaiSesi(pengguna, nama)

    const kartu = await screen.findAllByRole('article')
    expect(kartu).toHaveLength(2)

    const gabungan = kartu.map((k) => k.textContent).join(' ')
    for (const n of nama) {
      expect(gabungan.match(new RegExp(n, 'g'))?.length ?? 0).toBe(1)
    }
  })

  it('9 pemain mode Ganda menyisakan 1 pemain di daftar Istirahat', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'])

    const daftarIstirahat = await screen.findByText('Istirahat')
    const kartu = screen.getAllByRole('article')
    expect(kartu).toHaveLength(2)

    const yangIstirahat = (daftarIstirahat.closest('section')?.textContent ?? '').match(/P\d+/g)
    expect(yangIstirahat).toHaveLength(1)

    const teksMatch = kartu.map((k) => k.textContent).join(' ')
    expect(teksMatch).not.toContain(yangIstirahat![0])
  })

  it('mengubah daftar pemain tidak diizinkan setelah sesi dimulai', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))

    expect(screen.queryByLabelText('Nama pemain')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah' })).not.toBeInTheDocument()
  })
})

describe('localStorage — layar terakhir dipulihkan', () => {
  it('membuka kembali layar daftar match setelah refresh', async () => {
    const pengguna = userEvent.setup()
    const pertama = render(<App />)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4', 'P5'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(localStorage.getItem(KUNCI_SESI)).toContain('daftar_match')

    pertama.unmount()
    render(<App />)
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Istirahat')).toBeInTheDocument()
  })
})

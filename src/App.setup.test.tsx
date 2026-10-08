import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { KUNCI_SESI } from './storage'
import { inputNama, bukaAplikasi, mulaiSesi, tambahBanyak, tambahPemain } from './test/harness'

beforeEach(() => localStorage.clear())

describe('layar beranda', () => {
  it('menampilkan judul, tagline, dan tombol Mulai tanpa chrome aplikasi', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Match Tracker Bulutangkis' })).toBeInTheDocument()
    expect(screen.getByText('Acak pasangan, catat skor tiap ronde, dan lihat rekap + klasemen — semua dari satu layar.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mulai' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mulai sesi baru' })).not.toBeInTheDocument()
  })

  it('tombol Mulai mengarahkan ke layar setup untuk pilih mode dan isi nama', async () => {
    const pengguna = userEvent.setup()
    render(<App />)
    await pengguna.click(screen.getByRole('button', { name: 'Mulai' }))

    expect(screen.getByLabelText('Nama pemain')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Ganda' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Tunggal' })).toBeInTheDocument()
    expect(localStorage.getItem('bultang.sesi.v1')).toContain('"layar":"setup"')
  })

  it('tombol tema mengganti mode gelap/terang dan menyimpan preferensi', async () => {
    const pengguna = userEvent.setup()
    render(<App />)

    await pengguna.click(screen.getByRole('button', { name: 'Aktifkan mode gelap' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('bultang.tema')).toBe('gelap')

    await pengguna.click(screen.getByRole('button', { name: 'Aktifkan mode terang' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('bultang.tema')).toBe('terang')
  })
})

describe('layar setup — input pemain', () => {
  it('menambahkan pemain lewat tombol Tambah', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await tambahPemain(pengguna, 'Andi')
    expect(screen.getByRole('listitem')).toHaveTextContent('Andi')
  })

  it('menambahkan pemain dengan menekan Enter', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await pengguna.type(inputNama(), 'Budi{Enter}')
    expect(screen.getByRole('listitem')).toHaveTextContent('Budi')
  })

  it('menolak nama kosong dengan pesan yang jelas', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await pengguna.click(screen.getByRole('button', { name: 'Tambah' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nama tidak boleh kosong.')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('menolak nama duplikat tanpa memperhatikan huruf besar/kecil', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await tambahPemain(pengguna, 'Andi')
    await tambahPemain(pengguna, 'aNDI')
    expect(await screen.findByRole('alert')).toHaveTextContent('sudah terdaftar')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('bisa mengedit nama sebelum mulai', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
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
    await bukaAplikasi(pengguna)
    await tambahBanyak(pengguna, ['Andi', 'Budi'])
    await pengguna.click(screen.getByRole('button', { name: 'Hapus Andi' }))
    expect(screen.queryByRole('listitem', { name: /Andi/ })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('Budi')
  })
})

describe('layar setup — validasi tombol Mulai', () => {
  it('nonaktif sampai minimal 4 pemain pada mode Ganda', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    const tombolMulai = screen.getByRole('button', { name: 'Mulai' })
    expect(tombolMulai).toBeDisabled()

    await tambahBanyak(pengguna, ['P1', 'P2', 'P3'])
    expect(tombolMulai).toBeDisabled()

    await tambahPemain(pengguna, 'P4')
    expect(tombolMulai).toBeEnabled()
  })

  it('mengaktifkan Mulai dengan 2 pemain setelah mode Tunggal dipilih', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await tambahBanyak(pengguna, ['P1', 'P2'])
    expect(screen.getByRole('button', { name: 'Mulai' })).toBeDisabled()

    await pengguna.click(screen.getByRole('radio', { name: 'Tunggal' }))
    expect(screen.getByRole('button', { name: 'Mulai' })).toBeEnabled()
  })

  it('menampilkan pesan kekurangan pemain', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await tambahBanyak(pengguna, ['P1', 'P2', 'P3'])
    expect(await screen.findByText('Minimal 4 pemain untuk mode Ganda.')).toBeInTheDocument()
  })
})

describe('layar setup — memulai sesi', () => {
  it('8 pemain mode Ganda menghasilkan 2 match dengan tiap pemain tepat sekali', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
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
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'])

    const daftarIstirahat = await screen.findByText('Istirahat')
    const kartu = screen.getAllByRole('article')
    expect(kartu).toHaveLength(2)

    const yangIstirahat = (daftarIstirahat.closest('section')?.textContent ?? '').match(/P\d+/g)
    expect(yangIstirahat).toHaveLength(1)

    const teksMatch = kartu.map((k) => k.textContent).join(' ')
    expect(teksMatch).not.toContain(yangIstirahat![0])
  })
})

describe('kelola pemain di tengah sesi', () => {
  it('menyediakan kelola pemain di layar daftar match setelah sesi dimulai', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))

    expect(screen.getByRole('heading', { name: 'Kelola pemain (4/30)' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nama pemain')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah' })).toBeInTheDocument()
  })

  it('menambah pemain baru di tengah sesi tanpa mengulang sesi', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2))

    await tambahPemain(pengguna, 'P9')

    expect(screen.getByRole('heading', { name: 'Kelola pemain (9/30)' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)

    const istirahat = screen.getByText('Istirahat').closest('section')
    expect(istirahat).toHaveTextContent('P9')
  })

  it('menolak menghapus pemain yang masih terdaftar di match belum selesai', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))

    await pengguna.click(screen.getByRole('button', { name: 'Hapus P1' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/belum selesai/)
    expect(screen.getByRole('heading', { name: 'Kelola pemain (4/30)' })).toBeInTheDocument()
  })

  it('bisa mengedit nama pemain di tengah sesi', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))

    await pengguna.click(screen.getByRole('button', { name: 'Edit P1' }))
    const kolom = screen.getByLabelText('Nama pemain')
    await pengguna.clear(kolom)
    await pengguna.type(kolom, 'Pemenang')
    await pengguna.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(screen.getByLabelText('Edit Pemenang')).toBeInTheDocument()
    expect(screen.queryByLabelText('Edit P1')).not.toBeInTheDocument()
  })
})

describe('localStorage — layar terakhir dipulihkan', () => {
  it('membuka kembali layar daftar match setelah refresh', async () => {
    const pengguna = userEvent.setup()
    const pertama = await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, ['P1', 'P2', 'P3', 'P4', 'P5'])
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(localStorage.getItem(KUNCI_SESI)).toContain('daftar_match')

    pertama.unmount()
    render(<App />)
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Istirahat')).toBeInTheDocument()
  })
})

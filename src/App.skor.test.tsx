import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bukaAplikasi, bukaMatch, kartuMatch, lewatiBeranda, mulaiSesi, ubahSkor } from './test/harness'

beforeEach(() => localStorage.clear())

const DELAPAN = ['Aldi', 'Bagas', 'Citra', 'Dewi', 'Eka', 'Fajar', 'Gani', 'Hana']
const SEMBILAN = [...DELAPAN, 'Indra']

const pemainIstirahat = () => {
  const teks = screen.getByText('Istirahat').closest('section')?.textContent ?? ''
  return SEMBILAN.filter((n) => teks.includes(n))
}

const selesaikanMatch = async (
  pengguna: ReturnType<typeof userEvent.setup>,
  indeks: number,
) => {
  await bukaMatch(pengguna, indeks)
  await ubahSkor(pengguna, 'A', 1)
  await pengguna.click(screen.getByRole('button', { name: 'Selesai' }))
}

describe('layar detail skor', () => {
  it('menampilkan dua tim dengan tombol tambah/kurang berlabel aria-label', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await bukaMatch(pengguna, 0)

    expect(screen.getByRole('button', { name: 'Tambah skor Tim A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kurangi skor Tim A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah skor Tim B' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kurangi skor Tim B' })).toBeInTheDocument()
    expect(screen.getByTestId('skor-tim-a')).toHaveTextContent('0')
    expect(screen.getByTestId('skor-tim-b')).toHaveTextContent('0')
  })

  it('tombol ▲ menambah skor dan ▼ tidak membuat skor negatif', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await bukaMatch(pengguna, 0)

    await ubahSkor(pengguna, 'A', 1)
    await ubahSkor(pengguna, 'A', 1)
    await ubahSkor(pengguna, 'A', -1)
    expect(screen.getByTestId('skor-tim-a')).toHaveTextContent('1')

    await ubahSkor(pengguna, 'A', -1)
    await ubahSkor(pengguna, 'A', -1)
    expect(screen.getByTestId('skor-tim-a')).toHaveTextContent('0')

    await ubahSkor(pengguna, 'B', -1)
    expect(screen.getByTestId('skor-tim-b')).toHaveTextContent('0')
  })

  it('skor pertama diubah menandai match sedang main', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)

    expect(within(kartuMatch()[0]).getByText('Belum main')).toBeInTheDocument()
    await bukaMatch(pengguna, 0)
    await ubahSkor(pengguna, 'A', 1)
    await pengguna.click(screen.getByRole('button', { name: 'Kembali' }))

    expect(within(kartuMatch()[0]).getByText('Sedang main')).toBeInTheDocument()
  })

  it('membuka match yang belum dimainkan tanpa mengubah skor pun menandai sedang main', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await bukaMatch(pengguna, 0)
    await pengguna.click(screen.getByRole('button', { name: 'Kembali' }))
    expect(within(kartuMatch()[0]).getByText('Sedang main')).toBeInTheDocument()
  })
})

describe('alur ronde', () => {
  it('tombol Selesai menandai match selesai dan kembali ke daftar', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)

    await bukaMatch(pengguna, 0)
    await ubahSkor(pengguna, 'A', 1)
    await pengguna.click(screen.getByRole('button', { name: 'Selesai' }))

    expect(within(kartuMatch()[0]).getByText('Selesai')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lanjut ronde' })).toBeDisabled()
  })

  it('tombol Lanjut ronde nonaktif sampai semua match berstatus Selesai', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)

    expect(screen.getByRole('button', { name: 'Lanjut ronde' })).toBeDisabled()
    await selesaikanMatch(pengguna, 0)
    expect(screen.getByRole('button', { name: 'Lanjut ronde' })).toBeDisabled()

    await selesaikanMatch(pengguna, 1)
    expect(await screen.findByText('Ringkasan Ronde 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lanjut ronde' })).not.toBeInTheDocument()
  })

  it('match yang sudah selesai bisa dibuka lagi untuk mengoreksi skor', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await selesaikanMatch(pengguna, 0)
    expect(within(kartuMatch()[0]).getByText('Selesai')).toBeInTheDocument()

    await bukaMatch(pengguna, 0)
    await pengguna.click(screen.getByRole('button', { name: 'Edit skor' }))
    await ubahSkor(pengguna, 'A', 1)
    expect(screen.getByTestId('skor-tim-a')).toHaveTextContent('2')

    await pengguna.click(screen.getByRole('button', { name: 'Selesai' }))
    expect(screen.getByTestId('skor-akhir-r1m1')).toHaveTextContent('2')
  })

  it('pemain yang istirahat ikut bermain setelah acak ulang dan lanjut ronde', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, SEMBILAN)

    const istirahatRonde1 = pemainIstirahat()
    expect(istirahatRonde1).toHaveLength(1)

    await selesaikanMatch(pengguna, 0)
    await selesaikanMatch(pengguna, 1)
    await pengguna.click(
      screen.getByRole('button', { name: 'Acak ulang & lanjut ronde berikutnya' }),
    )

    expect(await screen.findByText('Ronde 2')).toBeInTheDocument()
    const istirahatRonde2 = pemainIstirahat()
    expect(istirahatRonde2).toHaveLength(1)
    expect(istirahatRonde2).not.toEqual(istirahatRonde1)

    const teksMatch = kartuMatch().map((k) => k.textContent).join(' ')
    expect(teksMatch).toContain(istirahatRonde1[0])
  })

  it('mengakhiri sesi dari ringkasan membuka layar rekap', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await selesaikanMatch(pengguna, 0)
    await selesaikanMatch(pengguna, 1)

    await pengguna.click(screen.getByRole('button', { name: 'Selesai' }))
    expect(await screen.findByRole('heading', { name: 'Rekap' })).toBeInTheDocument()
  })
})

describe('rekap', () => {
  it('menampilkan seluruh match beserta skor akhir dan klasemen', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await selesaikanMatch(pengguna, 0)
    await selesaikanMatch(pengguna, 1)
    await pengguna.click(screen.getByRole('button', { name: 'Selesai' }))

    expect(await screen.findByRole('heading', { name: 'Rekap' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Klasemen' })).toBeInTheDocument()
    await waitFor(() => {
      const baris = screen.getAllByRole('row')
      expect(baris.length).toBe(DELAPAN.length + 1)
    })
  })

  it('mulai sesi baru meminta konfirmasi lalu menghapus data', async () => {
    const pengguna = userEvent.setup()
    await bukaAplikasi(pengguna)
    await mulaiSesi(pengguna, DELAPAN)
    await selesaikanMatch(pengguna, 0)
    await selesaikanMatch(pengguna, 1)
    await pengguna.click(screen.getByRole('button', { name: 'Selesai' }))
    await screen.findByRole('heading', { name: 'Rekap' })

    const konfirmasi = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await pengguna.click(screen.getByRole('button', { name: 'Mulai sesi baru' }))
    expect(konfirmasi).toHaveBeenCalledWith(
      expect.stringContaining('menghapus seluruh data sesi'),
    )
    expect(screen.getByRole('heading', { name: 'Rekap' })).toBeInTheDocument()

    konfirmasi.mockReturnValue(true)
    await pengguna.click(screen.getByRole('button', { name: 'Mulai sesi baru' }))
    expect(
      screen.getByRole('heading', { name: 'Match Tracker Bulutangkis' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('bultang.sesi.v1')).toContain('"layar":"beranda"')

    await lewatiBeranda(pengguna)
    expect(screen.getByLabelText('Nama pemain')).toBeInTheDocument()
    expect(localStorage.getItem('bultang.sesi.v1')).toContain('"layar":"setup"')
    konfirmasi.mockRestore()
  })
})

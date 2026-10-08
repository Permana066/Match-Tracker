import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

export type Pengguna = ReturnType<typeof userEvent.setup>

export async function bukaAplikasi(pengguna: Pengguna) {
  const hasil = render(<App />)
  await lewatiBeranda(pengguna)
  return hasil
}

export async function lewatiBeranda(pengguna: Pengguna): Promise<void> {
  await pengguna.click(screen.getByRole('button', { name: 'Mulai' }))
}

export const inputNama = () => screen.getByLabelText('Nama pemain')

export async function tambahPemain(pengguna: Pengguna, nama: string): Promise<void> {
  await pengguna.clear(inputNama())
  await pengguna.type(inputNama(), nama)
  await pengguna.click(screen.getByRole('button', { name: 'Tambah' }))
}

export async function tambahBanyak(pengguna: Pengguna, nama: string[]): Promise<void> {
  for (const n of nama) await tambahPemain(pengguna, n)
}

export async function mulaiSesi(pengguna: Pengguna, nama: string[]): Promise<void> {
  await tambahBanyak(pengguna, nama)
  await pengguna.click(screen.getByRole('button', { name: 'Mulai' }))
}

export function kartuMatch() {
  return screen.getAllByRole('article')
}

export async function bukaMatch(pengguna: Pengguna, indeks = 0): Promise<void> {
  await pengguna.click(screen.getAllByRole('button', { name: /^Buka match/ })[indeks])
}

export async function ubahSkor(
  pengguna: Pengguna,
  tim: 'A' | 'B',
  delta: 1 | -1,
): Promise<void> {
  const nama = delta === 1 ? `Tambah skor Tim ${tim}` : `Kurangi skor Tim ${tim}`
  await pengguna.click(screen.getByRole('button', { name: nama }))
}

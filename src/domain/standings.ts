import type { Pemain, Ronde } from './types'

export interface BarisKlasemen {
  id: string
  nama: string
  menang: number
  kalah: number
  poin: number
}

export function klasemen(ronde: readonly Ronde[], pemain: readonly Pemain[]): BarisKlasemen[] {
  const peta = new Map<string, BarisKlasemen>(
    pemain.map((p) => [p.id, { id: p.id, nama: p.nama, menang: 0, kalah: 0, poin: 0 }]),
  )

  for (const r of ronde) {
    for (const m of r.match) {
      if (m.status !== 'selesai') continue
      const seri = m.skorA === m.skorB
      const timAMenang = m.skorA > m.skorB

      for (const id of m.timA) {
        const baris = peta.get(id)
        if (!baris) continue
        baris.poin += m.skorA
        if (!seri) baris[timAMenang ? 'menang' : 'kalah']++
      }
      for (const id of m.timB) {
        const baris = peta.get(id)
        if (!baris) continue
        baris.poin += m.skorB
        if (!seri) baris[timAMenang ? 'kalah' : 'menang']++
      }
    }
  }

  return [...peta.values()].sort(
    (a, b) => b.menang - a.menang || b.poin - a.poin || a.nama.localeCompare(b.nama, 'id'),
  )
}

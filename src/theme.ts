export type Tema = 'terang' | 'gelap'

export const KUNCI_TEMA = 'bultang.tema'

export function muatTema(): Tema {
  try {
    const tersimpan = localStorage.getItem(KUNCI_TEMA)
    if (tersimpan === 'terang' || tersimpan === 'gelap') return tersimpan
  } catch {
    // localStorage tidak tersedia — pakai preferensi sistem.
  }
  const sistemGelap =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return sistemGelap ? 'gelap' : 'terang'
}

export function terapkanTema(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'gelap')
  try {
    localStorage.setItem(KUNCI_TEMA, tema)
  } catch {
    // localStorage penuh atau tidak tersedia — tema tetap berlaku di sesi ini.
  }
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const hasil = [...items]
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[hasil[i], hasil[j]] = [hasil[j], hasil[i]]
  }
  return hasil
}

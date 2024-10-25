export function calculatePrizes(
  prizePool: number,
  playerCount: number
): number[] {
  if (prizePool <= 0 || playerCount <= 0) {
    return new Array(playerCount).fill(0);
  }

  const prizeDistribution = new Array(playerCount).fill(0);

  // İlk üç oyuncuya ödül dağıtımı (%20, %15, %10)
  if (playerCount > 0) prizeDistribution[0] = prizePool * 0.2;
  if (playerCount > 1) prizeDistribution[1] = prizePool * 0.15;
  if (playerCount > 2) prizeDistribution[2] = prizePool * 0.1;

  // Kalan ödül havuzunu geri kalan oyunculara dağıtım
  const remainingPrizePool = prizePool * 0.55;
  const remainingPlayerCount = Math.max(0, playerCount - 3);

  if (remainingPlayerCount > 0) {
    let totalWeight = 0;
    const weights: number[] = [];

    for (let i = 0; i < remainingPlayerCount; i++) {
      const weight = 1 / (i + 1);
      weights.push(weight);
      totalWeight += weight;
    }

    for (let i = 3; i < playerCount; i++) {
      prizeDistribution[i] =
        (weights[i - 3] / totalWeight) * remainingPrizePool;
    }
  }

  return prizeDistribution;
}

export function calculatePrizes(
  prizePool: number,
  playerCount: number
): number[] {
  if (prizePool <= 0 || playerCount <= 0) {
    return new Array(playerCount).fill(0);
  }

  const prizeDistribution = new Array(playerCount).fill(0);

  if (playerCount > 0) prizeDistribution[0] = prizePool * 0.2;
  if (playerCount > 1) prizeDistribution[1] = prizePool * 0.15;
  if (playerCount > 2) prizeDistribution[2] = prizePool * 0.1;

  const remainingPrizePool =
    prizePool -
    (prizeDistribution[0] + prizeDistribution[1] + prizeDistribution[2]);
  const remainingPlayerCount = Math.max(0, playerCount - 3);

  if (remainingPlayerCount > 0) {
    for (let i = 3; i < Math.min(100, playerCount); i++) {
      prizeDistribution[i] = remainingPrizePool / remainingPlayerCount;
    }
  }

  return prizeDistribution;
}

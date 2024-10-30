import playerRepository from "../repositories/playerRepository"; //eklencek
import { redisClient } from "../config/redis";
import Player from "../models/player";
import { calculatePrizes } from "../utils/prizeDistribiton";

class LeaderboardService {
  private leaderboardKey = "weekly_leaderboard";
  private prizePoolKey = "prize_pool";

  async updateEarnings(playerId: number, earnings: number): Promise<void> {
    try {
      const player = await playerRepository.getPlayerById(playerId);
      if (!player) {
        throw new Error(`Player with ID ${playerId} does not exist.`);
      }
      await redisClient.zIncrBy(
        this.leaderboardKey,
        earnings,
        playerId.toString()
      );
      player.earnings += earnings;
      await player.save();
      const prizeContribution = earnings * 0.02;
      await redisClient.incrByFloat(this.prizePoolKey, prizeContribution);
    } catch (error) {
      console.error("Error updating player earnings:", error);
      throw error;
    }
  }
  async getFullLeaderboard(): Promise<{ player: Player; rank: number }[]> {
    try {
      const top100Players = await playerRepository.getFullLeaderboard();

      const last10Players = await this.getLast10Players();

      const leaderboard = [...top100Players, ...last10Players];

      return leaderboard;
    } catch (error) {
      console.error("Error getting full leaderboard:", error);
      throw error;
    }
  }
  async calculateWeeklyPrizePool(): Promise<{
    totalEarnings: number;
    prizePoolContribution: number;
  }> {
    const players = await playerRepository.getAllPlayers();
    const totalEarnings = players.reduce(
      (acc, player) => acc + player.earnings,
      0
    );
    const prizePoolContribution = totalEarnings * 0.02;
    await redisClient.set(this.prizePoolKey, prizePoolContribution.toString());

    return { totalEarnings, prizePoolContribution };
  }
  async distributePrizesAndShowResults(prizePoolContribution: number): Promise<{
    topThree: { playerName: string; prize: number; totalEarnings: number }[];
    others: { totalPrize: number; totalEarnings: number };
  }> {
    const totalPrizePool = prizePoolContribution;

    const topPlayersWithScores = await playerRepository.getTopPlayersWithScores(
      100
    );
    const playerCount = topPlayersWithScores.length;
    const prizeDistribution = calculatePrizes(totalPrizePool, playerCount);

    const topThree = await Promise.all(
      topPlayersWithScores.slice(0, 3).map(async (entry, index) => {
        const player = entry.player;
        const prize = prizeDistribution[index];
        player.earnings += prize;
        await player.save();
        return {
          playerName: player.name,
          prize,
          totalEarnings: player.earnings,
        };
      })
    );
    const others = await topPlayersWithScores
      .slice(3)
      .reduce(async (accPromise, entry, index) => {
        const acc = await accPromise;
        const player = entry.player;
        const prize = prizeDistribution[index + 3];
        player.earnings += prize;
        await player.save();
        acc.totalPrize += prize;
        acc.totalEarnings += player.earnings;

        return acc;
      }, Promise.resolve({ totalPrize: 0, totalEarnings: 0 }));

    return {
      topThree,
      others,
    };
  }

  async resetPlayerEarnings(): Promise<void> {
    await Player.update({ earnings: 0 }, { where: {} });
  }
  async resetLeaderboardAndPrizePool(): Promise<void> {
    await playerRepository.resetLeaderboardAndPrizePool();
  }
  async getPrizePool(): Promise<number> {
    try {
      const prizePoolValue = await redisClient.get(this.prizePoolKey);
      return prizePoolValue !== null ? parseFloat(prizePoolValue) : 0;
    } catch (error) {
      console.error("Error getting prize pool:", error);
      throw error;
    }
  }

  async searchPlayers(query: string): Promise<any[]> {
    try {
      const players = await playerRepository.searchPlayersByName(query);

      const playersWithSurroundings = await Promise.all(
        players.map(async (player) => {
          const playerRank = await redisClient.zRevRank(
            this.leaderboardKey,
            player.id.toString()
          );

          if (playerRank !== null) {
            const startRank = Math.max(playerRank - 3, 0);
            const endRank = playerRank + 3;
            const surroundingPlayerIds = await redisClient.zRange(
              this.leaderboardKey,
              startRank,
              endRank,
              { REV: true }
            );
            const surroundingPlayers = await Promise.all(
              surroundingPlayerIds.map(async (id) => {
                const surroundingPlayer = await playerRepository.getPlayerById(
                  Number(id)
                );

                if (!surroundingPlayer) return null;

                const rank = await redisClient.zRevRank(
                  this.leaderboardKey,
                  id.toString()
                );
                const score = await redisClient.zScore(
                  this.leaderboardKey,
                  id.toString()
                );

                if (rank === null || score === null) return null;

                return {
                  player: surroundingPlayer,
                  rank: rank + 1,
                  score: score,
                };
              })
            );
            return surroundingPlayers.filter((p) => p !== null);
          }
          return [];
        })
      );
      return playersWithSurroundings.flat();
    } catch (error) {
      console.error("Error searching players:", error);
      throw error;
    }
  }

  async assignRandomEarningsToZeroPlayers(): Promise<Player[]> {
    try {
      const playersWithZeroEarnings =
        await playerRepository.getPlayersWithZeroEarnings();

      const updatedPlayers = await Promise.all(
        playersWithZeroEarnings.map(async (player) => {
          const randomEarnings = Math.floor(Math.random() * 3000) + 1;
          player.earnings = randomEarnings;
          await player.save();

          await redisClient.zAdd(this.leaderboardKey, [
            { score: randomEarnings, value: player.id.toString() },
          ]);

          return player;
        })
      );
      return updatedPlayers;
    } catch (error) {
      console.error("Error assigning random earnings:", error);
      throw error;
    }
  }
  async getLast10Players(): Promise<{ player: Player; rank: number }[]> {
    try {
      const allPlayers = await playerRepository.getAllPlayersLeaderboard();
      if (!allPlayers || !Array.isArray(allPlayers)) {
        throw new Error("No players data found");
      }
      const last10Players = allPlayers.slice(-10);
      return last10Players;
    } catch (error) {
      console.error("Error fetching last 10 players:", error);
      throw error;
    }
  }
}
export default new LeaderboardService();

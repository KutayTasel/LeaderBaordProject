import Player from "../models/player";
import { redisClient } from "../config/redis";
import { Op } from "sequelize";

class PlayerRepository {
  private leaderboardKey = "weekly_leaderboard";
  private prizePoolKey = "prize_pool";

  async createPlayer(name: string, country: string): Promise<Player> {
    const player = await Player.create({ name, country });
    await redisClient.zAdd(this.leaderboardKey, [
      { score: 0, value: player.id.toString() },
    ]);
    return player;
  }

  async getPlayerById(id: number): Promise<Player | null> {
    return Player.findByPk(id);
  }

  async getAllPlayers(): Promise<Player[]> {
    return Player.findAll();
  }

  async updatePlayerEarnings(id: number, earnings: number): Promise<void> {
    const player = await this.getPlayerById(id);
    if (player) {
      player.earnings += earnings;
      await player.save();
      await redisClient.zIncrBy(
        this.leaderboardKey,
        earnings,
        player.id.toString()
      );
    }
  }

  async getTopPlayers(limit: number): Promise<Player[]> {
    const topPlayerIds = await redisClient.zRange(
      this.leaderboardKey,
      0,
      limit - 1,
      { REV: true }
    );
    const topPlayers = await Promise.all(
      topPlayerIds.map((id) => this.getPlayerById(Number(id)))
    );
    return topPlayers.filter((p) => p !== null) as Player[];
  }

  async getFullLeaderboard(): Promise<{ player: Player; rank: number }[]> {
    const top100PlayerIds = await redisClient.zRange(
      this.leaderboardKey,
      0,
      99,
      { REV: true }
    );

    const leaderboard = await Promise.all(
      top100PlayerIds.map(async (id, index) => {
        const player = await this.getPlayerById(Number(id));

        if (player) {
          return { player, rank: index + 1 };
        }
        return null;
      })
    );

    return leaderboard.filter((entry) => entry !== null) as {
      player: Player;
      rank: number;
    }[];
  }

  async getTopPlayersWithScores(
    limit: number
  ): Promise<{ player: Player; score: number }[]> {
    const topPlayerIdsWithScores = await redisClient.zRangeWithScores(
      this.leaderboardKey,
      0,
      limit - 1,
      { REV: true }
    );

    const playersWithScores = await Promise.all(
      topPlayerIdsWithScores.map(async ({ value: id, score }) => {
        const player = await this.getPlayerById(Number(id));
        return player ? { player, score } : null;
      })
    );

    return playersWithScores.filter((entry) => entry !== null) as {
      player: Player;
      score: number;
    }[];
  }

  async resetLeaderboardAndPrizePool(): Promise<void> {
    await redisClient.del(this.leaderboardKey);
    await redisClient.set(this.prizePoolKey, 0);

    await Player.update({ earnings: 0 }, { where: {} });
  }

  async getPrizePool(): Promise<number> {
    const prizePoolValue = await redisClient.get(this.prizePoolKey);
    return prizePoolValue !== null ? parseFloat(prizePoolValue) : 0;
  }

  async searchPlayersByName(query: string): Promise<Player[]> {
    return Player.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
      },
    });
  }

  async ensureRedisConnection() {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }
  async getPlayersWithZeroEarnings(): Promise<Player[]> {
    return Player.findAll({
      where: {
        earnings: 0,
      },
    });
  }
  async getPlayersSortedByEarnings(): Promise<Player[]> {
    return Player.findAll({
      order: [["earnings", "DESC"]],
    });
  }
  async getPlayersSortedByEarningsInRedis(): Promise<Player[]> {
    try {
      const playerIds = await redisClient.zRange(this.leaderboardKey, 0, -1, {
        REV: true,
      });
      const players = await Promise.all(
        playerIds.map((id) => this.getPlayerById(Number(id)))
      );
      return players.filter((p) => p !== null) as Player[];
    } catch (error) {
      console.error(
        "Error getting players sorted by earnings in Redis:",
        error
      );
      throw error;
    }
  }
  async getAllPlayersLeaderboard(): Promise<
    { player: Player; rank: number }[]
  > {
    try {
      const allPlayerIds = await redisClient.zRange(
        this.leaderboardKey,
        0,
        -1,
        { REV: true }
      );
      const leaderboard = await Promise.all(
        allPlayerIds.map(async (id, index) => {
          const player = await this.getPlayerById(Number(id));
          if (player) {
            return { player, rank: index + 1 };
          }
          return null;
        })
      );
      return leaderboard.filter((entry) => entry !== null) as {
        player: Player;
        rank: number;
      }[];
    } catch (error) {
      console.error("Error getting all players leaderboard:", error);
      throw error;
    }
  }
}
export default new PlayerRepository();

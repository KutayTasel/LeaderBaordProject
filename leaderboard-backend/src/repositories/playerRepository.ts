import Player from "../models/player";
import { redisClient } from "../config/redis";
import { Op } from "sequelize";

class PlayerRepository {
  private leaderboardKey = "weekly_leaderboard";
  private prizePoolKey = "prize_pool";

  // Oyuncu oluşturma (MySQL ve Redis)
  async createPlayer(name: string, country: string): Promise<Player> {
    const player = await Player.create({ name, country });
    await redisClient.zAdd(this.leaderboardKey, [
      { score: 0, value: player.id.toString() },
    ]);
    return player;
  }

  // Oyuncuyu ID ile getirme (MySQL)
  async getPlayerById(id: number): Promise<Player | null> {
    return Player.findByPk(id);
  }

  // Tüm oyuncuları MySQL'den çekme
  async getAllPlayers(): Promise<Player[]> {
    return Player.findAll();
  }

  // Oyuncunun kazançlarını güncelleme (MySQL ve Redis)
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

  // İlk "limit" sayıda oyuncuyu getir (Redis - Ters sıralama)
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

  // Oyuncunun sıralamasını getir (Redis)
  async getPlayerRank(playerId: number): Promise<{ rank: number }> {
    try {
      const playerRank = await redisClient.zRevRank(
        this.leaderboardKey,
        playerId.toString()
      );

      if (playerRank === null) {
        throw new Error(
          `Player with ID ${playerId} not found in the leaderboard.`
        );
      }

      return { rank: playerRank + 1 }; // 1 bazlı sıralama
    } catch (error) {
      console.error("Error getting player rank:", error);
      throw error;
    }
  }

  // Tüm liderlik tablosunu getirme (Redis ve MySQL)
  async getFullLeaderboard(): Promise<{ player: Player; rank: number }[]> {
    const top100PlayerIds = await redisClient.zRange(
      this.leaderboardKey,
      0,
      99,
      { REV: true }
    );

    const leaderboard = await Promise.all(
      top100PlayerIds.map(async (id, index) => {
        // Oyuncuyu Redis'ten değil, MySQL'den çekiyoruz
        const player = await this.getPlayerById(Number(id));

        // Redis güncellemelerinin MySQL ile senkronize olduğundan emin olun
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

  // async getFullLeaderboard(): Promise<{ player: Player; rank: number }[]> {
  //   const top100PlayerIds = await redisClient.zRange(
  //     this.leaderboardKey,
  //     0,
  //     99,
  //     { REV: true }
  //   );

  //   const leaderboard = await Promise.all(
  //     top100PlayerIds.map(async (id, index) => {
  //       const player = await this.getPlayerById(Number(id));
  //       if (player) {
  //         return { player, rank: index + 1 };
  //       }
  //       return null;
  //     })
  //   );

  //   return leaderboard.filter((entry) => entry !== null) as {
  //     player: Player;
  //     rank: number;
  //   }[];
  // }

  // Liderlik tablosundaki oyuncuları ve kazançlarını getir (Redis ve MySQL)
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

  // Ödül havuzunu sıfırla ve liderlik tablosunu temizle (Redis)
  async resetLeaderboardAndPrizePool(): Promise<void> {
    await redisClient.del(this.leaderboardKey);
    await redisClient.set(this.prizePoolKey, 0);

    await Player.update({ earnings: 0 }, { where: {} });
  }

  // Ödül havuzunu getir (Redis)
  async getPrizePool(): Promise<number> {
    const prizePoolValue = await redisClient.get(this.prizePoolKey);
    return prizePoolValue !== null ? parseFloat(prizePoolValue) : 0;
  }

  // Oyuncuları isme göre arama (MySQL)
  async searchPlayersByName(query: string): Promise<Player[]> {
    return Player.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
      },
    });
  }

  // Redis bağlantısını kontrol et
  async ensureRedisConnection() {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }
}

export default new PlayerRepository();

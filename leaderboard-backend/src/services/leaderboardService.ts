import playerRepository from "../repositories/playerRepository";
import { redisClient } from "../config/redis";
import Player from "../models/player";
import { calculatePrizes } from "../utils/prizeDistribiton";

class LeaderboardService {
  private leaderboardKey = "weekly_leaderboard";
  private prizePoolKey = "prize_pool";

  // Oyuncunun kazancını güncelleme servisi
  async updateEarnings(playerId: number, earnings: number): Promise<void> {
    try {
      const player = await playerRepository.getPlayerById(playerId);
      if (!player) {
        throw new Error(`Player with ID ${playerId} does not exist.`);
      }

      // Redis'te kazancı güncelle
      await redisClient.zIncrBy(
        this.leaderboardKey,
        earnings,
        playerId.toString()
      );

      // MySQL'de kazancı güncelle
      player.earnings += earnings;
      await player.save();

      // Ödül havuzuna %2'lik katkıyı ekle
      const prizeContribution = earnings * 0.02;
      await redisClient.incrByFloat(this.prizePoolKey, prizeContribution);
    } catch (error) {
      console.error("Error updating player earnings:", error);
      throw error;
    }
  }

  // Oyuncunun sıralamasını al
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

  // Tüm liderlik tablosunu getiren servis
  async getFullLeaderboard(): Promise<{ player: Player; rank: number }[]> {
    try {
      const leaderboard = await playerRepository.getFullLeaderboard();
      return leaderboard;
    } catch (error) {
      console.error("Error getting full leaderboard:", error);
      throw error;
    }
  }

  // Tüm liderlik tablosundaki tüm oyuncuları getiren servis
  async getAllPlayersLeaderboard(): Promise<
    { player: Player; rank: number }[]
  > {
    try {
      // Tüm oyuncuları Redis'ten al (sıralı bir şekilde)
      const allPlayerIds = await redisClient.zRange(
        this.leaderboardKey,
        0,
        -1,
        { REV: true }
      );

      // Her oyuncunun bilgilerini ve sıralamasını al
      const leaderboard = await Promise.all(
        allPlayerIds.map(async (id, index) => {
          const player = await playerRepository.getPlayerById(Number(id));
          if (player) {
            return { player, rank: index + 1 }; // 1-bazlı sıralama
          }
          return null;
        })
      );

      // Sadece geçerli oyuncuları döndür
      return leaderboard.filter((entry) => entry !== null) as {
        player: Player;
        rank: number;
      }[];
    } catch (error) {
      console.error("Error getting all players leaderboard:", error);
      throw error;
    }
  }

  // Haftalık ödül havuzunu hesaplayan servis
  async calculateWeeklyPrizePool(): Promise<{
    totalEarnings: number;
    prizePoolContribution: number;
  }> {
    try {
      // MySQL'deki tüm oyuncuların kazançlarını al
      const allPlayers = await playerRepository.getAllPlayers();

      let totalEarnings = 0;

      // Tüm oyuncuların kazançlarını topluyoruz
      allPlayers.forEach((player) => {
        totalEarnings += player.earnings;
      });

      // Kazançların %2'sini ödül havuzuna ekle
      const prizePoolContribution = totalEarnings * 0.02;
      await redisClient.incrByFloat(this.prizePoolKey, prizePoolContribution);

      // Sonuç olarak toplam kazanç ve katkı miktarını döndür
      return { totalEarnings, prizePoolContribution };
    } catch (error) {
      console.error("Error calculating weekly prize pool:", error);
      throw error;
    }
  }

  // Ödülleri dağıtma ve sonuçları gösterme

  async distributePrizesAndShowResults(): Promise<{
    topThree: { playerName: string; prize: number; totalEarnings: number }[];
    others: { totalPrize: number; totalEarnings: number };
  }> {
    // İlk 100 oyuncuyu kazançlarıyla birlikte al
    const topPlayersWithScores = await playerRepository.getTopPlayersWithScores(
      100
    );

    // Ödül havuzunu al
    const prizePool = await playerRepository.getPrizePool();
    const playerCount = topPlayersWithScores.length;

    // Ödülleri hesapla (sadece ilk 100 oyuncuya)
    const prizeDistribution = calculatePrizes(prizePool, playerCount);

    // İlk üç oyuncuyu işliyoruz
    const topThree = await Promise.all(
      topPlayersWithScores.slice(0, 3).map(async (entry, index) => {
        const player = entry.player;
        const prize = prizeDistribution[index];
        player.earnings += prize; // Kazancını güncelle ve veritabanına kaydet
        await player.save();
        return {
          playerName: player.name,
          prize,
          totalEarnings: player.earnings,
        };
      })
    );

    // Geri kalan oyuncular için "the others" olarak genel sonuçları topluyoruz
    const others = await topPlayersWithScores
      .slice(3)
      .reduce(async (accPromise, entry, index) => {
        const acc = await accPromise;
        const player = entry.player;
        const prize = prizeDistribution[index + 3];
        player.earnings += prize; // Kazancını güncelle ve veritabanına kaydet
        await player.save();

        // Toplam ödülü ve kazancı topluyoruz
        acc.totalPrize += prize;
        acc.totalEarnings += player.earnings;

        return acc;
      }, Promise.resolve({ totalPrize: 0, totalEarnings: 0 })); // Başlangıç değerleri

    // Sonuçları döndür
    return {
      topThree, // İlk üç oyuncunun detayları
      others, // Diğer oyuncuların toplam ödül ve kazançları
    };
  }

  // async distributePrizesAndShowResults(): Promise<
  //   { player: Player; score: number; prize: number }[]
  // > {
  //   // İlk 100 oyuncuyu kazançlarıyla birlikte al
  //   const topPlayersWithScores = await playerRepository.getTopPlayersWithScores(
  //     100
  //   );

  //   // Ödül havuzunu al
  //   const prizePool = await playerRepository.getPrizePool();
  //   const playerCount = topPlayersWithScores.length;

  //   // Ödülleri hesapla (sadece ilk 100 oyuncuya)
  //   const prizeDistribution = calculatePrizes(prizePool, playerCount);

  //   // Her oyuncuya ödülleri dağıt ve sonuçları tut
  //   const prizeResults = await Promise.all(
  //     topPlayersWithScores.map(async (entry, index) => {
  //       const player = entry.player;
  //       const prize = prizeDistribution[index];

  //       // Oyuncunun kazancına ödül ekleyip MySQL'e kaydet
  //       player.earnings += prize;
  //       await player.save();

  //       return { player, score: entry.score, prize };
  //     })
  //   );

  //   // Ödülleri en yüksekten en düşüğe doğru sıralıyoruz
  //   const sortedPrizeResults = prizeResults.sort((a, b) => b.prize - a.prize);

  //   // Sıralanmış ödül sonuçlarını döndür
  //   return sortedPrizeResults;
  // }

  async resetPlayerEarnings(): Promise<void> {
    // MySQL'deki tüm oyuncuların kazançlarını sıfırla
    await Player.update({ earnings: 0 }, { where: {} });
  }

  // Liderlik tablosunu ve ödül havuzunu sıfırla
  async resetLeaderboardAndPrizePool(): Promise<void> {
    await playerRepository.resetLeaderboardAndPrizePool();
  }

  // Ödül havuzunu getirme servisi
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
      // Aranan oyuncunun ismiyle eşleşen oyuncuların listesini getir
      const players = await playerRepository.searchPlayersByName(query);

      const playersWithSurroundings = await Promise.all(
        players.map(async (player) => {
          const playerRank = await redisClient.zRevRank(
            this.leaderboardKey,
            player.id.toString()
          );

          if (playerRank !== null) {
            // Oyuncunun sırasını al ve çevresindeki oyuncuları bul
            const startRank = Math.max(playerRank - 3, 0); // Alt sınırı kontrol et
            const endRank = playerRank + 3; // Üst sınır

            // Çevresindeki oyuncuları getir
            const surroundingPlayerIds = await redisClient.zRange(
              this.leaderboardKey,
              startRank,
              endRank,
              { REV: true }
            );

            // Çevredeki oyuncuların bilgilerini getir
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
                  rank: rank + 1, // Sıralama 1-bazlı olsun
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
}

export default new LeaderboardService();

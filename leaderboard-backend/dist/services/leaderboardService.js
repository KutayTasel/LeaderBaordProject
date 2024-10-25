"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playerRepository_1 = __importDefault(require("../repositories/playerRepository"));
const redis_1 = require("../config/redis");
const prizeDistribiton_1 = require("../utils/prizeDistribiton");
class LeaderboardService {
    constructor() {
        this.leaderboardKey = "weekly_leaderboard";
        this.prizePoolKey = "prize_pool";
    }
    // Oyuncunun kazancını güncelleme servisi
    async updateEarnings(playerId, earnings) {
        try {
            const player = await playerRepository_1.default.getPlayerById(playerId);
            if (!player) {
                throw new Error(`Player with ID ${playerId} does not exist.`);
            }
            // Redis'te kazancı güncelle
            await redis_1.redisClient.zIncrBy(this.leaderboardKey, earnings, playerId.toString());
            // MySQL'de kazancı güncelle
            player.earnings += earnings;
            await player.save();
            // Ödül havuzuna %2'lik katkıyı ekle
            const prizeContribution = earnings * 0.02;
            await redis_1.redisClient.incrByFloat(this.prizePoolKey, prizeContribution);
        }
        catch (error) {
            console.error("Error updating player earnings:", error);
            throw error;
        }
    }
    // Mevcut hafta numarasını döndüren yardımcı fonksiyon
    getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    }
    // // Ödülleri dağıtma ve tabloyu sıfırlama işlemi
    // async distributePrizes(weekNumber: number): Promise<void> {
    //   try {
    //     // Redis'ten liderlik tablosundaki ilk 100 oyuncuyu al
    //     const topPlayerData = await redisClient.zRangeWithScores(
    //       this.leaderboardKey,
    //       0,
    //       99
    //     );
    //     if (topPlayerData.length === 0) {
    //       throw new Error("No players found in the leaderboard."); // Hata durumu
    //     }
    //     // Ödül havuzunu Redis'ten al
    //     const prizePoolValue = await redisClient.get(this.prizePoolKey);
    //     const prizePool =
    //       prizePoolValue !== null ? parseFloat(prizePoolValue) : 0;
    //     if (prizePool <= 0) {
    //       throw new Error("No prize pool available for distribution."); // Hata durumu
    //     }
    //     // Ödülleri hesapla
    //     const prizeDistribution = calculatePrizes(
    //       prizePool,
    //       topPlayerData.length
    //     );
    //     // Her oyuncuya ödülü ver ve kazançlarını güncelle
    //     for (let i = 0; i < topPlayerData.length; i++) {
    //       const playerId = parseInt(topPlayerData[i].value);
    //       const prize = prizeDistribution[i];
    //       const player = await playerRepository.getPlayerById(playerId);
    //       if (player) {
    //         player.earnings += prize;
    //         await player.save();
    //         // Ödülü kaydet (Redis'te)
    //         await playerRepository.recordPrizeDistribution(
    //           playerId,
    //           prize,
    //           weekNumber
    //         );
    //         console.log(`Recording prize for player ${playerId}: ${prize}`);
    //       }
    //     }
    //     // Ödül dağıtımından sonra liderlik tablosunu ve ödül havuzunu sıfırla
    //     await redisClient.del(this.leaderboardKey);
    //     await redisClient.set(this.prizePoolKey, "0");
    //     // MySQL ve Redis'teki oyuncu kazançlarını sıfırla
    //     await playerRepository.resetAllPlayerEarnings();
    //   } catch (error) {
    //     console.error("Error distributing prizes:", error);
    //     throw error; // Hata fırlat
    //   }
    // }
    async distributePrizes(weekNumber) {
        try {
            // Redis'ten liderlik tablosundaki ilk 100 oyuncuyu al
            const topPlayerData = await redis_1.redisClient.zRangeWithScores(this.leaderboardKey, 0, 99);
            if (topPlayerData.length === 0) {
                throw new Error("No players found in the leaderboard."); // Hata durumu
            }
            // Ödül havuzunu Redis'ten al
            const prizePoolValue = await redis_1.redisClient.get(this.prizePoolKey);
            const prizePool = prizePoolValue !== null ? parseFloat(prizePoolValue) : 0;
            if (prizePool <= 0) {
                throw new Error("No prize pool available for distribution."); // Hata durumu
            }
            // Ödülleri hesapla
            const prizeDistribution = (0, prizeDistribiton_1.calculatePrizes)(prizePool, topPlayerData.length);
            // Her oyuncuya ödülü ver ve kazançlarını güncelle
            for (let i = 0; i < topPlayerData.length; i++) {
                const playerId = parseInt(topPlayerData[i].value);
                const prize = prizeDistribution[i];
                const player = await playerRepository_1.default.getPlayerById(playerId);
                if (player) {
                    player.earnings += prize;
                    await player.save();
                    // Ödülü kaydet (Redis'te)
                    await playerRepository_1.default.recordPrizeDistribution(playerId, prize, weekNumber);
                    console.log(`Recording prize for player ${playerId}: ${prize}`);
                }
            }
            // Ödül dağıtımından sonra liderlik tablosunu sıfırla
            await redis_1.redisClient.del(this.leaderboardKey);
            // MySQL ve Redis'teki oyuncu kazançlarını sıfırla
            await playerRepository_1.default.resetAllPlayerEarnings(); // Burada PlayerRepository'den çekiyoruz
        }
        catch (error) {
            console.error("Error distributing prizes:", error);
            throw error; // Hata fırlat
        }
    }
    // Mevcut hafta numarasını döndürme
    getCurrentWeek() {
        return playerRepository_1.default.getCurrentWeek(); // PlayerRepository'den mevcut haftayı al
    }
    // Önceki haftanın ödül dağıtımını getirme
    async getPreviousWeeklyPrizeDistribution() {
        const currentWeek = this.getCurrentWeek();
        const previousWeek = currentWeek - 1; // Önceki haftayı al
        return this.getWeeklyPrizeDistribution(previousWeek);
    }
    // Belirli bir hafta için ödül dağıtımını getirme
    async getWeeklyPrizeDistribution(weekNumber) {
        try {
            const currentWeek = this.getCurrentWeek();
            if (weekNumber > currentWeek) {
                throw new Error("Week number cannot be in the future.");
            }
            // Redis'ten ödül dağıtım verilerini alalım
            const prizeData = await playerRepository_1.default.getPrizeDistributionForWeek(weekNumber);
            // Eğer Redis'te o hafta için veri yoksa
            if (!prizeData || Object.keys(prizeData).length === 0) {
                throw new Error(`No prize distribution found for week ${weekNumber}`);
            }
            const distribution = {};
            for (const [playerId, prize] of Object.entries(prizeData)) {
                const player = await playerRepository_1.default.getPlayerById(Number(playerId));
                if (player) {
                    distribution[Number(playerId)] = {
                        playerId: Number(playerId),
                        prize: parseFloat(prize),
                        name: player.name,
                        country: player.country,
                    };
                }
            }
            // Dağıtımı döndürelim
            return distribution;
        }
        catch (error) {
            console.error("Error getting weekly prize distribution:", error);
            throw error;
        }
    }
    // Oyuncunun sıralamasını al
    async getPlayerRank(playerId) {
        try {
            const playerRank = await redis_1.redisClient.zRevRank(this.leaderboardKey, playerId.toString());
            if (playerRank === null) {
                throw new Error(`Player with ID ${playerId} not found in the leaderboard.`);
            }
            return { rank: playerRank + 1 }; // 1 bazlı sıralama
        }
        catch (error) {
            console.error("Error getting player rank:", error);
            throw error;
        }
    }
    // Çevresindeki oyuncuları getirme servisi
    async getSurroundingPlayers(playerId) {
        try {
            const surroundingPlayers = await playerRepository_1.default.getNearestPlayers(playerId);
            return surroundingPlayers;
        }
        catch (error) {
            console.error("Error getting surrounding players:", error);
            throw error;
        }
    }
    // Tüm liderlik tablosunu getiren servis
    async getFullLeaderboard() {
        try {
            const leaderboard = await playerRepository_1.default.getFullLeaderboard();
            return leaderboard;
        }
        catch (error) {
            console.error("Error getting full leaderboard:", error);
            throw error;
        }
    }
    // Ödül havuzunu getirme servisi
    async getPrizePool() {
        try {
            const prizePoolValue = await redis_1.redisClient.get(this.prizePoolKey);
            return prizePoolValue !== null ? parseFloat(prizePoolValue) : 0;
        }
        catch (error) {
            console.error("Error getting prize pool:", error);
            throw error;
        }
    }
    // Oyuncu profilini getirme
    async getPlayerProfile(playerId) {
        try {
            return await playerRepository_1.default.getPlayerById(playerId);
        }
        catch (error) {
            console.error("Error getting player profile:", error);
            throw error;
        }
    }
    // Oyuncuları arama
    async searchPlayers(query) {
        try {
            const players = await playerRepository_1.default.searchPlayersByName(query);
            const playersWithRank = await Promise.all(players.map(async (player) => {
                const rank = await redis_1.redisClient.zRank(this.leaderboardKey, player.id.toString());
                return {
                    ...player.toJSON(),
                    rank: rank !== null ? rank + 1 : null, // Sıralamayı 1 bazlı yap
                };
            }));
            return playersWithRank;
        }
        catch (error) {
            console.error("Error searching players:", error);
            throw error;
        }
    }
}
exports.default = new LeaderboardService();

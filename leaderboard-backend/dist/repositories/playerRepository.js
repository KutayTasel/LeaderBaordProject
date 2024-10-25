"use strict";
// import Player from "../models/player";
// import { redisClient } from "../config/redis";
// import { Op } from "sequelize";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// class PlayerRepository {
//   private leaderboardKey = "weekly_leaderboard";
//   // Oyuncu oluşturma (MySQL ve Redis)
//   async createPlayer(name: string, country: string): Promise<Player> {
//     const player = await Player.create({ name, country });
//     await redisClient.zAdd(this.leaderboardKey, [
//       { score: 0, value: player.id.toString() },
//     ]);
//     return player;
//   }
//   // Oyuncuyu ID ile getirme (MySQL)
//   async getPlayerById(id: number): Promise<Player | null> {
//     return Player.findByPk(id);
//   }
//   // Mevcut hafta numarasını döndürme
//   getCurrentWeek(): number {
//     const currentDate = new Date();
//     const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
//     const daysSinceStartOfYear = Math.floor(
//       (currentDate.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24)
//     );
//     const weekNumber = Math.ceil(
//       (daysSinceStartOfYear + firstDayOfYear.getDay() + 1) / 7
//     );
//     console.log(`Calculated current week number: ${weekNumber}`);
//     return weekNumber;
//   }
//   // Oyuncunun kazançlarını güncelleme (MySQL ve Redis)
//   async updatePlayerEarnings(id: number, earnings: number): Promise<void> {
//     const player = await this.getPlayerById(id);
//     if (player) {
//       player.earnings += earnings;
//       await player.save();
//       await redisClient.zIncrBy(
//         this.leaderboardKey,
//         earnings,
//         player.id.toString()
//       );
//     }
//   }
//   // Tüm oyuncuların kazançlarını sıfırlama (MySQL ve Redis)
//   async resetAllPlayerEarnings(): Promise<void> {
//     await Player.update({ earnings: 0 }, { where: {} });
//     await redisClient.del(this.leaderboardKey);
//   }
//   // İlk "limit" sayıda oyuncuyu getir (Redis - Ters sıralama)
//   async getTopPlayers(limit: number): Promise<Player[]> {
//     const topPlayerIds = await redisClient.zRange(
//       this.leaderboardKey,
//       0,
//       limit - 1,
//       { REV: true }
//     );
//     const topPlayers = await Promise.all(
//       topPlayerIds.map((id) => this.getPlayerById(Number(id)))
//     );
//     return topPlayers.filter((p) => p !== null) as Player[];
//   }
//   // Oyuncunun sıralamasını getir (Redis)
//   async getPlayerRank(playerId: number): Promise<{ rank: number }> {
//     try {
//       const playerRank = await redisClient.zRevRank(
//         this.leaderboardKey,
//         playerId.toString()
//       );
//       if (playerRank === null) {
//         throw new Error(
//           `Player with ID ${playerId} not found in the leaderboard.`
//         );
//       }
//       return { rank: playerRank + 1 }; // 1 bazlı sıralama
//     } catch (error) {
//       console.error("Error getting player rank:", error);
//       throw error;
//     }
//   }
//   // Girilen oyuncunun kazancına en yakın 3 oyuncuyu getir (Redis)
//   async getNearestPlayers(playerId: number): Promise<Player[]> {
//     const playerRank = await redisClient.zRevRank(
//       this.leaderboardKey,
//       playerId.toString()
//     );
//     if (playerRank === null) {
//       throw new Error(
//         `Player with ID ${playerId} not found in the leaderboard.`
//       );
//     }
//     const startRank = Math.max(playerRank - 1, 0);
//     const endRank = playerRank + 1;
//     const nearestPlayerIds = await redisClient.zRange(
//       this.leaderboardKey,
//       startRank,
//       endRank,
//       { REV: true }
//     );
//     const nearestPlayers = await Promise.all(
//       nearestPlayerIds.map((id) => this.getPlayerById(Number(id)))
//     );
//     return nearestPlayers.filter((p) => p !== null) as Player[];
//   }
//   // Tüm liderlik tablosunu getirme (Redis ve MySQL)
//   async getFullLeaderboard(): Promise<{ player: Player; rank: number }[]> {
//     const allPlayerIds = await redisClient.zRange(this.leaderboardKey, 0, -1, {
//       REV: true,
//     });
//     const leaderboard = await Promise.all(
//       allPlayerIds.map(async (id, index) => {
//         const player = await this.getPlayerById(Number(id));
//         if (player) {
//           return { player, rank: index + 1 };
//         }
//         return null;
//       })
//     );
//     return leaderboard.filter((entry) => entry !== null) as {
//       player: Player;
//       rank: number;
//     }[];
//   }
//   // Oyuncuları isme göre arama (MySQL)
//   async searchPlayersByName(query: string): Promise<Player[]> {
//     return Player.findAll({
//       where: {
//         name: { [Op.like]: `%${query}%` },
//       },
//     });
//   }
//   // Ödülleri kaydetme (Redis)
//   // Ödülleri kaydetme (Redis)
//   async recordPrizeDistribution(
//     playerId: number,
//     prize: number,
//     weekNumber: number
//   ): Promise<void> {
//     const key = `weekly_prize_distribution:${weekNumber}`;
//     // Redis'e kaydedilen ödülleri loglayalım
//     console.log(
//       `Recording prize for player ${playerId} for week ${weekNumber}: ${prize}`
//     );
//     await redisClient.hSet(key, playerId.toString(), prize.toString());
//   }
//   // Belirli bir hafta için ödül dağıtımını sorgulama (Redis)
//   async getPrizeDistributionForWeek(
//     weekNumber: number
//   ): Promise<Record<string, string>> {
//     const key = `weekly_prize_distribution:${weekNumber}`;
//     // Redis'ten çekilen verileri loglayalım
//     const prizeData = await redisClient.hGetAll(key);
//     console.log(`Prize distribution for week ${weekNumber}:`, prizeData);
//     return prizeData;
//   }
// }
// export default new PlayerRepository();
const player_1 = __importDefault(require("../models/player"));
const redis_1 = require("../config/redis");
const sequelize_1 = require("sequelize");
class PlayerRepository {
    constructor() {
        this.leaderboardKey = "weekly_leaderboard";
    }
    // Oyuncu oluşturma (MySQL ve Redis)
    async createPlayer(name, country) {
        const player = await player_1.default.create({ name, country });
        await redis_1.redisClient.zAdd(this.leaderboardKey, [
            { score: 0, value: player.id.toString() },
        ]);
        return player;
    }
    // Oyuncuyu ID ile getirme (MySQL)
    async getPlayerById(id) {
        return player_1.default.findByPk(id);
    }
    // Mevcut hafta numarasını döndürme
    getCurrentWeek() {
        const currentDate = new Date();
        const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const daysSinceStartOfYear = Math.floor((currentDate.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil((daysSinceStartOfYear + firstDayOfYear.getDay() + 1) / 7);
        console.log(`Calculated current week number: ${weekNumber}`);
        return weekNumber;
    }
    // Oyuncunun kazançlarını güncelleme (MySQL ve Redis)
    async updatePlayerEarnings(id, earnings) {
        const player = await this.getPlayerById(id);
        if (player) {
            player.earnings += earnings;
            await player.save();
            await redis_1.redisClient.zIncrBy(this.leaderboardKey, earnings, player.id.toString());
        }
    }
    // Tüm oyuncuların kazançlarını sıfırlama (MySQL ve Redis)
    async resetAllPlayerEarnings() {
        try {
            // MySQL'deki oyuncu kazançlarını sıfırla
            await player_1.default.update({ earnings: 0 }, { where: {} });
            console.log("All player earnings reset in MySQL.");
            // Redis'teki liderlik tablosunu temizle
            await redis_1.redisClient.del(this.leaderboardKey);
            console.log("Leaderboard key cleared in Redis.");
        }
        catch (error) {
            console.error("Error resetting player earnings:", error);
            throw error; // Hata fırlat
        }
    }
    // İlk "limit" sayıda oyuncuyu getir (Redis - Ters sıralama)
    async getTopPlayers(limit) {
        const topPlayerIds = await redis_1.redisClient.zRange(this.leaderboardKey, 0, limit - 1, { REV: true });
        const topPlayers = await Promise.all(topPlayerIds.map((id) => this.getPlayerById(Number(id))));
        return topPlayers.filter((p) => p !== null);
    }
    // Oyuncunun sıralamasını getir (Redis)
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
    // Girilen oyuncunun kazancına en yakın 3 oyuncuyu getir (Redis)
    async getNearestPlayers(playerId) {
        const playerRank = await redis_1.redisClient.zRevRank(this.leaderboardKey, playerId.toString());
        if (playerRank === null) {
            throw new Error(`Player with ID ${playerId} not found in the leaderboard.`);
        }
        const startRank = Math.max(playerRank - 1, 0);
        const endRank = playerRank + 1;
        const nearestPlayerIds = await redis_1.redisClient.zRange(this.leaderboardKey, startRank, endRank, { REV: true });
        const nearestPlayers = await Promise.all(nearestPlayerIds.map((id) => this.getPlayerById(Number(id))));
        return nearestPlayers.filter((p) => p !== null);
    }
    // Tüm liderlik tablosunu getirme (Redis ve MySQL)
    async getFullLeaderboard() {
        const allPlayerIds = await redis_1.redisClient.zRange(this.leaderboardKey, 0, -1, {
            REV: true,
        });
        const leaderboard = await Promise.all(allPlayerIds.map(async (id, index) => {
            const player = await this.getPlayerById(Number(id));
            if (player) {
                return { player, rank: index + 1 };
            }
            return null;
        }));
        return leaderboard.filter((entry) => entry !== null);
    }
    // Oyuncuları isme göre arama (MySQL)
    async searchPlayersByName(query) {
        return player_1.default.findAll({
            where: {
                name: { [sequelize_1.Op.like]: `%${query}%` },
            },
        });
    }
    // Redis bağlantısını kontrol et
    async ensureRedisConnection() {
        if (!redis_1.redisClient.isOpen) {
            await redis_1.redisClient.connect(); // Redis'e bağlanmayı sağla
        }
    }
    // Ödülü Redis'e kaydet
    async savePrizeToRedis(key, playerId, prize) {
        await redis_1.redisClient.hSet(key, playerId.toString(), prize.toString());
    }
    // Ödül kaydetme işlemini logla
    async logPrizeRecord(playerId, prize, status) {
        const message = status === "success"
            ? `Successfully recorded prize for player ${playerId}: ${prize}`
            : `Failed to record prize for player ${playerId}: ${prize}`;
        console.log(message);
    }
    // Ödül dağıtımını kaydet
    async recordPrizeDistribution(playerId, prize, weekNumber) {
        const key = `weekly_prize_distribution:${weekNumber}`;
        try {
            await this.ensureRedisConnection(); // Redis bağlantısını kontrol et
            console.log(`Attempting to record prize for player ${playerId} for week ${weekNumber}: ${prize}`);
            await this.savePrizeToRedis(key, playerId, prize);
            await this.logPrizeRecord(playerId, prize, "success");
        }
        catch (error) {
            console.error(`Error recording prize for player ${playerId} in week ${weekNumber}:`, error);
            await this.logPrizeRecord(playerId, prize, "failure"); // Hata logla
            throw error; // Hata fırlat
        }
    }
    // Belirli bir hafta için ödül dağıtımını sorgulama (Redis)
    async getPrizeDistributionForWeek(weekNumber) {
        const key = `weekly_prize_distribution:${weekNumber}`;
        try {
            // Redis'ten çekilen verileri loglayalım
            const prizeData = await redis_1.redisClient.hGetAll(key);
            console.log(`Prize distribution for week ${weekNumber}:`, prizeData);
            if (Object.keys(prizeData).length === 0) {
                throw new Error(`No prize distribution found for week ${weekNumber}`);
            }
            return prizeData;
        }
        catch (error) {
            console.error(`Error fetching prize distribution for week ${weekNumber}:`, error);
            throw error;
        }
    }
}
exports.default = new PlayerRepository();

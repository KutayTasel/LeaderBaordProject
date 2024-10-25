"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(require("../models/player"));
const redis_1 = require("../config/redis"); // Redis bağlantısı burada zaten mevcut
// Ülke adlarını ve bunların ISO 3166-1 alpha-2 kodlarını eşleştiren nesne
const countryCodeMap = {
    "United States": "US", // Ana ülke için kod
    "United Kingdom": "GB", // Ana ülke için kod
    Germany: "DE",
    Turkey: "TR",
    France: "FR",
    Spain: "ES",
    China: "CN",
    Brazil: "BR",
    Australia: "AU",
    // İsterseniz daha fazla ülke ekleyebilirsiniz
};
async function seedData() {
    console.log("Mevcut veriler temizleniyor...");
    // MySQL'deki Player tablosunu temizliyoruz
    await player_1.default.destroy({ where: {}, truncate: true });
    // Redis'teki eski liderlik verilerini temizleyelim
    await redis_1.redisClient.del("weekly_leaderboard");
    await redis_1.redisClient.del("leaderboard");
    // Test oyuncularını oluşturuyoruz
    const players = [
        { name: "Kutay", country: "United States", earnings: 1000 },
        { name: "Berkay", country: "United Kingdom", earnings: 1200 },
        { name: "Merih", country: "Germany", earnings: 950 },
        { name: "Furkan", country: "Turkey", earnings: 1100 },
        { name: "Elif", country: "France", earnings: 1300 },
        { name: "Ahmet", country: "Turkey", earnings: 900 },
        { name: "Marta", country: "Spain", earnings: 1150 },
        { name: "Chen", country: "China", earnings: 1050 },
        { name: "Lucas", country: "Brazil", earnings: 1250 },
        { name: "Alice", country: "Australia", earnings: 1000 },
        { name: "Cagatay", country: "Australia", earnings: 1400 },
    ];
    // Oyuncuları hem MySQL veritabanına hem de Redis'e ekliyoruz
    for (const playerData of players) {
        try {
            // Ülke kodunu belirliyoruz
            const countryCode = countryCodeMap[playerData.country] || playerData.country;
            // Oyuncuyu MySQL'e ekliyoruz
            const player = await player_1.default.create({
                ...playerData,
                country: countryCode, // Ülke kodunu burada kullanıyoruz
            });
            console.log(`Oyuncu eklendi: ${playerData.name}`);
            // Redis'e hem weekly_leaderboard hem de leaderboard'a oyuncunun kazancını ekliyoruz
            await redis_1.redisClient.zAdd("weekly_leaderboard", {
                score: playerData.earnings,
                value: player.id.toString(), // Oyuncunun ID'sini Redis'e ekliyoruz
            });
            await redis_1.redisClient.zAdd("leaderboard", {
                score: playerData.earnings,
                value: player.id.toString(), // Oyuncunun ID'sini Redis'e ekliyoruz
            });
        }
        catch (error) {
            console.error(`Oyuncu eklenirken hata oluştu: ${playerData.name}`, error);
        }
    }
    console.log("Seed verileri başarıyla eklendi!");
}
exports.default = seedData;

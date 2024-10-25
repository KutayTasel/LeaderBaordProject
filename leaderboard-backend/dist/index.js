"use strict";
// import dotenv from "dotenv";
// import { connectToDatabase } from "./config/database";
// import { initRedisConnection } from "./config/redis";
// import Player from "./models/player";
// import cron from "node-cron";
// import leaderboardService from "./services/leaderboardService";
// import createApp from "./app";
// import seedData from "./data/seed"; // Seed fonksiyonunu dahil ediyoruz
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // .env dosyasını yüklemek için dotenv'i yapılandırıyoruz
// dotenv.config();
// // Haftanın numarasını hesaplayan fonksiyon
// function getWeekNumber(): number {
//   const now = new Date();
//   const start = new Date(now.getFullYear(), 0, 1);
//   const diff = now.getTime() - start.getTime();
//   const oneWeek = 1000 * 60 * 60 * 24 * 7;
//   return Math.floor(diff / oneWeek);
// }
// (async () => {
//   try {
//     // MySQL ve Redis bağlantısını başlatıyoruz
//     await connectToDatabase();
//     await initRedisConnection();
//     // Veritabanı modellerini senkronize ediyoruz
//     await Player.sync(); // Burada tabloların oluşturulmasını sağlıyoruz
//     // Seed verilerini ekliyoruz
//     await seedData(); // Seed verileri burada çalıştırılıyor
//     // Express uygulamasını oluşturuyoruz
//     const app = createApp();
//     const port = process.env.PORT || 3001;
//     // Express sunucusunu başlatıyoruz
//     app.listen(port, () => {
//       console.log(`Sunucu ${port} numaralı portta çalışıyor.`);
//     });
//     // Cron job ile her hafta liderlik tablosu sıfırlanacak
//     cron.schedule("0 0 * * 0", async () => {
//       try {
//         const weekNumber = getWeekNumber(); // Haftanın numarasını al
//         console.log(
//           "Haftalık liderlik tablosu sıfırlama ve ödül dağıtımı başlatılıyor..."
//         );
//         await leaderboardService.distributePrizes(weekNumber); // weekNumber argümanını geçir
//         console.log("Haftalık sıfırlama ve ödül dağıtımı tamamlandı.");
//       } catch (error) {
//         console.error("Haftalık sıfırlama sırasında hata oluştu:", error);
//       }
//     });
//   } catch (error) {
//     console.error("Sunucu başlatılırken bir hata oluştu:", error);
//   }
// })();
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const player_1 = __importDefault(require("./models/player"));
const app_1 = __importDefault(require("./app"));
const seed_1 = __importDefault(require("./data/seed")); // Seed fonksiyonunu dahil ediyoruz
// .env dosyasını yüklemek için dotenv'i yapılandırıyoruz
dotenv_1.default.config();
(async () => {
    try {
        // MySQL ve Redis bağlantısını başlatıyoruz
        await (0, database_1.connectToDatabase)();
        await (0, redis_1.initRedisConnection)();
        // Veritabanı modellerini senkronize ediyoruz
        await player_1.default.sync(); // Burada tabloların oluşturulmasını sağlıyoruz
        // Seed verilerini ekliyoruz
        await (0, seed_1.default)(); // Seed verileri burada çalıştırılıyor
        // Express uygulamasını oluşturuyoruz
        const app = (0, app_1.default)();
        const port = process.env.PORT || 3001;
        // Express sunucusunu başlatıyoruz
        app.listen(port, () => {
            console.log(`Sunucu ${port} numaralı portta çalışıyor.`);
        });
    }
    catch (error) {
        console.error("Sunucu başlatılırken bir hata oluştu:", error);
    }
})();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderboardController_1 = __importDefault(require("./controllers/leaderboardController"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
// API rate limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 1000,
    message: "Too many requests, please try again later.",
});
const createApp = () => {
    const app = (0, express_1.default)();
    // CORS middleware
    app.use((0, cors_1.default)({
        origin: ["http://localhost:3000", "https://gameleaderboard.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }));
    app.use(express_1.default.json());
    // API limit middleware
    app.use("/api/", apiLimiter);
    // Kazanç güncelleme
    app.post("/api/update-earnings", leaderboardController_1.default.updateEarnings);
    // Oyuncunun sıralamasını alma
    app.get("/api/leaderboard/player/:playerId/rank", leaderboardController_1.default.getPlayerRank);
    // Çevresindeki oyuncuları alma
    app.get("/api/leaderboard/player/:playerId/surrounding", leaderboardController_1.default.getSurroundingPlayers);
    // Liderlik tablosunu sıfırlama ve ödül dağıtma
    app.post("/api/leaderboard/reset", leaderboardController_1.default.distributePrizes);
    // Ödül havuzunu getirme
    app.get("/api/leaderboard/prizepool", leaderboardController_1.default.getPrizePool);
    // Oyuncu arama
    app.get("/api/leaderboard/search", leaderboardController_1.default.searchPlayers);
    // Tüm liderlik tablosunu alma
    app.get("/api/leaderboard/full", leaderboardController_1.default.getFullLeaderboard);
    // Belirli bir hafta için ödülleri getirme
    app.get("/api/leaderboard/prizes/:weekNumber", leaderboardController_1.default.getPrizeDistribution);
    // Geçerli haftanın ödüllerini alma
    app.get("/api/leaderboard/prizes", leaderboardController_1.default.getCurrentWeekPrizes);
    // Hata yakalama middleware
    app.use((err, _req, res, _next) => {
        console.error(err.stack);
        res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    });
    return app;
};
exports.default = createApp;

import express, { Request, Response, NextFunction } from "express";
import leaderboardController from "./controllers/leaderboardController";
import rateLimit from "express-rate-limit";
import cors from "cors";

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000,
  message: "Too many requests, please try again later.",
});

const createApp = () => {
  const app = express();

  // CORS middleware
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://gameleaderboard.com"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.use(express.json());

  // API limit middleware
  app.use("/api/", apiLimiter);

  // Oyuncunun sıralamasını alma
  app.get(
    "/api/leaderboard/player/:playerId/rank",
    leaderboardController.getPlayerRank
  );

  // Oyuncu arama
  app.get("/api/leaderboard/search", leaderboardController.searchPlayers);

  // Tüm liderlik tablosunu alma
  app.get("/api/leaderboard/full", leaderboardController.getFullLeaderboard);

  // Ödülleri dağıtma ve sonuçları gösterme
  app.post(
    "/api/leaderboard/distribute-prizes-and-show",
    leaderboardController.distributePrizesAndShowResults
  );

  // Haftalık ödül havuzunu güncelleyen GET route (Yeni eklenen route)
  app.get(
    "/api/leaderboard/calculate-weekly-prize-pool",
    leaderboardController.calculateWeeklyPrizePoolGet
  );
  app.get(
    "/api/leaderboard/all",
    leaderboardController.getAllPlayersLeaderboard
  );
  // Hata yakalama middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  });

  return app;
};

export default createApp;

import express, { Request, Response, NextFunction } from "express";
import leaderboardController from "./controllers/leaderboardController";
import rateLimit from "express-rate-limit";
import cors from "cors";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
});

const createApp = () => {
  const app = express();
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://51.20.106.162:3000",
        "http://www.gameleaderboarddemoooo.com",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.use(express.json());

  app.use("/api/", apiLimiter);

  app.get("/api/leaderboard/search", leaderboardController.searchPlayers);

  app.get("/api/leaderboard/full", leaderboardController.getFullLeaderboard);

  app.post(
    "/api/leaderboard/distribute-prizes-and-show",
    leaderboardController.distributePrizesAndShowResults
  );

  app.get(
    "/api/leaderboard/calculate-weekly-prize-pool",
    leaderboardController.calculateWeeklyPrizePoolGet
  );
  app.get(
    "/api/leaderboard/all",
    leaderboardController.getAllPlayersLeaderboard
  );
  app.post(
    "/api/leaderboard/refresh-earnings",
    leaderboardController.refreshEarnings
  );

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  });

  return app;
};

export default createApp;

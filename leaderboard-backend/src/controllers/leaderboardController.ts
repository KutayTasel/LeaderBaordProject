import { Request, Response } from "express";
import leaderboardService from "../services/leaderboardService";
import { asyncHandler } from "../utils/asyncHandler";
import { validateSearchPlayers } from "../middlewares/validation";
import playerRepository from "../repositories/playerRepository";

class LeaderboardController {
  calculateWeeklyPrizePoolGet = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const { totalEarnings, prizePoolContribution } =
          await leaderboardService.calculateWeeklyPrizePool();

        res.status(200).json({
          message: "Weekly prize pool updated successfully.",
          totalEarnings,
          prizePoolContribution,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update weekly prize pool.",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  getFullLeaderboard = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const leaderboard = await leaderboardService.getFullLeaderboard();
        res.status(200).json(leaderboard);
      } catch (error) {
        res.status(500).json({
          message: "Failed to retrieve full leaderboard",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  searchPlayers = [
    validateSearchPlayers,
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { query } = req.query;

      if (typeof query !== "string") {
        res.status(400).json({
          message: "Search query is required and should be a string.",
        });
        return;
      }

      try {
        const players = await leaderboardService.searchPlayers(query.trim());
        if (!players || players.length === 0) {
          res
            .status(404)
            .json({ message: "No players found with this query." });
          return;
        }
        res.status(200).json(players);
      } catch (error) {
        res.status(500).json({
          message: "Failed to search players",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  ];
  distributePrizesAndShowResults = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const { prizePoolContribution } =
          await leaderboardService.calculateWeeklyPrizePool();
        const prizeResults =
          await leaderboardService.distributePrizesAndShowResults(
            prizePoolContribution
          );
        await leaderboardService.resetPlayerEarnings();

        res.status(200).json(prizeResults);
      } catch (error) {
        res.status(500).json({
          message: "Failed to distribute prizes and show results.",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
  getAllPlayersLeaderboard = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const leaderboard = await playerRepository.getAllPlayersLeaderboard();
        res.status(200).json(leaderboard);
      } catch (error) {
        res.status(500).json({
          message: "Failed to retrieve all players leaderboard",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
  refreshEarnings = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const updatedPlayers =
          await leaderboardService.assignRandomEarningsToZeroPlayers();
        if (updatedPlayers.length === 0) {
          res.status(400).json({
            message:
              "Failed to assign random earnings. All players had non-zero earnings.",
          });
          return;
        }
        res.status(200).json({
          message: "Earnings values updated for players with 0 earnings.",
          updatedPlayers,
        });
        return;
      } catch (error) {
        res.status(500).json({
          message: "Failed to assign random earnings to players.",
          error: error instanceof Error ? error.message : String(error),
        });
        return;
      }
    }
  );
}

export default new LeaderboardController();

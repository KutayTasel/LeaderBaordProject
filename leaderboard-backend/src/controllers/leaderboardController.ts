import { Request, Response } from "express";
import leaderboardService from "../services/leaderboardService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  validateGetLeaderboard,
  validateSearchPlayers,
} from "../middlewares/validation";

class LeaderboardController {
  getPlayerRank = [
    validateGetLeaderboard,
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { playerId } = req.params;
      try {
        const data = await leaderboardService.getPlayerRank(Number(playerId));
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({
          message: "Failed to retrieve player rank",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  ];

  // Haftalık ödül havuzunu güncelleyen GET endpoint
  calculateWeeklyPrizePoolGet = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        // Haftalık kazançların %2'sini ödül havuzuna ekle ve sonucu al
        const { totalEarnings, prizePoolContribution } =
          await leaderboardService.calculateWeeklyPrizePool();

        // Yanıt olarak toplam kazanç ve katkı miktarını döndür
        res.status(200).json({
          message: "Weekly prize pool updated successfully.",
          totalEarnings, // %2 alınmadan önceki toplam kazanç
          prizePoolContribution, // Ödül havuzuna eklenen %2'lik miktar
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

      // query'nin string olup olmadığını kontrol et
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
        // Ödülleri dağıt ve kimlere ne kadar ödül verildiğini göster
        const prizeResults =
          await leaderboardService.distributePrizesAndShowResults();

        // Ödüller dağıtıldıktan sonra kazançları sıfırla (sadece earnings sıfırlanacak)
        await leaderboardService.resetPlayerEarnings();

        // Yanıtı döndür (kime ne kadar ödül verildiğini göster)
        res.status(200).json(prizeResults);
      } catch (error) {
        res.status(500).json({
          message: "Failed to distribute prizes and show results.",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // distributePrizesAndShowResults = asyncHandler(
  //   async (_req: Request, res: Response): Promise<void> => {
  //     try {
  //       // Ödülleri dağıt ve kimlere ne kadar ödül verildiğini göster
  //       const prizeResults =
  //         await leaderboardService.distributePrizesAndShowResults();

  //       // Yanıtı döndürmeden önce tabloyu sıfırla
  //       await leaderboardService.resetLeaderboardAndPrizePool();

  //       // Yanıtı döndür (kime ne kadar ödül verildiğini göster)
  //       res.status(200).json(prizeResults);
  //     } catch (error) {
  //       res.status(500).json({
  //         message: "Failed to distribute prizes and show results.",
  //         error: error instanceof Error ? error.message : String(error),
  //       });
  //     }
  //   }
  // );
  getAllPlayersLeaderboard = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        // Tüm liderlik tablosundaki oyuncuları getir
        const leaderboard = await leaderboardService.getAllPlayersLeaderboard();
        res.status(200).json(leaderboard);
      } catch (error) {
        res.status(500).json({
          message: "Failed to retrieve all players leaderboard",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
}

export default new LeaderboardController();

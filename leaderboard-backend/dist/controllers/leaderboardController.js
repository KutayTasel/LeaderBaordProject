"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leaderboardService_1 = __importDefault(require("../services/leaderboardService"));
const asyncHandler_1 = require("../utils/asyncHandler");
const validation_1 = require("../middlewares/validation");
class LeaderboardController {
    constructor() {
        // Kazanç güncelleme
        this.updateEarnings = [
            validation_1.validateUpdateEarnings,
            (0, asyncHandler_1.asyncHandler)(async (req, res) => {
                const { playerId, earnings } = req.body;
                try {
                    await leaderboardService_1.default.updateEarnings(playerId, earnings);
                    res.status(200).json({ message: "Earnings updated successfully" });
                }
                catch (error) {
                    res.status(500).json({
                        message: "Failed to update earnings",
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }),
        ];
        // Oyuncunun sıralamasını alma
        this.getPlayerRank = [
            validation_1.validateGetLeaderboard,
            (0, asyncHandler_1.asyncHandler)(async (req, res) => {
                const { playerId } = req.params;
                try {
                    const data = await leaderboardService_1.default.getPlayerRank(Number(playerId));
                    res.status(200).json(data);
                }
                catch (error) {
                    res.status(500).json({
                        message: "Failed to retrieve player rank",
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }),
        ];
        // Çevresindeki oyuncuları alma
        this.getSurroundingPlayers = [
            validation_1.validateGetLeaderboard,
            (0, asyncHandler_1.asyncHandler)(async (req, res) => {
                const { playerId } = req.params;
                try {
                    const surroundingPlayers = await leaderboardService_1.default.getSurroundingPlayers(Number(playerId));
                    if (!surroundingPlayers || surroundingPlayers.length === 0) {
                        res.status(404).json({
                            message: "No surrounding players found for this player.",
                        });
                        return;
                    }
                    res.status(200).json(surroundingPlayers);
                }
                catch (error) {
                    res.status(500).json({
                        message: "Failed to retrieve surrounding players",
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }),
        ];
        // Ödülleri dağıtma
        this.distributePrizes = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
            try {
                const weekNumber = leaderboardService_1.default.getWeekNumber(); // Haftanın numarasını hesapla
                await leaderboardService_1.default.distributePrizes(weekNumber); // Hafta numarasını iletin
                res.status(200).json({
                    message: "Prizes distributed and leaderboard reset successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to distribute prizes",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
        this.getPrizeDistribution = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { weekNumber } = req.params;
            if (!weekNumber || isNaN(Number(weekNumber))) {
                res.status(400).json({ message: "Invalid week number provided." });
                return;
            }
            try {
                const distribution = await leaderboardService_1.default.getWeeklyPrizeDistribution(Number(weekNumber));
                res.status(200).json(distribution);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to retrieve prize distribution",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
        // Ödül havuzunu getirme
        this.getPrizePool = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
            try {
                const prizePool = await leaderboardService_1.default.getPrizePool();
                res.status(200).json({ prizePool });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to retrieve prize pool",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
        // Tüm liderlik tablosunu alma
        this.getFullLeaderboard = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
            try {
                const leaderboard = await leaderboardService_1.default.getFullLeaderboard();
                res.status(200).json(leaderboard);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to retrieve full leaderboard",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
        // Oyuncu arama
        this.searchPlayers = [
            validation_1.validateSearchPlayers,
            (0, asyncHandler_1.asyncHandler)(async (req, res) => {
                const { query } = req.query;
                if (!query || typeof query !== "string") {
                    res.status(400).json({
                        message: "Search query is required and should be a string.",
                    });
                    return;
                }
                try {
                    const players = await leaderboardService_1.default.searchPlayers(query.trim());
                    if (!players || players.length === 0) {
                        res
                            .status(404)
                            .json({ message: "No players found with this query." });
                        return;
                    }
                    res.status(200).json(players);
                }
                catch (error) {
                    res.status(500).json({
                        message: "Failed to search players",
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }),
        ];
    }
    async getCurrentWeekPrizes(_, res) {
        try {
            const currentWeek = leaderboardService_1.default.getCurrentWeek();
            const prizeDistribution = await leaderboardService_1.default.getWeeklyPrizeDistribution(currentWeek);
            res.json(prizeDistribution);
        }
        catch (error) {
            // Hatanın türünü kontrol et
            if (error instanceof Error) {
                console.error("Error getting current week prizes:", error.message);
                res.status(500).json({
                    message: "Failed to retrieve prize distribution",
                    error: error.message,
                });
            }
            else {
                console.error("Unexpected error:", error);
                res.status(500).json({ message: "An unexpected error occurred." });
            }
        }
    }
}
exports.default = new LeaderboardController();

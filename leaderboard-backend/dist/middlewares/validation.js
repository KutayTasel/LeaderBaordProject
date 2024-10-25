"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchPlayers = exports.validateGetLeaderboard = exports.validateUpdateEarnings = void 0;
// Kazanç güncelleme validasyonu
const validateUpdateEarnings = (req, res, next) => {
    const { playerId, earnings } = req.body;
    if (!playerId || typeof playerId !== "number") {
        res
            .status(400)
            .json({ message: "Player ID is required and should be a number." });
        return;
    }
    if (!earnings || typeof earnings !== "number") {
        res
            .status(400)
            .json({ message: "Earnings are required and should be a number." });
        return;
    }
    next(); // Validasyon başarılı, bir sonraki middleware veya kontrolcüye geç
};
exports.validateUpdateEarnings = validateUpdateEarnings;
// Liderlik tablosu validasyonu
const validateGetLeaderboard = (req, res, next) => {
    const { playerId } = req.params;
    if (!playerId || isNaN(Number(playerId))) {
        res
            .status(400)
            .json({ message: "Player ID is required and should be a valid number." });
        return;
    }
    next();
};
exports.validateGetLeaderboard = validateGetLeaderboard;
// Oyuncu arama validasyonu
const validateSearchPlayers = (req, res, next) => {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        res
            .status(400)
            .json({ message: "Search query is required and should be a string." });
        return;
    }
    next();
};
exports.validateSearchPlayers = validateSearchPlayers;

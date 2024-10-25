import { Request, Response, NextFunction } from "express";

// Liderlik tablosu validasyonu
export const validateGetLeaderboard = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { playerId } = req.params;

  if (!playerId || isNaN(Number(playerId))) {
    res
      .status(400)
      .json({ message: "Player ID is required and should be a valid number." });
    return;
  }

  next();
};

// Oyuncu arama validasyonu
export const validateSearchPlayers = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    res
      .status(400)
      .json({ message: "Search query is required and should be a string." });
    return;
  }

  next();
};

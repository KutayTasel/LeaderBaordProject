import { Request, Response, NextFunction } from "express";

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

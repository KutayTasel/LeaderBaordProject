import leaderboardService from "../services/leaderboardService";
import playerRepository from "../repositories/playerRepository";
import { redisClient } from "../config/redis";
import Player from "../models/player";

jest.mock("../repositories/playerRepository");
jest.mock("../config/redis");
jest.mock("../models/player", () => ({
  update: jest.fn(),
}));

describe("LeaderboardService", () => {
  let player: any;

  beforeEach(() => {
    player = {
      id: 1,
      name: "Player 1",
      earnings: 100,
      save: jest.fn(),
    };
    (playerRepository.getPlayerById as jest.Mock).mockResolvedValue(player);
    (redisClient.zIncrBy as jest.Mock).mockResolvedValue(1);
    (redisClient.incrByFloat as jest.Mock).mockResolvedValue(1);
    (redisClient.get as jest.Mock).mockResolvedValue("1000");
  });

  it("should update player earnings and update Redis", async () => {
    const earnings = 50;
    await leaderboardService.updateEarnings(player.id, earnings);

    expect(playerRepository.getPlayerById).toHaveBeenCalledWith(player.id);
    expect(redisClient.zIncrBy).toHaveBeenCalledWith(
      "weekly_leaderboard",
      earnings,
      player.id.toString()
    );
    expect(player.save).toHaveBeenCalled();
    expect(redisClient.incrByFloat).toHaveBeenCalledWith(
      "prize_pool",
      earnings * 0.02
    );
  });

  it("should return full leaderboard", async () => {
    const leaderboard = [{ player, rank: 1 }];
    const last10Players = [{ player, rank: 11 }];

    jest
      .spyOn(leaderboardService, "getLast10Players")
      .mockResolvedValue(last10Players);
    (playerRepository.getFullLeaderboard as jest.Mock).mockResolvedValue(
      leaderboard
    );

    const result = await leaderboardService.getFullLeaderboard();

    expect(result).toEqual([...leaderboard, ...last10Players]);
  });

  it("should distribute prizes and return the results", async () => {
    const topPlayersWithScores = [{ player, score: 100 }];
    (playerRepository.getTopPlayersWithScores as jest.Mock).mockResolvedValue(
      topPlayersWithScores
    );
    (playerRepository.getPrizePool as jest.Mock).mockResolvedValue(500);

    const result = await leaderboardService.distributePrizesAndShowResults(100);

    expect(playerRepository.getTopPlayersWithScores).toHaveBeenCalledWith(100);
    expect(playerRepository.getPrizePool).toHaveBeenCalled();
    expect(result.topThree.length).toBeGreaterThan(0);
  });

  it("should reset player earnings", async () => {
    await leaderboardService.resetPlayerEarnings();

    expect(Player.update).toHaveBeenCalledWith({ earnings: 0 }, { where: {} });
  });

  it("should reset leaderboard and prize pool", async () => {
    await leaderboardService.resetLeaderboardAndPrizePool();

    expect(playerRepository.resetLeaderboardAndPrizePool).toHaveBeenCalled();
  });

  it("should return the current prize pool", async () => {
    const prizePool = await leaderboardService.getPrizePool();

    expect(redisClient.get).toHaveBeenCalledWith("prize_pool");
    expect(prizePool).toBe(1000);
  });

  it("should assign random earnings to players with zero earnings", async () => {
    const playersWithZeroEarnings = [player];
    (
      playerRepository.getPlayersWithZeroEarnings as jest.Mock
    ).mockResolvedValue(playersWithZeroEarnings);

    const result = await leaderboardService.assignRandomEarningsToZeroPlayers();

    expect(playerRepository.getPlayersWithZeroEarnings).toHaveBeenCalled();
    expect(player.save).toHaveBeenCalled();
    expect(redisClient.zAdd).toHaveBeenCalledWith("weekly_leaderboard", [
      { score: expect.any(Number), value: player.id.toString() },
    ]);
    expect(result.length).toBe(1);
  });

  it("should return last 10 players from leaderboard", async () => {
    const allPlayers = [
      { player, rank: 1 },
      { player, rank: 2 },
      { player, rank: 3 },
    ];
    (playerRepository.getAllPlayersLeaderboard as jest.Mock).mockResolvedValue(
      allPlayers
    );

    const result = await leaderboardService.getLast10Players();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          player: expect.objectContaining({ id: player.id }),
          rank: expect.any(Number),
        }),
      ])
    );
  });

  it("should search players by name and return surrounding players", async () => {
    const players = [player];
    (playerRepository.searchPlayersByName as jest.Mock).mockResolvedValue(
      players
    );
    (redisClient.zRevRank as jest.Mock).mockResolvedValue(1);
    (redisClient.zRange as jest.Mock).mockResolvedValue([1]);
    (playerRepository.getPlayerById as jest.Mock).mockResolvedValue(player);
    (redisClient.zScore as jest.Mock).mockResolvedValue(100);

    const result = await leaderboardService.searchPlayers("Player");
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          player: expect.objectContaining({ id: player.id }),
          rank: expect.any(Number),
          score: 100,
        }),
      ])
    );
  });
});

import { Api } from "../api/Api";
import { PrizePoolResponse } from "../models/PrizePoolResponse";

const LeaderboardService = {
  async getFullLeaderboard() {
    try {
      const { data } = await Api.getFullLeaderboard();
      return data;
    } catch (error) {
      console.error("Failed to get full leaderboard:", error);
      throw error;
    }
  },

  async getAllPlayersLeaderboard() {
    try {
      const { data } = await Api.getAllPlayersLeaderboard();
      return data;
    } catch (error) {
      console.error("Failed to get all players leaderboard:", error);
      throw error;
    }
  },

  async searchPlayers(query: string) {
    try {
      const { data } = await Api.searchPlayers(query);
      return data;
    } catch (error) {
      console.error("Failed to search players:", error);
      throw error;
    }
  },

  async distributePrizesAndShowResults(showToast = true) {
    try {
      const { data } = await Api.distributePrizesAndShowResults(showToast);
      return data;
    } catch (error) {
      console.error("Failed to distribute prizes and show results:", error);
      throw error;
    }
  },
  async calculateWeeklyPrizePoolGet(
    showToast = true
  ): Promise<PrizePoolResponse> {
    try {
      const { data } = await Api.calculateWeeklyPrizePoolGet(showToast);
      return data as PrizePoolResponse;
    } catch (error) {
      console.error("Failed to calculate weekly prize pool:", error);
      throw error;
    }
  },

  async refreshEarnings() {
    const response = await Api.refreshEarnings();
    if (response.status === 200) {
      console.log("Earnings successfully refreshed!");
    } else {
      console.log("Failed to refresh earnings.");
    }
    return response;
  },
};

export default LeaderboardService;

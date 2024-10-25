import axios from "axios";
import ToastService from "../services/ToastService";

// const api = axios.create({
//   baseURL: "http://51.20.71.6:3001/api",
// });
const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

const addContentJson = () => {
  api.defaults.headers.common["Content-Type"] = "application/json";
};

export const Api = {
  async getFullLeaderboard() {
    addContentJson();
    try {
      const response = await api.get("/leaderboard/full");
      return handleSuccess(response);
    } catch (error) {
      return handleErrors(error);
    }
  },
  async getAllPlayersLeaderboard() {
    addContentJson();
    try {
      const response = await api.get("/leaderboard/all");
      return handleSuccess(response);
    } catch (error) {
      return handleErrors(error);
    }
  },
  async searchPlayers(query: string) {
    addContentJson();
    try {
      const response = await api.get(`/leaderboard/search`, {
        params: { query },
      });
      return handleSuccess(response);
    } catch (error) {
      return handleErrors(error, false);
    }
  },
  async distributePrizesAndShowResults(showToast = true) {
    addContentJson();
    try {
      const response = await api.post(
        "/leaderboard/distribute-prizes-and-show"
      );
      console.log("Distribute Prizes Response:", response.data);
      return handleSuccess(response, showToast);
    } catch (error) {
      return handleErrors(error);
    }
  },
  async calculateWeeklyPrizePoolGet(showToast = true) {
    addContentJson();
    try {
      const response = await api.get(
        "/leaderboard/calculate-weekly-prize-pool"
      );
      console.log("Weekly Prize Pool Response:", response.data);
      return handleSuccess(response, showToast);
    } catch (error) {
      return handleErrors(error);
    }
  },

  async refreshEarnings(showToast = true) {
    addContentJson();
    try {
      const response = await api.post("/leaderboard/refresh-earnings");
      console.log("Refresh Earnings Response:", response.data);
      return handleSuccess(response, showToast);
    } catch (error) {
      return handleErrors(error);
    }
  },
};
const handleSuccess = (response: any, showToast: boolean = false) => {
  console.log("API Success Response:", response);
  if (showToast) {
    const message = response.data.message || "Operation successful";
    ToastService.toastSuccess(message);
  }
  return { data: response.data, status: response.status };
};
const handleErrors = (error: any, showToast: boolean = true) => {
  console.log("API Error Response:", error);

  if (!error.response) {
    if (showToast) {
      ToastService.toastError("Network error");
    }
    return { data: null, status: null };
  }

  const { data, status } = error.response;

  if (data.errors) {
    const firstError = Object.keys(data.errors)[0];
    if (showToast) {
      ToastService.toastWarning(data.errors[firstError][0] || data.message);
    }
  } else {
    if (showToast) {
      ToastService.toastWarning(data.message || "An unknown error occurred.");
    }
  }

  return { data, status };
};

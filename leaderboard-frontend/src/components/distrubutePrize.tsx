import React, { useState } from "react";
import LeaderboardService from "../services/leaderBoardService";
import { PrizePoolResponse } from "../models/PrizePoolResponse";

interface PrizePoolModalProps {
  onClose: () => void;
  onResetLeaderboard: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PrizePoolModal: React.FC<PrizePoolModalProps> = ({
  onClose,
  onResetLeaderboard,
  setIsLoading,
}) => {
  const [loading, setLoading] = useState(false);
  const [prizePoolData, setPrizePoolData] = useState<PrizePoolResponse | null>(
    null
  );
  const [prizeDistributionData, setPrizeDistributionData] = useState<any>(null);

  const calculatePrizePool = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const data = await LeaderboardService.calculateWeeklyPrizePoolGet();
      setPrizePoolData(data);
    } catch (error) {
      console.error("Error calculating weekly prize pool:", error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const distributePrizes = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const data = await LeaderboardService.distributePrizesAndShowResults();
      setPrizeDistributionData(data);
      onResetLeaderboard();
    } catch (error) {
      console.error("Error distributing prizes:", error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const refreshEarnings = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const response = await LeaderboardService.refreshEarnings();
      if (response.status === 200) {
        console.log("Earnings successfully refreshed!");
        setPrizePoolData(null);
        setPrizeDistributionData(null);
        onResetLeaderboard();
      } else {
        console.log("Failed to refresh earnings.");
      }
    } catch (error) {
      console.error("Error refreshing earnings:", error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#0d1117] bg-opacity-80">
      <div className="relative mt-32 sm:mt-40 p-4 sm:p-8 w-full max-w-lg sm:max-w-2xl bg-[#0d1117] border border-black rounded-md max-h-screen overflow-y-auto pb-16 sm:pb-24">
        <h2 className="text-2xl sm:text-3xl font-medium text-sky-500 text-center">
          Weekly Prize Pool
        </h2>
        {loading ? (
          <p className="text-white text-center mt-4">Loading...</p>
        ) : prizePoolData ? (
          <div className="mt-4">
            <p className="text-white text-sm sm:text-base">
              Total Earnings: ${prizePoolData.totalEarnings.toFixed(2)}
            </p>
            <p className="text-white text-sm sm:text-base">
              Prize Pool Contribution: $
              {prizePoolData.prizePoolContribution.toFixed(2)}
            </p>
            <p className="text-white text-sm sm:text-base">
              Message: {prizePoolData.message}
            </p>
          </div>
        ) : (
          <p className="text-white text-center mt-4 text-sm sm:text-base">
            Click the button to calculate the prize pool.
          </p>
        )}
        {prizeDistributionData && (
          <>
            <h3 className="text-white text-center mt-6 text-lg sm:text-xl">
              Top 3 Players
            </h3>
            <div className="overflow-x-auto">
              <table
                className="min-w-full table-auto border-separate"
                style={{ borderSpacing: "0 12px" }}
              >
                <thead>
                  <tr className="bg-gradient-to-r from-gray-700 to-blue-800 text-gray-200 text-xs sm:text-base">
                    <th className="px-6 py-3 rounded-tl-lg text-left">Rank</th>
                    <th className="px-6 py-3 text-left">Player Name</th>
                    <th className="px-6 py-3 hidden sm:table-cell text-left">
                      Prize
                    </th>
                    <th className="px-6 py-3 rounded-tr-lg text-left">
                      Total Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {prizeDistributionData.topThree.map(
                    (player: any, index: number) => (
                      <tr
                        key={`${player.playerName}-${index}`}
                        className={`bg-gradient-to-r from-gray-${
                          index % 2 === 0 ? "600" : "700"
                        } to-blue-${
                          index % 2 === 0 ? "800" : "700"
                        } hover:bg-blue-600 transition duration-200 ease-in-out`}
                        style={{ borderSpacing: "0 10px" }}
                      >
                        <td className="px-6 py-4 bg-gray-800 bg-opacity-90 rounded-l-lg">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 bg-gray-800 bg-opacity-90">
                          {player.playerName}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell bg-gray-800 bg-opacity-90">
                          ${player.prize.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 bg-gray-800 bg-opacity-90 rounded-r-lg">
                          ${player.totalEarnings.toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="text-white text-center mt-6 text-lg sm:text-xl">
              The Others
            </h3>
            <div className="overflow-x-auto">
              <table
                className="min-w-full table-auto border-separate"
                style={{ borderSpacing: "0 12px" }}
              >
                <thead>
                  <tr className="bg-gradient-to-r from-gray-700 to-blue-800 text-gray-200 text-xs sm:text-base">
                    <th className="px-6 py-3 rounded-tl-lg text-left">
                      Others
                    </th>
                    <th className="px-6 py-3 text-left">Total Prize</th>
                    <th className="px-6 py-3 rounded-tr-lg text-left">
                      {" "}
                      Total Earnings
                    </th>
                  </tr>
                </thead>

                <tbody className="text-white">
                  <tr
                    className="bg-gradient-to-r from-gray-600 to-blue-800 hover:bg-blue-600 transition duration-200 ease-in-out"
                    style={{ borderSpacing: "0 10px" }}
                  >
                    <td className="px-6 py-4 bg-gray-800 bg-opacity-90 rounded-l-lg">
                      Others
                    </td>
                    <td className="px-6 py-4 bg-gray-800 bg-opacity-90">
                      ${prizeDistributionData.others.totalPrize.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 bg-gray-800 bg-opacity-90 rounded-r-lg">
                      {" "}
                      {prizeDistributionData.others.totalEarnings.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="flex flex-col sm:flex-row justify-end mt-8 space-y-2 sm:space-y-0 sm:space-x-4 w-full mb-10 sm:mb-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-white text-[#0d1117] px-4 py-2 rounded-md font-semibold text-sm mb-4 sm:mb-0"
          >
            Close
          </button>
          <button
            onClick={calculatePrizePool}
            className="w-full sm:w-auto bg-sky-500 text-white px-4 py-2 rounded-md font-semibold text-sm mb-4 sm:mb-0"
            disabled={loading}
          >
            Calculate Weekly Prize Pool
          </button>
          <button
            onClick={distributePrizes}
            className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-md font-semibold text-sm mb-4 sm:mb-0"
            disabled={loading}
          >
            Distribute Prizes
          </button>
          <button
            onClick={refreshEarnings}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md font-semibold text-sm mb-10"
            disabled={loading}
          >
            Refresh Earnings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizePoolModal;

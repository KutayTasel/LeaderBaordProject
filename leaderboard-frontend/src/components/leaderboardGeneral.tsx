import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { SearchOutlined, AppstoreOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "../app/globals.css";
import LeaderboardService from "../services/leaderBoardService";
import { Player } from "../models/player";

const countryCodeMap: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  Germany: "DE",
  Turkey: "TR",
  France: "FR",
  Spain: "ES",
  China: "CN",
  Brazil: "BR",
  Australia: "AU",
};

interface LeaderboardGeneralProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  shouldUpdate: boolean;
}

const LeaderboardGeneral: React.FC<LeaderboardGeneralProps> = ({
  setIsLoading,
  shouldUpdate,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchInitialLeaderboardData = async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const response = await LeaderboardService.getFullLeaderboard();

      if (response && Array.isArray(response)) {
        const formattedData = response.map((entry: any) => {
          const countryName = entry.player.country;
          const countryCode = countryCodeMap[countryName] || countryName;
          return {
            id: entry.player.id,
            name: entry.player.name,
            country: countryCode,
            earnings: entry.player.earnings,
            rank: entry.rank,
          };
        });
        setLeaderboardData(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch full leaderboard data:", error);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const fetchSearchLeaderboardData = async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const response = await LeaderboardService.searchPlayers(searchQuery);
      if (response && Array.isArray(response)) {
        const formattedData = response.map((entry: any) => {
          const countryName = entry.player.country;
          const countryCode = countryCodeMap[countryName] || countryName;
          return {
            id: entry.player.id,
            name: entry.player.name,
            country: countryCode,
            earnings: entry.player.earnings,
            rank: entry.rank,
          };
        });
        setLeaderboardData(formattedData);
      } else {
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Failed to fetch searched players:", error);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchInitialLeaderboardData();
    } else {
      fetchSearchLeaderboardData();
    }
  }, [shouldUpdate, searchQuery]);

  return (
    <div className="w-full p-2 mt-10 max-w-none">
      <h1 className="text-center text-xl sm:text-2xl text-white font-bold mb-4">
        Global Leaderboard
      </h1>
      <div className="relative mb-4 w-full mx-auto">
        <Input
          className={`bg-gray-700 w-full p-2 rounded-lg border border-gray-500 ${
            searchQuery ? "text-black" : "text-gray-400"
          }`}
          placeholder="Search by Player Name"
          prefix={<SearchOutlined style={{ color: "white" }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ color: searchQuery ? "black" : "gray" }}
        />
        <AppstoreOutlined className="absolute right-3 top-3 text-white" />
      </div>

      <div className="overflow-x-auto">
        <table
          className="min-w-full table-auto border-separate"
          style={{ borderSpacing: "0 8px" }}
        >
          <thead>
            <tr className="bg-gradient-to-r from-gray-700 to-blue-800 text-gray-200 text-xs sm:text-base">
              <th className="px-4 py-2 text-left text-xs sm:text-sm rounded-l-lg">
                Rank
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm">
                Player Name
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm">
                Country
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm rounded-r-lg">
                Money
              </th>
            </tr>
          </thead>
          <tbody className="text-white text-xs sm:text-sm">
            {leaderboardData.map((player: Player, index: number) => (
              <>
                <tr
                  key={`${player.id}-${index}`}
                  className={`bg-gradient-to-r from-gray-${
                    index % 2 === 0 ? "600" : "700"
                  } to-blue-${
                    index % 2 === 0 ? "800" : "700"
                  } hover:bg-blue-600 transition duration-200 ease-in-out`}
                >
                  <td className="px-4 py-2 bg-gray-800 bg-opacity-90 rounded-l-lg">
                    {player.rank}
                  </td>
                  <td className="px-4 py-2 bg-gray-800 bg-opacity-90">
                    {player.name}
                  </td>
                  <td className="px-4 py-2 bg-gray-800 bg-opacity-90">
                    <div className="flex items-center">
                      <span
                        className={`fi fi-${player.country.toLowerCase()}`}
                        style={{ marginRight: "8px" }}
                      ></span>
                      {player.country}
                    </div>
                  </td>
                  <td className="px-4 py-2 bg-gray-800 bg-opacity-90 rounded-r-lg">
                    {player.earnings}
                  </td>
                </tr>
                {index === 99 && (
                  <tr>
                    <td colSpan={4} className="py-4">
                      <div className="flex flex-col sm:flex-row items-center justify-center">
                        <div className="hidden sm:block border-t border-gray-500 w-1/4"></div>
                        <div className="mx-4 text-lg sm:text-xl text-blue-500 font-bold text-center flex items-center">
                          <AppstoreOutlined className="mr-2" />
                          <span>-- Last 10 Players --</span>
                        </div>
                        <div className="hidden sm:block border-t border-gray-500 w-1/4"></div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardGeneral;

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

interface LeaderboardGroupProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  shouldUpdate: boolean;
}

const LeaderboardGroup: React.FC<LeaderboardGroupProps> = ({
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
      const data = await LeaderboardService.getAllPlayersLeaderboard();
      const formattedData = data.map((entry: any) => ({
        id: entry.player.id,
        name: entry.player.name,
        country: entry.player.country,
        countryCode:
          countryCodeMap[entry.player.country] || entry.player.country,
        earnings: entry.player.earnings,
        rank: entry.rank,
      }));
      setLeaderboardData(formattedData);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
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
        const formattedData = response.map((entry: any) => ({
          id: entry.player.id,
          name: entry.player.name,
          country: entry.player.country,
          countryCode:
            countryCodeMap[entry.player.country] || entry.player.country,
          earnings: entry.player.earnings,
          rank: entry.rank,
        }));
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

  const rankByCountry = () => {
    const countryGrouped = leaderboardData.reduce((acc, player) => {
      if (!acc[player.country]) {
        acc[player.country] = [];
      }
      acc[player.country].push(player);
      return acc;
    }, {} as Record<string, Player[]>);

    Object.keys(countryGrouped).forEach((country) => {
      countryGrouped[country].sort((a, b) => b.earnings - a.earnings);
      countryGrouped[country] = countryGrouped[country].map(
        (player, index) => ({
          ...player,
          countryRank: index + 1,
        })
      );
    });

    return countryGrouped;
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchInitialLeaderboardData();
    } else {
      fetchSearchLeaderboardData();
    }
  }, [shouldUpdate, searchQuery]);

  const groupedByCountry = rankByCountry();

  return (
    <div className="w-full p-2 mt-10 max-w-none">
      <h1 className="text-center text-xl sm:text-2xl text-white font-bold mb-4">
        Leaderboard by Country
      </h1>
      <div className="relative mb-4 w-full mx-auto">
        <Input
          className={`w-full p-2 rounded-lg border border-gray-500 ${
            searchQuery
              ? "text-black bg-gray-700"
              : "text-gray-400 bg-transparent"
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
                Country Rank
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm">
                Player Name
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm">
                Country
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm rounded-r-lg">
                Earnings
              </th>
            </tr>
          </thead>
          <tbody className="text-white text-xs sm:text-sm">
            {Object.keys(groupedByCountry).map((country) => (
              <React.Fragment key={country}>
                <tr>
                  <td
                    className="bg-gray-700 text-white text-center py-1 sm:py-2 rounded-lg"
                    colSpan={4}
                  >
                    <span
                      className={`fi fi-${
                        groupedByCountry[country][0].countryCode
                          ? groupedByCountry[
                              country
                            ][0].countryCode.toLowerCase()
                          : "default"
                      }`}
                    ></span>{" "}
                    {groupedByCountry[country][0].country}
                  </td>
                </tr>
                {groupedByCountry[country].map(
                  (player: Player, index: number) => (
                    <tr
                      key={`${player.id}-${index}`}
                      className={`bg-gradient-to-r from-gray-${
                        index % 2 === 0 ? "600" : "700"
                      } to-blue-${
                        index % 2 === 0 ? "800" : "700"
                      } hover:bg-blue-600 transition duration-200 ease-in-out`}
                    >
                      <td className="px-4 py-2 bg-gray-800 bg-opacity-90 rounded-l-lg text-left">
                        {player.countryRank}
                      </td>
                      <td className="px-4 py-2 bg-gray-800 bg-opacity-90 text-left">
                        {player.name}
                      </td>
                      <td className="px-4 py-2 bg-gray-800 bg-opacity-90 text-left">
                        <div className="flex items-center">
                          <span
                            className={`fi fi-${
                              player.countryCode
                                ? player.countryCode.toLowerCase()
                                : "default"
                            }`}
                            style={{ marginRight: "8px" }}
                          ></span>
                          {player.country}
                        </div>
                      </td>
                      <td className="px-4 py-2 bg-gray-800 bg-opacity-90 rounded-r-lg text-left">
                        {player.earnings}
                      </td>
                    </tr>
                  )
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardGroup;

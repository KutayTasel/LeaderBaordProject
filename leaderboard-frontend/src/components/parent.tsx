import React, { useState } from "react";
import LeaderboardGroup from "./leaderboardGroup";
import LeaderboardGeneral from "./leaderboardGeneral";
import { Button } from "flowbite-react";
import PrizePoolModal from "../components/distrubutePrize";

const ParentComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeComponent, setActiveComponent] = useState<"group" | "general">(
    "general"
  );
  const [isPrizePopupOpen, setIsPrizePopupOpen] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const handleResetLeaderboard = () => {
    setShouldUpdate((prev) => !prev);
  };

  return (
    <div className="parent-container flex flex-col justify-center items-center min-h-screen w-full max-w-screen-lg mx-auto pt-8 md:pt-12 px-4">
      <div className="button-group flex flex-col sm:flex-row justify-center gap-2 relative mb-4 sm:mb-6 p-2 w-full">
        <Button
          onClick={() => setActiveComponent("general")}
          className={`w-full sm:w-auto py-2 px-4 text-sm sm:text-base md:text-lg font-medium rounded-lg transition-all duration-300 mt-4 sm:mt-0 ${
            activeComponent === "general"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          General Leaderboard
        </Button>
        <Button
          onClick={() => setActiveComponent("group")}
          className={`w-full sm:w-auto py-2 px-4 text-sm sm:text-base md:text-lg font-medium rounded-lg transition-all duration-300 mt-4 sm:mt-0 ${
            activeComponent === "group"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Group Leaderboard
        </Button>
        <Button
          onClick={() => setIsPrizePopupOpen(true)}
          className="w-full sm:w-auto py-2 px-4 bg-green-600 text-white text-sm sm:text-base md:text-lg font-medium rounded-lg shadow-lg mt-4 sm:mt-0"
        >
          Distribute Prizes
        </Button>
      </div>
      <div className="content-area w-full max-w-6xl mt-0">
        {activeComponent === "general" ? (
          <LeaderboardGeneral
            setIsLoading={setIsLoading}
            shouldUpdate={shouldUpdate}
          />
        ) : (
          <LeaderboardGroup
            setIsLoading={setIsLoading}
            shouldUpdate={shouldUpdate}
          />
        )}
      </div>
      {isPrizePopupOpen && (
        <div className="w-full max-w-6xl mt-6">
          <PrizePoolModal
            onClose={() => setIsPrizePopupOpen(false)}
            onResetLeaderboard={handleResetLeaderboard}
            setIsLoading={setIsLoading}
          />
          <Button onClick={() => setIsPrizePopupOpen(false)}>Close</Button>
        </div>
      )}
    </div>
  );
};

export default ParentComponent;

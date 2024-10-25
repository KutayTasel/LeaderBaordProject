import React, { useState } from "react";

interface SidebarComponentProps {
  setActivePage: (name: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarComponent: React.FC<SidebarComponentProps> = ({
  setActivePage,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [currentSidebarTab, setCurrentSidebarTab] = useState<string | null>(
    null
  );

  const handleMenuItemClick = (name: string) => {
    setCurrentSidebarTab(name);
    setActivePage(name);
    toggleSidebar();
  };

  const menuItems = [
    {
      name: "leaderboard",
      label: "Leaderboard",
      icon: "M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z",
    },
    {
      name: "otherPage",
      label: "Other Page",
      icon: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z",
    },
  ];

  return (
    <div>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white border-r-2 shadow-lg transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-40`}
        style={{ marginTop: "64px" }}
      >
        <nav className="flex flex-col flex-1 mt-2">
          <ul className="flex flex-col flex-1 space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => handleMenuItemClick(item.name)}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                  currentSidebarTab === item.name
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-indigo-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="sidebar-icon"
                >
                  <path d={item.icon} className="fill-current" />
                </svg>
                <span className="ml-2 text-sm">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SidebarComponent;

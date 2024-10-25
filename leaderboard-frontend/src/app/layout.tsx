"use client";

import React, { useState } from "react";
import NavbarComponent from "../components/navbar";
import SidebarComponent from "../components/sidebar";
import FooterComponent from "../components/footer";
import ParentComponent from "../components/parent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Panteon Leaderboard</title>
      </head>
      <body className="bg-gray-900 text-white">
        <div className="flex flex-col min-h-screen w-full overflow-y-auto">
          <NavbarComponent toggleSidebar={toggleSidebar} />

          <div className="flex flex-grow">
            <aside
              className={`relative h-screen z-30 transition-all duration-300 ${
                isSidebarOpen ? "w-64" : "w-0"
              }`}
            >
              <SidebarComponent
                setActivePage={setActivePage}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
              />
            </aside>
            <main
              className={`flex-grow flex flex-col justify-center items-center bg-gray-900 pt-6 sm:pt-8 transition-all duration-300 ${
                isSidebarOpen ? "ml-64" : "ml-0"
              }`}
            >
              {activePage === "leaderboard" ? (
                <ParentComponent />
              ) : activePage === "otherPage" ? (
                <div>Other Page Content</div>
              ) : (
                <div className="flex-grow flex items-center justify-center w-full">
                  <div className="text-center flex flex-col items-center">
                    <p className="text-4xl font-bold text-gray-300">
                      Please select a page.
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
          <FooterComponent />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </body>
    </html>
  );
}

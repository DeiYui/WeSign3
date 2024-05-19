"use client";
import Header from "@/components/Layouts/Header";
import Sidebar from "@/components/Layouts/Sidebar";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import ChatWidget from "../Chat/ChatWidget";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = useSelector((state: RootState) => state.admin);

  // Initial state from local storage or default to false
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : false;
  });

  // Effect to save sidebarOpen state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden ">
        {/* <!-- ===== Sidebar Start ===== --> */}
        {sidebarOpen && (
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}

        {/* <!-- ===== Sidebar End ===== --> */}
        <button
          className=" rounded-full bg-white p-2 focus:outline-none dark:bg-boxdark"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <DoubleLeftOutlined size={24} />
          ) : (
            <DoubleRightOutlined size={24} />
          )}
        </button>
        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 pr-14 ">
              {children}
            </div>
          </main>
        </div>

        {/* Chat */}
        {admin && <ChatWidget />}
      </div>
    </>
  );
}

"use client";
import React, { useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Logo, MessageIcon } from "@/assets/icons";
import { CloseOutlined, DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import BasicDrawer from "../draw/BasicDraw";
import { colors } from "@/assets/colors";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show chat
  const [chatOpen, setChatOpen] = useState(false);

  // Hàm để đảo ngược giá trị của sidebarOpen
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
                className=" bg-white rounded-full p-2 focus:outline-none dark:bg-boxdark"
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
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
         
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>

        <div className="bg-white fixed right-0 bottom-0 top-0 z-[1000] rounded-md" style={{width: chatOpen ? "360px" : "60px"}}>
          {/* Header */}
                  <div className="px-4 bg-neutral-700 h-20 flex justify-between items-center cursor-pointer transition-all" >
                    <div className="flex text-white gap-4 items-center" onClick={() => setChatOpen(true)} >
                      
                    <MessageIcon size={36}  color={colors.primary600}  />

                     {chatOpen && "MY CHAT"} 
                    </div>
                  {chatOpen && (
                    <div className="" onClick={() => setChatOpen(false)}>
                    <CloseOutlined style={{color: "white"}} />
                    </div>
                  )}
                  </div>
                </div>
       
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}

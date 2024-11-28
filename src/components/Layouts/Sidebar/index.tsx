import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";
import { AdminSystem } from "@/config/adminNavigation";
import { MenuSystem } from "@/config/userNavigation";
import Learning from "@/model/Learning";
import { RootState, store } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { updateSetting } from "@/store/slices/SettingSlice";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const state: RootState = store.getState();
  const admin = state.admin;

  useEffect(() => {
    const icon: any = document.querySelector(".shake-icon");
    icon.classList.add("shake");

    const timer = setTimeout(() => {
      icon.classList.remove("shake");
    }, 4000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const sidebar = useRef(null);
  const dispatch = useDispatch();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const storedSidebarExpanded = localStorage.getItem("sidebarExpanded");
    if (storedSidebarExpanded !== null) {
      setSidebarExpanded(storedSidebarExpanded === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded((prevExpanded) => !prevExpanded);
    localStorage.setItem("sidebarExpanded", `${!sidebarExpanded}`);
    setSidebarOpen(!sidebarOpen);
    dispatch(
      updateSetting({
        openSideBar: !sidebarOpen,
      }),
    );
  };

  const renderChildItems = (items: any[], level = 0) => (
    <ul className={`pl-${level * 4}`}>
      {items.map((item) => (
        <SidebarLinkGroup
          key={item.key}
          activeCondition={pathname.includes(item.path)}
        >
          {(handleClick, open) => {
            const hasChildren = item.children?.length > 0;
            return (
              <>
                <Link
                  href={item.path}
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 text-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    pathname === item.path ? "bg-graydark dark:bg-meta-4" : ""
                  }`}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      sidebarExpanded ? handleClick() : toggleSidebar();
                    }
                  }}
                  style={{ paddingLeft: `${level * 1}rem` }}
                >
                  {item.icon}
                  {item.label}
                  {hasChildren && (
                    <svg
                      className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                        open ? "rotate-180" : ""
                      }`}
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                        fill=""
                      />
                    </svg>
                  )}
                </Link>
                {hasChildren &&
                  open &&
                  renderChildItems(item.children, level + 1)}
              </>
            );
          }}
        </SidebarLinkGroup>
      ))}
    </ul>
  );

  const {
    data: listLinkMobile,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["getLinkMobile"],
    queryFn: async () => {
      const res = await Learning.getLinkMobile();
      return res?.data;
    },
  });

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-99 flex h-screen flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark sm:w-20 lg:static lg:w-70 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        className="bg-sky-100 p-2 hover:bg-slate-100 sm:block lg:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <DoubleLeftOutlined size={24} />
        ) : (
          <DoubleRightOutlined size={24} />
        )}
      </button>
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-center gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/" className="flex items-end justify-center">
          <Logo size={80} color={colors.primary400} />
          <div className="mb-1 text-3xl font-bold text-white">eSign</div>
        </Link>
      </div>

      <div className="no-scrollbar mb-40 flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* Sidebar Menu */}
        <nav className="mt-5 py-4 pl-4 pr-2 lg:mt-9">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {MenuSystem()?.map((item: any) => (
                <React.Fragment key={item.label}>
                  {renderChildItems([item])}
                </React.Fragment>
              ))}
            </ul>

            {admin && (admin?.role === "ADMIN" || admin?.role === "TEACHER") ? (
              <>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  ADMIN
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {AdminSystem(admin)?.map((item: any) => (
                    <React.Fragment key={item.label}>
                      {renderChildItems([item])}
                    </React.Fragment>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </nav>
      </div>
      <nav className="absolute bottom-0 mt-2 w-full py-2 pl-4 pr-2 pt-4 ">
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              viewBox="0 0 64 64"
              className="shake-icon"
            >
              <rect width="64" height="64" fill="none" />
              <path
                fill="#405866"
                d="M47.873 0H16.124a5.082 5.082 0 0 0-5.08 5.079v53.845a5.084 5.084 0 0 0 5.08 5.079h31.749a5.088 5.088 0 0 0 5.083-5.079V5.087A5.085 5.085 0 0 0 47.873.008"
              />
              <path
                fill="#85cfea"
                d="M44.579 3.876h-25.16a4.03 4.03 0 0 0-4.03 4.02v42.667a4.028 4.028 0 0 0 4.03 4.02h25.16c2.22 0 4.02-1.81 4.02-4.02V7.892c0-2.22-1.805-4.02-4.02-4.02"
              />
              <path
                fill="#28a6de"
                d="M31.3 3.876H19.425a4.03 4.03 0 0 0-4.03 4.02v42.667a4.028 4.028 0 0 0 4.03 4.02h25.16c.813 0 1.564-.249 2.196-.659C36.084 39.99 30.358 21.259 31.303 3.874"
              />
              <path
                fill="#cbd5dc"
                d="M35.3 59.39c0 1.817-1.476 3.298-3.297 3.298s-3.297-1.48-3.297-3.298s1.476-3.298 3.297-3.298s3.297 1.48 3.297 3.298m-12.705 0a2.412 2.412 0 1 1-4.823.003a2.412 2.412 0 0 1 4.823-.003m18.815 0a2.412 2.412 0 1 0 4.822 0a2.41 2.41 0 0 0-4.822 0"
              />
            </svg>
            <div className="text-white">ANDROID</div>
          </div>
          <Button
            className="mb-4 ml-4 text-sm font-semibold text-primary-700"
            onClick={() => {
              window.open(listLinkMobile[0]);
            }}
          >
            TẢI ỨNG DỤNG MOBILE
          </Button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

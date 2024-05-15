import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import { Logo } from "@/assets/icons";
import { colors } from "@/assets/colors";
import { RootState, store } from "@/store";
import Buttons from "@/app/ui/buttons/page";
import { Button } from "antd";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { sidebarOpen } = props;

  const state: RootState = store.getState();
  const admin = state.admin;
  console.log("admin", admin);

  return (
    <header className="sticky top-0  z-999 flex w-full bg-white pr-6 drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div
        className={`flex flex-grow items-center ${sidebarOpen ? "justify-end" : "justify-between"}  px-4 py-4 pr-8 shadow-2 `}
      >
        {/* Hiện logo khi ẩn slideBar */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2  ">
            <Link className="flex items-end justify-center" href="/">
              <Logo size={40} color={colors.primary400} />
              <div className="font-bold text-black">eSign</div>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Toggler --> */}
            {/* <DarkModeSwitcher /> */}
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Notification Menu Area --> */}
            {/* <DropdownNotification /> */}
            {/* <!-- Notification Menu Area --> */}

            {/* <!-- Chat Notification Area --> */}
            {/* <DropdownMessage /> */}
            {/* <!-- Chat Notification Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          {admin ? (
            <DropdownUser admin={admin} />
          ) : (
            <div className="flex gap-4">
              <Link href="/register">
                <Button>Đăng ký</Button>
              </Link>
              <Link href="/login">
                <Button type="primary"> Đăng nhập</Button>
              </Link>
            </div>
          )}
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;

import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";
import SearchInput from "@/components/Friend/components/SearchInput";
import { RootState, store } from "@/store";
import { Button } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DropdownUser from "./DropdownUser";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { sidebarOpen } = props;
  const router = useRouter();
  const pathname = usePathname();
  console.log("router", router, pathname);

  const state: RootState = store.getState();
  const admin = state.admin;

  return (
    <header className="sticky top-0  z-999 flex w-full bg-white pr-6 drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div
        className={`flex flex-grow items-center justify-between px-4 py-4 pr-10 shadow-2 `}
      >
        {/* Hiện logo khi ẩn slideBar */}
        <div className="flex items-center gap-4">
          {!sidebarOpen && (
            <div className="flex items-center gap-2">
              <Link className="flex items-end justify-center" href="/">
                <Logo size={40} color={colors.primary400} />
                <div className="font-bold text-black">eSign</div>
              </Link>
            </div>
          )}
          {/* Tìm kiếm bạn bè */}
          {pathname?.includes("friend") && <SearchInput />}
        </div>

        <div className="2xsm:gap-7 flex items-center gap-3">
          <ul className="2xsm:gap-4 flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};

export default Header;

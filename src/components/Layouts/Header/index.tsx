import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";
import SearchInput from "@/components/Friend/components/SearchInput";
import StudySelect from "@/components/Study/StudySelect";
import { RootState, store } from "@/store";
import { Button } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DropdownUser from "./DropdownUser";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { updateSetting } from "@/store/slices/SettingSlice";
import { useDispatch } from "react-redux";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { sidebarOpen, setSidebarOpen } = props;
  const pathname = usePathname();
  const dispatch = useDispatch();

  const state: RootState = store.getState();
  const admin = state.admin;
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    dispatch(
      updateSetting({
        openSideBar: !sidebarOpen,
      }),
    );
  };

  return (
    <header className="sticky top-0  z-[98] flex w-full bg-white  drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div
        className={`flex flex-grow items-center justify-between  px-4  py-4  shadow-2 ${!pathname.includes("/chat") && admin ? "pr-16" : "pr-4"} `}
      >
        {/* Hiện logo khi ẩn slideBar */}
        <div className="flex items-center gap-4">
          <button
            className="rounded-full bg-white p-2 focus:outline-none dark:bg-boxdark sm:block md:hidden md:px-1"
            onClick={toggleSidebar}
          >
            <MenuOutlined size={24} />
          </button>
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

          {/* Học tập */}
          {pathname?.includes("study") && sidebarOpen && <StudySelect />}
        </div>

        <div className=" flex items-center gap-3">
          <ul className=" flex items-center gap-2">
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

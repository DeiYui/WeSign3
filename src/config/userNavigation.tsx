import {
  ChatIcon,
  CollectDataIcon,
  DashboardIcon,
  ExamIcon,
  PracticeIcon,
  StudyIcon,
} from "@/assets/icons";
import { RootState, store } from "@/store";
import { UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

export const MenuSystem = () => {
  const admin = useSelector((state: RootState) => state.admin);

  return [
    {
      key: "/dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      hidden: false,
    },
    {
      key: "/friend",
      label: "Bạn bè",
      path: "/friend",
      icon: <UserOutlined color="white" size={20} />,
      hidden: !admin,
    },
    {
      key: "/study",
      label: "Học tập",
      path: "/study",
      icon: <StudyIcon color="white" size={20} />,
      hidden: false,
    },
    {
      key: "/chat",
      label: "Trò chuyện",
      path: "/chat",
      icon: <ChatIcon size={20} color="white" />,
      hidden: true,
    },
    {
      key: "/exam",
      label: "Kiểm tra",
      path: "/exam",
      icon: <ExamIcon color="white" size={20} />,
      hidden: !admin,
    },
    {
      key: "/collect-data",
      label: "Thu thập dữ liệu",
      path: "/collect-data",
      icon: <CollectDataIcon color="white" size={20} />,
      hidden: !admin,
    },
    {
      key: "/practice-data",
      label: "Luyện tập",
      path: "/practice-data",
      icon: <PracticeIcon color="white" size={20} />,
      hidden: false,
    },
  ].filter((item) => !item.hidden);
};

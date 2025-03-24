import {
  ChatIcon,
  CollectDataIcon,
  DashboardIcon,
  DotIcon,
  ExamIcon,
  PracticeIcon,
  StudyIcon,
} from "@/assets/icons";
import { Introduction } from "@/assets/icons/Introduction";
import { RootState, store } from "@/store";
import { BarChartOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

export const MenuSystem = () => {
  const admin = useSelector((state: RootState) => state.admin);
  const token = localStorage.getItem("access_token");

  return [
    {
      key: "/introduction",
      label: "Giới thiệu",
      path: "/introduction",
      icon: <Introduction color="white" size={20} />,
      hidden: false,
    },
    {
      key: "/dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      hidden: !token,
    },
    {
      key: "/student",
      label: "Học sinh",
      path: "/student",
      hidden: false,
      icon: <DashboardIcon />,
    },
    {
      key: "/study",
      label: "Học tập",
      path: "/study",
      icon: <StudyIcon color="white" size={20} />,
      children: [
        {
          key: "/study/room",
          label: "Lớp",
          path: "/study/room",
          hidden: !token,
          icon: <DotIcon color="white" size={20} />,
        },
        {
          key: "/study/topics",
          label: "Chủ đề",
          path: "/study/topics",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
        {
          key: "/study/vocabulary",
          label: "Từ điển học liệu",
          path: "/study/vocabulary",
          hidden: !token,
          icon: <DotIcon color="white" size={20} />,
        },
        // {
        //   key: "/study/sentence",
        //   label: "Câu",
        //   path: "/study/sentence",
        //   hidden: false,
        //   icon: <DotIcon color="white" size={20} />,
        // },
        // {
        //   key: "/study/paragraph",
        //   label: "Đoạn",
        //   path: "/study/paragraph",
        //   hidden: false,
        //   icon: <DotIcon color="white" size={20} />,
        // },
        {
          key: "/study/alphabet",
          label: "Bảng chữ cái",
          path: "/study/alphabet",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
        {
          key: "/study/alphanumeric",
          label: "Bảng chữ số",
          path: "/study/alphanumeric",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
      ]?.filter((item) => !item.hidden),
      hidden: false,
    },
    {
      key: "/exam",
      label: "Kiểm tra",
      path: "/exam",
      icon: <ExamIcon color="white" size={20} />,
      hidden: !token && !admin,
    },
    {
      key: "/collect-data",
      label: "Thu thập dữ liệu",
      path: "/collect-data",
      icon: <CollectDataIcon color="white" size={20} />,
      hidden: !token && !admin,
    },

    {
      key: "/learning-progress",
      label: "Tiến độ học tập",
      path: "/learning-progress",
      icon: <BarChartOutlined />,
      hidden: false,
    },
    
    {
      key: "/practice-data",
      label: "Luyện tập",
      path: "/practice-data",
      icon: <PracticeIcon color="white" size={20} />,
      hidden: !token,
    },
  ].filter((item) => !item.hidden);
};

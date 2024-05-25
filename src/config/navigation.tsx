import {
  ChatIcon,
  CollectDataIcon,
  DashboardIcon,
  ExamIcon,
  MessageIcon,
  StudyIcon,
} from "@/assets/icons";
import { AdminIcon } from "@/assets/icons/AdminIcon";
import { RootState, store } from "@/store";
import { UserOutlined } from "@ant-design/icons";

const state: RootState = store.getState();
const admin = state.admin;

export const navigation = [
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
    hidden: !admin ? true : false,
    // children: [
    //   {
    //     key: "/study/alphabet",
    //     label: "Học tập theo bảng chữ cái",
    //     path: "/study/alphabet",
    //     hidden: false,
    //   },

    //   {
    //     key: "/study/topics",
    //     label: "Học tập theo chủ đề",
    //     path: "/study/topics",
    //     hidden: false,
    //   },
    //   {
    //     key: "/study/vocabulary",
    //     label: "Học tập theo từ vựng",
    //     path: "/study/vocabulary",
    //     hidden: false,
    //   },
    // ],
  },
  {
    key: "/study",
    label: "Học tập",
    path: "/study",
    icon: <StudyIcon color="white" size={20} />,
    hidden: false,
    // children: [
    //   {
    //     key: "/study/alphabet",
    //     label: "Học tập theo bảng chữ cái",
    //     path: "/study/alphabet",
    //     hidden: false,
    //   },

    //   {
    //     key: "/study/topics",
    //     label: "Học tập theo chủ đề",
    //     path: "/study/topics",
    //     hidden: false,
    //   },
    //   {
    //     key: "/study/vocabulary",
    //     label: "Học tập theo từ vựng",
    //     path: "/study/vocabulary",
    //     hidden: false,
    //   },
    // ],
  },
  {
    key: "/chat",
    label: "Trò chuyện",
    path: "/chat",
    icon: <ChatIcon size={20} color="white" />,
    hidden: false,
  },
  {
    key: "/exam",
    label: "Kiểm tra",
    path: "/exam",
    icon: <ExamIcon color="white" size={20} />,
    hidden: false,
  },
  {
    key: "/collect-data",
    label: "Thu thập dữ liệu ",
    path: "/collect-data",
    icon: <CollectDataIcon color="white" size={20} />,
    hidden: false,
  },
]?.filter((item) => !item.hidden);

// admin
export const navigationAdmin = [
  {
    key: "/learning-management",
    label: "Quản lý học tập",
    path: "/learning-management",
    icon: <AdminIcon color="white" size={20} />,
    children: [
      {
        key: "/learning-management/topics",
        label: "Chủ đề",
        path: "/learning-management/topics",
        hidden: false,
      },
      {
        key: "/learning-management/vocabulary",
        label: "Ký hiệu",
        path: "/learning-management/vocabulary",
        hidden: false,
      },
      {
        key: "/learning-management/exam",
        label: "Bài kiểm tra",
        path: "/learning-management/exam",
        hidden: false,
      },
    ],
    hidden: admin.role !== "ADMIN",
  },
]?.filter((item) => !item.hidden);

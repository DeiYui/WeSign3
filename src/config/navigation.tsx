import { DashboardIcon, StudyIcon } from "@/assets/icons";
import { UserOutlined } from "@ant-design/icons";

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
];

import { DotIcon, RequestIcon } from "@/assets/icons";
import { AdminIcon } from "@/assets/icons/AdminIcon";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const AdminSystem = () => {
  const admin = useSelector((state: RootState) => state.admin);

  return [
    {
      key: "/learning-management",
      label: "Quản lý học tập",
      path: "/learning-management",
      icon: <AdminIcon color="white" size={20} />,
      children: [
        {
          key: "/learning-management/class",
          label: "Lớp học",
          path: "/learning-management/class",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
        {
          key: "/learning-management/topics",
          label: "Chủ đề ",
          path: "/learning-management/topics",
          icon: <DotIcon color="white" size={20} />,
          children: [
            {
              key: "/learning-management/topics/public",
              label: "Chung",
              path: "/learning-management/topics/public",
              hidden: false,
              icon: <DotIcon color="white" size={20} />,
            },
            {
              key: "/learning-management/topics/private",
              label: "Riêng",
              path: "/learning-management/topics/private",
              hidden: false,
              icon: <DotIcon color="white" size={20} />,
            },
          ],
          hidden: false,
        },
        {
          key: "/learning-management/vocabulary",
          label: "Ký hiệu ",
          path: "/learning-management/vocabulary",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
        {
          key: "/learning-management/questions",
          label: "Câu hỏi",
          path: "/learning-management/questions",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
        {
          key: "/learning-management/check-list",
          label: "Bài kiểm tra ",
          path: "/learning-management/check-list",
          hidden: false,
          icon: <DotIcon color="white" size={20} />,
        },
      ],
      hidden: false,
    },
    {
      key: "/approve-request",
      label: "Phê duyệt yêu cầu",
      path: "/approve-request",
      icon: <RequestIcon color="white" size={20} />,
      hidden: false,
    },
  ].filter((item) => !item.hidden);
};

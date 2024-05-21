"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import { RootState } from "@/store";
import { Avatar } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { VALUE_GENDER } from "../common/constants";
import { useRouter } from "next/navigation";
import {
  CalendarOutlined,
  MailOutlined,
  ManOutlined,
  PhoneOutlined,
  WomanOutlined,
} from "@ant-design/icons";

const Profile = () => {
  const router = useRouter();
  const user: User = useSelector((state: RootState) => state.admin);

  return (
    <div className="mx-auto max-w-242.5">
      <Breadcrumb
        pageName="Thông tin cá nhân"
        itemBreadcrumb={[
          { pathName: "/", name: "Trang chủ" },
          { pathName: "#", name: "Thông tin cá nhân" },
        ]}
      />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={"/images/cover/cover-01.png"}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
          <div
            className="xsm:bottom-4 xsm:right-4 absolute bottom-1 right-1 z-10"
            onClick={() => router.push(`/profile/${user.userId}`)}
          >
            <label
              htmlFor="cover"
              className="xsm:px-4 flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-2 py-1 text-sm font-medium text-white hover:bg-opacity-80"
            >
              <span>
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.99992 5.83329C6.03342 5.83329 5.24992 6.61679 5.24992 7.58329C5.24992 8.54979 6.03342 9.33329 6.99992 9.33329C7.96642 9.33329 8.74992 8.54979 8.74992 7.58329C8.74992 6.61679 7.96642 5.83329 6.99992 5.83329ZM4.08325 7.58329C4.08325 5.97246 5.38909 4.66663 6.99992 4.66663C8.61075 4.66663 9.91659 5.97246 9.91659 7.58329C9.91659 9.19412 8.61075 10.5 6.99992 10.5C5.38909 10.5 4.08325 9.19412 4.08325 7.58329Z"
                    fill="white"
                  />
                </svg>
              </span>
              <span>Chỉnh sửa</span>
            </label>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-44 w-full max-w-44 rounded-full p-3  ">
            <div className="relative drop-shadow-2">
              <Avatar alt="profile" src={user.avatarLocation} size={160} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {user.name}
            </h3>
            <p className="font-medium">{user.address}</p>

            <div className="mx-auto mt-4 max-w-[460px]">
              <h4 className="font-semibold text-black dark:text-white">
                Thông tin cơ bản
              </h4>

              <div className="mt-4 flex items-center gap-3 ">
                <div className="flex w-1/3 items-center gap-2">
                  <MailOutlined style={{ fontSize: 16, marginTop: "1px" }} />
                  <p className="text-gray-500 dark:text-gray-400 mr-2 text-sm font-medium">
                    Email
                  </p>
                </div>
                <p className="text-black dark:text-white">{user.email}</p>
              </div>

              <div className="my-2 flex items-center gap-3 ">
                <div className="flex w-1/3 items-center gap-2">
                  <PhoneOutlined style={{ fontSize: 16, marginTop: "1px" }} />
                  <p className="text-gray-500 dark:text-gray-400 mr-2 text-sm font-medium">
                    Số điện thoại
                  </p>
                </div>
                <p className="text-black dark:text-white">{user.phoneNumber}</p>
              </div>

              <div className="my-2 flex items-center gap-3 ">
                <div className="flex w-1/3 items-center gap-2">
                  {user?.gender === "MALE" ? (
                    <ManOutlined style={{ fontSize: 16, marginTop: "1px" }} />
                  ) : (
                    <WomanOutlined style={{ fontSize: 16, marginTop: "1px" }} />
                  )}{" "}
                  <p className="text-gray-500 dark:text-gray-400 mr-2 text-sm font-medium">
                    Giới tính
                  </p>
                </div>
                <p className="text-black dark:text-white">
                  {VALUE_GENDER[user.gender]}
                </p>
              </div>

              <div className="my-2 flex items-center gap-3 ">
                <div className="flex w-1/3 items-center gap-2">
                  <CalendarOutlined
                    style={{ fontSize: 16, marginTop: "1px" }}
                  />
                  <p className="text-gray-500 dark:text-gray-400 mr-2 text-sm font-medium">
                    Năm sinh
                  </p>
                </div>
                <p className="text-black dark:text-white">{user.birthDay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

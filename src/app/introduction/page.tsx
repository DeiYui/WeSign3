// pages/auth/login.tsx
import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Introduction - WeSign",
  description: "Introduction page for WeSign",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
    ],
  },
};

export default function Introduction() {
  return (
    <DefaultLayout>
      <div className="bg-gray-100 flex max-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="mb-6 flex items-end justify-center">
          <Logo size={80} color={colors.primary400} />
          <div className="mb-1 text-3xl font-bold text-blue-600">eSign</div>
        </div>
        <div className="max-w-2xl rounded-lg bg-white p-6 text-justify shadow-lg hover:start-11 hover:shadow-1">
          <h1 className="text-gray-800 mb-4 text-2xl font-bold">
            Giới thiệu phần mềm dạy và học ngôn ngữ ký hiệu tiếng Việt WeSign
          </h1>
          <p className="text-gray-700 mb-4">
            Phần mềm dạy và học ngôn ngữ ký hiệu tiếng Việt (WeSign) được phát
            triển nhằm cung cấp một nền tảng hỗ trợ cho giáo viên cung cấp học
            liệu và cho người học học ngôn ngữ ký hiệu tiếng Việt cho người
            khiếm thính một cách thuận tiện. Phần mềm có thể được dùng trực tiếp
            từ trình duyệt trên máy tính và ứng dụng trên điện thoại.
          </p>
          <p className="text-gray-700 mb-4">
            Phiên bản hiện tại là phiên bản thử nghiệm. Phần mềm được sử dụng
            với mục đích phi thương mại. Một số dữ liệu dạy học trong phần mềm
            được tham khảo từ dự án QIPEDC và các tình nguyện viên. Phần mềm
            được phát triển bởi nhóm nghiên cứu iBME lab, Đại học Bách Khoa Hà
            Nội.
          </p>
          <p className="text-gray-700 font-semibold">
            WeSign version 0.9 @iBME lab
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}

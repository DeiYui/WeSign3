import { colors } from "@/assets/colors";
import { LoginBg, Logo } from "@/assets/icons";
import ECommerce from "@/components/Dashboard/E-commerce";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "We_sign",
  description: "We_sign",
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
export default function LayoutAuth({ children }: any) {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="px-26 py-17.5 text-center">
            <Link href="/" className="mb-5.5 flex items-end justify-center">
              <Logo size={80} color={colors.primary400} />
              <div className="mb-1 text-3xl font-bold text-blue-400 ">
                eSign
              </div>
            </Link>

            <p className="space-x-1 text-xl uppercase">
              EveryOne, EveryWhere,EveryTime
            </p>

            <span className="mt-15 inline-block">
              <LoginBg />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          {children}
        </div>
      </div>
    </div>
  );
}

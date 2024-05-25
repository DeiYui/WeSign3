import Chart from "@/components/Charts/page";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

export const metadata: Metadata = {
  title: "Management-exam - We_sign",
  description: "Management-exam page for We_sign",
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

const ManagementExamPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="">Quản lý bài kiểm tra</div>
    </DefaultLayout>
  );
};

export default ManagementExamPage;

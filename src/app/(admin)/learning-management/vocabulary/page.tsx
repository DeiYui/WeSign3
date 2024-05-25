import Chart from "@/components/Charts/page";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

export const metadata: Metadata = {
  title: "Management-vocabulary- We_sign",
  description: "Management-vocabulary page for We_sign",
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

const ManagementVocabularyPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="">Quản lý ký hiệu</div>
    </DefaultLayout>
  );
};

export default ManagementVocabularyPage;

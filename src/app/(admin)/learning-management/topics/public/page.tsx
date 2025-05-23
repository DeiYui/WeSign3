import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import TopicList from "../TopicList";

export const metadata: Metadata = {
  title: "Management-topics  - We_sign",
  description: "Management-topics page for We_sign",
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

const ManagementTopicsPage: React.FC = () => {
  return (
    <DefaultLayout>
      <TopicList isPrivate={false} />
    </DefaultLayout>
  );
};

export default ManagementTopicsPage;

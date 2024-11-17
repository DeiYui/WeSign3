import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import LessonList from "../LessonList";

export const metadata: Metadata = {
  title: "Management-lesson  - We_sign",
  description: "Management-lesson page for We_sign",
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
      <LessonList isPrivate />
    </DefaultLayout>
  );
};

export default ManagementTopicsPage;

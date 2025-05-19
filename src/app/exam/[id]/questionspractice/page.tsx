import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import QuestionsPractice from "./QuestionsPractice";

export const metadata: Metadata = {
  title: "ExamDetail - We_sign",
  description: "ExamDetail page for We_sign",
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

const ExamDetail: React.FC = () => {
  return (
    <DefaultLayout>
      <QuestionsPractice/>
    </DefaultLayout>
  );
};

export default ExamDetail;
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import GradeTest from "@/components/Grading-Test/GradeTest";

export const metadata: Metadata = {
  title: "Exam - We_sign",
  description: "Exam page for We_sign",
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

const ExamPage: React.FC = () => {
  return (
    <DefaultLayout>
      <GradeTest />
    </DefaultLayout>
  );
};

export default ExamPage;
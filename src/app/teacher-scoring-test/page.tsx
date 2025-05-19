import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import ScoreTest from "./ScoreTest";

export const metadata: Metadata = {
  title: "ScoreTest - We_sign",
  description: "Score Test for We_sign",
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

const ScoreTesting: React.FC = () => {
  return (
    <DefaultLayout>
      <ScoreTest />
    </DefaultLayout>
  );
};

export default ScoreTesting;

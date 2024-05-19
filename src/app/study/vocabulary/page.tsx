import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "LearnVocabulary - We_sign",
  description: "LearnVocabulary page for We_sign",
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

const LearnVocabulary = () => {
  return (
    <DefaultLayout>
      <div>Học theo từ vựng</div>;
    </DefaultLayout>
  );
};

export default LearnVocabulary;

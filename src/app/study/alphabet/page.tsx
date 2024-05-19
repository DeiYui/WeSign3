import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "LearnAlphabet - We_sign",
  description: "LearnAlphabet page for We_sign",
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
const LearnAlphabet = () => {
  return (
    <DefaultLayout>
      <div>Học theo bảng chữ cái</div>;
    </DefaultLayout>
  );
};

export default LearnAlphabet;

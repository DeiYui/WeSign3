import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import RequestPage from "./RequestPage";

export const metadata: Metadata = {
  title: "Approve-Request Account - We_sign",
  description: "Approve-Request Account page for We_sign",
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

const Request: React.FC = () => {
  return (
    <DefaultLayout>
      <RequestPage />
    </DefaultLayout>
  );
};

export default Request;

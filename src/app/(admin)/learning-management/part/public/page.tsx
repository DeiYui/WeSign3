import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import VocabularyList from "../PartList";

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
      <VocabularyList isPrivate={false} />
    </DefaultLayout>
  );
};

export default ManagementVocabularyPage;

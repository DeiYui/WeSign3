import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import PartCreateUpdate from "./PartCreateUpdate";

export const metadata: Metadata = {
  title: "create-update-part- We_sign",
  description: "createUpdate-part page for We_sign",
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

const CreateVocabularyPage: React.FC = () => {
  return (
    <DefaultLayout>
      <PartCreateUpdate />
    </DefaultLayout>
  );
};

export default CreateVocabularyPage;

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import Lessons from "./Lessons";

export const metadata: Metadata = {
  title: "LearnTopics - We_sign",
  description: "LearnTopics page for We_sign",
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

const LearnTopics = () => {
  return (
    <DefaultLayout>
      <Lessons />
      {/* <StudyComponent /> */}
    </DefaultLayout>
  );
};

export default LearnTopics;

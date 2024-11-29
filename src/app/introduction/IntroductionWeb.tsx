"use client";
import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";
import Learning from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import DOMPurify from "dompurify";
import React from "react";

const IntroductionWeb: React.FC = () => {
  // API lấy thông tin lời giới thiệu
  const { data: introductionData, isFetching } = useQuery({
    queryKey: ["getIntroductionWeb"],
    queryFn: async () => {
      const res = await Learning.getIntroduction();

      return {
        title: res?.data.title,
        body: res?.data.body,
        footer: res?.data.footer,
      } as {
        title: string;
        body: string;
        footer: string;
      };
    },
  });

  return (
    <Spin spinning={isFetching}>
      <div className="bg-gray-100 flex flex-col items-center justify-center px-4 py-6 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-center sm:justify-center">
          {/* <div className="mb-2 sm:mb-0">
            <Logo size={60} color={colors.primary400} />
          </div> */}
          <div className="text-center text-2xl font-bold text-blue-600 sm:ml-2 sm:text-3xl">
            WeSign
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-lg hover:shadow-xl sm:p-6">
          <h1 className="text-gray-800 mb-4 text-lg font-bold sm:text-2xl">
            {introductionData?.title}
          </h1>
          <div
            className="text-gray-700 mb-4 text-sm sm:text-base"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(introductionData?.body || ""),
            }}
          />
          <p className="text-gray-700 text-sm font-semibold sm:text-base">
            {introductionData?.footer}
          </p>
        </div>
      </div>
    </Spin>
  );
};

export default IntroductionWeb;

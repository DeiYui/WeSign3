"use client";
import Learning from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Input, Select, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CustomTable } from "../(admin)/learning-management/check-list/ExamList";

interface Exam {
  key: string;
  name: string;
  questionCount: number;
  status: number;
}

interface FilterParams {
  page: number;
  size: number;
  topicId: number;
  status: number;
}

const exams: Exam[] = [
  { key: "1", name: "Bài kiểm tra 1", questionCount: 10, status: 1 },
  { key: "2", name: "Bài kiểm tra 2", questionCount: 15, status: 0 },
];

const optionStatus = [
  {
    label: "Đã hoàn thành",
    value: 1,
  },
  {
    label: "Chưa hoàn thành",
    value: 0,
  },
  {
    label: "Tất cả",
    value: -1,
  },
];

const ExamListPage: React.FC = () => {
  const router = useRouter();

  const [filterParams, setFilterParams] = useState<FilterParams>({
    page: 1,
    size: 999999,
    topicId: 0,
    status: -1,
  });

  // API lấy danh sách  topics
  const { data: allTopics } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      return res?.data?.map((item: { topicId: any; content: any }) => ({
        id: item.topicId,
        value: item.topicId,
        label: item.content,
        text: item.content,
      }));
    },
  });

  const columns = [
    { title: "STT", dataIndex: "key", key: "key", width: 50 },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Exam) => (
        <div onClick={() => router.push(`/exam/${record.key}`)}>
          <a className="text-blue-500">{text}</a>
        </div>
      ),
    },
    { title: "Số câu hỏi", dataIndex: "questionCount", key: "questionCount" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number) =>
        status === 1 ? (
          <div className="caption-12-medium flex w-[120px] items-center justify-center rounded bg-green-100 px-4 py-2 text-green-700">
            Đã hoàn thành
          </div>
        ) : (
          <div className="caption-12-medium flex w-[128px] items-center justify-center rounded bg-neutral-200 px-4 py-2 text-neutral-700">
            Chưa hoàn thành
          </div>
        ),
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <h1 className="mb-4 text-2xl font-bold">Kiểm tra học tập</h1>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input className="w-full" placeholder="Tên bài kiểm tra" />
        <Select
          className="w-full"
          allowClear
          placeholder="Chủ đề"
          options={allTopics}
          onChange={(value, option: any) =>
            setFilterParams({ ...filterParams, topicId: value })
          }
        />

        <Select
          className="w-full"
          allowClear
          placeholder="Trạng thái"
          options={optionStatus}
          onChange={(e) => setFilterParams({ ...filterParams, status: e })}
        />
      </div>
      <CustomTable dataSource={exams} columns={columns as any} />
    </div>
  );
};

export default ExamListPage;

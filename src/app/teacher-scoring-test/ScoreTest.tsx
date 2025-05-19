"use client";
import { useQuery } from "@tanstack/react-query";
import { Table, Select, Input, Tag, Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Exam from "@/model/Exam";
import Learning from "@/model/Learning";

const ScoreTest: React.FC = () => {
  const router = useRouter();

  // Bộ lọc
  const [filterParams, setFilterParams] = useState({
    classRoomId: 0,
    nameSearch: "",
    examType: "practice", // chỉ lấy bài kiểm tra thực hành
  });

  // Lấy danh sách lớp
  const { data: allClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res?.data?.map((item: { classRoomId: number; content: string }) => ({
        value: item.classRoomId,
        label: item.content,
      }));
    },
  });

  // Lấy danh sách bài kiểm tra thực hành
  const { data: examList = [], isFetching } = useQuery({
    queryKey: ["getLstExamPractice", filterParams],
    queryFn: async () => {
      const res = await Exam.getLstExam({ ...filterParams });
      // Lọc chỉ lấy bài kiểm tra thực hành
      return (res?.content || []).filter((item: any) => item.examType === "practice");
    },
  });

  // Cột bảng
  const columns = [
    {
      title: "STT",
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "examName",
      key: "examName",
      render: (examName: string, record: any) => (
        <div
          className="hover:cursor-pointer text-blue-500"
          onClick={() => router.push(`/exam/${record.examId}/practice`)}
        >
          {examName}
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "classRoomName",
      key: "classRoomName",
      render: (value: string) => <span>{value}</span>,
    },
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (value: string) => <span>{value}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isFinished",
      render: (isFinished: boolean) =>
        isFinished ? (
          <Tag color="green" className="px-3 py-1">Đã hoàn thành</Tag>
        ) : (
          <Tag color="default" className="px-3 py-1">Chưa hoàn thành</Tag>
        ),
    },
    {
      title: "Điểm",
      dataIndex: "score",
      render: (value: number, record: any) =>
        record.isFinished ? <b>{value !== undefined ? value.toFixed(1) : "0.0"}</b> : "-",
    },
    {
      title: "Hành động",
      render: (record: any) => (
        <Button
          type="primary"
          onClick={() => router.push(`/exam/${record.examId}/practice`)}
        >
          Chấm điểm
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách bài kiểm tra thực hành</h1>
      <div className="mb-4 flex items-center gap-4">
        <Select
          placeholder="Chọn lớp"
          allowClear
          options={allClass}
          style={{ width: 200 }}
          onChange={(value) => setFilterParams({ ...filterParams, classRoomId: value })}
        />
        <Input
          placeholder="Tìm theo tên bài kiểm tra"
          style={{ width: 300 }}
          onChange={(e) => setFilterParams({ ...filterParams, nameSearch: e.target.value })}
        />
      </div>
      <Table
        columns={columns}
        dataSource={examList}
        loading={isFetching}
        rowKey="examId"
        pagination={{ pageSize: 10, showSizeChanger: false, position: ["bottomCenter"] }}
      />
    </div>
  );
};

export default ScoreTest;
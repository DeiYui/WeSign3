"use client";
import { colors } from "@/assets/colors";
import { usePage } from "@/hooks/usePage";
import Exam from "@/model/Exam";
import Learning from "@/model/Learning";
import { RootState } from "@/store";
import { Button, Input, Select, Table, message, Modal } from "antd";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";

const ExamListPage: React.FC = () => {
  const router = useRouter();
  const user: any = useSelector((state: RootState) => state.admin);

  const [filterParams, setFilterParams] = useState({
    classRoomId: 0,
    nameSearch: "",
    isPrivate: "false",
  });

  const {
    page,
    pageSize,
    content,
    isFetching,
    pagination,
    refetch,
  } = usePage(["getLstExam", filterParams], Exam.getLstExam, { ...filterParams });

  // ✅ Refetch lại khi user quay về tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  const { data: allClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res?.data?.map((item) => ({
        value: item.classRoomId,
        label: item.content,
      }));
    },
  });

  const handleRedoExam = (examId: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc chắn muốn làm lại bài kiểm tra này không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await Exam.resetExam(examId);
          message.success("Đã làm mới bài kiểm tra.");
          router.push(`/exam/${examId}?redo=true`);
        } catch (error) {
          message.error("Lỗi khi làm lại bài kiểm tra.");
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div
          className="hover:cursor-pointer text-blue-500"
          onClick={() => router.push(`/exam/${record.examId}`)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Số câu hỏi",
      dataIndex: "numberOfQuestions",
    },
    {
      title: "Điểm số (Thang điểm 10)",
      dataIndex: "score",
      render: (value: number) => (value !== undefined ? <b>{value}</b> : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "score",
      render: (score: number) =>
        score !== undefined ? (
          <div className="rounded bg-green-100 px-4 py-2 text-green-700 text-center">Đã hoàn thành</div>
        ) : (
          <div className="rounded bg-neutral-200 px-4 py-2 text-neutral-700 text-center">Chưa hoàn thành</div>
        ),
    },
    {
      title: "Hành động",
      render: (record: any) =>
        record.score !== undefined ? (
          <Button type="primary" danger onClick={() => handleRedoExam(record.examId)}>
            Làm lại
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách bài kiểm tra</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          placeholder="Tìm theo tên"
          onChange={(e) => setFilterParams({ ...filterParams, nameSearch: e.target.value })}
        />
        <Select
          placeholder="Chọn lớp"
          allowClear
          options={allClass}
          onChange={(value) => setFilterParams({ ...filterParams, classRoomId: value })}
        />
        {(user?.role === "ADMIN" || user?.role === "TEACHER") && (
          <Select
            defaultValue={"false"}
            options={[
              { label: "Chung", value: "false" },
              { label: "Riêng", value: "true" },
            ]}
            onChange={(value) => setFilterParams({ ...filterParams, isPrivate: value })}
          />
        )}
      </div>
      <CustomTable
        dataSource={content}
        columns={columns}
        loading={isFetching}
        pagination={{ ...pagination, showSizeChanger: false }}
        rowKey="examId"
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ExamListPage;

const CustomTable = styled(Table)`
  .ant-table-tbody > tr:hover > td {
    background-color: #f9f9f9;
  }
`;

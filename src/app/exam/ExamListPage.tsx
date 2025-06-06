"use client";
import { colors } from "@/assets/colors";
import { usePage } from "@/hooks/usePage";
import Exam from "@/model/Exam";
import Learning from "@/model/Learning";
import { RootState } from "@/store";
import { Button, Input, Select, Table, message, Modal, Tag } from "antd";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ExamListPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user: any = useSelector((state: RootState) => state.admin);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filterParams, setFilterParams] = useState({
    classRoomId: 0,
    nameSearch: "",
    examType: "",
    isFinished: "",
    userId: user?.userId || 0,
  });

  // Debounce input (500ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Cập nhật filterParams.nameSearch mỗi khi debounce xong
  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      nameSearch: debouncedSearch,
    }));
  }, [debouncedSearch]);

  const {
    page,
    pageSize,
    content,
    isFetching,
    pagination,
    refetch,
  } = usePage(
    user?.userId ? ["getLstExam", filterParams] : [],
    Exam.getLstExam,
    { ...filterParams, pageSize: 10 }
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetch();
        queryClient.invalidateQueries({ queryKey: ["getLstExam"] });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient, refetch]);

  const { data: allClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClasses();
      return res?.content?.map((item: { classRoomId: number; name: string }) => ({
        value: item.classRoomId,
        label: item.name,
      }));
    },
  });

  const handleRedoExam = async (examId: number, examType: string) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc chắn muốn làm lại bài kiểm tra này không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      okButtonProps: {
      style: { backgroundColor: "#2f54eb", borderColor: "#2f54eb", color: "#fff" },
      },
      onOk: async () => {
        try {
          if (examType === "practice") {
            // Gọi API reset riêng cho thực hành
            await Exam.resetPracticeExam(examId, { userId: user.userId });
            message.success("Đã làm mới bài kiểm tra thực hành.");
            router.push(`/exam/${examId}/questionspractice?redo=true`);
          } else {
            await Exam.resetExam(examId, { userId: user.userId });
            message.success("Đã làm mới bài kiểm tra.");
            router.push(`/exam/${examId}/questionspage?redo=true`);
          }
        } catch (error) {
          message.error("Lỗi khi làm lại bài kiểm tra.");
        }
      },
    });
  };

  const examTypeOptions = [
    { label: "Tất cả", value: "" },
    { label: "Thực hành", value: "practice" },
    { label: "Trắc nghiệm", value: "quiz" },
  ];

  const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Đã hoàn thành", value: "1" },
    { label: "Chưa hoàn thành", value: "0" },
  ];

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
          onClick={() => {
            if (record.examType === "practice") {
              router.push(`/exam/${record.examId}/questionspractice`);
            } else {
              if (record.isFinished) {
                router.push(`/exam/${record.examId}/questionspage?review=true`);
              } else {
                router.push(`/exam/${record.examId}/questionspage`);
              }
            }
          }}
        >
          {examName}
        </div>
      ),
    },
    {
      title: "Loại bài kiểm tra",
      dataIndex: "examType",
      key: "examType",
      render: (examType: string) =>
        examType === "practice" ? (
          <Tag color="blue">Thực hành</Tag>
        ) : (
          <Tag color="green">Trắc nghiệm</Tag>
        ),
    },
    {
      title: "Lớp",
      dataIndex: "classRoomName",
      key: "classRoomName",
    },
    {
      title: "Số lần đã làm",
      dataIndex: "attemptCount",
      render: (attemptCount: number, record: any) =>
        record.isFinished ? attemptCount : "-",
    },
    {
      title: "Điểm cao nhất (Thang điểm 10)",
      dataIndex: "score",
      render: (value: number | string, record: any) =>
        record.isFinished ? <b>{Number(value)?.toFixed(1) ?? "0.0"}</b> : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isFinished",
      render: (isFinished: boolean) =>
        isFinished ? (
          <Tag color="green">Đã hoàn thành</Tag>
        ) : (
          <Tag>Chưa hoàn thành</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (record: any) => (
        <div className="space-x-2">
          {record.isFinished ? (
            <>
              <Button
                onClick={() =>
                  record.examType === "practice"
                    ? router.push(`/exam/${record.examId}/questionspractice?review=true`)
                    : router.push(`/exam/${record.examId}/questionspage?review=true`)
                }
              >
                Xem đáp án
              </Button>
              <Button
                danger
                type="primary"
                onClick={() => handleRedoExam(record.examId, record.examType)}
              >
                Làm lại
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              onClick={() =>
                record.examType === "practice"
                  ? router.push(`/exam/${record.examId}/questionspractice`)
                  : router.push(`/exam/${record.examId}/questionspage`)
              }
            >
              Làm bài
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách bài kiểm tra</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Select
          placeholder="Chọn lớp"
          allowClear
          options={allClass}
          onChange={(value) =>
            setFilterParams((prev) => ({ ...prev, classRoomId: value || 0 }))
          }
        />
        <Input
          placeholder="Tìm theo tên bài kiểm tra"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          placeholder="Loại bài kiểm tra"
          allowClear
          options={examTypeOptions}
          onChange={(value) =>
            setFilterParams((prev) => ({ ...prev, examType: value }))
          }
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          options={statusOptions}
          onChange={(value) =>
            setFilterParams((prev) => ({ ...prev, isFinished: value }))
          }
        />
      </div>
      <CustomTable
        dataSource={content}
        columns={columns}
        loading={isFetching}
        pagination={{
          ...pagination,
          pageSize: 10,
          showSizeChanger: false,
        }}
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

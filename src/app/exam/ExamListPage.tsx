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

  // useEffect(() => {
  //   if (!user?.userId) {
  //     router.push("/");
  //   }
  // }, [user, router]);

  const [filterParams, setFilterParams] = useState({
    classRoomId: 0,
    nameSearch: "",
    isPrivate: "false",
    userId: 0,
  });

  useEffect(() => {
    if (user?.userId) {
      setFilterParams((prev) => ({ ...prev, userId: user.userId }));
    }
  }, [user]);

  const {
    page,
    pageSize,
    content,
    isFetching,
    pagination,
    refetch,
  } = usePage(user?.userId ?["getLstExam", filterParams] : [], Exam.getLstExam, { ...filterParams });

  // ✅ Refetch lại khi user quay về tab
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
  }, [refetch, queryClient]);

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

  const handleRedoExam = (examId: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc chắn muốn làm lại bài kiểm tra này không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await Exam.resetExam(examId, { userId: user.userId });
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
      dataIndex: "examName",
      key: "examName",
      render: (examName: string, record: any) => (
        <div
          className="hover:cursor-pointer text-blue-500"
          onClick={() => {
            if (record.examType === "practice") {
              // Điều hướng đến QuestionsPractice nếu là bài kiểm tra thực hành
              router.push(`/exam/${record.examId}/practice`);
            } else {
              // Điều hướng đến QuestionsPage nếu là bài kiểm tra trắc nghiệm
              if (record.isFinished) {
                router.push(`/exam/${record.examId}?review=true`);
              } else {
                router.push(`/exam/${record.examId}`);
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
      title: "Số lần đã làm",
      dataIndex: "attemptCount",
      render: (attemptCount: number, record: any) => {
        if (record.isFinished) {
          return attemptCount;
        }
        return "-"; // Hiển thị dấu "-" nếu chưa làm bài
      },
    },
    {
      title: "Điểm cao nhất (Thang điểm 10)",
      dataIndex: "score",
      render: (value: number, record: any) => {
        if (record.isFinished) {
          return <b>{value !== undefined ? value.toFixed(1) : "0.0"}</b>;
        }
        return "-";
      },
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
      title: "Hành động",
      render: (record: any) => (
        <div className="space-x-2">
          {record.isFinished ? (
            <>
              <Button 
                type="default"
                onClick={() => 
                  router.push(
                    record.examType === "practice"
                      ? `/exam/${record.examId}/practice`
                      : `/exam/${record.examId}?review=true`
                  )
                }
              >
                Xem đáp án
              </Button>
              <Button 
                type="primary" 
                danger 
                onClick={() => handleRedoExam(record.examId)}
              >
                Làm lại
              </Button>
            </>
          ) : (
            <Button 
              type="primary"
              onClick={() => 
                router.push(
                  record.examType === "practice"
                    ? `/exam/${record.examId}/practice`
                    : `/exam/${record.examId}`
                )
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Select
          placeholder="Chọn lớp"
          allowClear
          options={allClass}
          onChange={(value) => setFilterParams({ ...filterParams, classRoomId: value })}
        />
        <Input
          placeholder="Tìm theo tên"
          onChange={(e) => setFilterParams({ ...filterParams, nameSearch: e.target.value })}
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
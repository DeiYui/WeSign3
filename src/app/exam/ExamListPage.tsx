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

interface ExamData {
  examId: number;
  name: string;
  numberOfQuestions: number;
  score?: number;
  // Trường finish không còn được trả về từ backend,
  // nên ta dựa vào score: nếu có score (kể cả bằng 0) thì coi như bài thi đã nộp.
}

const ExamListPage: React.FC = () => {
  const router = useRouter();
  const user: any = useSelector((state: RootState) => state.admin);

  // Tham số lọc: lớp, tìm kiếm theo tên, và loại bài kiểm tra (chung hay riêng)
  const [filterParams, setFilterParams] = useState<{
    classRoomId: number;
    nameSearch: string;
    isPrivate?: string;
  }>({
    classRoomId: 0,
    nameSearch: "",
    isPrivate: "false",
  });

  // Lấy danh sách bài thi qua hook usePage
  const { page, pageSize, content, isFetching, pagination, refetch } = usePage(
    ["getLstExam", filterParams],
    Exam.getLstExam,
    { ...filterParams }
  );

  // Khi trang được hiển thị lại, gọi lại API (nếu cần)
  useEffect(() => {
    refetch();
  }, []);

  // Lấy danh sách lớp học
  const { data: allClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res?.data?.map((item: { classRoomId: any; content: any }) => ({
        value: item.classRoomId,
        label: item.content,
      }));
    },
  });

  // Hàm xử lý "Làm lại"
  const handleRedoExam = (examId: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc chắn muốn làm lại bài kiểm tra này không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await Exam.resetExam(examId); // Gọi API reset exam
          message.success("Bài kiểm tra đã được làm lại thành công.");
          router.push(`/exam/${examId}?redo=true`); // Chuyển đến trang làm bài với chế độ redo
        } catch (error) {
          message.error("Có lỗi xảy ra khi làm lại bài kiểm tra.");
        }
      },
    });
  };

  // Các cột bảng
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      render: (value: any, record: ExamData, index: number) =>
        (page - 1) * pageSize + index + 1,
      width: 80,
    },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ExamData) => (
        <div
          className="hover:cursor-pointer"
          onClick={() => router.push(`/exam/${record.examId}`)}
        >
          <div className="text-blue-500">{text}</div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Số câu hỏi",
      dataIndex: "numberOfQuestions",
      key: "numberOfQuestions",
      width: 100,
    },
    {
      title: "Điểm số (Thang điểm 10)",
      dataIndex: "score",
      key: "score",
      width: 100,
      render: (value: number) =>
        value !== undefined ? <div className="font-bold">{value}</div> : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "score",
      key: "finish",
      render: (score: number) =>
        score !== undefined ? (
          <div className="caption-12-medium flex w-[120px] items-center justify-center rounded bg-green-100 px-4 py-2 text-green-700">
            Đã hoàn thành
          </div>
        ) : (
          <div className="caption-12-medium flex w-[128px] items-center justify-center rounded bg-neutral-200 px-4 py-2 text-neutral-700">
            Chưa hoàn thành
          </div>
        ),
      width: 100,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record: ExamData) =>
        record.score !== undefined ? (
          <Button type="primary" danger onClick={() => handleRedoExam(record.examId)}>
            Làm lại
          </Button>
        ) : null,
      width: 150,
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách bài kiểm tra</h1>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          className="w-full"
          placeholder="Tên bài kiểm tra"
          onChange={(e) =>
            setFilterParams({ ...filterParams, nameSearch: e.target.value })
          }
        />
        <Select
          className="w-full"
          allowClear
          placeholder="Lớp"
          options={allClass}
          onChange={(value) =>
            setFilterParams({ ...filterParams, classRoomId: value })
          }
        />
        {(user?.role === "ADMIN" || user?.role === "TEACHER") && (
          <Select
            className="w-full"
            allowClear
            placeholder="Loại bài kiểm tra"
            defaultValue={"false"}
            options={[
              { label: "Chung", value: "false" },
              { label: "Riêng", value: "true" },
            ]}
            onChange={(value) =>
              setFilterParams({ ...filterParams, isPrivate: value })
            }
          />
        )}
      </div>

      <CustomTable
        dataSource={content}
        columns={columns as any}
        scroll={{ x: 1100, y: 440 }}
        loading={isFetching}
        pagination={{ ...pagination, showSizeChanger: false }}
        rowKey="examId"
      />
    </div>
  );
};

export default ExamListPage;

export const CustomTable = styled(Table)`
  .ant-table-tbody {
    padding: 10px 16px;
  }
  .ant-table-tbody > tr > td {
    padding: 10px 16px;
    background-color: white;
  }
  .ant-table-cell.ant-table-cell-with-append {
    display: flex;
    padding-left: 0;
  }
  .ant-table-tbody > tr:hover {
    background-color: #f6f7f9;
  }
  .ant-table-thead .ant-table-cell {
    background-color: ${colors.neutral200};
    color: ${colors.neutral800};
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
  }
  .ant-table-row {
    color: ${colors.neutral1100};
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > th,
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-wrapper .ant-table-tbody > tr > th.ant-table-cell-row-hover,
  .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background: ${colors.neutral100};
  }
  .ant-pagination.ant-table-pagination.ant-table-pagination-right {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ant-pagination-item {
    width: 32px;
    height: 32px;
    border-color: white;
    border-radius: 50%;
    color: ${colors.neutral1100} !important;
  }
  .ant-pagination-item.ant-pagination-item-active {
    background-color: ${colors.neutral200} !important;
  }
  .ant-pagination .ant-pagination-item-active a {
    color: ${colors.neutral1100} !important;
    font-size: 14px;
  }
  .ant-table-body {
    scrollbar-width: auto;
    scrollbar-color: auto;
  }
  .ant-table-body::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .ant-table-body::-webkit-scrollbar-track {
    background-color: transparent;
  }
  .ant-table-body::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-color: #babac0;
  }
`;

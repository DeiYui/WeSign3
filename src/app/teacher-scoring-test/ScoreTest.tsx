"use client";
import { usePage } from "@/hooks/usePage";
import Exam from "@/model/Exam";
import Learning from "@/model/Learning";
import { Table, Select, Input, Tag, Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const ScoreTest: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.admin);
  const [examList, setExamList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [filterParams, setFilterParams] = useState({
    classRoomId: 0,
    name: "", // Changed from nameSearch to name to match backend
    isPrivate: "false",
    examType: "practice", 
    isFinished: "", 
  });

  // Lấy danh sách lớp
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

  // Lấy danh sách bài kiểm tra thực hành 
  const fetchExams = React.useCallback(async () => {
    const teacherId = user.userId;
    try {
      setLoading(true);
      const data = await Exam.getListPracticeExam(filterParams, teacherId );
      setExamList(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExamList([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  // Effect để gọi API khi filterParams thay đổi
  useEffect(() => {
    fetchExams();
  }, [filterParams, fetchExams]);

  // Handler for name search with debounce
  const handleNameSearch = (value: string) => {
    setFilterParams({ ...filterParams, name: value });
  };

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
          onClick={() => router.push(`/grading-test/${record.examId}/${record.userId}`)}
        >
          {examName}
        </div>
      ),
    },
    {
      title: "Loại bài kiểm tra",
      dataIndex: "examType",
      key: "examType",
      render: () => <Tag color="blue">Thực hành</Tag>,
    },
    {
      title: "Lớp",
      dataIndex: "classRoomName",
      key: "classRoomName",
      render: (value: string) => <span>{value}</span>,
    },
    {
      title: "Học sinh",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <span>{value}</span>,
    },
    {
      title: "Hành động",
      render: (record: any) => (
        <Button
          type="primary"
          onClick={() => router.push(`/grading-test/${record.examId}/${record.userId}`)}
          style={{background: "#2f54eb"}}
        >
          Chấm điểm
        </Button>
      ),
    },
  ];

  const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Đã hoàn thành", value: "1" },
    { label: "Chưa hoàn thành", value: "0" },
  ];

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách bài kiểm tra thực hành</h1>
      <div className="mb-4 flex items-center gap-4">
        {/* <Select
          placeholder="Chọn lớp"
          allowClear
          options={allClass}
          style={{ width: 200 }}
          onChange={(value) => setFilterParams({ ...filterParams, classRoomId: value || 0 })}
        /> */}
        <Input
          placeholder="Tìm theo tên bài kiểm tra"
          style={{ width: 220 }}
          value={filterParams.name}
          onChange={(e) => handleNameSearch(e.target.value)}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={examList}
        loading={loading}
        rowKey={(record) => `${record.examId}-${record.userId}`} // More unique key
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          position: ["bottomCenter"],
          total: examList.length,
        }}
      />
    </div>
  );
};

export default ScoreTest;
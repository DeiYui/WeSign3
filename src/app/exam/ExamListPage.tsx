/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useQuery} from "@tanstack/react-query";
import { Button, Select, message, Modal, Tag } from "antd";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import Exam from "@/model/Exam";
import Learning from "@/model/Learning";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import { CustomTable } from "../../app/(admin)/learning-management/check-list/ExamList";

interface ExamItem {
  examId: number;
  examName: string;
  examType: string,
  classRoomName: string,
  attemptCount: number,
  score: number,
  isFinished: string,
}

const ExamList: React.FC = () => {
  const user = useSelector((state: RootState) => state.admin);
  const router = useRouter();

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [filterParams, setFilterParams] = useState({
    classRoomName: "",
    nameSearch: "",
    examType: "",
    isFinished: "",
    userId: user?.userId || 0,
  });

  // Update filterParams when selectedType changes
  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      examType: selectedType,
    }));
  }, [selectedType]);

  // Fetch exams with filters and pagination
  const { isFetching, refetch } = useQuery({
    queryKey: ["getExamList", filterParams, currentPage, user?.userId],
    queryFn: async () => {
      const res = await Exam.getLstExam({
        userId: user.userId,   
        name: filterParams.nameSearch,
        classRoomName: filterParams.classRoomName || undefined,
        examType: filterParams.examType || undefined, // Use filterParams instead of selectedType directly
        isFinished: filterParams.isFinished || undefined,
        page: currentPage - 1,
        take: pageSize,
        orderBy: "examId",
        sortBy: "DESC",
      });
 
      setTotal(res.data.meta.itemCount);
      const mapped = res.data.content.map((item: any) => ({
        examId: item.examId,
        examName: item.examName,
        examType: item.examType,
        classRoomName: item.classRoomName,
        attemptCount: item.attemptCount,
        score: item.score,
        isFinished: item.isFinished,
      }));
      setExams(mapped);
      return mapped;
    },
  });

  const handleTableChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const { data: allClasses, isFetching: isFetchingClasses } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClasses();
      return res?.content?.map((item: { name: string; classRoomId: number }) => ({
        label: item.name,
        value: Number(item.classRoomId),
      }));
    },
  });

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
      key: "index",
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
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
    // {
    //   title: "Lớp",
    //   dataIndex: "classRoomName",
    //   key: "classRoomName",
    // },
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
              style={{background: "#2f54eb"}}
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
    }
  ].filter(Boolean);

  const handleSearch = useCallback(
    debounce((value: string) => {
      setCurrentPage(1);
      setFilterParams((prev) => ({ ...prev, nameSearch: value }));
    }, 300),
    []
  );

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách bài kiểm tra</h1>
      <div className="mb-4 flex items-center justify-between">
        <InputPrimary
          allowClear
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Tìm kiếm tên bài kiểm tra"
          style={{ width: 400 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchText);
            }
          }}
        />
        {/* <Select
          options={allClasses || []}
          placeholder="Lựa chọn lớp"
          loading={isFetchingClasses}
          allowClear
          showSearch
          optionFilterProp="label"
          value={filterParams.classRoomName || undefined}
          onChange={(value) =>
            setFilterParams((prev) => ({
              ...prev,
              classRoomName: value || "",
            }))
          }
        /> */}

        <Select
          placeholder="Loại bài kiểm tra"
          allowClear
          options={examTypeOptions}
          value={selectedType || undefined}
          onChange={(value) => {
            setSelectedType(value || "");
            setCurrentPage(1);
          }}
        />

        <Select
          placeholder="Trạng thái"
          allowClear
          options={statusOptions}
          value={filterParams.isFinished || undefined}
          onChange={(value) =>
            setFilterParams((prev) => ({
              ...prev,
              isFinished: value || "",
            }))
          }
        />
      </div>

      <CustomTable
        columns={columns as any}
        dataSource={exams}
        loading={isFetching}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          total: total,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />
    </div>
  );
};

export default ExamList;

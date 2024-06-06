"use client";
import { MediaUpload } from "@/components/UI/Upload/UploadFile";
import Learning from "@/model/Learning";
import { validateRequire } from "@/utils/validation/validtor";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Collapse,
  Form,
  Input,
  Modal,
  Pagination,
  Radio,
  Select,
  Spin,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useEffect, useMemo, useState } from "react";
import QuestionModal from "./ModalSelectFile";
import ModalChooseQuestions from "./ModalChooseQuestions";
import Questions from "@/model/Questions";

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  files: UploadFile[];
  answers: Answer[];
  type: "single" | "multiple";
}

const { Panel } = Collapse;

const CreateAndEditExamPage: React.FC = () => {
  const [form] = useForm();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const questionsPerPage = 10;

  // Modal chọn câu hỏi
  const [openChooseQuestions, setOpenChooseQuestions] = useState<{
    open: boolean;
    topicId: number;
    size: number;
  }>({ open: false, topicId: 0, size: 0 });

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

  const params = useMemo(() => {
    return {
      page: 0,
      size: openChooseQuestions.size,
      topicId: openChooseQuestions.topicId,
    };
  }, [openChooseQuestions]);

  // API lấy danh sách câu hỏi
  const { data: limitQuestion, isFetching } = useQuery({
    queryKey: ["getLimitQuestionTopic", params],
    queryFn: async () => {
      const res = await Questions.getLimitQuestionTopic(params);
      return res?.data;
    },
    enabled: openChooseQuestions.open,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Thêm bài kiểm tra</h1>
        <Form
          form={form}
          onFinish={(value) => {
            console.log("value", value);
          }}
          layout="vertical"
        >
          <Form.Item
            label="Chủ đề"
            name="topicId"
            required
            rules={[validateRequire("Chủ đề không được bỏ trống")]}
          >
            <Select
              placeholder="Chọn chủ đề"
              options={allTopics}
              onChange={(e) => {
                setOpenChooseQuestions({ ...openChooseQuestions, topicId: e });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Số câu hỏi muốn tạo (không quá 100):"
            name="numQuestions"
            required
            rules={[validateRequire("Số lượng câu hỏi không được bỏ trống")]}
          >
            <Input
              placeholder="Nhập số lượng câu hỏi"
              type="number"
              maxLength={100}
              onChange={(e) => {
                setOpenChooseQuestions({
                  ...openChooseQuestions,
                  size: Number(e.target.value),
                });
              }}
            />
          </Form.Item>
          <Button
            type="primary"
            className=""
            onClick={() =>
              setOpenChooseQuestions({ ...openChooseQuestions, open: true })
            }
          >
            Chọn câu hỏi
          </Button>
          <Form.Item name="questionIds">
            {/* Modal danh sách các câu hỏi */}

            <ModalChooseQuestions
              questions={limitQuestion}
              open={openChooseQuestions.open}
              onClose={() =>
                setOpenChooseQuestions({ ...openChooseQuestions, open: false })
              }
            />
          </Form.Item>

          <div className="flex items-center justify-center gap-4">
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </div>
        </Form>

        {/* Page */}
        {questions?.length > 0 ? (
          <Pagination
            current={currentPage}
            pageSize={questionsPerPage}
            total={openChooseQuestions.size}
            onChange={handlePageChange}
          />
        ) : null}
      </div>
    </>
  );
};

export default CreateAndEditExamPage;

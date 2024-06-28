"use client";
import { MediaUpload } from "@/components/UI/Upload/UploadFile";
import Learning from "@/model/Learning";
import {
  validateRequire,
  validateRequireInput,
} from "@/utils/validation/validtor";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import Exam from "@/model/Exam";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const [form] = useForm();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const questionsPerPage = 10;
  const searchParams = useSearchParams();
  const isPrivate = searchParams.get("isPrivate");
  const id = searchParams.get("id");
  // list câu hỏi
  const lstQuestions = Form.useWatch("lstQuestions", form);

  useEffect(() => {
    form.setFieldValue(
      "questionIds",
      lstQuestions?.map((item: any) => item.questionId),
    );
  }, [form, lstQuestions]);

  // Modal chọn câu hỏi
  const [openChooseQuestions, setOpenChooseQuestions] = useState<{
    open: boolean;
    classRoomId: number;
    size: number;
  }>({ open: false, classRoomId: 0, size: 0 });

  // API lấy danh sách  topics
  const { data: allTopics } = useQuery({
    queryKey: ["getAllTopics", isPrivate],
    queryFn: async () => {
      const res = await Learning.getAllTopics({ isPrivate: isPrivate });
      return res?.data?.map((item: { topicId: any; content: any }) => ({
        id: item.topicId,
        value: item.topicId,
        label: item.content,
        text: item.content,
      }));
    },
    enabled: !!isPrivate,
  });

  // chi tiết bài kiểm tra
  const { data: detailExam, refetch } = useQuery({
    queryKey: ["detailExamsForUser", id],
    queryFn: async () => {
      const res = await Exam.detailExamsForUser(Number(id));
      form.setFieldsValue(res?.data);
      return res?.data;
    },
    enabled: !!id,
  });

  // Dánh sách lớp
  const { data: allClass, isFetching: isFetchingClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res?.data?.map((item: { classRoomId: any; content: any }) => ({
        value: item.classRoomId,
        label: item.content,
      }));
    },
    enabled: !!isPrivate,
  });

  const params = useMemo(() => {
    return {
      page: 0,
      size: openChooseQuestions.size,
      classRoomId: openChooseQuestions.classRoomId,
    };
  }, [openChooseQuestions]);

  // API lấy danh sách câu hỏi
  const { data: limitQuestion, isFetching } = useQuery({
    queryKey: ["getLimitQuestionCLassRoom", params],
    queryFn: async () => {
      const res = await Questions.getLimitQuestionCLassRoom(params);
      return res?.data;
    },
    enabled: openChooseQuestions.open,
  });

  // Thêm bài kiểm tra
  const addExam = useMutation({
    mutationFn: Exam.addExam,
    onSuccess: async () => {
      // Thông báo thành công
      message.success("Thêm bài kiểm tra thành công thành công");

      router.push(
        isPrivate === "true"
          ? "/learning-management/check-list/private"
          : "/learning-management/check-list/public",
      );
    },
    onError: () => {
      message.error("Thêm bài kiểm tra thất bại");
    },
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
            // convert
            const req = {
              name: value.name,
              questionIds: value.questionIds,
              classRoomId: value.classRoomId,
              private: isPrivate,
            };
            addExam.mutate(req);
          }}
          layout="vertical"
        >
          <Form.Item
            label="Lớp "
            name="classRoomId"
            className="mb-2"
            required
            rules={[validateRequire("Lớp không được bỏ trống")]}
          >
            <Select
              placeholder="Chọn lớp"
              options={allClass}
              onChange={(e) => {
                setOpenChooseQuestions({
                  ...openChooseQuestions,
                  classRoomId: e,
                });
                form.setFieldValue("lstQuestions", []);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Tên bài kiểm tra"
            name="name"
            required
            className="mb-2"
            rules={[
              validateRequireInput("Tên bài kiểm tra không được bỏ trống"),
            ]}
          >
            <Input placeholder="Nhập tên bài kiểm tra" />
          </Form.Item>

          <Form.Item
            label="Số câu hỏi"
            name="numQuestions"
            className="mb-2"
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
          <Form.Item name="questionIds" noStyle>
            {/* Modal danh sách các câu hỏi */}

            <ModalChooseQuestions
              questions={limitQuestion}
              open={openChooseQuestions.open}
              onClose={() =>
                setOpenChooseQuestions({ ...openChooseQuestions, open: false })
              }
              loading={isFetching}
            />
          </Form.Item>

          <Form.Item name="lstQuestions" hidden noStyle />
          {lstQuestions?.length ? (
            <div className="mt-2 flex flex-col gap-y-2 bg-white p-2">
              <div className="text-xl font-bold">Danh sách câu hỏi </div>

              {lstQuestions?.map((e: any) => (
                <>
                  <div
                    key={e}
                    className="body-14-regular rounded-lg p-2 hover:cursor-default hover:bg-primary-200"
                  >
                    {e.content}
                  </div>
                </>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-center gap-4">
            <Button
              onClick={() =>
                router.push(
                  isPrivate === "true"
                    ? "/learning-management/check-list/private"
                    : "/learning-management/check-list/public",
                )
              }
            >
              Huỷ
            </Button>
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

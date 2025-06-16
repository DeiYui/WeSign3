/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Exam from "@/model/Exam";
import Learning from "@/model/Learning";
import Questions from "@/model/Questions";
import {
  validateRequire,
  validateRequireInput,
} from "@/utils/validation/validtor";
import { DeleteFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Collapse,
  Form,
  Input,
  Pagination,
  Select,
  Spin,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import type { UploadFile } from "antd/es/upload/interface";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import ModalChooseQuestions from "./ModalChooseQuestions";

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
  const [examType, setExamType] = useState<string | null>(null); 
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [topicOptions, setTopicOptions] = useState<any[]>([]);
  const [vocabOptions, setVocabOptions] = useState<{ [key: number]: any[] }>(
    {},
  );
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
      // const res = await Exam.detailExamsForUser(Number(id));
      const res = await Exam.getDetailExam(Number(id));
      form.setFieldsValue({
        ...res?.data,
        numQuestions: res.data?.numberOfQuestions,
      });
      setOpenChooseQuestions({
        ...openChooseQuestions,
        classRoomId: res?.data.classRoomId,
      });

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
  // const { data: limitQuestion, isFetching } = useQuery({
  //   queryKey: ["getLimitQuestionCLassRoom", params],
  //   queryFn: async () => {
  //     const res = await Questions.getLimitQuestionCLassRoom(params);
  //     return res?.data;
  //   },
  //   enabled: openChooseQuestions.open,
  // });

  // Lấy câu hỏi theo bài kiểm tra
  const { data: limitQuestion, isFetching: isFetchingQExams } = useQuery({
    queryKey: ["getLstQuestionExam"],
    queryFn: async () => {
      const res = await Questions.getLstQuestionExam(detailExam.examId);
      form.setFieldValue("lstQuestions", res?.data);
      return res?.data;
    },
    enabled: detailExam && !!detailExam?.examId,
  });

  // Thêm bài kiểm tra
  const addExam = useMutation({
    mutationFn: Exam.addExam,
    onSuccess: async () => {
      // Thông báo thành công
      message.success("Thêm bài kiểm tra trắc nghiệm thành công");

      router.push(
        isPrivate === "true"
          ? "/learning-management/check-list/private"
          : "/learning-management/check-list/public",
      );
    },
    onError: () => {
      message.error("Thêm bài kiểm tra trắc nghiệm thất bại");
    },
  });

    const addPracticeExam = useMutation({
    mutationFn: Exam.addPracticeExam,
    onSuccess: async () => {
      message.success("Thêm bài kiểm tra thực hành thành công");
      router.push(
        isPrivate === "true"
          ? "/learning-management/check-list/private"
          : "/learning-management/check-list/public",
      );
    },
    onError: () => {
      message.error("Thêm bài kiểm tra thực hành thất bại");
    },
  });

  const editExamMutation = useMutation({
    mutationFn: Exam.editExams,
    onSuccess: async () => {
      // Thông báo thành công
      message.success("Chỉnh sửa bài kiểm tra thành công");

      router.push(
        isPrivate === "true"
          ? "/learning-management/check-list/private"
          : "/learning-management/check-list/public",
      );
    },
    onError: () => {
      message.error("Chỉnh sửa bài kiểm tra thất bại");
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    // Lấy danh sách chủ đề
    Learning.getAllTopics().then((res) => {
      setTopicOptions(
        res?.data?.map((item: any) => ({
          value: item.topicId,
          label: item.content,
        })) || [],
      );
    });
  }, []);

  const fetchVocabulary = async (topicId: number, index: number) => {
    if (!topicId) return;
    const res = await Learning.getVocabularyTopic(topicId);
    setVocabOptions((prev) => ({
      ...prev,
      [index]: res?.data?.map((item: any) => ({
        value: item.vocabularyId,
        label: item.content,
      })) || [],
    }));
  };

  // Thêm state lưu practiceQuestions
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);

  // Hàm xử lý thay đổi chủ đề hoặc từ vựng cho từng câu hỏi
  const handlePracticeQuestionChange = (index: number, key: string, value: any) => {
    setPracticeQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
    form.setFieldValue("practiceQuestions", [
      ...(form.getFieldValue("practiceQuestions") || []).map((q: any, i: number) =>
        i === index ? { ...q, [key]: value } : q
      ),
    ]);
    // Nếu đổi chủ đề thì reset từ vựng
    if (key === "topicId") {
      setVocabOptions(prev => ({ ...prev, [index]: [] }));
      fetchVocabulary(value, index);
      handlePracticeQuestionChange(index, "vocabularyId", undefined);
    }
  };

  // Khi Form.List thay đổi, đồng bộ lại state
  useEffect(() => {
    const qs = form.getFieldValue("practiceQuestions") || [];
    setPracticeQuestions(qs);
  }, [form.getFieldValue("practiceQuestions")]);

  return (
    <Spin
      spinning={
        editExamMutation.isPending || addExam.isPending || isFetchingQExams
      }
    >
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Thêm bài kiểm tra</h1>

      <Form
        form={form}
        onFinish={async (value) => {
          let reqAdd;

          if (examType === "quiz") {
            reqAdd = {
              name: value.name,
              questionIds: value.questionIds,
              classRoomId: value.classRoomId,
              isPrivate: isPrivate,
              numberOfQuestions: value.numQuestions
            };
            if (id) {
              editExamMutation.mutate(reqAdd);
            } else {
              addExam.mutate(reqAdd);
            }
          } else {
            const practiceQs = (value.practiceQuestions || []).map((q: any, idx: number) => {
              const vocab = (vocabOptions[idx] || []).find(v => v.value === q.vocabularyId);
              const vocabName = vocab ? vocab.label : "";
              return {
                ...q,
                content: q.content && vocabName ? `${q.content} - ${vocabName}` : q.content,
              };
            });

            reqAdd = {
              name: value.name,
              practiceWords: practiceQs,
              classRoomId: value.classRoomId,
              isPrivate: isPrivate,
            };


            if (id) {
              editExamMutation.mutate(reqAdd);
            } else {
              addPracticeExam.mutate(reqAdd); // ✅ Gửi thực hành
            }
          }
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
          <Form.Item name="examId" hidden />
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
            label="Loại bài kiểm tra"
            name="examType"
            className="mb-2"
            required
            rules={[validateRequire("Loại bài kiểm tra không được bỏ trống")]}
          >
            <Select
              placeholder="Chọn loại bài kiểm tra"
              options={[
                { value: "quiz", label: "Bài kiểm tra trắc nghiệm" },
                { value: "practice", label: "Bài kiểm tra thực hành" },
              ]}
              onChange={(value) => {
                setExamType(value); // Cập nhật trạng thái examType
                form.setFieldValue("examType", value);
                form.setFieldValue("lstQuestions", []);
                form.setFieldValue("practiceWords", []);
              }}
            />
          </Form.Item>

          {/* Hiển thị động dựa trên loại bài kiểm tra */}
          {examType === "quiz" && (
            <>
              <Form.Item
                label="Số câu hỏi"
                name="numQuestions"
                className="mb-2"
                required
                rules={[validateRequire("Số lượng câu hỏi không được bỏ trống")]}
              >
                <Input
                  disabled={!openChooseQuestions.classRoomId}
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
                style={{background: "#2f54eb"}}
                disabled={
                  form.getFieldValue("numQuestions") > limitQuestion?.length
                }
                onClick={() =>
                  setOpenChooseQuestions({ ...openChooseQuestions, open: true })
                }
              >
                Chọn câu hỏi
              </Button>
              <Form.Item name="questionIds" noStyle>
                <ModalChooseQuestions
                  questions={limitQuestion}
                  open={openChooseQuestions.open}
                  onClose={() =>
                    setOpenChooseQuestions({
                      ...openChooseQuestions,
                      open: false,
                    })
                  }
                  number={openChooseQuestions.size}
                  loading={isFetchingQExams}
                />
              </Form.Item>
            </>
          )}        
          {examType === "practice" && (
            <>
              <Form.List name="practiceQuestions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key} className="mb-4 border p-4 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-md font-semibold">Câu hỏi {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              onClick={() => remove(name)}
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                        <Form.Item
                          {...restField}
                          name={[name, "content"]}
                          // fieldKey={[fieldKey, "content"]}
                          label="Nội dung câu hỏi"
                          rules={[{ required: true, message: "Vui lòng nhập nội dung câu hỏi" }]}
                        >
                          <Input
                            placeholder="Nhập nội dung câu hỏi"
                            onChange={e => handlePracticeQuestionChange(index, "content", e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Chủ đề"
                          name={[name, "topicId"]}
                          rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
                        >
                          <Select
                            placeholder="Chọn chủ đề"
                            options={topicOptions}
                            onChange={value => handlePracticeQuestionChange(index, "topicId", value)}
                            value={practiceQuestions[index]?.topicId}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Từ vựng"
                          name={[name, "vocabularyId"]}
                          rules={[{ required: true, message: "Vui lòng chọn từ vựng" }]}
                        >
                          <Select
                            placeholder="Chọn từ vựng"
                            options={vocabOptions[index] || []}
                            value={practiceQuestions[index]?.vocabularyId}
                            onChange={value => handlePracticeQuestionChange(index, "vocabularyId", value)}
                            disabled={!practiceQuestions[index]?.topicId}
                          />
                        </Form.Item>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ content: "" })}
                      block
                    >
                      + Thêm câu hỏi
                    </Button>
                  </>
                )}
              </Form.List>
            </>
          )}

          <Form.Item name="questionIds" noStyle>
            {/* Modal danh sách các câu hỏi */}
            <ModalChooseQuestions
              questions={limitQuestion}
              open={openChooseQuestions.open}
              onClose={() =>
                setOpenChooseQuestions({ ...openChooseQuestions, open: false })
              }
              number={openChooseQuestions.size}
              loading={isFetchingQExams}
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
                    className="body-14-regular group flex items-center justify-between rounded-lg p-2 pr-4 hover:cursor-default hover:bg-primary-200"
                  >
                    {e.content}
                    <div
                      className="opacity-0 hover:cursor-pointer group-hover:opacity-100"
                      onClick={() => {
                        form.setFieldValue(
                          "lstQuestions",
                          lstQuestions?.filter(
                            (question: { questionId: any }) =>
                              question?.questionId !== e?.questionId,
                          ),
                        );
                      }}
                    >
                      <DeleteFilled />
                    </div>
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
            <Button type="primary" htmlType="submit" style={{background: "#2f54eb"}}>
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
    </Spin>
  );
};

export default CreateAndEditExamPage;

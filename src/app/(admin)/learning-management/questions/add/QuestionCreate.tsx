"use client";
import { MediaUpload } from "@/components/UI/Upload/UploadFile";
import { isImage } from "@/components/common/constants";
import Learning from "@/model/Learning";
import Questions from "@/model/Questions";
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
  Image,
  Input,
  Pagination,
  Radio,
  Select,
  Spin,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import QuestionModal from "../../check-list/create-edit/ModalSelectFile";

interface Answer {
  content?: string;
  imageLocation: string;
  videoLocation: string;
  correct: boolean;
  fileType?: string; // Thêm dòng này
  file?: string; // Thêm dòng này
}

interface Question {
  content: string;
  explanation: string;
  imageLocation: string;
  videoLocation: string;
  topicId: number;
  answerReqs: Answer[];
  type?: string;
  file?: string;
  typeFile?: string; // Thêm dòng này
}
const { Panel } = Collapse;

const initAnswerValue = {
  content: "",
  imageLocation: "",
  videoLocation: "",
  correct: false,
};

// Convert form data to API request format
function convertQuestions(input: any) {
  return input.questions.map((question: any) => ({
    content: question.content || "",
    explanation: "",
    imageLocation: isImage(question.file) ? question.file || "" : "",
    videoLocation: !isImage(question.file) ? question.file : "",
    classRoomId: input.classRoomId,
    questionType: question.type|| "ONE_ANSWER",
    fileType: question.typeFile|| "TEXT",
    answerReqs: question.answerReqs.map((answer: any) => ({
      content: answer.content || "", // Ensure content is always a string
      imageLocation: isImage(answer.file) ? answer.file || "" : "", // Handle file uploads
      videoLocation: !isImage(answer.file) && answer.file ? answer.file : "", // Handle video uploads
      correct: answer.correct,
      fileType: answer.fileType || "TEXT", 
    })),
  }));
}

const QuestionCreate: React.FC = () => {
  const router = useRouter();
  const [form] = useForm();
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const questionsPerPage = 10;

  const questions: Question[] = Form.useWatch("questions", form);

  const [openChooseVideo, setOpenChooseVideo] = useState<boolean>(false);
  const [openChooseAnswerVideo, setOpenChooseAnswerVideo] = useState<Record<string, boolean>>({});
  // Danh sách lớp
  const { data: allClass, isFetching: isFetchingClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res?.data?.map((item: { classRoomId: any; content: any }) => ({
        value: item.classRoomId,
        label: item.content,
      }));
    },
  });

  const mutationAdd = useMutation({
    mutationFn: Questions.addQuestionForExam,
    onSuccess: () => {
      message.success("Thêm mới câu hỏi thành công");
      router.push("/learning-management/questions");
    },
  });

  const handleNumQuestionsChange = (value: number) => {
    const newValue = Math.min(100, Math.max(0, value));
    setNumQuestions(newValue);
    form.setFieldValue(
      "questions",
      Array.from({ length: newValue }, () => ({
        content: "",
        explanation: "",
        imageLocation: "",
        videoLocation: "",
        classRoomId: 0,
        type: "ONE_ANSWER",
        answerReqs: [], // Không có đáp án mặc định
      })),
    );
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any,
  ) => {
    const updatedQuestions = questions?.map((q, i) =>
      i === index ? { ...q, [field]: value } : q,
    );
    form.setFieldValue("questions", updatedQuestions);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentQuestions = questions?.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage,
  );

  const lstQuestions = form.getFieldsValue();

  return (
    <div className="container mx-auto bg-white p-4">
      <h1 className="mb-4 text-2xl font-bold">Thêm câu hỏi</h1>
      <Form
        form={form}
        onFinish={(value) => {
          const newValue = convertQuestions(value);
          mutationAdd.mutate(newValue);
        }}
        layout="vertical"
      >
        <Form.Item
          label="Lớp học"
          name="classRoomId"
          required
          rules={[validateRequire("Lớp học không được bỏ trống")]}
        >
          <Select
            loading={isFetchingClass}
            placeholder="Chọn lớp"
            options={allClass}
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
            value={numQuestions}
            onChange={(e) =>
              handleNumQuestionsChange(parseInt(e.target.value, 10))
            }
          />
        </Form.Item>
        <Form.Item name="questions" hidden />
        <Collapse accordion className="mb-4 bg-white">
          {currentQuestions?.map((question, index) => (
            <Panel
              header={`Câu hỏi ${(currentPage - 1) * questionsPerPage + index + 1}`}
              key={index}
            >
              <div key={index} className="mb-6 rounded border bg-white p-4">
                <h2 className="mb-2 text-xl font-bold">
                  Câu hỏi {(currentPage - 1) * questionsPerPage + index + 1}
                </h2>

                {/* Kiểu câu hỏi */}
                <Form.Item
                  name={["questions", index, "type"]}
                  label="Kiểu câu hỏi:"
                  required
                  rules={[validateRequireInput("Vui lòng chọn loại câu hỏi")]}
                  initialValue={"ONE_ANSWER"}
                >
                  <Select
                    value={question.type}
                    onChange={(value) => handleQuestionChange(index, "type", value)}
                    placeholder="Chọn loại câu hỏi"
                    options={[
                      { label: "Một đáp án", value: "ONE_ANSWER" },
                      { label: "Nhiều đáp án", value: "MULTIPLE_ANSWERS" },
                    ]}
                  />
                </Form.Item>  

                {/* Tên câu hỏi */}
                <Form.Item
                  label="Tên câu hỏi:"
                  name={["questions", index, "content"]}
                  required
                  rules={[
                    validateRequireInput("Tên câu hỏi không được bỏ trống"),
                  ]}
                >
                  <Input placeholder="Nhập câu hỏi" />
                </Form.Item>

                {/* Lựa chọn câu hỏi */}
                <Form.Item
                  name={["questions", index, "typeFile"]}
                  label="Lựa chọn câu hỏi (hình ảnh, video, từ):"
                  className="mb-0"
                  required
                  rules={[validateRequire("Không được bỏ trống trường này")]}
                >
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn hoặc tải lên câu hỏi"
                    onChange={(value) => handleQuestionChange(index, "typeFile", value)}
                  >
                    <Select.Option value="NOT_EXISTED">Tải lên mới</Select.Option>
                    <Select.Option value="EXISTED">Chọn từ dữ liệu có sẵn</Select.Option>
                    <Select.Option value="TEXT">Nhập câu hỏi bằng từ</Select.Option>
                  </Select>
                </Form.Item>

                {/* Hiển thị trường nhập nếu chọn "Nhập câu hỏi bằng từ" */}
                {question.typeFile === "TEXT" && (
                  <Form.Item
                    name={["questions", index, "content"]}
                    label="Nhập câu hỏi:"
                    required
                    rules={[validateRequireInput("Vui lòng nhập câu hỏi")]}
                  >
                    <Input placeholder="Nhập câu hỏi" />
                  </Form.Item>
                )}

                <div className="mt-2">
                  {lstQuestions.questions?.length && (
                    <>
                      <Form.Item
                        name={["questions", index, "file"]}
                        className="mb-2"
                        required
                        hidden={
                          lstQuestions?.questions[index]?.typeFile ===
                          "NOT_EXISTED"
                        }
                      >
                        {lstQuestions?.questions[index]?.typeFile ===
                          "EXISTED" && (
                          <QuestionModal
                            openChooseVideo={openChooseVideo}
                            setOpenChooseVideo={setOpenChooseVideo}
                            file={lstQuestions?.questions[index]?.file}
                          >
                            <div
                              onClick={() => {
                                setOpenChooseVideo(true);
                              }}
                            >
                              <Button>Chọn file</Button>
                              {lstQuestions?.questions[index]?.file && (
                                <div className="">
                                  {isImage(
                                    lstQuestions?.questions[index]?.file,
                                  ) ? (
                                    <Image
                                      preview={false}
                                      alt="example"
                                      style={{
                                        width: 200,
                                        height: 200,
                                        objectFit: "contain",
                                      }}
                                      src={lstQuestions?.questions[index]?.file}
                                    />
                                  ) : (
                                    <video
                                      controls
                                      style={{ width: 200, height: 200 }}
                                    >
                                      <source
                                        src={
                                          lstQuestions?.questions[index]?.file
                                        }
                                        type="video/mp4"
                                      />
                                    </video>
                                  )}
                                </div>
                              )}
                            </div>
                          </QuestionModal>
                        )}
                      </Form.Item>
      

                      {/* Nếu tải lên mới */}
                      {question.typeFile === "NOT_EXISTED" && (
                        <MediaUpload />
                      )}
                    </>
                  )}
                </div>

                

                {/* Đáp án */}
                <Form.List name={["questions", index, "answerReqs"]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, answerIndex) => (
                        <div key={field.key} className="flex w-full items-center gap-4">
                          <div className="mb-2 flex items-center gap-2">
                            {/* Checkbox đáp án đúng */}
                            <Form.Item
                              {...field}
                              name={[field.name, "correct"]}
                              className="mb-0"
                              valuePropName="checked">
                              <Checkbox
                                onChange={(e) => {
                                  if (question.type === "ONE_ANSWER" && e.target.checked) {
                                    // Nếu là "Một đáp án", bỏ chọn các đáp án khác
                                    const updatedAnswers = question.answerReqs.map(
                                      (answer, i) => ({
                                        ...answer,
                                        correct: i === answerIndex,
                                      })
                                    );
                                    handleQuestionChange(index, "answerReqs", updatedAnswers);
                                  }
                                }}
                              />
                            </Form.Item>

                            {/* Lựa chọn kiểu đáp án */}
                            <Select
                              // style={{ width: 150 }}
                              // value={question.answerReqs[answerIndex]?.fileType || "TEXT"}
                              // onChange={(value) => {
                              //   const updatedAnswers = [...question.answerReqs];
                              //   updatedAnswers[answerIndex].fileType = value;
                              //   updatedAnswers[answerIndex].file = undefined;
                              //   // updatedAnswers[answerIndex].content = ""; // Sửa ở đây
                              //   if (value === "TEXT") {
                              //     updatedAnswers[answerIndex].content = updatedAnswers[answerIndex].content || "";
                              //   } else {
                              //     updatedAnswers[answerIndex].content = "";
                              //   }
                              //   handleQuestionChange(index, "answerReqs", updatedAnswers);
                              // }}>
                              // <Select.Option value="TEXT">Nhập chữ</Select.Option>
                              // <Select.Option value="NOT_EXISTED">Tải lên</Select.Option>
                                style={{ width: 150 }}
                                value={question.answerReqs[answerIndex]?.fileType || "TEXT"}
                                onChange={(value) => {
                                  const updatedAnswers = [...question.answerReqs];
                                  updatedAnswers[answerIndex].fileType = value;
                                  updatedAnswers[answerIndex].file = undefined;
                                  if (value === "TEXT") {
                                    updatedAnswers[answerIndex].content = updatedAnswers[answerIndex].content || "";
                                  } else {
                                    updatedAnswers[answerIndex].content = "";
                                  }
                                  handleQuestionChange(index, "answerReqs", updatedAnswers);
                                }}>
                                <Select.Option value="TEXT">Nhập chữ</Select.Option>
                                <Select.Option value="EXISTED">Chọn từ dữ liệu có sẵn</Select.Option>
                                <Select.Option value="NOT_EXISTED">Tải lên mới</Select.Option>
                            </Select>

                            {/* Nhập đáp án bằng chữ */}
                            {question.answerReqs[answerIndex]?.fileType === "TEXT" && (
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "content"]}
                                    className="mb-0 w-full"
                                    required
                                    rules={[validateRequireInput("Vui lòng nhập đáp án")]}>
                                    <Input placeholder="Nhập đáp án" style={{ width: 300 }} />
                                  </Form.Item>
                                )}

                                                      {/* If select existing files */}
                                  {question.answerReqs[answerIndex]?.fileType === "EXISTED" && (
                                    <Form.Item
                                      name={[field.name, "file"]}
                                      className="mb-0"
                                      required>
                                      <QuestionModal
                                        openChooseVideo={openChooseAnswerVideo[`${index}-${answerIndex}`] || false}
                                        setOpenChooseVideo={(open: boolean) =>
                                          setOpenChooseAnswerVideo((prev) => ({
                                            ...prev,
                                            [`${index}-${answerIndex}`]: open,
                                          }))
                                        }
                                        file={question.answerReqs[answerIndex]?.file}
                                      >
                                        <div
                                          onClick={() =>
                                            setOpenChooseAnswerVideo((prev) => ({
                                              ...prev,
                                              [`${index}-${answerIndex}`]: true,
                                            }))
                                          }
                                        >
                                          <Button>Chọn file</Button>
                                          {/* Remove the preview code from here since QuestionModal handles it */}
                                        </div>
                                      </QuestionModal>
                                    </Form.Item>
                                  )} 

                            {/* Nếu chọn tải lên */}
                            {question.answerReqs[answerIndex]?.fileType === "NOT_EXISTED" && (
                              <MediaUpload
                                onUpload={(file) => {
                                  const updatedAnswers = [...question.answerReqs];
                                  updatedAnswers[answerIndex].file = file;
                                  handleQuestionChange(index, "answerReqs", updatedAnswers);
                                }}
                              />
                            )}


                            {/* Hiển thị ảnh hoặc video đã chọn */}
                            {question.answerReqs[answerIndex]?.file && (
                              <div>
                                {isImage(question.answerReqs[answerIndex]?.file) ? (
                                  <Image
                                    preview={false}
                                    alt="example"
                                    style={{
                                      width: 100,
                                      height: 100,
                                      objectFit: "contain",
                                    }}
                                    src={question.answerReqs[answerIndex]?.file}
                                  />
                                ) : (
                                  <video controls style={{ width: 100, height: 100 }}>
                                    <source
                                      src={question.answerReqs[answerIndex]?.file}
                                      type="video/mp4"
                                    />
                                  </video>
                                )}
                              </div>
                            )}
                          </div>

                          <MinusCircleOutlined
                            style={{ fontSize: 20 }}
                            className="dynamic-delete-button"
                            onClick={() => remove(field.name)}
                          />
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() =>
                          add({
                            ...initAnswerValue,
                            fileType: "TEXT", // Đặt mặc định là "TEXT"
                            correct: fields?.length === 0 && question.type === "ONE_ANSWER",
                          })
                        }
                        icon={<PlusOutlined />}>
                        Thêm đáp án
                      </Button>
                    </>
                  )}
                </Form.List>
              </div>
            </Panel>
          ))}
        </Collapse>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => router.push("/learning-management/questions")}>
            Huỷ
          </Button>
          <Button type="primary" htmlType="submit">
            Tạo
          </Button>
        </div>
      </Form>

      {questions?.length > 0 ? (
        <Pagination
          current={currentPage}
          pageSize={questionsPerPage}
          total={numQuestions}
          onChange={handlePageChange}
        />
      ) : null}
    </div>
  );
};

export default QuestionCreate;


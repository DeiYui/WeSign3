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
  Image,
  Input,
  Pagination,
  Radio,
  Select,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";
import QuestionModal from "../../check-list/create-edit/ModalSelectFile";
import Questions from "@/model/Questions";
import { useRouter } from "next/navigation";
import { isImage } from "@/components/common/constants";

interface Answer {
  content: string;
  imageLocation: string;
  videoLocation: string;
  correct: boolean;
}

interface Question {
  content: string;
  explanation: string;
  imageLocation: string;
  videoLocation: string;
  topicId: number;
  answerReqs: Answer[];
  type?: string;
}
const { Panel } = Collapse;

const initAnswerValue = {
  content: "",
  imageLocation: "",
  videoLocation: "",
  correct: false,
};

// conert về data tạo
function convertQuestions(input: any) {
  const result: any = [];

  input.questions.forEach((question: any, questionIndex: any) => {
    const newQuestion: any = {
      content: question.content,
      explanation: "",
      imageLocation: "",
      videoLocation: "",
      topicId: input.topicId,
      answerReqs: [],
    };

    // Loop through each answer in the current question
    question.answerReqs.forEach((answer: any, answerIndex: any) => {
      const newAnswer = {
        content: answer.content,
        imageLocation: isImage(answer.file) ? answer.file : "",
        videoLocation: !isImage(answer.file) ? answer.file : "",
        correct: answer.correct,
      };

      newQuestion.answerReqs.push(newAnswer);
    });

    result.push(newQuestion);
  });

  return result;
}

const QuestionCreate: React.FC = () => {
  const router = useRouter();
  const [form] = useForm();
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const questionsPerPage = 10;

  const topicId = Form.useWatch("topicId", form);

  // Modal chọn file
  const [openChooseVideo, setOpenChooseVideo] = useState<boolean>(false);

  // Kiểu file
  const [typeFileUpload, setTypeFileUpload] = useState<
    string | "upload" | "existing"
  >("");

  // API lấy danh sách  topics
  const { data: allTopics, refetch } = useQuery({
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

  // API tạo câu hỏi
  const mutationAdd = useMutation({
    mutationFn: Questions.addQuestion,
    onSuccess: () => {
      message.success("Thêm mới câu hỏi thành công");
      router.push("/learning-management/questions");
    },
  });

  const handleNumQuestionsChange = (value: number) => {
    const newValue = Math.min(100, Math.max(0, value));
    setNumQuestions(newValue);
    setQuestions(
      Array.from({ length: newValue }, () => ({
        content: "",
        explanation: "",
        imageLocation: "",
        videoLocation: "",
        topicId: 0,
        type: "single",
        answerReqs: [
          { content: "", imageLocation: "", videoLocation: "", correct: true },
        ],
      })),
    );
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any,
  ) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q,
    );
    setQuestions(updatedQuestions);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage,
  );

  const lstQuestions = form.getFieldsValue();

  console.log("lstQuestions", lstQuestions);

  return (
    <>
      <div className="container mx-auto bg-white p-4">
        <h1 className="mb-4 text-2xl font-bold">Thêm câu hỏi</h1>
        <Form
          form={form}
          onFinish={(value) => {
            // convert
            const newValue = convertQuestions(value);
            console.log("newValue: ", value, newValue);

            mutationAdd.mutate(newValue);
          }}
          layout="vertical"
        >
          <Form.Item
            label="Chủ đề"
            name="topicId"
            required
            rules={[validateRequire("Chủ đề không được bỏ trống")]}
          >
            <Select placeholder="Chọn chủ đề" options={allTopics} />
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

          <Collapse accordion className="mb-4 bg-white">
            {currentQuestions.map((question, index) => (
              <Panel
                header={`Câu hỏi ${(currentPage - 1) * questionsPerPage + index + 1}`}
                key={index}
              >
                <div key={index} className="mb-6 rounded border bg-white p-4">
                  <h2 className="mb-2 text-xl font-bold">
                    Câu hỏi {(currentPage - 1) * questionsPerPage + index + 1}
                  </h2>
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

                  <Form.Item
                    name={["questions", index, "typeFile"]}
                    label="Lựa chọn file (hình ảnh, video):"
                    className="mb-0"
                  >
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Chọn hoặc tải lên file"
                      onChange={(value) => setTypeFileUpload(value)}
                    >
                      <Select.Option value="upload">
                        Tải lên file mới
                      </Select.Option>
                      <Select.Option value="existing">
                        Chọn từ dữ liệu có sẵn
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name={["questions", index, "file"]}
                    className="mb-2"
                  >
                    <div className="mt-4">
                      {lstQuestions.questions?.length && (
                        <>
                          {lstQuestions?.questions[index]?.typeFile ===
                            "existing" && (
                            <QuestionModal
                              openChooseVideo={openChooseVideo}
                              setOpenChooseVideo={setOpenChooseVideo}
                              topicId={topicId}
                              file={lstQuestions?.questions[index]?.file}
                            >
                              <div
                                onClick={() => {
                                  if (topicId) {
                                    setOpenChooseVideo(true);
                                  } else {
                                    message.warning("Vui lòng chọn chủ đề");
                                  }
                                }}
                              >
                                <Button disabled={!topicId}>Chọn file</Button>
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
                                        src={
                                          lstQuestions?.questions[index]?.file
                                        }
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
                          {lstQuestions?.questions[index]?.typeFile ===
                            "upload" && <MediaUpload />}
                        </>
                      )}
                    </div>
                  </Form.Item>

                  <Form.Item
                    name={["questions", index, "type"]}
                    label="Kiểu câu hỏi:"
                    required
                    rules={[validateRequireInput("Vui lòng chọn loại đáp án")]}
                    initialValue={"single"}
                  >
                    <Select
                      value={question.type}
                      onChange={(value) =>
                        handleQuestionChange(index, "type", value)
                      }
                      placeholder="Chọn loại đáp án"
                      options={[
                        { label: "Một đáp án", value: "single" },
                        { label: "Nhiều đáp án", value: "multiple" },
                      ]}
                    />
                  </Form.Item>

                  <Form.List name={["questions", index, "answerReqs"]}>
                    {(fields, { add, remove }) => (
                      <>
                        {question.type === "single" ? (
                          <Radio.Group className="w-full" defaultValue={0}>
                            {fields.map((field, answerIndex) => (
                              <div
                                key={field.key}
                                className="flex w-full items-center gap-4"
                              >
                                <div className="mb-2 flex items-center">
                                  <Form.Item
                                    name={[field.name, "correct"]}
                                    className="mb-0 ml-2 w-full"
                                    valuePropName="checked"
                                    required
                                    rules={[
                                      validateRequire(
                                        "Vui lòng nhập chọn đáp án đúng",
                                      ),
                                    ]}
                                    initialValue={0}
                                  >
                                    <Radio value={answerIndex} />
                                  </Form.Item>

                                  <Form.Item
                                    name={[field.name, "content"]}
                                    className="mb-0 ml-2 w-full"
                                    required
                                    rules={[
                                      validateRequireInput(
                                        "Vui lòng nhập đáp án",
                                      ),
                                    ]}
                                  >
                                    <Input
                                      placeholder="Nhập đáp án"
                                      style={{ width: 500 }}
                                    />
                                  </Form.Item>
                                  {/* <Form.Item
                                    name={[field.name, "imageLocation"]}
                                    className="mb-0 ml-2 w-full"
                                  >
                                    <MediaUpload />
                                  </Form.Item>
                                  <Form.Item
                                    name={[field.name, "videoLocation"]}
                                    className="mb-0 ml-2 w-full"
                                  >
                                    <MediaUpload />
                                  </Form.Item> */}
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
                                  correct: fields?.length === 0,
                                })
                              }
                              icon={<PlusOutlined />}
                            >
                              Thêm đáp án
                            </Button>
                          </Radio.Group>
                        ) : (
                          <Checkbox.Group className="w-full" defaultValue={[0]}>
                            {fields.map((field, answerIndex) => (
                              <div
                                key={field.key}
                                className="flex w-full items-center gap-4"
                              >
                                <div className="mb-2 flex items-center">
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "correct"]}
                                    className="mb-0 ml-2 w-full"
                                    valuePropName="checked"
                                  >
                                    <Checkbox value={field.name} />
                                  </Form.Item>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "content"]}
                                    className="mb-0 ml-2 w-full"
                                  >
                                    <Input style={{ width: 700 }} />
                                  </Form.Item>
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
                                  correct: fields?.length === 0,
                                })
                              }
                              icon={<PlusOutlined />}
                            >
                              Thêm đáp án
                            </Button>
                          </Checkbox.Group>
                        )}
                      </>
                    )}
                  </Form.List>
                </div>
              </Panel>
            ))}
          </Collapse>
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
            total={numQuestions}
            onChange={handlePageChange}
          />
        ) : null}
      </div>
    </>
  );
};

export default QuestionCreate;

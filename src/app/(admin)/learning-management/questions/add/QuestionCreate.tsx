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
  Pagination,
  Radio,
  Select,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";
import QuestionModal from "../../check-list/create-edit/ModalSelectFile";

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

const QuestionCreate: React.FC = () => {
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

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Thêm câu hỏi</h1>
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
                  <Form.Item label="Tên câu hỏi:" name="content">
                    <Input placeholder="Nhập câu hỏi" />
                  </Form.Item>

                  <Form.Item
                    name="file"
                    label="Lựa chọn file (hình ảnh, video):"
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
                    <div className="mt-4">
                      {typeFileUpload && (
                        <>
                          {typeFileUpload === "existing" ? (
                            <QuestionModal
                              openChooseVideo={openChooseVideo}
                              setOpenChooseVideo={setOpenChooseVideo}
                              topicId={topicId}
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
                              </div>
                            </QuestionModal>
                          ) : (
                            <MediaUpload />
                          )}
                        </>
                      )}
                    </div>
                  </Form.Item>

                  <Form.Item label="Kiểu câu hỏi:">
                    <Select
                      value={question.type}
                      onChange={(value) =>
                        handleQuestionChange(index, "type", value)
                      }
                    >
                      <Select.Option value="single">Một đáp án</Select.Option>
                      <Select.Option value="multiple">
                        Nhiều đáp án
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.List name="answerReqs">
                    {(fields, { add, remove }) => (
                      <>
                        {question.type === "single" ? (
                          <Radio.Group
                            className="w-full"
                            defaultValue={fields[0]?.name}
                          >
                            {fields.map(
                              ({ key, name, ...restField }, answerIndex) => (
                                <div
                                  key={key}
                                  className="flex w-full items-center gap-4"
                                >
                                  <div className="mb-2 flex items-center">
                                    <Radio value={name} />
                                    <Form.Item
                                      {...restField}
                                      name={[name, "content"]}
                                      className="mb-0 ml-2 w-full"
                                    >
                                      <Input style={{ width: 700 }} />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "imageLocation"]}
                                      className="mb-0 ml-2 w-full"
                                    >
                                      <MediaUpload />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "videoLocation"]}
                                      className="mb-0 ml-2 w-full"
                                    >
                                      <MediaUpload />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "correct"]}
                                      className="mb-0 ml-2 w-full"
                                    >
                                      <Checkbox />
                                    </Form.Item>
                                  </div>

                                  <MinusCircleOutlined
                                    style={{ fontSize: 20 }}
                                    className="dynamic-delete-button"
                                    onClick={() => remove(name)}
                                  />
                                </div>
                              ),
                            )}
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                            >
                              Thêm đáp án
                            </Button>
                          </Radio.Group>
                        ) : (
                          <Checkbox.Group defaultValue={[fields[0]?.name]}>
                            {fields.map(
                              ({ key, name, ...restField }, answerIndex) => (
                                <div
                                  key={key}
                                  className="flex w-full items-center gap-4"
                                >
                                  <div className="mb-2 flex items-center">
                                    <Checkbox value={name} />
                                    <Form.Item
                                      {...restField}
                                      name={[name, "text"]}
                                      className="mb-0 ml-2 w-full"
                                    >
                                      <Input style={{ width: 700 }} />
                                    </Form.Item>
                                  </div>

                                  <MinusCircleOutlined
                                    style={{ fontSize: 20 }}
                                    className="dynamic-delete-button"
                                    onClick={() => remove(name)}
                                  />
                                </div>
                              ),
                            )}
                            <Button
                              type="dashed"
                              onClick={() => add()}
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

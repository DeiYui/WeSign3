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
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

const initAnswerValue = {
  content: "",
  imageLocation: "",
  videoLocation: "",
  correct: false,
};

// Convert form data to API request format
function convertQuestions(input: any) {
  return input.questions.map((question: any) => ({
    content: question.content,
    explanation: "",
    imageLocation: isImage(question.file) ? question.file : "",
    videoLocation: !isImage(question.file) ? question.file : "",
    topicId: input.topicId,
    answerReqs: question.answerReqs.map((answer: any) => ({
      content: answer.content,
      imageLocation: "",
      videoLocation: "",
      correct: answer.correct,
    })),
  }));
}

const convertDataToFormValues = (data: any) => {
  const { answerResList, ...questionData } = data;
  const questions = [
    {
      content: questionData.content,
      file: questionData.imageLocation || questionData.videoLocation,
      typeFile: "existing",
      type:
        answerResList?.filter((item: any) => item.correct).length > 1
          ? "multiple"
          : "single",
      answerReqs: answerResList.map((answer: any) => ({
        content: answer.content,
        imageLocation: answer.imageLocation,
        videoLocation: answer.videoLocation,
        correct: answer.correct,
      })),
    },
  ];
  return { ...questionData, questions };
};

const QuestionEdit: React.FC = () => {
  const router = useRouter();
  const [form] = useForm();
  const { id } = useParams();
  const [numQuestions, setNumQuestions] = useState<number>(0);

  const { data: detailQuestions } = useQuery({
    queryKey: ["getDetailQuestion", id],
    queryFn: async () => {
      if (id) {
        const res = await Questions.getDetailQuestion(Number(id));
        const formValues = convertDataToFormValues(res?.data);
        form.setFieldsValue(res?.data);
        return res?.data;
      }
    },
    enabled: !!id,
  });

  console.log("checksss", Form.useWatch("answerResList", form));

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
    form.setFieldValue(
      "questions",
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

  return (
    <>
      <div className="container mx-auto bg-white p-4">
        <h1 className="mb-4 text-2xl font-bold">Chỉnh sửa câu hỏi</h1>
        <Form
          form={form}
          onFinish={(value) => {
            const newValue = convertQuestions(value);
            console.log("newValue: ", value, newValue);
            mutationAdd.mutate(newValue);
          }}
          layout="vertical"
        >
          <Form.Item name="questionId" hidden />
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
          <Form.Item
            name={"type"}
            label="Kiểu câu hỏi:"
            required
            rules={[validateRequireInput("Vui lòng chọn loại đáp án")]}
            initialValue={"single"}
          >
            <Select
              placeholder="Chọn loại đáp án"
              options={[
                { label: "Một đáp án", value: "single" },
                { label: "Nhiều đáp án", value: "multiple" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="typeFile"
            label="Lựa chọn file (hình ảnh, video):"
            className="mb-4"
          >
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn hoặc tải lên file"
              //   onChange={(value) => setTypeFileUpload(value)}
            >
              <Select.Option value="upload">Tải lên file mới</Select.Option>
              <Select.Option value="existing">
                Chọn từ dữ liệu có sẵn
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.List name="answerResList">
            {(fields, { add, remove }) => (
              <Checkbox.Group className="w-full">
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
                      content: "",
                      imageLocation: "",
                      videoLocation: "",
                      correct: false,
                    })
                  }
                  icon={<PlusOutlined />}
                >
                  Thêm đáp án
                </Button>
              </Checkbox.Group>
            )}
          </Form.List>
          {/* <Collapse accordion className="mb-4 bg-white">
            {currentQuestions?.map((question, index) => (
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
                          <Radio.Group className="w-full">
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
                                    initialValue={answerIndex === 0}
                                  >
                                    <Radio />
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
                          <Checkbox.Group className="w-full">
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
                                    <Checkbox />
                                  </Form.Item>
                                  <Form.Item
                                    {...field}
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
                                      style={{ width: 700 }}
                                    />
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
          </Collapse> */}

          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => router.push("/learning-management/questions")}
            >
              Huỷ
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default QuestionEdit;

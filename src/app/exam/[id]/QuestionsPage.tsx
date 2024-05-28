"use client";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import { Button, Checkbox, Form, Image, Modal, Pagination, Radio } from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

const PAGE_SIZE = 20;

const questions = [
  {
    key: "1",
    question: "Kết quả của 2 + 2 ?",
    answers: ["3", "4", "5"],
    correctAnswer: ["4"],
    multiple: false,
    media: null,
  },
  {
    key: "2",
    question: "Đây là con gì ?",
    answers: ["Con thỏ", "Con cá", "Con bò"],
    correctAnswer: ["Con bò"],
    multiple: false,
    media: {
      type: "image",
      src: "https://wetalk.ibme.edu.vn/upload/vocabularies//0494_con%20b%C3%B2.png",
    },
  },
  {
    key: "3",
    question: "Đây là chữ gì ?",
    answers: ["A", "B", "C", "D"],
    correctAnswer: ["A", "H", "K"],
    multiple: true,
    media: {
      type: "image",
      src: "/images/study/A.webp",
    },
  },
  {
    key: "4",
    question: "Đây là con gì ?",
    answers: ["Con chim", "Con thỏ", "Con mèo"],
    correctAnswer: ["Con chim"],
    multiple: false,
    media: {
      type: "video",
      src: "https://wetalk.ibme.edu.vn/upload/vocabularies//0121_con%20chim.mp4",
    },
  },
];

const ExamDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // Kiểm tra xem đã chọn câu nào chưa
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [form] = Form.useForm();

  const submitExam = (values: any) => {
    let calculatedScore = 0;

    questions.forEach((question) => {
      const userAnswers = values[question.key] || [];
      const correctAnswers = question.correctAnswer;

      if (
        question.multiple
          ? JSON.stringify(userAnswers.sort()) ===
            JSON.stringify(correctAnswers.sort())
          : userAnswers.includes(correctAnswers[0])
      ) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsModalVisible(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentQuestions = questions.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="container mx-auto py-4">
      <div className="">
        <Breadcrumb
          pageName={`Bài kiểm tra ${id}`}
          itemBreadcrumb={[
            { pathName: "/", name: "Trang chủ" },
            { pathName: "/exam", name: "Danh sách bài kiểm tra" },
            { pathName: "#", name: "Bài kiểm tra" },
          ]}
        />
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={submitExam}
        onFieldsChange={() => setIsDirty(true)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {currentQuestions.map((q) => (
            <div
              key={q.key}
              className="rounded-md border bg-white p-4 shadow-md"
            >
              <Form.Item
                name={q.key}
                label={q.question}
                valuePropName={q.multiple ? "value" : undefined}
              >
                {q.media && (
                  <div className="mb-4 flex justify-center">
                    {q.media.type === "image" && (
                      <Image
                        style={{ height: "256px" }}
                        src={q.media.src}
                        alt="question media"
                        className="h-64 w-full object-cover"
                      />
                    )}
                    {q.media.type === "video" && (
                      <video controls className="h-64 w-full object-cover">
                        <source src={q.media.src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
                {q.multiple ? (
                  <Checkbox.Group>
                    {q.answers.map((answer, index) => (
                      <Checkbox key={index} value={answer}>
                        {answer}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                ) : (
                  <Radio.Group>
                    {q.answers.map((answer, index) => (
                      <Radio key={index} value={answer}>
                        {answer}
                      </Radio>
                    ))}
                  </Radio.Group>
                )}
              </Form.Item>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button disabled={!isDirty} htmlType="submit" type="primary">
            Nộp bài
          </Button>
        </div>
      </Form>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={questions.length}
          onChange={handlePageChange}
        />
      </div>
      <Modal
        title="Kết quả"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={
          <>
            <Button type="primary" onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>
          </>
        }
      >
        <p>Điểm của bạn là: {score}</p>
      </Modal>
    </div>
  );
};

export default ExamDetailPage;

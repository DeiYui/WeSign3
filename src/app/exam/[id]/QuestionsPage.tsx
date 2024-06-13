"use client";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import Exam from "@/model/Exam";
import Questions from "@/model/Questions";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Form,
  Image,
  Modal,
  Pagination,
  Radio,
  Spin,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

const PAGE_SIZE = 20;

const ExamDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [form] = Form.useForm();

  const {
    data: detailExam,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["detailExamsForUser", id],
    queryFn: async () => {
      const res = await Exam.detailExamsForUser(Number(id));
      return res?.data;
    },
    enabled: !!id,
  });

  const { data: lstQuestions, isFetching: isFetchingQuestions } = useQuery({
    queryKey: ["getLstQuestionExam", id],
    queryFn: async () => {
      const responsive = await Questions.getLstQuestionExam(id);
      return responsive?.data;
    },
    enabled: !!id,
  });

  const submitExam = (values: any) => {
    let calculatedScore = 0;

    lstQuestions.forEach((question: any) => {
      const userAnswers = values[question.key];
      const correctAnswers = question.answerResList
        .filter((answer: any) => answer.correct)
        .map((answer: any) => answer.content);

      if (Array.isArray(userAnswers)) {
        if (
          userAnswers.length === correctAnswers.length &&
          userAnswers.every((answer: any) => correctAnswers.includes(answer))
        ) {
          calculatedScore += 1;
        }
      } else {
        // Handle radio group (single correct answer)
        if (correctAnswers.includes(userAnswers)) {
          calculatedScore += 1;
        }
      }
    });

    setScore(calculatedScore);
    setIsModalVisible(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentQuestions = lstQuestions?.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  return (
    <Spin spinning={isFetching || isFetchingQuestions}>
      {lstQuestions ? (
        <div className="container mx-auto py-4">
          <div className="">
            <Breadcrumb
              pageName={`Bài kiểm tra:  ${detailExam?.name}`}
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
              {currentQuestions?.map((q: any, index: number) => (
                <div
                  key={q.key}
                  className="rounded-md border bg-white p-4 shadow-md"
                >
                  <div className="text-base">
                    <span className="text-base font-bold">
                      Câu {`${index + 1}`} :
                    </span>{" "}
                    {q.content}
                  </div>
                  {(q.imageLocation || q.videoLocation) && (
                    <div className="mb-4 flex justify-center">
                      {q.imageLocation && (
                        <Image
                          style={{ height: "256px" }}
                          src={q.imageLocation}
                          alt="question media"
                          className="h-64 w-full object-cover"
                        />
                      )}
                      {q.videoLocation && (
                        <video controls className="h-64 w-full object-cover">
                          <source src={q.videoLocation} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}

                  <Form.Item name={q.key}>
                    {q.answerResList?.filter(
                      (item: { correct: boolean }) => item.correct,
                    )?.length > 1 ? (
                      <Checkbox.Group>
                        {q.answerResList.map((answer: any) => (
                          <Checkbox
                            key={answer.answerId}
                            value={answer.content}
                          >
                            {answer.content}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    ) : (
                      <Radio.Group>
                        {q.answerResList.map((answer: any) => (
                          <Radio key={answer.answerId} value={answer.content}>
                            {answer.content}
                          </Radio>
                        ))}
                      </Radio.Group>
                    )}
                  </Form.Item>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button htmlType="submit" type="primary">
                Nộp bài
              </Button>
            </div>
          </Form>
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={lstQuestions?.length}
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
      ) : null}
    </Spin>
  );
};

export default ExamDetailPage;

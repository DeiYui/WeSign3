"use client";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import Exam from "@/model/Exam";
import Questions from "@/model/Questions";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Form,
  Image,
  Modal,
  Pagination,
  Radio,
  Spin,
  message,
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

  // Chấm điểm
  const markExam = useMutation({
    mutationFn: Exam.markExam,
    onSuccess: () => {
      message.success("Chấm điểm thành công");
    },
  });

  const submitExam = (values: any) => {
    const calculatedScore = values.answer?.filter((item: any) => item)?.length;
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
                  <Form.Item name={["answer", index]} hidden />

                  <Form.Item name={["answerList", index, "answerId"]}>
                    {q.answerResList?.filter(
                      (item: { correct: boolean }) => item.correct,
                    )?.length > 1 ? (
                      <Checkbox.Group
                        onChange={(value) => {
                          const correct = q.answerResList
                            ?.filter((item: any) =>
                              value.includes(item.answerId),
                            )
                            ?.every(
                              (item: { correct: boolean }) => item.correct,
                            );
                          form.setFieldValue(["answer", index], correct);
                        }}
                      >
                        {q.answerResList.map((answer: any) => (
                          <Checkbox
                            key={answer.answerId}
                            value={answer.answerId}
                          >
                            {answer.content}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    ) : (
                      <Radio.Group>
                        {q.answerResList.map((answer: any) => (
                          <Radio
                            key={answer.answerId}
                            value={answer.answerId}
                            onChange={(e) => {
                              if (e.target.checked) {
                                form.setFieldValue(
                                  ["answer", index],
                                  answer.correct,
                                );
                              }
                            }}
                          >
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
            onOk={() => {
              setIsModalVisible(false);
              markExam.mutate({
                examId: Number(id),
                score: score,
              });
            }}
            onCancel={() => setIsModalVisible(false)}
            footer={
              <>
                <Button type="primary" onClick={() => setIsModalVisible(false)}>
                  Đóng
                </Button>
              </>
            }
          >
            <p>
              Điểm của bạn là: {score}/${lstQuestions?.length}
            </p>
          </Modal>
        </div>
      ) : null}
    </Spin>
  );
};

export default ExamDetailPage;

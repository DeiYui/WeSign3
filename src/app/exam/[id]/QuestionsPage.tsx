"use client";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import Exam from "@/model/Exam";
import Questions from "@/model/Questions";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Image,
  Modal,
  Pagination,
  Radio,
  Spin,
  message,
} from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const PAGE_SIZE = 20;

const ExamDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  // Nếu có tham số redo, nghĩa là user đang làm lại bài
  const isRedo = searchParams.get("redo");
  const [form] = Form.useForm();
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy thông tin chi tiết bài kiểm tra, bao gồm thông tin chấm điểm (score)
  const { data: detailExam, isFetching } = useQuery({
    queryKey: ["detailExamsForUser", id],
    queryFn: async () => {
      const res = await Exam.detailExamsForUser(Number(id));
      return res?.data;
    },
    enabled: !!id,
  });

  // Xác định exam đã hoàn thành nếu có trường score từ backend
  const isExamCompleted = detailExam && detailExam.score !== undefined;

  // Lấy danh sách câu hỏi cho bài kiểm tra
  const { data: lstQuestions, isFetching: isFetchingQuestions } = useQuery({
    queryKey: ["getLstQuestionExam", id],
    queryFn: async () => {
      const response = await Questions.getLstQuestionExam(id);
      form.setFieldsValue({
        questionId: response?.data?.map((question: any) => question.questionId),
      });
      return response?.data;
    },
    enabled: !!id,
  });

  // Lấy dữ liệu đáp án đã lưu (nếu có)
  const { data: detailExamSave } = useQuery({
    queryKey: ["getDetailSaveExam", id],
    queryFn: async () => {
      const response = await Exam.getDetailSaveExam(id);
      return response?.data;
    },
    enabled: !!id,
  });

  // Nếu bài thi đã hoàn thành và không ở chế độ redo, prefill form từ dữ liệu đã lưu
  useEffect(() => {
    if (detailExamSave && lstQuestions && isExamCompleted && !isRedo) {
      const initialValues = lstQuestions.reduce((acc: any, question: any, index: number) => {
        const savedAnswer = detailExamSave.find((item: any) => item.questionId === question.questionId);
        if (savedAnswer && savedAnswer.selectedAnswers && savedAnswer.selectedAnswers.length > 0) {
          acc.answerList = acc.answerList || [];
          acc.answerList[index] =
            question?.questionType === "ONE_ANSWER"
              ? { answerId: savedAnswer.selectedAnswers[0] }
              : { answerId: savedAnswer.selectedAnswers };
          acc.answer = acc.answer || [];
          acc.answer[index] = question.answerResList?.some((ans: any) =>
            savedAnswer.selectedAnswers?.includes(ans.answerId) && ans.correct
          );
        }
        return acc;
      }, {});
      form.setFieldsValue(initialValues);
    }
  }, [detailExamSave, lstQuestions, isExamCompleted, isRedo, form]);

  const markExam = useMutation({
    mutationFn: Exam.markExam,
  });

  // Khi nộp bài: lưu đáp án, chấm điểm và chuyển hướng về trang danh sách
  const submitExam = (values: any) => {
    const req = lstQuestions.map((question: any, index: number) => {
      const correctAnswer = values?.answerList[index];
      const selectedAnswers =
        typeof correctAnswer.answerId === "number"
          ? [correctAnswer?.answerId]
          : correctAnswer?.answerId;
      return {
        questionId: question.questionId,
        examId: Number(id),
        selectedAnswers,
      };
    });

    // Nếu chưa trả lời hết các câu hỏi, hiển thị modal xác nhận
    const unansweredQuestions = lstQuestions.filter(
      (q: any, index: number) =>
        !values.answer || values.answer[index] === undefined
    );

    if (unansweredQuestions.length > 0) {
      setIsConfirmModalVisible(true);
    } else {
      calculateScore(values);
    }

    // Gọi API lưu đáp án
    Exam.saveExam(req).then(() => {
      message.success("Bài kiểm tra đã được lưu.");
    });
  };

  const calculateScore = (values: any) => {
    const calculatedScore = values.answer?.filter((item: any) => item)?.length || 0;
    markExam.mutate({
      examId: Number(id),
      score: (calculatedScore / lstQuestions?.length) * 10,
    });
    setScore((calculatedScore / lstQuestions?.length) * 10);
    setIsResultModalVisible(true);
  };

  const handleConfirmSubmit = () => {
    form.validateFields().then((values) => {
      calculateScore(values);
    });
    setIsConfirmModalVisible(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentQuestions = lstQuestions?.slice(startIndex, startIndex + PAGE_SIZE);

  // Hàm tính icon biểu cảm dựa trên điểm
  const calculateRating = () => {
    if (score >= 7) {
      return <SmileOutlined style={{ fontSize: "140px", color: "#53d100" }} />;
    } else if (score >= 4 && score < 7) {
      return <MehOutlined style={{ fontSize: "140px", color: "orange" }} />;
    } else {
      return <FrownOutlined style={{ fontSize: "140px", color: "red" }} />;
    }
  };

  return (
    <Spin spinning={isFetching || isFetchingQuestions}>
      {lstQuestions ? (
        <div className="container mx-auto py-4">
          <div>
            <Breadcrumb
              pageName={`Bài kiểm tra: ${detailExam?.name}`}
              itemBreadcrumb={[
                { pathName: "/", name: "Trang chủ" },
                { pathName: "/exam", name: "Danh sách bài kiểm tra" },
                { pathName: "#", name: "Bài kiểm tra" },
              ]}
            />
          </div>
          {/* Phần "Xem đáp án" đã bị loại bỏ */}
          <Form form={form} layout="vertical" onFinish={submitExam}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentQuestions?.map((q: any, index: number) => (
                <div key={q.key} className="rounded-md border bg-white p-4 shadow-md">
                  <div className="text-base">
                    <span className="text-base font-bold">Câu {index + 1}:</span> {q.content}
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
                  <Form.Item name={["questionId", index]} hidden />
                  <Form.Item name={["answerList", index, "answerId"]}>
                    {q.answerResList?.filter((item: { correct: boolean }) => item.correct)?.length > 1 ? (
                      <Checkbox.Group
                        disabled={isExamCompleted && !isRedo}
                        onChange={(value) => {
                          const correct = q.answerResList
                            ?.filter((item: any) => value.includes(item.answerId))
                            ?.every((item: { correct: boolean }) => item.correct);
                          form.setFieldValue(["answer", index], correct);
                        }}
                      >
                        {q.answerResList.map((answer: any) => (
                          <Checkbox key={answer.answerId} value={answer.answerId}>
                            {answer.content}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    ) : (
                      <Radio.Group disabled={isExamCompleted && !isRedo}>
                        {q.answerResList.map((answer: any) => (
                          <Radio
                            key={answer.answerId}
                            value={answer.answerId}
                            onChange={(e) => {
                              if (e.target.checked) {
                                form.setFieldValue(["answer", index], answer.correct);
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
            open={isResultModalVisible}
            onOk={() => {
              setIsResultModalVisible(false);
              router.push("/exam");
            }}
            maskClosable={false}
            onCancel={() => setIsResultModalVisible(false)}
            footer={
              <Button
                type="primary"
                onClick={() => {
                  setIsResultModalVisible(false);
                  router.push("/exam");
                }}
              >
                Đóng
              </Button>
            }
          >
            <div className="flex w-full justify-center py-4">
              {calculateRating()}
            </div>
            <p className="text-xl font-bold">Điểm của bạn là: {score}/10</p>
          </Modal>
          <Modal
            title="Thông báo"
            open={isConfirmModalVisible}
            onOk={handleConfirmSubmit}
            onCancel={() => setIsConfirmModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsConfirmModalVisible(false)}>
                Tiếp tục
              </Button>,
              <Button key="submit" type="primary" onClick={handleConfirmSubmit}>
                Nộp bài
              </Button>,
            ]}
          >
            <p>Bạn chưa hoàn thành bài kiểm tra, bạn có muốn tiếp tục?</p>
          </Modal>
        </div>
      ) : (
        <Empty description="Không có câu hỏi nào" />
      )}
    </Spin>
  );
};

export default ExamDetailPage;

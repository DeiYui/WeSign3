"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Form,
  Pagination,
  Radio,
  Skeleton,
  message,
  Modal,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftOutlined, TrophyOutlined } from "@ant-design/icons";
import Questions from "@/model/Questions";
import Exam from "@/model/Exam";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function QuestionsPage() {
  const router = useRouter();
  const { id }: any = useParams();
  const searchParams = useSearchParams();
  const isRedo = searchParams.get("redo") === "true";
  const isReview = searchParams.get("review") === "true";

  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(isReview);
  const [examScore, setExamScore] = useState<number | undefined>(undefined);
  const userId = useSelector((state: RootState) => state.admin.userId);

  const { data: detailExam, refetch: refetchExam } = useQuery({
    queryKey: ["getExamDetail", id],
    queryFn: async () => {
      const res = await Exam.getDetailExam(Number(id));
      if (res?.data?.score !== undefined) {
        setExamScore(res.data.score);
      }
      return res?.data;
    },
  });

  const { data: lstQuestions } = useQuery({
    queryKey: ["getLstQuestionExam", id],
    queryFn: async () => {
      const res = await Questions.getLstQuestionExam(Number(id));
      return res?.data || [];
    },
  });

  const { data: detailExamSave } = useQuery({
    queryKey: ["getDetailExamSave", id],
    queryFn: async () => {
      const res = await Exam.getDetailExamSave(Number(id));
      return res?.data || [];
    },
    enabled: !!detailExam && (detailExam.score !== undefined) && (isRedo || isReview),
  });

  const isCompleted = detailExam?.score !== undefined && !isRedo;

  useEffect(() => {
    if ((isRedo || isReview) && detailExamSave && lstQuestions) {
      const initialValues = lstQuestions.reduce((acc: any, question: any, index: number) => {
        const savedAnswer = detailExamSave.find(
          (item: any) => item.questionId === question.questionId
        );
        if (savedAnswer) {
          const selectedAnswers = savedAnswer.selectedAnswers;
          acc.answerList = acc.answerList || [];
          acc.answerList[index] = {
            answerId:
              selectedAnswers && question?.questionType === "ONE_ANSWER"
                ? selectedAnswers[0]
                : selectedAnswers,
          };
          acc.answer = acc.answer || [];
          acc.answer[index] = question.answerResList?.some(
            (ans: any) =>
              selectedAnswers?.includes(ans.answerId) && ans.correct
          );
        }
        return acc;
      }, {});
      form.setFieldsValue(initialValues);
    }
  }, [detailExamSave, lstQuestions, isRedo, isReview, form]);

  const saveExam = useMutation({
    mutationFn: (data: any) => Exam.saveExam(data),
  });

  const markExam = useMutation({
    mutationFn: (data: any) => Exam.markExam(data),
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const answers = lstQuestions.map((q: any, index: number) => {
        const selectedRaw = values?.answerList?.[index]?.answerId;
        const selected =
          selectedRaw !== undefined && selectedRaw !== null
            ? selectedRaw
            : [];

        return {
          examId: detailExam.examId,
          questionId: q.questionId,
          selectedAnswers: Array.isArray(selected) ? selected : [selected],
        };
      });

      await saveExam.mutateAsync(answers);

      const correctCount = answers.reduce((count: number, a: { 
        questionId: any; 
        selectedAnswers: string[] | number[] 
      }) => {
        const q = lstQuestions.find((q: { questionId: any; }) => q.questionId === a.questionId);
        const correctAnswers = q.answerResList
          .filter((ans: { correct: any; }) => ans.correct)
          .map((ans: { answerId: any; }) => ans.answerId)
          .sort()
          .toString();
        const selectedAnswers = a.selectedAnswers.sort().toString();
        return count + (correctAnswers === selectedAnswers ? 1 : 0);
      }, 0);
  
      const score = parseFloat(((correctCount / lstQuestions.length) * 10).toFixed(2));
      setExamScore(score);

      await markExam.mutateAsync({
        examId: detailExam.examId,
        score,
        isFinished: true,
        userId: userId
      });

      await refetchExam();
      setSubmitted(true);

      // Show the result modal
      Modal.success({
        title: "Nộp bài thành công!",
        content: (
          <div className="text-center py-4">
            <p className="text-xl font-bold mb-2">Điểm số của bạn</p>
            <p className="text-3xl font-bold text-blue-600">{score.toFixed(1)}/10</p>
            <p className="mt-2">
              Bạn đã trả lời đúng {correctCount}/{lstQuestions.length} câu hỏi
            </p>
          </div>
        ),
        okText: "Xem kết quả",
        onOk: () => {
          setShowResults(true);
          router.push(`/exam/${id}?review=true`);
        },
        cancelText: "Quay lại danh sách",
        onCancel: () => {
          router.push("/exam");
        }
      });
    } catch (error) {
      message.error("Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.");
    }
  };

  const handleRedoExam = () => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc chắn muốn làm lại bài kiểm tra này không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        router.push(`/exam/${id}?redo=true`);
      },
    });
  };

  const questionsPerPage = 1;
  const currentQuestion = lstQuestions?.[currentPage - 1];

  return (
    <div className="p-4 md:p-10">
      <Breadcrumb
        items={[
          { title: <ArrowLeftOutlined onClick={() => router.back()} /> },
          { title: "Danh sách bài kiểm tra" },
        ]}
      />

      <Form form={form} layout="vertical">
        <Skeleton loading={!currentQuestion} active>
          {currentQuestion && (
            <Card
              title={`Câu ${currentPage}: ${currentQuestion.content}`}
              className="mb-6"
            >
              {currentQuestion.videoLocation && (
                <video width="100%" controls className="mb-4">
                  <source src={currentQuestion.videoLocation} type="video/mp4" />
                  Trình duyệt không hỗ trợ video.
                </video>
              )}

              {currentQuestion.imageLocation && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQuestion.imageLocation}
                  alt="Question Media"
                  className="mb-4 w-full max-w-md"
                />
              )}

              <Form.Item name={["answerList", currentPage - 1, "answerId"]}>
                {currentQuestion.answerResList.filter((a: { correct: any; }) => a.correct).length > 1 ? (
                  <Checkbox.Group
                    disabled={isCompleted || showResults}
                    onChange={(value) => {
                      const correct = currentQuestion.answerResList
                        .filter((item: any) => value.includes(item.answerId))
                        .every((item: { correct: any; }) => item.correct);
                      form.setFieldValue(["answer", currentPage - 1], correct);
                    }}
                  >
                    {currentQuestion.answerResList.map((answer: any) => (
                      <div 
                        key={answer.answerId} 
                        className={`p-2 ${
                          showResults && answer.correct 
                            ? "bg-green-50 border border-green-200 rounded mb-2" 
                            : "mb-2"
                        }`}
                      >
                        <Checkbox value={answer.answerId}>
                          {answer.content}
                          {showResults && answer.correct && (
                            <span className="ml-2 text-green-600">(Đáp án đúng)</span>
                          )}
                        </Checkbox>
                      </div>
                    ))}
                  </Checkbox.Group>
                ) : (
                  <Radio.Group disabled={isCompleted || showResults}>
                    {currentQuestion.answerResList.map((answer: any) => (
                      <div 
                        key={answer.answerId} 
                        className={`p-2 ${
                          showResults && answer.correct 
                            ? "bg-green-50 border border-green-200 rounded mb-2" 
                            : "mb-2"
                        }`}
                      >
                        <Radio
                          value={answer.answerId}
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setFieldValue(["answer", currentPage - 1], answer.correct);
                            }
                          }}
                        >
                          {answer.content}
                          {showResults && answer.correct && (
                            <span className="ml-2 text-green-600">(Đáp án đúng)</span>
                          )}
                        </Radio>
                      </div>
                    ))}
                  </Radio.Group>
                )}
              </Form.Item>
            </Card>
          )}
        </Skeleton>

        <div className="flex justify-between items-center mt-8">
          <Pagination
            current={currentPage}
            total={lstQuestions?.length || 0}
            pageSize={questionsPerPage}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />

          {!isCompleted && !isReview && (
            <Button type="primary" onClick={handleSubmit} disabled={submitted}>
              Nộp bài
            </Button>
          )}

          {isReview && (
            <div className="flex space-x-4">
              {/* <Button type="primary" onClick={handleRedoExam}>
                Làm lại
              </Button> */}
              <Button onClick={() => router.push("/exam")}>
                Quay lại danh sách
              </Button>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
}
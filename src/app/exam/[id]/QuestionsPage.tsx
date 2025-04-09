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
} from "antd";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Questions from "@/model/Questions";
import Exam from "@/model/Exam";

export default function QuestionsPage() {
  const router = useRouter();
  const { id }: any = useParams();
  const searchParams = useSearchParams();
  const isRedo = searchParams.get("redo") === "true";

  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const { data: detailExam } = useQuery({
    queryKey: ["getExamDetail", id],
    queryFn: async () => {
      const res = await Exam.getDetailExam(Number(id));
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
    enabled: !!detailExam && detailExam.score !== undefined && !isRedo,
  });

  const isCompleted = detailExam?.score !== undefined;

  useEffect(() => {
    if (!isRedo && detailExamSave && lstQuestions) {
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
  }, [detailExamSave, lstQuestions, isRedo]);

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

      const correctCount = answers.reduce((count, a) => {
        const q = lstQuestions.find((q) => q.questionId === a.questionId);
        const correctAnswers = q.answerResList
          .filter((ans) => ans.correct)
          .map((ans) => ans.answerId)
          .sort()
          .toString();
        const selectedAnswers = a.selectedAnswers.sort().toString();
        return count + (correctAnswers === selectedAnswers ? 1 : 0);
      }, 0);

      const score = (correctCount / lstQuestions.length) * 10;

      await markExam.mutateAsync({
        examId: detailExam.examId,
        score,
      });

      message.success("Nộp bài thành công!");
      setSubmitted(true);
      router.push("/study/examlist");
    } catch (error) {
      message.error("Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.");
    }
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

      <h1 className="text-2xl font-bold mt-4 mb-6">{detailExam?.name}</h1>

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
                <img
                  src={currentQuestion.imageLocation}
                  alt="Question Media"
                  className="mb-4 w-full max-w-md"
                />
              )}

              <Form.Item name={["answerList", currentPage - 1, "answerId"]}>
                {currentQuestion.answerResList.filter((a) => a.correct).length > 1 ? (
                  <Checkbox.Group
                    disabled={!isRedo && isCompleted}
                    onChange={(value) => {
                      const correct = currentQuestion.answerResList
                        .filter((item: any) => value.includes(item.answerId))
                        .every((item) => item.correct);
                      form.setFieldValue(["answer", currentPage - 1], correct);
                    }}
                  >
                    {currentQuestion.answerResList.map((answer: any) => (
                      <Checkbox key={answer.answerId} value={answer.answerId}>
                        {answer.content}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                ) : (
                  <Radio.Group disabled={!isRedo && isCompleted}>
                    {currentQuestion.answerResList.map((answer: any) => (
                      <Radio
                        key={answer.answerId}
                        value={answer.answerId}
                        onChange={(e) => {
                          if (e.target.checked) {
                            form.setFieldValue(["answer", currentPage - 1], answer.correct);
                          }
                        }}
                      >
                        {answer.content}
                      </Radio>
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

          {(!isCompleted || isRedo) && (
            <Button type="primary" onClick={handleSubmit} disabled={submitted}>
              Nộp bài
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
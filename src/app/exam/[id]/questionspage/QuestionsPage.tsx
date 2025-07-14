/* eslint-disable @next/next/no-img-element */
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
import { ArrowLeftOutlined, TrophyOutlined, PlayCircleOutlined, PictureOutlined } from "@ant-design/icons";
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
  const [mediaModal, setMediaModal] = useState<{
    visible: boolean;
    type: 'video' | 'image' | null;
    url: string;
    title: string;
  }>({ visible: false, type: null, url: '', title: '' });
  
  const userId = useSelector((state: RootState) => state.admin.userId);
console.log('id ne', id)
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
      return res?.content || []; // Fixed: use content instead of data
    },
  });

  const { data: detailExamSave } = useQuery({
    queryKey: ["getDetailExamSave", id],
    queryFn: async () => {
      const res = await Exam.getDetailExamSave(Number(id));
      return res?.data || [];
    },
    enabled: !!detailExam && (isRedo || isReview), // Fixed: removed score check
  });

  const isCompleted = detailExam?.score !== undefined && !isRedo;

  // Function to show media modal
  const showMediaModal = (answer: any) => {
    if (answer.videoLocation) {
      setMediaModal({
        visible: true,
        type: 'video',
        url: answer.videoLocation,
        title: `Đáp án ${answer.answerId}`
      });
    } else if (answer.imageLocation) {
      setMediaModal({
        visible: true,
        type: 'image',
        url: answer.imageLocation,
        title: `Đáp án ${answer.answerId}`
      });
    }
  };

  // Function to render answer content
  const renderAnswerContent = (answer: any) => {
    // If content is empty and has media, show button
    if (!answer.content && (answer.videoLocation || answer.imageLocation)) {
      return (
        <div className="flex items-center gap-2">
          <Button
            type="link"
            icon={answer.videoLocation ? <PlayCircleOutlined /> : <PictureOutlined />}
            onClick={() => showMediaModal(answer)}
            className="p-0"
          >
             {answer.videoLocation ? `Xem video` : `Xem hình ảnh `}
          </Button>
          {showResults && answer.correct && (
            <span className="ml-2 text-green-600">(Đáp án đúng)</span>
          )}
        </div>
      );
    }
    
    // If has content, show content normally
 return (
    <div>
      {answer.content}
      {/* Show media button alongside content if available */}
      {(answer.videoLocation || answer.imageLocation) && (
        <Button
          type="link"
          size="small"
          icon={answer.videoLocation ? <PlayCircleOutlined /> : <PictureOutlined />}
          onClick={() => showMediaModal(answer)}
          className="ml-2"
        >
          {answer.videoLocation ? 'Video' : 'Hình ảnh'}
        </Button>
      )}
      {showResults && answer.correct && (
        <span className="ml-2 text-green-600">(Đáp án đúng)</span>
      )}
    </div>
  );
};

  // 1. State lưu đáp án
  const [allAnswers, setAllAnswers] = useState<{ [index: number]: any }>({});

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

      // 4. Khi submit, lấy từ allAnswers
      const answers = lstQuestions.map((q: any, index: number) => {
        const selected = allAnswers[index] ?? [];
        return {
          examId: detailExam[0].examId,
          questionId: q.questionId,
          selectedAnswers: Array.isArray(selected) ? selected : [selected],
        };
      });

      await saveExam.mutateAsync(answers);

      console.log("lstQuestions:", lstQuestions);
      console.log("answers:", answers);

      const correctCount = answers.reduce((count: number, a: { 
        questionId: any; 
        selectedAnswers: string[] | number[] 
      }) => {
        const q = lstQuestions.find((q: { questionId: any; }) => q.questionId === a.questionId);
        const correctAnswers = q.answerResList
          .filter((ans: { correct: any; }) => ans.correct)
          .map((ans: { answerId: any; }) => String(ans.answerId))
          .sort()
          .toString();
        const selectedAnswers = a.selectedAnswers.map(String).sort().toString();

        // Log từng câu hỏi
        console.log(
          "QuestionId:", a.questionId,
          "| correctAnswers:", correctAnswers,
          "| selectedAnswers:", selectedAnswers
        );

        return count + (correctAnswers === selectedAnswers ? 1 : 0);
      }, 0);

      console.log("correctCount:", correctCount);

      const score = parseFloat(((correctCount / lstQuestions.length) * 10).toFixed(2));
      setExamScore(score);

      await markExam.mutateAsync({
        examId: detailExam[0].examId,
        score,
        isFinished: true,
        userId: userId
      });

      await refetchExam();
      setSubmitted(true);

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
        okText : "Quay về",
        okButtonProps: {
        style: { backgroundColor: "#2f54eb", borderColor: "#2f54eb", color: "#fff" },
        },
        onOk: () => {
          router.push("/exam");
        },
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
              title={
                <div style={{ textAlign: "center", fontSize: 24, fontWeight: 700, margin: "24px 0" }}>
                  Câu {currentPage}: {currentQuestion.content}
                </div>
              }
              className="mb-6"
            >
              {/* Căn giữa media */}
              {(currentQuestion.videoLocation || currentQuestion.imageLocation) && (
                <div className="flex justify-center mb-4">
                  {currentQuestion.videoLocation && (
                    <video width="100%" style={{ maxWidth: 500 }} controls>
                      <source src={currentQuestion.videoLocation} type="video/mp4" />
                      Trình duyệt không hỗ trợ video.
                    </video>
                  )}
                  {currentQuestion.imageLocation && (
                    <img
                      src={currentQuestion.imageLocation}
                      alt="Question Media"
                      style={{ maxWidth: 400, width: "100%" }}
                    />
                  )}
                </div>
              )}

              <Form.Item
                name={["answerList", currentPage - 1, "answerId"]}
                preserve={true}
              >
                {currentQuestion.questionType === "MULTIPLE_ANSWERS" ? (
                  <div className="flex justify-center">
                    <Checkbox.Group
                      disabled={isCompleted || showResults}
                      // 2. Khi chọn đáp án
                      value={allAnswers[currentPage - 1] || []}
                      onChange={(value) => {
                        setAllAnswers((prev) => ({
                          ...prev,
                          [currentPage - 1]: value,
                        }));
                        form.setFieldValue(["answerList", currentPage - 1, "answerId"], value);
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                          maxWidth: 600,
                        }}
                      >
                        {currentQuestion.answerResList.map((answer: any) => (
                          <div
                            key={answer.answerId}
                            className={`p-3 flex items-center ${
                              showResults && answer.correct
                                ? "bg-green-50 border border-green-200 rounded"
                                : ""
                            }`}
                            style={{
                              minHeight: 56,
                              background: "#f9f9f9",
                              borderRadius: 8,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <Checkbox value={answer.answerId} style={{ width: "100%" }}>
                              {renderAnswerContent(answer)}
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                    </Checkbox.Group>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Radio.Group
                      value={allAnswers[currentPage - 1] || undefined}
                      onChange={(e) => {
                        setAllAnswers((prev) => ({
                          ...prev,
                          [currentPage - 1]: e.target.value,
                        }));
                        form.setFieldValue(["answerList", currentPage - 1, "answerId"], e.target.value);
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                          maxWidth: 600,
                        }}
                      >
                        {currentQuestion.answerResList.map((answer: any) => (
                          <div
                            key={answer.answerId}
                            className={`p-3 flex items-center ${
                              showResults && answer.correct
                                ? "bg-green-50 border border-green-200 rounded"
                                : ""
                            }`}
                            style={{
                              minHeight: 56,
                              background: "#f9f9f9",
                              borderRadius: 8,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <Radio
                              value={answer.answerId}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  form.setFieldValue(["answer", currentPage - 1], answer.correct);
                                }
                              }}
                              style={{ width: "100%" }}
                            >
                              {renderAnswerContent(answer)}
                            </Radio>
                          </div>
                        ))}
                      </div>
                    </Radio.Group>
                  </div>
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
            <Button type="primary" onClick={handleSubmit} disabled={submitted} style={{background: "#2f54eb"}}>
              Nộp bài
            </Button>
          )}

          {isReview && (
            <div className="flex space-x-4">
              <Button onClick={() => router.push("/exam")}>
                Quay lại danh sách
              </Button>
            </div>
          )}
        </div>
      </Form>

      {/* Media Modal */}
      <Modal
        title={mediaModal.title}
        open={mediaModal.visible}
        onCancel={() => setMediaModal({ visible: false, type: null, url: '', title: '' })}
        footer={null}
        width={800}
        centered
      >
        {mediaModal.type === 'video' && mediaModal.url && (
          <video width="100%" controls autoPlay key={mediaModal.url}>
            <source src={mediaModal.url} type="video/mp4" />
            Trình duyệt không hỗ trợ video.
          </video>
        )}
        {mediaModal.type === 'image' && mediaModal.url && (
          <img
            src={mediaModal.url}
            alt="Answer Media"
            className="w-full max-w-full"
            key={mediaModal.url}
          />
        )}
      </Modal>
    </div>
  );
}
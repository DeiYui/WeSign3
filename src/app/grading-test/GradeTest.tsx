"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Checkbox, Spin, message } from "antd";
import Exam from "@/model/Exam";
import { useParams, useRouter } from "next/navigation";

interface PracticeQuestion {
  contentFromExamVocabulary: string;
  videoUrl?: string;
  aiAnswer?: string;
}

const GradingTest: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id;
  const [loading, setLoading] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [gradingList, setGradingList] = useState<{ isCorrect: boolean | null }[]>([]);

  // Lấy danh sách câu hỏi thực hành và kết quả AI detect
  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    Exam.getDetailPracticeExam(Number(examId))
      .then((res) => {
        if (Array.isArray(res?.data)) {
          // Lọc chỉ lấy các câu hỏi đã có videoUrl (học sinh đã nộp video)
          const filtered = res.data.filter((q: any) => !!q.videoUrl);
          setPracticeQuestions(filtered);
          setGradingList(filtered.map(() => ({ isCorrect: null })));
        } else {
          setPracticeQuestions([]);
          setGradingList([]);
        }
      })
      .catch(() => {
        message.error("Không lấy được danh sách câu hỏi thực hành");
      })
      .finally(() => setLoading(false));
  }, [examId]);

  // Hàm tick đúng/sai
  const handleGradeChange = (index: number, value: boolean) => {
    setGradingList((prev) => {
      const updated = [...prev];
      updated[index] = { isCorrect: value };
      return updated;
    });
  };

  // Hàm lưu kết quả chấm điểm
  const handleSaveGrading = async () => {
    const total = gradingList.length;
    const correct = gradingList.filter((g) => g.isCorrect === true).length;
    const score = total > 0 ? Math.round((correct / total) * 10 * 10) / 10 : 0; // Làm tròn 1 chữ số thập phân

    setLoading(true);
    try {
      // Gọi API lưu điểm và kết quả chấm từng câu
      await Exam.saveGrading({
        examId,
        gradingList,
        score,
      });
      message.success(`Đã lưu kết quả chấm điểm! Điểm: ${score}/10`);
      router.push("/teacher-scoring-test");
    } catch (err) {
      message.error("Lưu kết quả thất bại");
    }
    setLoading(false);
  };

  // Cột bảng
  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "contentFromExamVocabulary",
      key: "contentFromExamVocabulary",
      width: 200,
    },
    {
      title: "Từ nhận diện",
      dataIndex: "aiAnswer",
      key: "aiAnswer",
      width: 200,
      render: (text: string) => <span>{text || <i>Chưa có</i>}</span>,
    },
    {
      title: "Video biểu diễn",
      dataIndex: "videoUrl",
      key: "videoUrl",
      width: 150,
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Xem video
          </a>
        ) : (
          <span>Chưa có</span>
        ),
    },
    {
      title: "Chấm điểm",
      key: "grading",
      width: 180,
      render: (_: any, record: any, idx: number) => (
        <div>
          <Checkbox
            checked={gradingList[idx]?.isCorrect === true}
            onChange={() => handleGradeChange(idx, true)}
            style={{ marginRight: 12 }}
          >
            Đúng
          </Checkbox>
          <Checkbox
            checked={gradingList[idx]?.isCorrect === false}
            onChange={() => handleGradeChange(idx, false)}
          >
            Sai
          </Checkbox>
        </div>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Chấm điểm bài kiểm tra thực hành</h2>
        <Table
          columns={columns}
          dataSource={practiceQuestions.map((q, idx) => ({
            ...q,
            key: idx,
          }))}
          pagination={false}
          bordered
        />
        <div className="flex justify-end mt-4">
          <Button type="primary" onClick={handleSaveGrading}>
            Lưu kết quả chấm điểm
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default GradingTest;
"use client";

// import { useState } from "react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Input, Pagination } from "antd";
import Webcam from "react-webcam";
import Exam from "@/model/Exam";
import { useParams } from "next/navigation";
const QuestionsPractice: React.FC = () => {
    const params = useParams();
  const examId = params?.id;
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
   const [loading, setLoading] = useState(false);
  // const [wordsList, setWordsList] = useState<string[]>([
  //   "Xin chào",
  //   "Tạm biệt",
  //   "Cảm ơn",
  //   "Xin lỗi",
  // ]); // Danh sách từ/câu mẫu
    const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const handleNextWord = () => {
    if (currentWordIndex < practiceQuestions.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Thêm logic quay video
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Thêm logic dừng quay video
  };

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
  
    Exam.getDetailPracticeExam(Number(examId))
      .then((res) => {
        if (res?.data) {
          setPracticeQuestions(res.data); // giả sử bạn cần mảng câu hỏi
        } else {
          setPracticeQuestions([]);
        }
      })
      .catch(() => {
        // message.error("Không lấy được danh sách câu hỏi thực hành");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [examId]);

  return (
    <div className="flex gap-4 p-4">
      {/* Bên trái: Danh sách từ/câu */}
      <div className="w-1/3 bg-gray-100 p-4 rounded-md">
        <h3 className="text-lg font-bold mb-4">Danh sách từ/câu</h3>
        <div className="mb-4">
          <p className="text-xl font-semibold">
            Câu hỏi {currentWordIndex + 1}/{practiceQuestions.length}
          </p>
        </div>
                  <div className="mb-6 text-xl min-h-[48px]">
            {practiceQuestions[currentWordIndex]?.contentFromExamVocabulary}
          </div>
        <div className="flex justify-between">
          <Button
            disabled={currentWordIndex === 0}
            onClick={handlePreviousWord}
          >
            Quay lại
          </Button>
          <Button
            disabled={currentWordIndex === practiceQuestions.length - 1}
            onClick={handleNextWord}
          >
            Tiếp theo
          </Button>
        </div>
      </div>

      {/* Bên phải: Camera và chức năng */}
      <div className="w-2/3 bg-white p-4 rounded-md">
        <h3 className="text-lg font-bold mb-4">Biểu diễn ngôn ngữ ký hiệu</h3>
        <Webcam
          audio={false}
          className="w-full h-64 bg-black rounded-md mb-4"
        />
        <div className="flex justify-between">
          <Button
            type="primary"
            onClick={handleStartRecording}
            disabled={isRecording}
          >
            Bắt đầu quay
          </Button>
          <Button
            type="default"
            onClick={handleStopRecording}
            disabled={!isRecording}
          >
            Dừng quay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPractice;
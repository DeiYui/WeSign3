"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, message, Spin } from "antd";
import Webcam from "react-webcam";
import Exam from "@/model/Exam";
import { useParams, useRouter } from "next/navigation";

const QuestionsPractice: React.FC = () => {
  const params = useParams();
  const router = useRouter(); // Thêm dòng này ở đầu component
  const examId = params?.id;
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUrls, setVideoUrls] = useState<(string | null)[]>([]);
  const [showPreview, setShowPreview] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  });

  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Lấy danh sách câu hỏi thực hành
  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    Exam.getDetailPracticeExam(Number(examId))
      .then((res) => {
        if (res?.data) {
          setPracticeQuestions(res.data);
          setVideoUrls(new Array(res.data.length).fill(null));
        } else {
          setPracticeQuestions([]);
          setVideoUrls([]);
        }
      })
      .catch(() => {
        message.error("Không lấy được danh sách câu hỏi thực hành");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [examId]);

  // Bắt đầu quay video
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedChunks([]);
    const stream = webcamRef.current?.stream as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    mediaRecorder.onstop = handleSaveVideo;
    mediaRecorder.start();
  };

  // Dừng quay video
  const handleStopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  };

  // Lưu video sau khi quay xong
  const handleSaveVideo = async () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    // Giả lập upload, thực tế bạn sẽ upload lên server và lấy url
    const url = URL.createObjectURL(blob);
    setVideoUrls((prev) => {
      const updated = [...prev];
      updated[currentWordIndex] = url;
      return updated;
    });
    message.success(`Đã lưu video cho câu hỏi ${currentWordIndex + 1}`);
  };

  // Nộp bài: gửi tất cả url video đã lưu cho backend
  const handleSubmit = async () => {
    if (videoUrls.filter(Boolean).length === 0) {
      message.warning("Bạn chưa quay video nào để nộp!");
      return;
    }
    setLoading(true);
    try {
      // Gửi lên backend: gửi cả mảng videoUrls (bao gồm cả null nếu chưa làm)
      await Exam.submitPracticeVideos({
        examId,
        videos: videoUrls,
      });
      message.success("Nộp bài thành công!");
      // Quay về trang danh sách bài kiểm tra
      router.push("/exam");
    } catch (err) {
      message.error("Nộp bài thất bại!");
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="flex gap-4 p-4">
        {/* Bên trái: Danh sách từ/câu */}
        <div className="w-1/3 bg-gray-100 p-6 rounded-md flex flex-col items-center">
          <h3 className="text-lg font-bold mb-6">Danh sách từ/câu</h3>
          <div
            className="mb-6 w-full text-center border-2 border-blue-400 rounded-lg p-6 bg-white shadow"
            style={{ minHeight: 120 }}
          >
            <div className="text-primary text-2xl font-bold mb-2">
              Câu hỏi {currentWordIndex + 1}/{practiceQuestions.length}
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {practiceQuestions[currentWordIndex]?.contentFromExamVocabulary}
            </div>
          </div>
          <div className="flex justify-between w-full gap-4 mt-4">
            <Button
              type="default"
              size="large"
              style={{
                flex: 1,
                background: "#f0f5ff",
                color: "#2f54eb",
                fontWeight: 600,
                border: "1.5px solid #2f54eb",
              }}
              disabled={currentWordIndex === 0}
              onClick={() => setCurrentWordIndex((i) => i - 1)}
            >
              ← Quay lại
            </Button>
            <Button
              type="primary"
              size="large"
              style={{
                flex: 1,
                background: "#2f54eb",
                color: "#fff",
                fontWeight: 600,
                border: "1.5px solid #2f54eb",
              }}
              disabled={currentWordIndex === practiceQuestions.length - 1}
              onClick={() => setCurrentWordIndex((i) => i + 1)}
            >
              Tiếp theo →
            </Button>
          </div>
        </div>

        {/* Bên phải: Camera và chức năng */}
        <div className="w-2/3 bg-white p-6 rounded-md flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Biểu diễn ngôn ngữ ký hiệu</h3>
          <Webcam
            ref={webcamRef}
            audio={false}
            className="w-full"
            style={{
              width: "100%",
              maxWidth: 900,
              height: 520,
              background: "#000",
              borderRadius: 18,
              objectFit: "cover",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user",
            }}
          />
          <div className="flex justify-between w-full mt-8 gap-4">
            <Button
              type="primary"
              onClick={handleStartRecording}
              disabled={isRecording}
              style={{ minWidth: 140, fontWeight: 600, fontSize: 16 }}
            >
              Bắt đầu quay
            </Button>
            <Button
              type="default"
              onClick={handleStopRecording}
              disabled={!isRecording}
              style={{ minWidth: 140, fontWeight: 600, fontSize: 16 }}
            >
              Dừng quay
            </Button>
            <Button
              type="dashed"
              disabled={!videoUrls[currentWordIndex]}
              onClick={() =>
                setShowPreview({ open: true, url: videoUrls[currentWordIndex] || "" })
              }
              style={{
                minWidth: 140,
                fontWeight: 600,
                fontSize: 16,
                border: "1.5px dashed #2f54eb",
                color: "#2f54eb",
              }}
            >
              Xem lại file
            </Button>
          </div>
          <div className="flex justify-center w-full mt-10">
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              style={{
                minWidth: 200,
                fontWeight: 700,
                fontSize: 18,
                background: "#52c41a",
                border: "none",
              }}
            >
              Nộp bài
            </Button>
          </div>
        </div>
      </div>
      {/* Modal xem lại video */}
      <Modal
        open={showPreview.open}
        onCancel={() => setShowPreview({ open: false, url: "" })}
        footer={null}
        title="Xem lại video"
        width={900}
        destroyOnClose
      >
        <div className="flex justify-center">
          {showPreview.url && (
            <video
              key={showPreview.url}
              controls
              src={showPreview.url}
              style={{ width: "100%", maxWidth: 800, borderRadius: 12 }}
            />
          )}
        </div>
      </Modal>
    </Spin>
  );
};

export default QuestionsPractice;
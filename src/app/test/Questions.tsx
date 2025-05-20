/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { filterOption } from "@/components/Dashboard/DashboardApp";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import Learning from "@/model/Learning";
import UploadModel from "@/model/UploadModel";
import { WarningFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Image,
  Modal,
  Select,
  Spin,
  Tabs,
  Tooltip,
  message,
  Upload,
} from "antd";
import { RcFile } from "antd/lib/upload";
import axios from "axios";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ReactMediaRecorder } from "react-media-recorder-2";
import Webcam from "react-webcam";
import * as XLSX from "xlsx";
import { formatTime } from "../collect-data/CollectData";
import LearningData from "../practice-data/LearningData";
import Exam from "@/model/Exam";
import { useParams } from "next/navigation";

const PracticeData: React.FC = () => {
  // Lấy examId từ URL (giả sử truyền examId khi chuyển sang trang này)
    const params = useParams();
    const examId = params?.id;
  // State cho danh sách câu hỏi thực hành và index hiện tại
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Gọi API lấy danh sách câu hỏi thực hành theo examId
  // useEffect(() => {
  //   if (!examId) return;
  //   setLoading(true);
  //   // TODO: Thay thế bằng API thật khi backend sẵn sàng
  //   fetch(`/api/exam/practice-questions?examId=${examId}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setPracticeQuestions(data || []);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       message.error("Không lấy được danh sách câu hỏi thực hành");
  //       setLoading(false);
  //     });
  // }, [examId]);
  useEffect(() => {
  if (!examId) return;
  setLoading(true);

  Exam.getDetailPracticeExam(Number(examId))
    .then((res) => {
      console.log('105', res.data)
      if (res?.data) {
        setPracticeQuestions(res.data); // giả sử bạn cần mảng câu hỏi
      } else {
        setPracticeQuestions([]);
      }
    })
    .catch(() => {
      message.error("Không lấy được danh sách câu hỏi thực hành");
    })
    .finally(() => {
      setLoading(false);
    });
}, [examId]);

  const [showSampleData, setShowSampleData] = useState<boolean>(true);
  const [webcamReady, setWebcamReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(5);
  const [showModalPreview, setShowModalPreview] = useState<{
    open: boolean;
    preview: string | undefined;
    type: string;
  }>({
    open: false,
    preview: "",
    type: "",
  });
  const [showModalResult, setShowModalResult] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const isRecordingRef = useRef(false);
  const maxRecordingTime = 5;
  // Kết quả sau khi xử lý AI
  const [resultContent, setResultContent] = useState<{
    content: string;
    fileLocation?: string;
  }>({
    content: "",
    fileLocation: "",
  });
  const startTimeRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStatusRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkButtonRef = useRef<HTMLButtonElement>(null);

  // Dữ liệu mẫu
  const [filterParams, setFilterParams] = useState<any>({
    topic: "",
    vocabulary: "",
    file: "",
    vocabularyName: "",
  });

  const [modalVideo, setModalVideo] = useState<{
    open: boolean;
    previewImg: string;
    previewVideo: string;
    type: string;
    vocabularyContent?: string;
    typeModal?: string;
  }>({
    open: false,
    previewImg: "",
    previewVideo: "",
    type: "",
    vocabularyContent: "",
    typeModal: "create",
  });

  const videoRef = useRef<any>(null);

  const handleWebcamReady = useCallback(() => {
    setWebcamReady(true);
  }, []);

  // Đọc file excel
  const [dataExcel, setDataExcel] = useState<any>([]);
  const excelUrl =
    "https://res.cloudinary.com/dso3fp1fx/raw/upload/v1720014385/01_1-200_yttv3i.xlsx";

  // Đọc dữ liệu lưu file AI tử cloudinary
  useEffect(() => {
    async function fetchData() {
      try {
        // Tải tệp từ Cloudinary
        const response = await axios.get(excelUrl, {
          responseType: "arraybuffer",
        });

        // Đọc tệp Excel
        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: "array" });

        // Chuyển đổi dữ liệu
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const transformedData = jsonData.map((item: any) => {
          const newItem = {
            ...item,
            id: item["__EMPTY"],
            word: item["Words"],
            link: item["Link Video"],
          };
          delete newItem["__EMPTY"];
          delete newItem["Words"];
          delete newItem["Link Video"];
          return newItem;
        });

        // Lưu dữ liệu vào state
        setDataExcel(transformedData);
      } catch (error) {
        console.error("Lỗi khi đọc tệp Excel:", error);
      }
    }

    fetchData();
  }, [excelUrl]);

  // API lấy danh sách  topics
  const { data: allTopics } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      console.log("test topic", res);
      return res?.data?.map((item: { topicId: any; content: any }) => ({
        id: item.topicId,
        value: item.topicId,
        label: item.content,
        text: item.content,
      }));
    },
  });

  // API lấy danh sách từ theo topics
  const { data: allVocabulary, isFetching: isFetchingVocabulary } = useQuery({
    queryKey: ["getVocabularyTopic", filterParams.topic],
    queryFn: async () => {
      const res = await Learning.getVocabularyTopic(filterParams.topic);
      if (res?.data) {
        return res?.data?.map(
          (item: {
            vocabularyId: any;
            content: any;
            vocabularyImageResList: any;
            vocabularyVideoResList: any;
          }) => ({
            id: item.vocabularyId,
            value: item.vocabularyId,
            label: item.content,
            vocabularyImageResList: item.vocabularyImageResList,
            vocabularyVideoResList: item.vocabularyVideoResList,
          }),
        );
      }
      return [];
    },
    enabled: !!filterParams.topic,
  });

  const handleStartRecording = useCallback(
    (startRecording: any, stopRecording: any) => {
      if (isRecordingRef.current) return;
      isRecordingRef.current = true;
      setRecordingTime(0);
      startTimeRef.current = null; // Sẽ được đặt khi status thực sự là "recording"
      startRecording();

      // Kiểm tra status và bắt đầu đếm thời gian
      const checkRecordingStatus = () => {
        if (recordingStatusRef.current === "recording") {
          if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
          }

          intervalRef.current = setInterval(() => {
            const elapsedTime = Math.floor(
              (Date.now() - startTimeRef.current!) / 1000,
            );
            setRecordingTime(elapsedTime);

            if (elapsedTime >= recordingDuration) {
              handleStopRecording(stopRecording);
            }
          }, 1000);

          // Đặt timeout để dừng ghi sau recordingDuration
          recordingTimeoutRef.current = setTimeout(() => {
            handleStopRecording(stopRecording);
          }, recordingDuration * 1000);
        } else {
          // Nếu chưa ở trạng thái recording, kiểm tra lại sau 100ms
          setTimeout(checkRecordingStatus, 100);
        }
      };

      checkRecordingStatus();
    },
    [recordingDuration],
  );

  const handleStopRecording = useCallback(
    async (stopRecording: () => void) => {
      if (!isRecordingRef.current) return;

      isRecordingRef.current = false;
      stopRecording();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      startTimeRef.current = null;
      setRecordingTime(0);
      setShowModalPreview({
        ...showModalPreview,
        open: false,
        type: "video",
      });
      setTimeout(() => {
        if (checkButtonRef.current) {
          checkButtonRef.current.click();
        }
      }, 1000);
    },

    [showModalPreview],
  );

  const uploadVideo = async (mediaBlobUrl: any) => {
    const formData = new FormData();
    const response = await fetch(mediaBlobUrl);
    const blob: any = await response.blob();
    const metadata = { type: blob.type, lastModified: blob.lastModified };
    const file = new File([blob], `volunteer_${Date.now()}.mp4`, metadata);
    formData.append("file", file);
    return await UploadModel.uploadFile(formData);
  };

  const [selectedAIModel, setSelectedAIModel] = useState("model1");

  // Kiểm tra AI
  const mutationDetectAI = useMutation({
    mutationFn: async (data: { videoUrl: string }) => {
      console.log("Gửi dữ liệu đến AI model:", data);
      if (selectedAIModel === "model1") {
        console.log("Sử dụng model1...");
        return await UploadModel.checkAI(data);
      } else if (selectedAIModel === "model2") {
        console.log("Sử dụng model2...");
        const response = await axios.post(
          "https://wesign.ibme.edu.vn/ai/t2/ai/detection",
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Kết quả trả về từ model2:", response.data);
        return response.data;
      }
    },
    onSuccess: async (res: any) => {
      console.log("Kết quả AI detect thành công:", res);

      const vocabularyName =
        typeof filterParams?.vocabularyName === "string"
          ? filterParams.vocabularyName.toLowerCase().trim()
          : null;

      const content =
        typeof res?.action_name === "string"
          ? res.action_name.toLowerCase().trim()
          : null;

      // Loại bỏ phần mô tả trong ngoặc (nếu có)
      const normalize = (str: string) => str.replace(/\s*\(.*?\)\s*/g, "").trim();

      const normalizedContent = content ? normalize(content) : null;
      const normalizedVocabularyName = vocabularyName
        ? normalize(vocabularyName)
        : null;

      if (
        normalizedContent &&
        normalizedVocabularyName &&
        normalizedContent === normalizedVocabularyName
      ) {
        console.log("Kết quả AI khớp với từ vựng:", normalizedVocabularyName);
        const body = {
          dataLocation: filterParams.file,
          vocabularyId: filterParams.vocabulary,
        };
        await Learning.sendData(body);
      } else {
        console.log("Kết quả AI không khớp với từ vựng.");
      }

      if (res?.action_name) {
        setResultContent({
          content: res.action_name,
          fileLocation: res.fileLocation,
        });
        setShowModalResult(true);
        message.success("Xử lý dữ liệu thành công");
      } else {
        message.error("Không có từ nào đúng với nội dung cung cấp");
      }
    },
    onError: (error) => {
      console.error("Lỗi khi gọi AI model:", error);
      message.error("Đã xảy ra lỗi khi xử lý AI");
    },
  });

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<RcFile | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Function to handle video upload
  const handleUpload = async () => {
    if (!uploadedVideo) {
      message.error("Vui lòng chọn một video.");
      return;
    }

    console.log("Loại file được upload:", uploadedVideo.type);

    const isVideo = uploadedVideo.type.startsWith("video/");
    const isLt10M = uploadedVideo.size / 1024 / 1024 < 10;

    if (!isVideo) {
      message.error("File phải là video.");
      return;
    }

    if (!isLt10M) {
      message.error("Video phải nhỏ hơn 10MB.");
      return;
    }

    const videoDuration = await getVideoDuration(uploadedVideo);
    if (videoDuration > 5) {
      message.error("Video phải có thời lượng tối đa 5 giây.");
      return;
    }

    try {
      setUploadLoading(true); // Set loading state
      const formData = new FormData();
      formData.append("file", uploadedVideo);
      const response = await UploadModel.uploadFile(formData);

      console.log("Phản hồi từ API upload:", response);
      if (!response || typeof response !== "string") {
        throw new Error("Phản hồi từ API không hợp lệ hoặc thiếu URL video.");
      }

      const videoUrl = response; // Lấy URL từ response (response.data là chuỗi)
      console.log("Video đã được tải lên. URL:", videoUrl);

      // Gửi video đến AI model
      mutationDetectAI.mutate({ videoUrl }, {
        onSettled: () => {
          setUploadLoading(false); // Reset loading state
          setUploadModalVisible(false);
          setUploadedVideo(null);
        }
      });

      message.success("Video đã được tải lên thành công.");
    } catch (error) {
      console.error("Lỗi khi tải video:", error);
      message.error("Không thể tải video. Vui lòng thử lại.");
      setUploadLoading(false);
    }
  };

  // Function to get video duration
  const getVideoDuration = (file: RcFile): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Random từ vựng
  const [randomVocabularyList, setRandomVocabularyList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomWord, setRandomWord] = useState<any>(null); // Từ vựng được random
  const [vocabularyList, setVocabularyList] = useState<any[]>([]); // Danh sách từ vựng

  // Lấy danh sách từ vựng từ API khi component được mount
  useEffect(() => {
    async function fetchVocabulary() {
      try {
        const data = await Learning.getAllVocabulary(); // Gọi API từ Learning.ts
        setVocabularyList(data.data); // Lưu danh sách từ vựng vào state      
      } catch (error) {
        console.error("Lỗi khi lấy danh sách từ vựng:", error);
      }
    }
    fetchVocabulary();
  }, []);

  // Hàm random từ vựng
  const handleRandomWord = () => {
    if (vocabularyList.length > 0) {
      const randomIndex = Math.floor(Math.random() * vocabularyList.length);
       setRandomWord(vocabularyList[randomIndex]); // Chọn một từ ngẫu nhiên
    } else {
      message.warning("Không có từ vựng để random.");
    }
  };

  // Chuyển tiếp sang từ khác
  const handleNextWord = () => {
    if (currentIndex < randomVocabularyList.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setRandomWord(randomVocabularyList[nextIndex]);
    }
  };

  // Quay lại từ ban đầu
  const handleResetWord = () => {
    setCurrentIndex(0);
    setRandomWord(randomVocabularyList[0]);
  };

  const [videoUrls, setVideoUrls] = useState<(string | null)[]>([]); // Lưu URL video từng câu
  const [submitted, setSubmitted] = useState(false);
  const [resultList, setResultList] = useState<any[]>([]); // Kết quả AI trả về

  // Khi upload xong video cho từng câu hỏi
  const handleSaveVideo = async (mediaBlobUrl: string, index: number) => {
    const link = await uploadVideo(mediaBlobUrl);
    setVideoUrls((prev) => {
      const updated = [...prev];
      updated[index] = link;
      return updated;
    });
    message.success(`Đã lưu video cho câu hỏi ${index + 1}`);
  };

  // Khi ấn Nộp bài
  const handleSubmit = async () => {
    // Gửi danh sách video lên backend để detect AI
    try {
      setLoading(true);
      const res = await fetch("/api/exam/submit-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          videos: videoUrls,
        }),
      });
      const data = await res.json();
      setResultList(data.results || []);
      setSubmitted(true);
      setLoading(false);
      message.success("Đã nộp bài và chấm điểm xong!");
    } catch (err) {
      setLoading(false);
      message.error("Nộp bài thất bại!");
    }
  };

  // Tự động lưu video khi quay xong
  const handleAutoSaveVideo = async (mediaBlobUrl: string, index: number) => {
    const link = await uploadVideo(mediaBlobUrl);
    setVideoUrls((prev) => {
      const updated = [...prev];
      updated[index] = link;
      return updated;
    });
    message.success(`Đã tự động lưu video cho câu hỏi ${index + 1}`);
  };

  return (
    <Spin spinning={loading}>
      <div className="relative flex h-[600px] items-start justify-between gap-4 overflow-hidden bg-gray-2">
        <div className="flex w-1/2 flex-col justify-start">
          <div className="mb-2 flex justify-between items-center text-xl font-semibold">
            <div>
              Câu hỏi {currentIndex + 1}/{practiceQuestions.length}
            </div>
          </div>
          <div className="mb-6 text-xl min-h-[48px]">
            {practiceQuestions[currentIndex]?.contentFromExamVocabulary}
          </div>
          <div className="flex gap-4 mt-2">
            <Button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              Lùi
            </Button>
            <Button
              onClick={() =>
                setCurrentIndex((i) => Math.min(practiceQuestions.length - 1, i + 1))
              }
              disabled={currentIndex === practiceQuestions.length - 1}
            >
              Tiến
            </Button>
          </div>
        </div>
        <div className="w-1/2">
          {!webcamReady && (
            <div className="flex justify-center">
              <Spin />
            </div>
          )}
          <Webcam
            className="scale-x-[-1] object-fill"
            width="100%"
            height={50}
            ref={webcamRef}
            audio={false}
            onUserMedia={handleWebcamReady}
            style={{
              filter: "FlipH",
              height: "70%",
            }}
          />
          <ReactMediaRecorder
            video={true}
            render={({
              status,
              startRecording,
              stopRecording,
              mediaBlobUrl,
            }) => {
              recordingStatusRef.current = status;

              // Khi quay xong video thì tự động upload
              useEffect(() => {
                if (mediaBlobUrl) {
                  handleAutoSaveVideo(mediaBlobUrl, currentIndex);
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, [mediaBlobUrl, currentIndex]);

              return (
                <div className="mt-3 object-contain overflow-y-auto max-h-[200px]">
                  <div className="flex gap-2 items-center">
                    <p>Trạng thái video: {status}</p>
                    <Select
                      defaultValue={5}
                      onChange={(value) => setRecordingDuration(value)}
                      options={[
                        { value: 3, label: "3 giây" },
                        { value: 4, label: "4 giây" },
                        { value: 5, label: "5 giây" },
                      ]}
                      className="w-24"
                    />
                    <Button
                      className="flex items-center gap-3"
                      onClick={() => handleStartRecording(startRecording, stopRecording)}
                      disabled={isRecordingRef.current}
                      icon={
                        <Tooltip
                          title={`Thời gian tối đa cho mỗi video là ${recordingDuration}s.`}
                          placement="top"
                          trigger="hover"
                          color="#4096ff"
                        >
                          <WarningFilled style={{ color: "#4096ff" }} />
                        </Tooltip>
                      }
                    >
                      Bắt đầu quay
                      {isRecordingRef.current && (
                        <p
                          className="text-sm text-black"
                          style={{ color: "red" }}
                        >
                          {formatTime(Math.max(0, recordingTime))}
                        </p>
                      )}
                    </Button>
                    <Button
                      disabled={!videoUrls[currentIndex]}
                      onClick={() =>
                        setShowModalPreview({
                          ...showModalPreview,
                          open: true,
                          preview: videoUrls[currentIndex] || "",
                          type: "video",
                        })
                      }
                    >
                      Xem lại File
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
      {/* Nút nộp bài */}
      <div className="flex justify-center mt-6">
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
        >
          Nộp bài
        </Button>
      </div>
      {/* Hiển thị kết quả sau khi nộp bài */}
      {submitted && (
        <Modal
          open={submitted}
          onCancel={() => setSubmitted(false)}
          footer={null}
          title="Kết quả bài kiểm tra"
          width={800}
        >
          <div>
            {resultList.map((item, idx) => (
              <div key={idx} className="mb-2">
                <b>Câu {idx + 1}:</b> {item.question} <br />
                <span>
                  Đáp án AI: <b>{item.aiAnswer}</b> -{" "}
                  {item.isCorrect ? (
                    <span style={{ color: "green" }}>Đúng</span>
                  ) : (
                    <span style={{ color: "red" }}>Sai</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {/* Modal xem lại giữ nguyên */}
      <Modal
        open={showModalPreview.open}
        onCancel={() =>
          setShowModalPreview({ ...showModalPreview, open: false })
        }
        footer={null}
        title="Xem lại video"
        width={800}
      >
        <div className="flex justify-center">
          <video controls src={showModalPreview.preview}></video>
        </div>
      </Modal>
    </Spin>
  );
};

export default PracticeData;

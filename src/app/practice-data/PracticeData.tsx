"use client";
import UploadModel from "@/model/UploadModel";
import { WarningFilled } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Image, Modal, Spin, Tabs, Tooltip, message } from "antd";
import React, { useCallback, useRef, useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder-2";
import Webcam from "react-webcam";
import { formatTime } from "../collect-data/CollectData";
import LearningData from "./LearningData";

const PracticeData: React.FC = () => {
  const [webcamReady, setWebcamReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [showModalPreview, setShowModalPreview] = useState<{
    open: boolean;
    preview: string | undefined;
    type: string;
  }>({ open: false, preview: "", type: "" });
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRecordingRef = useRef(false);
  const maxRecordingTime = 5;
  // Kết quả sau khi xử lý AI
  const [resultContent, setResultContent] = useState<{
    content: string;
  }>({
    content: "",
  });
  const startTimeRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStatusRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleWebcamReady = useCallback(() => {
    setWebcamReady(true);
  }, []);

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

            if (elapsedTime >= maxRecordingTime) {
              handleStopRecording(stopRecording);
            }
          }, 1000);

          // Đặt timeout để dừng ghi sau maxRecordingTime
          recordingTimeoutRef.current = setTimeout(() => {
            handleStopRecording(stopRecording);
          }, maxRecordingTime * 1000);
        } else {
          // Nếu chưa ở trạng thái recording, kiểm tra lại sau 100ms
          setTimeout(checkRecordingStatus, 100);
        }
      };

      checkRecordingStatus();
    },
    [maxRecordingTime],
  );

  const handleStopRecording = useCallback(
    (stopRecording: any) => {
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
        type: "video",
      });
      message.success("Video đã được lưu. Bạn có thể xem lại video");
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

  // Kiểm tra AI
  const mutationDetectAI = useMutation({
    mutationFn: UploadModel.checkAI,
    onSuccess: (res) => {
      message.success("Xử lý dữ liệu thành công");
      setResultContent({ content: res.data?.content });
    },
  });

  return (
    <>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Luyện tập từ vựng" key="1">
          <div className="relative flex h-[500px] items-center justify-between overflow-hidden bg-gray-2">
            <div className="w-1/2">
              <Webcam
                className="absolute left-0 top-0 z-999 object-contain"
                width={600}
                height={400}
                ref={webcamRef}
                audio={false}
                onUserMedia={handleWebcamReady}
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
                  return (
                    <div className="absolute bottom-0 left-0 z-999 flex gap-4 object-contain">
                      <p>Trạng thái quay video: {status}</p>
                      <Button
                        className="flex items-center gap-3"
                        onClick={() =>
                          handleStartRecording(startRecording, stopRecording)
                        }
                        disabled={isRecordingRef.current}
                        icon={
                          <Tooltip
                            title={`Thời gian tối đa cho mỗi video là ${maxRecordingTime}s.`}
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
                        onClick={() => handleStopRecording(stopRecording)}
                        disabled={!isRecordingRef.current}
                      >
                        Dừng quay
                      </Button>
                      <Button
                        disabled={!mediaBlobUrl}
                        onClick={() => {
                          if (showModalPreview.type === "image") {
                            setShowModalPreview({
                              ...showModalPreview,
                              open: true,
                            });
                          } else {
                            setShowModalPreview({
                              ...showModalPreview,
                              open: true,
                              preview: mediaBlobUrl,
                            });
                          }
                        }}
                      >
                        Xem lại file
                      </Button>
                      <Button
                        size="large"
                        type="primary"
                        disabled={!mediaBlobUrl}
                        className="text-center"
                        onClick={async () => {
                          const link = await uploadVideo(mediaBlobUrl);
                          mutationDetectAI.mutate({ videoUrl: link });
                        }}
                      >
                        Kiểm tra
                      </Button>
                    </div>
                  );
                }}
              />

              <canvas
                ref={canvasRef}
                width={600}
                height={450}
                className="absolute left-0 top-0 z-999 object-cover pb-3"
              />
            </div>
            <div className="flex w-1/2 justify-center gap-x-5">
              kết quả
              <Spin spinning={mutationDetectAI.isPending}>
                <div className="text-center text-[60px] font-bold">
                  {resultContent.content}
                </div>
              </Spin>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Luyện tập theo bảng chữ cái" key="2">
          <LearningData />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal xem lại */}
      <Modal
        open={showModalPreview.open}
        onCancel={() =>
          setShowModalPreview({ ...showModalPreview, open: false })
        }
        footer={null}
        title={
          showModalPreview.type === "image" ? "Xem lại ảnh: " : "Xem lại video"
        }
        zIndex={10000}
      >
        {showModalPreview.type === "video" ? (
          <video controls src={showModalPreview.preview}></video>
        ) : (
          <Image preview={false} src={showModalPreview.preview} alt="preview" />
        )}
      </Modal>
    </>
  );
};

export default PracticeData;

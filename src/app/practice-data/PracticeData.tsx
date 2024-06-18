"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Hands, Results, HAND_CONNECTIONS, VERSION } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { ReactMediaRecorder } from "react-media-recorder-2";
import { Button, Modal, Tooltip, message } from "antd";
import { WarningFilled } from "@ant-design/icons";
import Webcam from "react-webcam";
import * as fingerpose from "fingerpose";
import * as fp from "fingerpose";
import { formatTime } from "../collect-data/CollectData";
import Handsigns from "@/utils/handsigns";

const PracticeData: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimerId, setRecordingTimerId] = useState<any>(null);
  const [showModalPreview, setShowModalPreview] = useState<{
    open: boolean;
    preview: string | undefined;
    type: string;
  }>({ open: false, preview: "", type: "" });

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const fingerPoseRef = useRef(
    new fingerpose.GestureEstimator(Object.values(Handsigns)),
  );
  const sign = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file: any) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    const sendToMediaPipe = async () => {
      if (webcamRef.current && webcamRef.current.video && webcamReady) {
        if (!webcamRef.current.video.videoWidth) {
          requestAnimationFrame(sendToMediaPipe);
        } else {
          await hands.send({ image: webcamRef.current.video });
          requestAnimationFrame(sendToMediaPipe);
        }
      }
    };

    if (webcamReady) {
      contextRef.current = canvasRef.current?.getContext("2d") || null;
      sendToMediaPipe();
    }

    return () => {
      if (hands) {
        hands.close();
      }
    };
  }, [webcamReady]);

  const onResults = async (results: Results) => {
    if (canvasRef.current && contextRef.current) {
      setLoaded(true);

      contextRef.current.save();
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      contextRef.current.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      const GE = new fp.GestureEstimator([
        fp.Gestures.ThumbsUpGesture,
        Handsigns.aSign,
        Handsigns.bSign,
        Handsigns.cSign,
        Handsigns.dSign,
        Handsigns.eSign,
        Handsigns.fSign,
        Handsigns.gSign,
        Handsigns.hSign,
        Handsigns.iSign,
        Handsigns.jSign,
        Handsigns.kSign,
        Handsigns.lSign,
        Handsigns.mSign,
        Handsigns.nSign,
        Handsigns.oSign,
        Handsigns.pSign,
        Handsigns.qSign,
        Handsigns.rSign,
        Handsigns.sSign,
        Handsigns.tSign,
        Handsigns.uSign,
        Handsigns.vSign,
        Handsigns.wSign,
        Handsigns.xSign,
        Handsigns.ySign,
        Handsigns.zSign,
      ]);

      if (results.multiHandLandmarks && results.multiHandedness) {
        for (
          let index = 0;
          index < results.multiHandLandmarks.length;
          index++
        ) {
          const landmarks = results.multiHandLandmarks[index];

          console.log("landmarks", landmarks);

          const estimatedGestures = await GE.estimate(landmarks, 6.5);
          console.log("estimatedGestures", estimatedGestures);

          if (
            estimatedGestures.gestures &&
            estimatedGestures.gestures.length > 0
          ) {
            const confidence = estimatedGestures.gestures.map((p) => p.score);
            const maxConfidence = confidence.indexOf(
              Math.max.apply(undefined, confidence),
            );
            console.log("maxConfidence", maxConfidence);

            if (
              estimatedGestures.gestures[maxConfidence].name !== "thumbs_up"
            ) {
              sign.value = estimatedGestures.gestures[maxConfidence].name;
            } else {
              sign.value = null;
            }
          }

          drawConnectors(contextRef.current, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(contextRef.current, landmarks, {
            color: "#FF0000",
            fillColor: "#FF0000",
            lineWidth: 2,
            radius: (data: any) => {
              return lerp(data.z || 0, -0.15, 0.1, 10, 1);
            },
          });
        }
      }

      contextRef.current.restore();
    }
  };

  const handleWebcamReady = useCallback(() => {
    setWebcamReady(true);
  }, []);

  const handleStartRecording = (startRecording: any) => {
    startRecording();
    const timerId = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    setRecordingTimerId(timerId);
  };

  const handleStopRecording = (stopRecording: any) => {
    stopRecording();
    clearInterval(recordingTimerId);
    setRecordingTime(0);
    message.success("Video đã được lưu. Bạn có thể xem lại video");
    setShowModalPreview({
      ...showModalPreview,
      type: "video",
    });
  };

  return (
    <>
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
            }) => (
              <div className="absolute bottom-0 left-0 z-999 flex gap-4 object-contain">
                <p>Trạng thái quay video: {status}</p>
                <Button
                  onClick={() => handleStartRecording(startRecording)}
                  disabled={status === "recording"}
                  icon={
                    <Tooltip
                      title="Thời gian tối đa cho mỗi video là 5s."
                      placement="top"
                      trigger="hover"
                      color="#4096ff"
                    >
                      <WarningFilled style={{ color: "#4096ff" }} />
                    </Tooltip>
                  }
                >
                  Bắt đầu quay
                  {recordingTime !== 0 && (
                    <p style={{ color: "red" }}>{formatTime(recordingTime)}</p>
                  )}
                </Button>
                <Button
                  onClick={() => handleStopRecording(stopRecording)}
                  disabled={status !== "recording"}
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
              </div>
            )}
          />

          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="absolute left-0 top-0 z-999 object-cover"
          />
        </div>
        <div className="flex w-1/2 justify-center">kết quả</div>
      </div>
      <div className="mt-4 flex w-full justify-center">
        <Button className="text-center">Kiểm tra</Button>
      </div>
      {!loaded && (
        <div className="loading absolute inset-0 flex items-center justify-center bg-gray-2">
          <div className="spinner h-32 w-32 animate-spin rounded-full border-8 border-t-8 border-t-blue-500"></div>
          <div className="absolute text-xl text-white">Loading</div>
        </div>
      )}

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
        {!(showModalPreview.type === "video") ? (
          <img src={showModalPreview.preview} alt="preview" />
        ) : (
          <video controls src={showModalPreview.preview}></video>
        )}
      </Modal>
    </>
  );
};

export default PracticeData;

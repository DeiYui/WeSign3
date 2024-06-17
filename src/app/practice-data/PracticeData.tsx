"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Results, Hands, HAND_CONNECTIONS, VERSION } from "@mediapipe/hands";
import {
  drawConnectors,
  drawLandmarks,
  Data,
  lerp,
} from "@mediapipe/drawing_utils";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import { Button, Image, Modal, Tooltip, message } from "antd";
import { ReactMediaRecorder } from "react-media-recorder-2";
import { WarningFilled } from "@ant-design/icons";
import { formatTime } from "../collect-data/CollectData";

const data = [
  [
    {
      x: 0.043247319757938385,
      y: 0.07247714698314667,
      z: 0.0143585205078125,
    },
    {
      x: 0.014570441097021103,
      y: 0.06042982265353203,
      z: 0.029144287109375,
    },
    {
      x: -0.010104045271873474,
      y: 0.04821936786174774,
      z: 0.042266845703125,
    },
    {
      x: -0.03772835060954094,
      y: 0.04087943583726883,
      z: 0.05865478515625,
    },
    {
      x: -0.0595359206199646,
      y: 0.03070748597383499,
      z: 0.0714111328125,
    },
    {
      x: -0.011129861697554588,
      y: 0.0002600597217679024,
      z: 0.026611328125,
    },
    {
      x: -0.025935418903827667,
      y: -0.022942783311009407,
      z: 0.0229949951171875,
    },
    {
      x: -0.04557769000530243,
      y: -0.03398936614394188,
      z: 0.016204833984375,
    },
    {
      x: -0.06912419945001602,
      y: -0.028503863140940666,
      z: -0.00415802001953125,
    },
    {
      x: -0.0014371793949976563,
      y: -0.003915974870324135,
      z: 0.00730133056640625,
    },
    {
      x: -0.02698962204158306,
      y: -0.031571164727211,
      z: -0.0017871856689453125,
    },
    {
      x: -0.05432039499282837,
      y: -0.0320463627576828,
      z: -0.016754150390625,
    },
    {
      x: -0.07929114997386932,
      y: -0.024828076362609863,
      z: -0.02752685546875,
    },
    {
      x: 0.004804319702088833,
      y: -0.0006223141681402922,
      z: -0.0177001953125,
    },
    {
      x: -0.015749571844935417,
      y: -0.020739497616887093,
      z: -0.0254974365234375,
    },
    {
      x: -0.04351562634110451,
      y: -0.021803846582770348,
      z: -0.034271240234375,
    },
    {
      x: -0.07031328231096268,
      y: -0.012864749878644943,
      z: -0.039520263671875,
    },
    {
      x: 0.011707687750458717,
      y: 0.015057062730193138,
      z: -0.032867431640625,
    },
    {
      x: -0.00045037572272121906,
      y: 0.0014220261946320534,
      z: -0.03887939453125,
    },
    {
      x: -0.028072835877537727,
      y: -0.002252180129289627,
      z: -0.048828125,
    },
    {
      x: -0.049393486231565475,
      y: 0.00623747706413269,
      z: -0.051025390625,
    },
  ],
  [
    {
      x: -0.04169473052024841,
      y: 0.07398022711277008,
      z: 0.05255126953125,
    },
    {
      x: -0.0034611374139785767,
      y: 0.05439532920718193,
      z: 0.046661376953125,
    },
    {
      x: 0.025161847472190857,
      y: 0.045454345643520355,
      z: 0.034637451171875,
    },
    {
      x: 0.0551670603454113,
      y: 0.0361492894589901,
      z: 0.01023101806640625,
    },
    {
      x: 0.07369834184646606,
      y: 0.025516726076602936,
      z: -0.00339508056640625,
    },
    {
      x: 0.01841939426958561,
      y: -0.00805029645562172,
      z: 0.015380859375,
    },
    {
      x: 0.03579849749803543,
      y: -0.026397157460451126,
      z: 0.004253387451171875,
    },
    {
      x: 0.05188453570008278,
      y: -0.037538327276706696,
      z: -0.00612640380859375,
    },
    {
      x: 0.06806100904941559,
      y: -0.04055837541818619,
      z: -0.032073974609375,
    },
    {
      x: 0.0007333513349294662,
      y: -0.004923230968415737,
      z: 0.004364013671875,
    },
    {
      x: 0.015403645113110542,
      y: -0.03581567853689194,
      z: -0.0192108154296875,
    },
    {
      x: 0.027378685772418976,
      y: -0.03922121971845627,
      z: -0.045562744140625,
    },
    {
      x: 0.04935462027788162,
      y: -0.039060790091753006,
      z: -0.06884765625,
    },
    {
      x: -0.011158538982272148,
      y: 0.0008170320652425289,
      z: -0.01073455810546875,
    },
    {
      x: -0.003854610025882721,
      y: -0.01822500303387642,
      z: -0.0299835205078125,
    },
    {
      x: 0.01569233648478985,
      y: -0.018731744959950447,
      z: -0.0526123046875,
    },
    {
      x: 0.039582837373018265,
      y: -0.011424210853874683,
      z: -0.07427978515625,
    },
    {
      x: -0.030018439516425133,
      y: 0.020363351330161095,
      z: -0.0201568603515625,
    },
    {
      x: -0.021426623687148094,
      y: 0.0034543098881840706,
      z: -0.031829833984375,
    },
    {
      x: -0.005667761899530888,
      y: -0.0017364427912980318,
      z: -0.049652099609375,
    },
    {
      x: 0.004632472991943359,
      y: 0.0104158790782094,
      z: -0.06439208984375,
    },
  ],
];

const PracticeData: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  // Quay video
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimerId, setRecordingTimerId] = useState(null);
  //Modal
  const [showModalPreview, setShowModalPreview] = useState<{
    open: boolean;
    preview: string | undefined;
    type: string;
  }>({ open: false, preview: "", type: "" });

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

  function distanceBetween(landmarks: any, p1_loc: any, p2_loc: any) {
    const p1 = landmarks[p1_loc];
    const p2 = landmarks[p2_loc];
    const squaredDist =
      (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2;
    return Math.sqrt(squaredDist);
  }

  function landmarkToDistEmb(landmarks: any) {
    const emb = [
      // thumb to finger tip
      distanceBetween(landmarks, 4, 8),
      distanceBetween(landmarks, 4, 12),
      distanceBetween(landmarks, 4, 16),
      distanceBetween(landmarks, 4, 20),
      // wrist to finger tip
      distanceBetween(landmarks, 4, 0),
      distanceBetween(landmarks, 8, 0),
      distanceBetween(landmarks, 12, 0),
      distanceBetween(landmarks, 16, 0),
      distanceBetween(landmarks, 20, 0),
      // tip to tip (specific to this application)
      distanceBetween(landmarks, 8, 12),
      distanceBetween(landmarks, 12, 16),
      // within finger joint (detect bending)
      distanceBetween(landmarks, 1, 4),
      distanceBetween(landmarks, 8, 5),
      distanceBetween(landmarks, 12, 9),
      distanceBetween(landmarks, 16, 13),
      distanceBetween(landmarks, 20, 17),
      // distance from each tip to thumb joint
      distanceBetween(landmarks, 2, 8),
      distanceBetween(landmarks, 2, 12),
      distanceBetween(landmarks, 2, 16),
      distanceBetween(landmarks, 2, 20),
    ];

    // Normalize the embedding
    const embTensor = tf.tensor1d(emb);
    const norm = tf.norm(embTensor);
    const embNorm = embTensor.div(norm).arraySync();

    return embNorm;
  }

  // Process each set of landmarks in the provided data
  data.forEach((landmarks, index) => {
    const normalizedEmbeddings = landmarkToDistEmb(landmarks);
    console.log(
      `Normalized Embeddings for set ${index + 1}:`,
      normalizedEmbeddings,
    );
  });

  const onResults = (results: Results) => {
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

      if (results.multiHandLandmarks && results.multiHandedness) {
        for (
          let index = 0;
          index < results.multiHandLandmarks.length;
          index++
        ) {
          const classification = results.multiHandedness[index];
          const isRightHand = classification.label === "Right";
          const landmarks = results.multiHandLandmarks[index];
          landmarkToDistEmb(landmarks);
          drawConnectors(contextRef.current, landmarks, HAND_CONNECTIONS, {
            color: isRightHand ? "#00FF00" : "#FF0000",
          });
          drawLandmarks(contextRef.current, landmarks, {
            color: isRightHand ? "#00FF00" : "#FF0000",
            fillColor: isRightHand ? "#FF0000" : "#00FF00",
            radius: (data: Data) => {
              return lerp(data.from!.z!, -0.15, 0.1, 10, 1);
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

  // Bắt đầu quay
  const handleStartRecording = (startRecording: any) => {
    startRecording();
    const timerId = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    setRecordingTimerId(timerId as any);
  };

  // Dừng quay
  const handleStopRecording = (stopRecording: any) => {
    stopRecording();
    clearInterval(recordingTimerId as any);
    setRecordingTime(0);
    message.success("Video đã được lưu. Bạn có thể xem lại video ");
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
              <div>
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
          <Button className="absolute bottom-0 left-0 z-999 object-contain">
            Quay
          </Button>
          <Button className="absolute bottom-0 left-20 z-999 object-contain">
            Dừng quay
          </Button>
          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="absolute left-0 top-0 z-999 object-cover"
          />
        </div>
        <div className="flex w-1/2 justify-center">kết quả</div>
      </div>
      <div className="flex w-full justify-center">
        <ButtonPrimary className="text-center">Kiểm tra</ButtonPrimary>
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
        {!(showModalPreview.type === "image") ? (
          <div>
            <video key={showModalPreview.preview} controls width="100%">
              <source src={showModalPreview.preview} />
              video không hỗ trợ cho trình duyệt này.
            </video>
          </div>
        ) : (
          <div>
            <Image
              preview={false}
              src={showModalPreview.preview}
              alt="Captured"
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default PracticeData;

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
import { Button } from "antd";

const PracticeData: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

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

  // useEffect(() => {
  //   const convertToNumpyArray = (data: any) => {
  //     // Flatten the data
  //     const flattenedData = data
  //       .flat()
  //       .map((point: any) => [point.x, point.y, point.z]);

  //     // Convert to numpy array
  //     const numpyArray = nj.array(flattenedData);

  //     // Reshape the numpy array to the desired shape
  //     const reshapedArray = numpyArray.reshape(1, 3, 224, 224);

  //     return reshapedArray;
  //   };

  //   // Convert the JSON data to numpy array and set the state
  //   const numpyArray = convertToNumpyArray(detectedData);
  //   setNumpyArray(numpyArray);
  // }, [detectedData]);

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
    </>
  );
};

export default PracticeData;

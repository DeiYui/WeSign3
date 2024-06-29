"use client";
import Handsigns from "@/utils/handsigns";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, Hands, Results, VERSION } from "@mediapipe/hands";
import * as fp from "fingerpose";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const LearningData: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);

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

      if (
        results.multiHandLandmarks?.length &&
        results.multiHandedness?.length
      ) {
        for (
          let index = 0;
          index < results.multiHandLandmarks.length;
          index++
        ) {
          const landmarks = results.multiHandLandmarks[index];
          const handSignsArray = Object.values(Handsigns);
          const GE = new fp.GestureEstimator(handSignsArray);
          const handData: any = results.multiHandLandmarks[0].map((item) => [
            item.x,
            item.y,
            item.z,
          ]);
          const gesture = await GE.estimate(handData, 8);

          if (gesture.gestures && gesture.gestures.length > 0) {
            const confidence = gesture.gestures.map((p) => p.score);
            const maxConfidence = confidence.indexOf(
              Math.max.apply(undefined, confidence),
            );

            setEmoji(gesture.gestures[maxConfidence].name);
          } else {
            setEmoji("");
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
      } else {
        setEmoji("");
      }

      contextRef.current.restore();
    }
  };

  const handleWebcamReady = useCallback(() => {
    setWebcamReady(true);
  }, []);

  return (
    <>
      <div className="relative flex h-[500px] items-center justify-between overflow-hidden bg-gray-2 ">
        <div className="w-full">
          <Webcam
            className="absolute left-0 top-0 z-999 object-contain"
            width={600}
            height={400}
            ref={webcamRef}
            audio={false}
            onUserMedia={handleWebcamReady}
          />

          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="absolute left-0 top-0 z-999 object-cover pb-3"
          />
          <div
            style={{
              top: "10%",
              position: "absolute",
              left: "25%",
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "center",
              zIndex: 999,
            }}
            className="text-[50px] text-red"
          >
            {emoji}
          </div>
        </div>
      </div>

      {!loaded && (
        <div className="loading absolute inset-0 z-999 flex items-center justify-center bg-gray-2">
          <div className="spinner h-32 w-32 animate-spin rounded-full border-8 border-t-8 border-t-blue-500"></div>
          <div className="absolute text-xl text-white">Loading</div>
        </div>
      )}
    </>
  );
};

export default LearningData;

"use client";
import Handsigns from "@/utils/handsigns";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as fp from "fingerpose";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawHand } from "./utilities";

const LearningData: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [emoji, setEmoji] = useState<string | null>(null);
  const [scoreEmoji, setScoreEmoji] = useState<number | undefined>(undefined);

  const runHandpose = async () => {
    // Set the backend to WebGL
    await tf.setBackend("webgl");
    await tf.ready();
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net: any) => {
    setLoaded(true);

    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }

      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const handSignsArray = Object.values(Handsigns);
        const GE = new fp.GestureEstimator(handSignsArray);

        const gesture = await GE.estimate(hand[0].landmarks, 7);
        if (gesture.gestures && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map((p) => p.score);
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence),
          );

          setEmoji(gesture.gestures[maxConfidence].name);
          setScoreEmoji(gesture.gestures[maxConfidence].score);
        } else {
          setEmoji("");
          setScoreEmoji(undefined);
        }
      } else {
        setScoreEmoji(undefined);
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawHand(hand, ctx);
      }
    }
  };

  useEffect(() => {
    runHandpose();
    return () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.srcObject
      ) {
        const stream = webcamRef.current.video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="text-center">
      <header className="flex min-h-screen flex-col items-center justify-center bg-[#282c34] text-[calc(10px_+_2vmin)] text-white">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <div
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
            zIndex: 9,
          }}
          className="text-[50px] text-red"
        >
          {emoji} - {scoreEmoji ? `${Math.round(scoreEmoji / 10)} ` : null}
        </div>
      </header>
      {!loaded && (
        <div className="loading absolute inset-0 z-999 flex items-center justify-center bg-gray-2">
          <div className="spinner h-32 w-32 animate-spin rounded-full border-8 border-t-8 border-t-blue-500"></div>
          <div className="absolute text-xl text-white">Loading</div>
        </div>
      )}
    </div>
  );
};

export default LearningData;

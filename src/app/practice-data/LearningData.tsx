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
        const GE = new fp.GestureEstimator([
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
        const gesture = await GE.estimate(hand[0].landmarks, 6.5);
        if (gesture.gestures && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map((p) => p.score);
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence),
          );

          setEmoji(gesture.gestures[maxConfidence].name);
        } else {
          setEmoji("");
        }
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawHand(hand, ctx);
      }
    }
  };

  useEffect(() => {
    runHandpose();
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
          className="text-[50px]"
        >
          {emoji}
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

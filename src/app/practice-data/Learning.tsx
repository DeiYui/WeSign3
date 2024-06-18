"use client";
import { useRef, useState, useEffect } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-backend-webgl"; // Ensure the WebGL backend is loaded
import * as tf from "@tensorflow/tfjs-core"; // Import core functions
import * as fp from "fingerpose";
import Handsigns from "@/utils/handsigns";

const DETECTION_INTERVAL_MILLISECONDS = 250;

export default function Home() {
  const videoCam = useRef(null);
  const [sign, setSign] = useState(null);

  useEffect(() => {
    const initialiseWebCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
        if (videoCam.current) {
          videoCam.current.srcObject = stream;
          videoCam.current.onloadedmetadata = () => videoCam.current.play();
        }
      } catch (e) {
        console.error(e.name + ": " + e.message);
      }
    };

    const createDetectionInstance = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: "mediapipe",
        modelType: "lite",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
      };
      return await handPoseDetection.createDetector(model, detectorConfig);
    };

    const handleSignDetection = async (detector) => {
      setInterval(async () => {
        if (!videoCam.current || !detector) return;
        const hands = await detector.estimateHands(videoCam.current);
        if (hands.length > 0) {
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

          const landmark = hands[0].keypoints3D.map((value) => [
            value.x,
            value.y,
            value.z,
          ]);
          const estimatedGestures = await GE.estimate(landmark, 6.5);

          if (
            estimatedGestures.gestures &&
            estimatedGestures.gestures.length > 0
          ) {
            const confidence = estimatedGestures.gestures.map((p) => p.score);
            const maxConfidence = confidence.indexOf(Math.max(...confidence));

            if (
              estimatedGestures.gestures[maxConfidence].name !== "thumbs_up"
            ) {
              setSign(estimatedGestures.gestures[maxConfidence].name);
            } else {
              setSign(null);
            }
          }
        }
      }, DETECTION_INTERVAL_MILLISECONDS);
    };

    const initializeDetector = async () => {
      try {
        await tf.setBackend("webgl"); // Explicitly set the backend to WebGL
        await tf.ready(); // Ensure the backend is ready
        const detector = await createDetectionInstance();
        handleSignDetection(detector);
      } catch (error) {
        console.error("Error initializing detector:", error);
      }
    };

    initialiseWebCamera();
    initializeDetector();
  }, []);

  return (
    <div className="relative flex h-screen items-center justify-center">
      <video
        ref={videoCam}
        className="h-1/2 w-1/2 -scale-x-100 transform rounded object-contain"
        preload="auto"
        autoPlay
        muted
        playsInline
      ></video>
      <div className="text-red-600 absolute bottom-16 left-1/2 -translate-x-1/2 transform text-6xl font-bold">
        {sign}
      </div>
    </div>
  );
}

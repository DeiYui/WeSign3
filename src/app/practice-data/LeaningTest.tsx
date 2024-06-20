import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import * as fp from "fingerpose";

import { Typography, Button, Image, Row, Col, Layout, Space } from "antd";
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri";
import Handsigns from "@/utils/handsigns";
import { drawHand } from "./utilities";

// Ensure Signpass is imported or defined
import { Signpass, Signimage } from "@/utils/handimage";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

export default function LeaningTest() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [camState, setCamState] = useState("on");
  const [sign, setSign] = useState<string | null>(null);

  let signList: Array<any> = [];
  let currentSign = 0;
  let gamestate = "started";

  async function runHandpose() {
    await tf.setBackend("webgl");
    await tf.ready();
    const net = await handpose.load();
    _signList();

    setInterval(() => {
      detect(net);
    }, 150);
  }

  function _signList() {
    signList = generateSigns();
  }

  function shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateSigns() {
    const password = shuffle(Signpass);
    return password;
  }

  async function detect(net: handpose.HandPose) {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
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

      const hand: any = await net.estimateHands(video);

      if (hand.length > 0) {
        const handSignsArray = Object.values(Handsigns);
        const GE = new fp.GestureEstimator(handSignsArray);

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5);

        if (gamestate === "started") {
          const appTitle: any = document.querySelector("#app-title");
          if (appTitle) {
            appTitle.innerText = "Make a 👍 gesture with your hand to start";
          }
        }

        if (
          estimatedGestures.gestures !== undefined &&
          estimatedGestures.gestures.length > 0
        ) {
          const confidence = estimatedGestures.gestures.map(
            (p: any) => p.confidence,
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence),
          );

          if (
            estimatedGestures.gestures[maxConfidence].name === "thumbs_up" &&
            gamestate !== "played"
          ) {
            _signList();
            gamestate = "played";
            const emojiImage = document.getElementById("emojimage");
            if (emojiImage) {
              emojiImage.classList.add("play");
            }
            const tutorText: any = document.querySelector(".tutor-text");
            if (tutorText) {
              tutorText.innerText =
                "make a hand gesture based on letter shown below";
            }
          } else if (gamestate === "played") {
            const appTitle: any = document.querySelector("#app-title");
            if (appTitle) {
              appTitle.innerText = "";
            }

            if (currentSign === signList.length) {
              _signList();
              currentSign = 0;
              return;
            }

            const emojiImage = document.getElementById("emojimage");
            if (emojiImage && signList[currentSign].src.src) {
              emojiImage.setAttribute("src", signList[currentSign].src.src);
              if (
                signList[currentSign].alt ===
                estimatedGestures.gestures[maxConfidence].name
              ) {
                currentSign++;
              }
              setSign(estimatedGestures.gestures[maxConfidence].name);
            }
          } else if (gamestate === "finished") {
            return;
          }
        }
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawHand(hand, ctx);
      }
    }
  }

  useEffect(() => {
    runHandpose();
  }, []);

  function turnOffCamera() {
    setCamState((prevState) => (prevState === "on" ? "off" : "on"));
  }

  return (
    <Layout style={{ backgroundColor: "#5784BA", height: "100vh" }}>
      <Header style={{ backgroundColor: "#5784BA" }}>
        <Title
          level={3}
          className="tutor-text"
          style={{ color: "white" }}
        ></Title>
      </Header>
      <Content>
        <Row justify="center">
          <Col>
            <Title level={1} id="app-title" style={{ color: "white" }}>
              🧙‍♀️ Loading the Magic 🧙‍♂️
            </Title>
          </Col>
        </Row>

        <Row justify="center">
          <Col>
            <div id="webcam-container">
              {camState === "on" ? (
                <Webcam id="webcam" ref={webcamRef} />
              ) : (
                <div id="webcam" style={{ backgroundColor: "black" }}></div>
              )}

              {sign ? (
                <div
                  style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    right: "calc(50% - 50px)",
                    bottom: 100,
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: "sm",
                      marginBottom: "1rem",
                    }}
                  >
                    detected gestures
                  </Text>
                  <Image
                    preview={false}
                    alt="signImage"
                    src={
                      Signimage[sign]?.src
                        ? Signimage[sign].src
                        : "/loveyou_emoji.svg"
                    }
                    style={{ height: 30 }}
                  />
                </div>
              ) : (
                " "
              )}
            </div>

            <canvas id="gesture-canvas" ref={canvasRef} style={{}} />

            <div
              id="singmoji"
              style={{
                zIndex: 9,
                position: "fixed",
                top: "50px",
                right: "30px",
              }}
            ></div>

            <Image alt="" preview={false} height="150px" id="emojimage" />
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: "1rem" }}>
          <Col>
            <Space>
              <Button
                icon={
                  camState === "on" ? (
                    <RiCameraFill size={20} />
                  ) : (
                    <RiCameraOffFill size={20} />
                  )
                }
                onClick={turnOffCamera}
                type="primary"
                danger
              >
                Camera
              </Button>
              {/* Placeholder for About component */}
            </Space>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

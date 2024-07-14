import { CallIcon, EndCallIcon, Logo } from "@/assets/icons";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import User from "@/model/User";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import * as fp from "fingerpose";
import { RootState } from "@/store";
import Handsigns from "@/utils/handsigns";
import {
  AudioMutedOutlined,
  AudioOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { HandPose } from "@tensorflow-models/handpose";
import { Avatar, Modal, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { drawHand } from "@/app/practice-data/drawHand";

type CallModalProps = {
  incoming: any;
  setIsModalOpen?: any;
  isOpen: boolean;
  acceptCall?: any;
  endCall?: any;
  selectedContact?: any;
  localStream?: any;
  remoteStream?: any;
  isVideoOff?: boolean;
  isAudioMuted?: boolean;
  toggleAudio?: any;
  toggleVideo?: any;
  users?: any;
  callAccepted?: boolean;
};

const CustomModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
  }
`;
const CustomVideo = styled.video`
  width: 100%;
  height: 600px;
`;

const CallModalSocket: React.FC<CallModalProps> = ({
  isOpen,
  setIsModalOpen,
  incoming,
  acceptCall,
  endCall,
  selectedContact,
  localStream,
  remoteStream,
  isVideoOff,
  isAudioMuted,
  toggleAudio,
  toggleVideo,
  users,
  callAccepted,
}) => {
  const user: User = useSelector((state: RootState) => state.admin);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [refsReady, setRefsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sign, setSign] = useState<string | null>(null);

  // video
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  const setMyVideoRef = (ref: HTMLVideoElement | null) => {
    myVideoRef.current = ref;
    if (myVideoRef.current && userVideoRef.current) {
      setRefsReady(true);
    }
  };

  const setUserVideoRef = (ref: HTMLVideoElement | null) => {
    userVideoRef.current = ref;
    if (myVideoRef.current && userVideoRef.current) {
      setRefsReady(true);
    }
  };

  useEffect(() => {
    if (myVideoRef.current && userVideoRef.current) {
      setRefsReady(true);
    }
  }, [myVideoRef.current, userVideoRef.current]);

  useEffect(() => {
    if (refsReady && localStream) {
      myVideoRef.current!.srcObject = localStream;
    }
  }, [localStream, refsReady]);

  useEffect(() => {
    if (refsReady && remoteStream) {
      userVideoRef.current!.srcObject = remoteStream;
    }
  }, [remoteStream, refsReady]);

  const { data: userInfo } = useQuery({
    queryKey: ["getUserInfo", selectedContact.contactId],
    queryFn: async () => {
      const res = await User.getUserInfo(selectedContact.contactId);
      return res.data as User;
    },
    enabled: !!selectedContact.contactId,
  });

  useEffect(() => {
    setShowModalConfirm(incoming?.isRinging && !callAccepted);
  }, [incoming]);

  const handleEndCall = () => {
    endCall({ user: user, remoteUser: userInfo || users });
  };

  // detect
  async function runHandpose() {
    await tf.setBackend("webgl");
    await tf.ready();

    const net = await handpose.load();

    setInterval(() => {
      detect(net);
    }, 150);
  }

  async function detect(net: handpose.HandPose) {
    if (userVideoRef.current && userVideoRef.current?.readyState === 4) {
      const video = userVideoRef.current as HTMLVideoElement;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      userVideoRef.current.width = videoWidth;
      userVideoRef.current.height = videoHeight;

      canvasRef.current!.width = videoWidth;
      canvasRef.current!.height = videoHeight;

      const hand: any = await net.estimateHands(video);

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

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 7);

        if (
          estimatedGestures.gestures !== undefined &&
          estimatedGestures.gestures.length > 0
        ) {
          const confidence = estimatedGestures.gestures.map((p) => p.score);
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence),
          );
          setSign(estimatedGestures.gestures[maxConfidence].name);
        } else {
          setSign("");
        }
      }

      const ctx = canvasRef.current!.getContext("2d")!;
      drawHand(hand, ctx);
    }
  }

  useEffect(() => {
    runHandpose();
  }, []);

  return (
    <>
      <CustomModal
        open={isOpen}
        width={1300}
        closable={false}
        footer={null}
        maskClosable={false}
        mask={false}
        closeIcon={null}
        centered
        destroyOnClose
        zIndex={10000}
      >
        <div
          className="flex items-center justify-between bg-green-200 px-3 py-1 shadow-lg"
          style={{ border: "1px solid #8C8C8C" }}
        >
          <div className="flex items-center gap-3">
            <Logo size={20} />
            Cuộc gọi qua WeSign
          </div>
          <div className="cursor-pointer" onClick={handleEndCall}>
            <CloseOutlined />
          </div>
        </div>

        <div className="relative gap-6">
          {incoming && !incoming?.isRinging && !callAccepted && (
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 transform bg-black py-2">
              <div className="flex h-full flex-col justify-center gap-3 text-center text-white">
                <div className="flex items-center justify-center">
                  <Avatar
                    alt=""
                    icon={<UserOutlined />}
                    src={userInfo?.avatarLocation}
                    style={{ borderRadius: "100%", width: 120, height: 120 }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xl">{userInfo?.name}</div>
                  <div className="text-sm text-neutral-400">Đang gọi ...</div>
                </div>
              </div>
            </div>
          )}
          <video
            className="absolute bottom-4 right-0"
            width="300px"
            ref={setMyVideoRef}
            autoPlay
            style={{ height: "200px", display: isVideoOff ? "none" : "block" }}
            playsInline
          />
          <CustomVideo
            ref={setUserVideoRef}
            className="bg-black"
            autoPlay
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{
              filter: "FlipH",
            }}
            className="absolute left-0 top-0 z-999 scale-x-[-1] object-cover pb-3"
          />
          {/* {sign && ( */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 transform text-[30px] font-bold text-primary">
            {sign}
          </div>
          {/* )} */}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
          <div className="flex items-center justify-center gap-3">
            <Tooltip
              placement="top"
              title={isVideoOff ? "Bật video" : "Tắt video"}
              zIndex={10000}
            >
              <div
                className="cursor-pointer rounded-full bg-neutral-500 p-2.5"
                onClick={toggleVideo}
              >
                {!isVideoOff ? (
                  <CallIcon size={20} color="white" />
                ) : (
                  <div className="">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="white"
                        d="m30.929 32.697l10.937 10.937a1.25 1.25 0 0 0 1.768-1.768l-37.5-37.5a1.25 1.25 0 1 0-1.768 1.768l4.119 4.119A6.25 6.25 0 0 0 4 16.25v15.5A6.25 6.25 0 0 0 10.25 38h14.5a6.25 6.25 0 0 0 6.179-5.303m13.075.046c0 1.973-1.667 3.335-3.411 3.252L33 28.403V16.66l5.907-4.079c2.156-1.488 5.097.055 5.097 2.675zM31 16.25v10.153L14.597 10H24.75A6.25 6.25 0 0 1 31 16.25"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Tooltip>
            <Tooltip
              placement="top"
              title={!isAudioMuted ? "Tắt micro" : "Bật micro"}
              zIndex={10000}
            >
              <div
                className="cursor-pointer rounded-full bg-neutral-500 p-2.5"
                onClick={toggleAudio}
              >
                {!isAudioMuted ? (
                  <AudioMutedOutlined
                    style={{ fontSize: 20, color: "white" }}
                  />
                ) : (
                  <AudioOutlined style={{ fontSize: 20, color: "white" }} />
                )}
              </div>
            </Tooltip>
            <Tooltip placement="top" title="Kết thúc cuộc gọi" zIndex={10000}>
              <div
                className="flex cursor-pointer justify-center rounded-full bg-red p-2.5"
                onClick={handleEndCall}
              >
                <EndCallIcon size={20} color="white" />
              </div>
            </Tooltip>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        open={showModalConfirm}
        width={600}
        title={<div className="w-full pt-3 text-center">Cuộc gọi đến</div>}
        onCancel={() => setShowModalConfirm(false)}
        footer={null}
        maskClosable={false}
        mask={false}
        centered
        destroyOnClose
        zIndex={10002}
      >
        <div className="mt-4 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Avatar
                icon={<UserOutlined />}
                src={users?.avatarLocation}
                style={{ borderRadius: "100%", width: 120, height: 120 }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xl">{users?.name} đang gọi cho bạn</div>
            </div>
          </div>
          <div className="mt-4 flex w-full justify-center gap-3">
            <ButtonPrimary
              onClick={async () => {
                await acceptCall();
                setIsModalOpen(true);
              }}
            >
              Chấp nhận
            </ButtonPrimary>
            <ButtonSecondary
              onClick={() => {
                setShowModalConfirm(false);
                handleEndCall();
              }}
            >
              Từ chối
            </ButtonSecondary>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default CallModalSocket;

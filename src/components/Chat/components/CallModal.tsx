// CallModal.tsx
import { CallIcon, EndCallIcon, Logo } from "@/assets/icons";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import {
  AudioMutedOutlined,
  AudioOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Modal, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

type CallModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  myVideoRef: React.RefObject<HTMLVideoElement>;
  userVideoRef: React.RefObject<HTMLVideoElement>;
  callAccepted: boolean;
  callUser: () => void;
  answerCall: () => void;
  call: any;
  callEnded: any;
  leaveCall: any;
  toggleAudio: any;
  isAudioMuted: any;
  toggleVideo: any;
  isVideoOff: any;
  name: { myUser: User; remoteUser: User };
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

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  myVideoRef,
  userVideoRef,
  callAccepted,
  answerCall,
  call,
  callEnded,
  leaveCall,
  toggleAudio,
  isAudioMuted,
  toggleVideo,
  isVideoOff,
  name,
}) => {
  const [showModalConfirm, setShowModalConfirm] = useState(
    call.isReceivingCall && !callAccepted,
  );
  useEffect(() => {
    setShowModalConfirm(call.isReceivingCall && !callAccepted);
  }, [call, callAccepted]);

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

          <div
            className="cursor-pointer"
            onClick={() => {
              leaveCall();
            }}
          >
            <CloseOutlined />
          </div>
        </div>

        <div className="relative gap-6">
          {!callAccepted && (
            <div className="absolute top-1/2 w-full -translate-y-1/2 transform bg-black py-2">
              <div className="flex h-full flex-col justify-center gap-3 text-center text-white">
                <div className="flex items-center justify-center">
                  <Avatar
                    alt=""
                    icon={<UserOutlined />}
                    src={name.remoteUser.avatarLocation}
                    style={{ borderRadius: "100%", width: 120, height: 120 }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xl">{name.remoteUser.name}</div>
                  <div className="text-sm text-neutral-400">Đang gọi ...</div>
                </div>
              </div>
            </div>
          )}
          <video
            className="absolute bottom-4 right-0"
            width="300px"
            ref={myVideoRef}
            autoPlay
            style={{ height: "200px", display: isVideoOff ? "none" : "block" }}
            playsInline
          />
          {/* {callAccepted && !callEnded && ( */}
          <CustomVideo
            className="bg-black"
            autoPlay
            playsInline
            ref={userVideoRef}
          />
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
                {isAudioMuted ? (
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
                className="flex cursor-pointer justify-center rounded-full bg-red   p-2.5"
                onClick={leaveCall}
              >
                <EndCallIcon size={20} color="white" />
              </div>
            </Tooltip>
          </div>
        </div>
      </CustomModal>

      {/*  Modal xác nhận */}
      <CustomModal
        open={showModalConfirm}
        width={600}
        title={<div className="w-full pt-3 text-center">Cuộc gọi đến</div>}
        className=""
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
                src={name.remoteUser.avatarLocation}
                style={{ borderRadius: "100%", width: 120, height: 120 }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xl">
                {name.remoteUser.name} đang gọi cho bạn
              </div>
            </div>
          </div>
          <div className="mt-4 flex w-full justify-center gap-3">
            <ButtonPrimary
              onClick={() => {
                answerCall();
              }}
            >
              Chấp nhận
            </ButtonPrimary>
            <ButtonSecondary
              onClick={() => {
                setShowModalConfirm(false);
                leaveCall();
              }}
            >
              Từ chối
            </ButtonSecondary>
          </div>
        </div>
      </CustomModal>
    </>

    // <Modal open={isOpen} onCancel={onRequestClose}>
    //   <div>
    //     <div>
    //       <video
    //         ref={myVideoRef}
    //         autoPlay
    //         muted
    //         style={{
    //           width: "300px",
    //           height: "300px",
    //           backgroundColor: "black",
    //         }}
    //       />

    //       {callAccepted && !callEnded && (
    //         <video
    //           ref={userVideoRef}
    //           autoPlay
    //           style={{
    //             width: "300px",
    //             height: "300px",
    //             backgroundColor: "black",
    //           }}
    //         />
    //       )}
    //     </div>
    //     <div>
    //       {call.isReceivingCall && !callAccepted && (
    //         <div>
    //           <h1>{`You have a call from ${call.name}`}</h1>
    //           <button onClick={answerCall}>Answer</button>
    //         </div>
    //       )}
    //       <button onClick={() => callUser()}>Call</button>
    //       <button onClick={leaveCall}>Hang Up</button>
    //       <button onClick={toggleAudio}>
    //         {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
    //       </button>
    //       <button onClick={toggleVideo}>
    //         {isVideoOff ? "Turn Video On" : "Turn Video Off"}
    //       </button>
    //     </div>
    //   </div>
    // </Modal>
  );
};

export default CallModal;

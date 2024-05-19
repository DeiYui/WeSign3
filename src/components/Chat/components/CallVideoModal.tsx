import React, { useRef } from "react";
import { Image, Modal } from "antd";
import {
  CloseOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from "@ant-design/icons";
import logo from "./logo.png"; // Đảm bảo rằng bạn đã import đúng đường dẫn của logo
import blank from "./blank.png"; // Đảm bảo rằng bạn đã import đúng đường dẫn của blank
import { Logo } from "@/assets/icons";
import styled from "styled-components";

interface CallModalProps {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  endCall: () => void;
  openWaitCall?: boolean;
  userInfo: {
    avatarLocation: string;
    name: string;
  } | null;
  openVoice?: boolean;
  setOpenVoice?: (open: boolean) => void;
  currentUserVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  callAccepted?: any;
}

const CustomVideo = styled.video`
  width: 100%;
  height: 600px;
`;

const CallVideoModal: React.FC<CallModalProps> = ({
  openModal,
  setOpenModal,
  endCall,
  openWaitCall,
  userInfo,
  openVoice,
  setOpenVoice,
  currentUserVideoRef,
  remoteVideoRef,
  callAccepted,
}) => {
  console.log("callAccepted", callAccepted);

  return (
    <Modal
      open={openModal}
      width={1300}
      onCancel={() => setOpenModal && setOpenModal(false)}
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
            setOpenModal(false);
            endCall();
          }}
        >
          <CloseOutlined />
        </div>
      </div>

      <div className="relative gap-6">
        {openWaitCall && (
          <div className="absolute top-1/2 w-full -translate-y-1/2 transform bg-black py-2">
            <div className="flex h-full flex-col justify-center gap-3 text-center text-white">
              <div className="flex items-center justify-center">
                <Image
                  preview={false}
                  alt=""
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
          autoPlay
          style={{ height: "200px" }}
          playsInline
          muted={openVoice}
          ref={currentUserVideoRef}
        />
        <CustomVideo
          className="bg-black"
          autoPlay
          playsInline
          muted={openVoice}
          ref={remoteVideoRef}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
        <div className="flex items-center justify-center gap-3">
          <div className="cursor-pointer rounded-full bg-neutral-500 px-3.5 py-2.5">
            {openVoice ? (
              <AudioMutedOutlined
                style={{ fontSize: 40, color: "white" }}
                onClick={() => setOpenVoice && setOpenVoice(false)}
              />
            ) : (
              <AudioOutlined
                style={{ fontSize: 40, color: "white" }}
                onClick={() => setOpenVoice && setOpenVoice(true)}
              />
            )}
          </div>
          <div
            className="bg-red-700 flex cursor-pointer justify-center rounded-full p-1"
            onClick={endCall}
          >
            {/* <EndCallIcon size={30} color="white" /> */}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CallVideoModal;

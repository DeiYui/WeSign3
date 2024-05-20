import { SocketContext } from "@/hooks/useContext";
import React, { useContext, useEffect } from "react";

const VideoCall = () => {
  const {
    call,
    callAccepted,
    myVideo,
    userVideo,
    callEnded,
    stream,
    callUser,
    leaveCall,
    answerCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoOff,
    startVideo,
  }: any = useContext(SocketContext);

  useEffect(() => {
    startVideo();
  }, []);

  return (
    <div>
      <div>
        <video
          ref={myVideo}
          autoPlay
          muted
          style={{ width: "300px", height: "300px", backgroundColor: "black" }}
        />
        {callAccepted && !callEnded && (
          <video
            ref={userVideo}
            autoPlay
            style={{
              width: "300px",
              height: "300px",
              backgroundColor: "black",
            }}
          />
        )}
      </div>
      <div>
        {call.isReceivingCall && !callAccepted && (
          <div>
            <h1>{`You have a call from ${call.name}`}</h1>
            <button onClick={answerCall}>Answer</button>
          </div>
        )}
        <button onClick={() => callUser(stream)}>Call</button>
        <button onClick={leaveCall}>Hang Up</button>
        <button onClick={toggleAudio}>
          {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        </button>
        <button onClick={toggleVideo}>
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;

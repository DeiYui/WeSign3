import { RootState } from "@/store";
import { createContext, useEffect, useRef, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { Socket, io } from "socket.io-client";

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

const ContextProvider = ({ children }: ContextProviderProps) => {
  const chat = useSelector((state: RootState) => state.chat);
  const { conversationId, contactId } = chat;
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [name, setName] = useState("");
  const [call, setCall] = useState<Call>({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (conversationId && contactId) {
      // const socketBaseUrl = "http://localhost:8017";
      const socketBaseUrl = "https://chat-call-app.onrender.com";
      const socketInstance = io(socketBaseUrl, {
        query: { conversationId, contactId },
      });
      setSocket(socketInstance);

      socketInstance.on("offer", (offer) => {
        setCall({ isReceivingCall: true, signal: offer });
      });

      socketInstance.on("answer", (answer) => {
        setCallAccepted(true);
        const peerConnection = connectionRef.current;
        if (peerConnection) {
          peerConnection
            .setRemoteDescription(new RTCSessionDescription(answer))
            .then(() => {
              console.log("Remote description set successfully");
            })
            .catch((error) => {
              console.error("Error setting remote description:", error);
            });
        } else {
          console.error("Peer connection is not available");
        }
      });

      socketInstance.on("candidate", (candidate) => {
        if (candidate && candidate.candidate) {
          const peerConnection = connectionRef.current;
          if (peerConnection && peerConnection.remoteDescription) {
            peerConnection
              .addIceCandidate(new RTCIceCandidate(candidate))
              .then(() => {
                console.log("ICE candidate added successfully");
              })
              .catch((error) => {
                console.error("Error adding ICE candidate:", error);
              });
          } else {
            console.error(
              "Peer connection or remote description is not available",
            );
          }
        } else {
          console.error("Invalid candidate data:", candidate);
        }
      });

      socketInstance.on("leave", () => {
        setCallEnded(true);

        if (myVideo.current?.srcObject) {
          (myVideo.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
        }
        if (userVideo.current?.srcObject) {
          (userVideo.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
        }
        connectionRef.current?.close();
        connectionRef.current = null;
      });
    }
  }, [conversationId, contactId]);

  const startVideo = (callback?: (stream: MediaStream) => void) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
        if (socket) {
          socket.emit("ready");
        }
        if (callback) {
          callback(currentStream);
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new RTCPeerConnection();

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("candidate", event.candidate);
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    if (stream) {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }
    peer.setRemoteDescription(new RTCSessionDescription(call.signal));
    peer.createAnswer().then((answer) => {
      peer.setLocalDescription(answer);
      if (socket) {
        socket.emit("answer", answer);
      }
    });

    connectionRef.current = peer;
  };

  const callUser = (currentStream?: MediaStream) => {
    const activeStream = currentStream || stream;
    if (activeStream && socket) {
      const peer = new RTCPeerConnection();

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", event.candidate);
        }
      };

      peer.ontrack = (event) => {
        if (userVideo.current) {
          userVideo.current.srcObject = event.streams[0];
        }
      };

      activeStream
        .getTracks()
        .forEach((track) => peer.addTrack(track, activeStream));

      peer.createOffer().then((offer) => {
        peer.setLocalDescription(offer).then(() => {
          socket.emit("offer", offer);
        });
      });

      connectionRef.current = peer;
    } else {
      console.error("Stream or socket is not available");
    }
  };
  const leaveCall = () => {
    setCallEnded(true);
    if (socket) {
      socket.emit("leave");
    }
    if (myVideo.current?.srcObject) {
      (myVideo.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (userVideo.current?.srcObject) {
      (userVideo.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    connectionRef.current?.close();
    connectionRef.current = null;
  };

  const toggleAudio = () => {
    if (stream && socket) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
      socket.emit("toggleAudio", { room: 1, isAudioOn: !isAudioMuted });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        callUser,
        leaveCall,
        answerCall,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoOff,
        startVideo,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };

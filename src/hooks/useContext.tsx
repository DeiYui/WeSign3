// contexts/SocketContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "@/store";

type SocketContextProps = {
  isConnected: boolean;
  socketResponse: SocketResponse;
  sendData: (payload: Payload) => void;
  sendTypingEvent: (payload: TypingPayload) => void;
  sendStopTypingEvent: () => void;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  call: Call;
  callAccepted: boolean;
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | undefined;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  callEnded: boolean;
  callUser: (currentStream?: MediaStream) => void;
  leaveCall: () => void;
  answerCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  startVideo: (callback?: (stream: MediaStream) => void) => void;
};

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const chat = useSelector((state: RootState) => state.chat);
  const { conversationId, contactId } = chat;

  // Chat socket states
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [socketResponse, setSocketResponse] = useState<SocketResponse>({
    contactId: "",
    content: "",
    messageType: "",
    mediaLocation: "",
    createdAt: "",
  });
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Video call states
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

  const sendData = useCallback(
    (payload: Payload) => {
      if (socket) {
        socket.emit("stop_typing", conversationId);
        socket.emit("send_message", {
          contactId: payload.contactId,
          content: payload.content,
          messageType: payload.messageType,
          mediaLocation: payload.mediaLocation,
        });
      } else {
        console.error("Socket is not initialized");
      }
    },
    [socket, conversationId],
  );

  const sendTypingEvent = useCallback(
    (payload: TypingPayload) => {
      if (socket) {
        socket.emit("typing", {
          contactId: payload.contactId,
          avatarLocation: payload.avatarLocation,
        });
      } else {
        console.error("Socket is not initialized");
      }
    },
    [socket],
  );

  const sendStopTypingEvent = useCallback(() => {
    if (socket) {
      console.log("Sending stop_typing event");
      setIsTyping(false);
      socket.emit("stop_typing", conversationId);
    } else {
      console.error("Socket is not initialized");
    }
  }, [socket, conversationId]);

  useEffect(() => {
    if (conversationId && contactId) {
      const socketBaseUrl = "https://chat-call-app.onrender.com";
      const s = io(socketBaseUrl, {
        query: { conversationId, contactId },
      });

      setSocket(s);

      s.on("connect", () => {
        setConnected(true);
      });

      s.on("connect_error", (error: any) => {
        console.error("SOCKET CONNECTION ERROR", error);
      });

      s.on("get_message", (res: SocketResponse) => {
        setSocketResponse({ ...res, createdAt: new Date() });
      });

      s.on("typing", (data: { contactId: number }) => {
        if (data.contactId !== contactId) {
          setIsTyping(true);
        }
      });

      s.on("stop_typing", () => {
        setIsTyping(false);
      });

      s.on("offer", (offer) => {
        setCall({ isReceivingCall: true, signal: offer });
      });

      s.on("answer", (answer) => {
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

      s.on("candidate", (candidate) => {
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

      s.on("leave", () => {
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

      return () => {
        s.disconnect();
      };
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
        isConnected,
        socketResponse,
        sendData,
        sendTypingEvent,
        sendStopTypingEvent,
        isTyping,
        setIsTyping,
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

export { SocketProvider, SocketContext };

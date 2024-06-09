import CallModal from "@/components/Chat/components/CallModal";
import { RootState } from "@/store";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Socket, io } from "socket.io-client";

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
  name: any;
  setName: React.Dispatch<React.SetStateAction<any>>;
  callEnded: boolean;
  callUser: (currentStream?: MediaStream) => void;
  leaveCall: () => void;
  answerCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  selectedContact: any;
  setSelectedContact: any;
  isLoading?: boolean;
};

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const user: User = useSelector((state: RootState) => state?.admin);

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

  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [name, setName] = useState<{
    myUser: any;
    remoteUser: any;
  }>({ myUser: {}, remoteUser: {} });
  const [call, setCall] = useState<Call>({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy thông tin liên hệ cần chat, call
  const [selectedContact, setSelectedContact] = useState<{
    contactId: number;
    contactName: string;
    conversationId: number;
  }>({
    contactId: 0,
    contactName: "",
    conversationId: 0,
  });
  const { conversationId, contactId } = selectedContact;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      setIsLoading(true);
      const socketBaseUrl = "https://chat-call-app.onrender.com";
      const s = io(socketBaseUrl, {
        query: { conversationId, contactId },
      });

      setSocket(s);

      s.on("connect", () => {
        setConnected(true);
        setIsLoading(false);
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

      s.on("ready", (data) => {
        setName({ ...name, remoteUser: data });
        setCallAccepted(false);
        openModal();
      });

      s.on("offer", (offer) => {
        setCall({ isReceivingCall: true, signal: offer });
        setCallEnded(false);
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
              myVideo.current.srcObject = currentStream;
            }
          });
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
        const peerConnection = connectionRef.current;
        if (peerConnection && candidate) {
          peerConnection
            .addIceCandidate(new RTCIceCandidate(candidate))
            .then(() => {
              console.log("ICE candidate added successfully");
            })
            .catch((error) => {
              console.error("Error adding ICE candidate:", error);
            });
        }
      });

      s.on("leave", () => {
        setCallEnded(true);
        endCallCleanup();
        closeModal();
      });

      return () => {
        s.disconnect();
      };
    }
  }, [conversationId, contactId]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:freeturn.net:5349" },
        {
          urls: "turns:freeturn.tel:5349",
          username: "free",
          credential: "free",
        },
        {
          urls: "relay1.expressturn.com:3478",
          username: "efK7QHXRMSZHVGR70O",
          credential: "zh6GHMeMDQNHLStt",
        },
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:asia-east.relay.metered.ca:80",
          username: "fff496ad71b17d3d38ca224e",
          credential: "NYcdbdYGytIGfL/u",
        },
        {
          urls: "turn:asia-east.relay.metered.ca:80?transport=tcp",
          username: "fff496ad71b17d3d38ca224e",
          credential: "NYcdbdYGytIGfL/u",
        },
        {
          urls: "turn:asia-east.relay.metered.ca:443",
          username: "fff496ad71b17d3d38ca224e",
          credential: "NYcdbdYGytIGfL/u",
        },
        {
          urls: "turns:asia-east.relay.metered.ca:443?transport=tcp",
          username: "fff496ad71b17d3d38ca224e",
          credential: "NYcdbdYGytIGfL/u",
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

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

    peer
      .setRemoteDescription(new RTCSessionDescription(call.signal))
      .then(() => {
        return peer.createAnswer();
      })
      .then((answer) => {
        return peer.setLocalDescription(answer);
      })
      .then(() => {
        if (socket) {
          socket.emit("answer", peer.localDescription);
        }
      })
      .catch((error) => {
        console.error("Error handling answer call:", error);
      });

    connectionRef.current = peer;
  };

  const callUser = () => {
    openModal();
    setCallEnded(false);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
          if (socket) {
            socket.emit("ready", user);
          }
        }
        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:freeturn.net:5349" },
            {
              urls: "turns:freeturn.tel:5349",
              username: "free",
              credential: "free",
            },
            {
              urls: "relay1.expressturn.com:3478",
              username: "efK7QHXRMSZHVGR70O",
              credential: "zh6GHMeMDQNHLStt",
            },
            { urls: "stun:stun.relay.metered.ca:80" },
            {
              urls: "turn:asia-east.relay.metered.ca:80",
              username: "fff496ad71b17d3d38ca224e",
              credential: "NYcdbdYGytIGfL/u",
            },
            {
              urls: "turn:asia-east.relay.metered.ca:80?transport=tcp",
              username: "fff496ad71b17d3d38ca224e",
              credential: "NYcdbdYGytIGfL/u",
            },
            {
              urls: "turn:asia-east.relay.metered.ca:443",
              username: "fff496ad71b17d3d38ca224e",
              credential: "NYcdbdYGytIGfL/u",
            },
            {
              urls: "turns:asia-east.relay.metered.ca:443?transport=tcp",
              username: "fff496ad71b17d3d38ca224e",
              credential: "NYcdbdYGytIGfL/u",
            },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
          ],
        });

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

        currentStream.getTracks().forEach((track) => {
          peer.addTrack(track, currentStream);
        });

        peer
          .createOffer()
          .then((offer) => {
            return peer.setLocalDescription(offer);
          })
          .then(() => {
            if (socket) {
              socket.emit("offer", peer.localDescription);
            }
          })
          .catch((error) => {
            console.error("Error handling call user:", error);
          });

        connectionRef.current = peer;
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  };

  const endCallCleanup = () => {
    if (myVideo.current?.srcObject) {
      const tracks = (myVideo.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      myVideo.current.srcObject = null;
    }
    if (userVideo.current?.srcObject) {
      const tracks = (userVideo.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      userVideo.current.srcObject = null;
    }
    connectionRef.current?.close();
    connectionRef.current = null;
    setStream(undefined);
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (socket) {
      socket.emit("leave");
    }
    endCallCleanup();
    closeModal();
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
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
        isLoading,
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
        selectedContact,
        setSelectedContact,
      }}
    >
      {children}

      {/* Modal call */}
      <CallModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        myVideoRef={myVideo}
        userVideoRef={userVideo}
        callAccepted={callAccepted}
        callUser={callUser}
        answerCall={answerCall}
        call={call}
        callEnded={callEnded}
        leaveCall={leaveCall}
        toggleAudio={toggleAudio}
        isAudioMuted={isAudioMuted}
        toggleVideo={toggleVideo}
        isVideoOff={isVideoOff}
        name={name}
      />
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };

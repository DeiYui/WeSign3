import CallModalSocket from "@/components/Chat/components/CallModalSocket";
import { RootState } from "@/store";
import {
  Dispatch,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";

// Define the types for the state and actions
interface State {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  socket: Socket | null;
  users: any;
  isReceivingCall?: boolean;
  incoming?: any;
  isTyping?: boolean;
}

export interface SocketContextProps extends State {
  dispatchSocket: Dispatch<Action>;
  storeUser?: (username: User) => void;
  startCall?: (targetUser: User) => void;
  endCall?: any;
  acceptCall?: any;
  sendData?: any;
  sendTypingEvent?: any;
  sendStopTypingEvent?: any;
  socketResponse?: any;
  selectedContact?: any;
  setSelectedContact?: any;
}

const initialState: State = {
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  socket: null,
  users: null,
  isReceivingCall: false,
  incoming: { from: null, isRinging: false },
  isTyping: false,
};

type Action =
  | { type: "SET_LOCAL_STREAM"; payload: MediaStream | null }
  | { type: "SET_REMOTE_STREAM"; payload: MediaStream | null }
  | { type: "SET_PEER_CONNECTION"; payload: RTCPeerConnection | null }
  | { type: "SET_SOCKET"; payload: Socket }
  | { type: "SET_USERS"; payload: any }
  | {
      type: "SET_INCOMING_CALL";
      payload: { from: User | null; isRinging: boolean } | null;
    }
  | { type: "SET_IS_TYPING"; payload: any };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_LOCAL_STREAM":
      return { ...state, localStream: action.payload };
    case "SET_REMOTE_STREAM":
      return { ...state, remoteStream: action.payload };
    case "SET_PEER_CONNECTION":
      return { ...state, peerConnection: action.payload };
    case "SET_SOCKET":
      return { ...state, socket: action.payload };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_INCOMING_CALL":
      return { ...state, incoming: action.payload };
    case "SET_IS_TYPING":
      return { ...state, isTyping: action.payload };
    default:
      return state;
  }
};

interface SocketProviderProps {
  children: ReactNode;
}

const SocketVideoCallContext = createContext<SocketContextProps | undefined>(
  undefined,
);

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "ef4L3BRHOH5L72TY10",
      credential: "Oi8KR9Ly1fZrY2Lm",
    },
  ],
};

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const user: User = useSelector((state: RootState) => state.admin);
  // CHAT
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

  const [socketResponse, setSocketResponse] = useState<SocketResponseSocket>({
    to: undefined,
    from: undefined,
    content: "",
    messageType: "",
    mediaLocation: "",
    createdAt: "",
  });
  // CALL
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  const [iceServers, setIceServers] = useState([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchTurnCredentials = async () => {
      try {
        const response = await fetch(
          "https://wesign.metered.live/api/v1/turn/credentials?apiKey=08644a3885ebd012a2c390eb8e3cfa8e6e4d",
        );
        const data = await response.json();
        setIceServers(data);
      } catch (error) {
        console.error("Error fetching TURN credentials:", error);
      }
    };

    fetchTurnCredentials();
  }, []);

  // Khởi tạo
  const initializePeerConnection = async (data: any) => {
    const peerConnection = new RTCPeerConnection({ iceServers: iceServers });
    peerConnectionRef.current = peerConnection;
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    dispatch({ type: "SET_LOCAL_STREAM", payload: localStream });

    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    // Create and store the remote stream
    if (!remoteStreamRef.current) {
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      dispatch({ type: "SET_REMOTE_STREAM", payload: remoteStream });
    }

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && state.socket) {
        state.socket.emit("ice_candidate", {
          user: data.from,
          data: candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      // Log the event to check if it's being called
      if (remoteStreamRef.current) {
        remoteStreamRef.current.addTrack(event.track);
      } else {
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        remoteStreamRef.current = remoteStream;
        dispatch({ type: "SET_REMOTE_STREAM", payload: remoteStream });
      }
    };

    return peerConnection;
  };

  // Gửi tin nhắn
  const sendData = useCallback(
    (payload: PayloadSocKet) => {
      if (state.socket) {
        sendStopTypingEvent({
          to: payload.to,
          from: payload.from,
        });
        state.socket.emit("send_message", {
          to: payload.to,
          from: payload.from,
          content: payload.content,
          messageType: payload.messageType,
          mediaLocation: payload.mediaLocation,
          conversationId: payload.conversationId,
        });
      } else {
        console.error("Socket is not initialized");
      }
    },
    [state.socket],
  );

  // Khi đăng nhập tin nhắn
  const sendTypingEvent = useCallback(
    (payload: TypingPayloadSocket) => {
      if (state.socket) {
        state.socket.emit("typing", {
          to: payload.to,
          from: payload.from,
        });
      } else {
        console.error("Socket is not initialized");
      }
    },
    [state.socket],
  );

  // Dừng nhập tin nhắn
  const sendStopTypingEvent = useCallback(
    (payload: TypingPayloadSocket) => {
      if (state.socket) {
        state.socket.emit("stop_typing", {
          to: payload.to,
          from: payload.from,
        });
      } else {
        console.error("Socket is not initialized");
      }
    },
    [state.socket],
  );

  const cleanupStreamsAndConnection = () => {
    if (state.peerConnection) {
      state.peerConnection.close();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
    }
    if (state.remoteStream) {
      state.remoteStream.getTracks().forEach((track) => track.stop());
    }
    dispatch({ type: "SET_LOCAL_STREAM", payload: null });
    dispatch({ type: "SET_REMOTE_STREAM", payload: null });
    dispatch({ type: "SET_PEER_CONNECTION", payload: null });
    dispatch({ type: "SET_USERS", payload: null });
    setIsModalOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    if (token && iceServers?.length) {
      const socket = io("https://chat-call-app-api.onrender.com", {
        transports: ["websocket"],
      });

      dispatch({ type: "SET_SOCKET", payload: socket });

      // socket.on("connect", () => {
      //   dispatch({ type: "SET_SOCKET", payload: socket });
      //   socket.emit("store_user", { user: user });
      // });
      socket.emit("store_user", { user: user });

      // CHAT
      socket.on("get_message", (res) => {
        setSocketResponse({ ...res, createdAt: new Date() });
        dispatch({ type: "SET_IS_TYPING", payload: false });
      });

      socket.on("typing", (data) => {
        if (data.isTyping) {
          dispatch({ type: "SET_IS_TYPING", payload: data.isTyping });
        }
      });

      socket.on("stop_typing", (data) => {
        if (data.isTyping) {
          dispatch({ type: "SET_IS_TYPING", payload: data.isTyping });
        }
      });

      // CALL
      socket.on(
        "call_response",
        async (data: { type: string; data: string; to: User; from: User }) => {
          if (data.data === "user is ready for call") {
            const peerConnection = await initializePeerConnection({
              to: data.to,
              from: data.from,
            });
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket.emit("create_offer", {
              to: data.to,
              from: data.from,
              data: { sdp: offer },
            });
            dispatch({ type: "SET_USERS", payload: data.to });
            dispatch({ type: "SET_PEER_CONNECTION", payload: peerConnection });
          } else {
            alert("Người dùng không online");
            return;
          }
        },
      );

      socket.on(
        "offer_received",
        async (data: {
          from: User;
          to: User;
          data: RTCSessionDescriptionInit;
        }) => {
          dispatch({
            type: "SET_INCOMING_CALL",
            payload: { from: data.from, isRinging: true },
          });
          dispatch({ type: "SET_USERS", payload: data.to });
          // Lưu offer để sử dụng sau này nếu người dùng chấp nhận cuộc gọi
          sessionStorage.setItem("pendingOffer", JSON.stringify(data));
        },
      );

      socket.on(
        "answer_received",
        async (data: {
          to: User;
          from: User;
          data: RTCSessionDescriptionInit;
        }) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(data.data);
            setCallAccepted(true);
          }
        },
      );

      socket.on(
        "ice_candidate",
        async (data: { data: RTCIceCandidateInit }) => {
          try {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.addIceCandidate(data.data);
            }
          } catch (e) {
            console.error("Error adding received ICE candidate", e);
          }
        },
      );

      socket.on("call_ended", (data) => {
        // Xử lý kết thúc cuộc gọi ở đây
        // Ví dụ: đóng kết nối peer, dừng streams, cập nhật UI
        cleanupStreamsAndConnection();
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        cleanupStreamsAndConnection();
      });

      return () => {
        socket.disconnect();

        // cleanupStreamsAndConnection();
      };
    }
  }, [token, iceServers]);

  const startCall = (data: any) => {
    if (state.socket) {
      state.socket.emit("start_call", {
        data,
      });
    }
    setIsModalOpen(true);
    dispatch({ type: "SET_USERS", payload: data.remoteUser });
  };

  // Xác nhận call
  const acceptCall = async () => {
    const pendingOfferData = sessionStorage.getItem("pendingOffer");
    if (pendingOfferData) {
      const data = JSON.parse(pendingOfferData);
      const peerConnection = await initializePeerConnection({
        to: data.from,
        from: data.to,
      });
      await peerConnection.setRemoteDescription(data.data);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (state.socket) {
        state.socket.emit("create_answer", {
          to: data.to,
          from: data.from,
          data: { sdp: answer },
        });
      }

      dispatch({ type: "SET_PEER_CONNECTION", payload: peerConnection });
      dispatch({ type: "SET_INCOMING_CALL", payload: null });
    }
  };

  const endCall = (data: any) => {
    if (state.socket) {
      state.socket.emit("end_call", {
        to: data.user,
        from: data.remoteUser,
      });

      cleanupStreamsAndConnection();
    }
  };

  // Thêm hàm toggleAudio để tắt mở micro
  const toggleAudio = () => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Thêm hàm toggleVideo để tắt mở video
  const toggleVideo = () => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <SocketVideoCallContext.Provider
      value={{
        ...state,
        dispatchSocket: dispatch,
        socketResponse,
        selectedContact,
        setSelectedContact,
        sendData,
        sendTypingEvent,
        sendStopTypingEvent,
        startCall,
        endCall,
        acceptCall,
      }}
    >
      {children}

      <CallModalSocket
        isOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        acceptCall={acceptCall}
        endCall={endCall}
        localStream={state?.localStream}
        remoteStream={state?.remoteStream}
        incoming={state.incoming}
        selectedContact={selectedContact}
        isAudioMuted={isAudioMuted}
        toggleAudio={toggleAudio}
        isVideoOff={isVideoOff}
        toggleVideo={toggleVideo}
        users={state.users}
        callAccepted={callAccepted}
      />
    </SocketVideoCallContext.Provider>
  );
};

export { SocketProvider, SocketVideoCallContext };

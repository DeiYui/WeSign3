interface SocketResponse {
  contactId: string;
  content: string;
  messageType: string;
  mediaLocation: string;
  createdAt: Date | string;
}

interface Payload {
  contactId: string;
  content: string;
  messageType: string;
  mediaLocation?: string;
}

interface TypingPayload {
  contactId: number;
  avatarLocation: string;
}

interface Call {
  isReceivingCall?: boolean;
  signal?: any;
}

interface ContextProviderProps {
  children: any;
}

interface SocketContextProps {
  call: Call;
  callAccepted: boolean;
  myVideo: any;
  userVideo: any;
  stream: MediaStream | undefined;
  name: string;
  setName: (name: string) => void;
  callEnded: boolean;
  callUser: () => void;
  leaveCall: () => void;
  answerCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  startVideo: () => void;
}

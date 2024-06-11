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

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" },
    { urls: "stun:stun01.sipphone.com" },
    { urls: "stun:stun.ekiga.net" },
    { urls: "stun:stun.fwdnet.net" },
    { urls: "stun:stun.ideasip.com" },
    { urls: "stun:stun.iptel.org" },
    { urls: "stun:stun.rixtelecom.se" },
    { urls: "stun:stun.schlund.de" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.softjoys.com" },
    { urls: "stun:stun.voiparound.com" },
    { urls: "stun:stun.voipbuster.com" },
    { urls: "stun:stun.voipstunt.com" },
    { urls: "stun:stun.voxgratia.org" },
    { urls: "stun:stun.xten.com" },

    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      urls: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },

    { urls: "stun:numb.viagenie.ca" },
    { urls: "stun:iphone-stun.strato-iphone.de:3478" },
    { urls: "stun:relay.webwormhole.io:3478" },
    { urls: "stun:stun-eu.3cx.com:3478" },
    { urls: "stun:stun-us.3cx.com:3478" },
    { urls: "stun:stun.1-voip.com:3478" },
    { urls: "stun:stun.12connect.com:3478" },
    { urls: "stun:stun.12voip.com:3478" },
    { urls: "stun:stun.1cbit.ru:3478" },
    { urls: "stun:stun.1und1.de:3478" },
    { urls: "stun:stun.3cx.com:3478" },
    { urls: "stun:stun.3deluxe.de:3478" },
    { urls: "stun:stun.3wayint.com:3478" },
    { urls: "stun:stun.5sn.com:3478" },
    { urls: "stun:stun.aa.net.uk:3478" },
    { urls: "stun:stun.aaisp.co.uk:3478" },
    { urls: "stun:stun.aceweb.com:3478" },
    { urls: "stun:stun.acquageraci.it:3478" },
    { urls: "stun:stun.acrobits.cz:3478" },
    { urls: "stun:stun.acronis.com:3478" },
    { urls: "stun:stun.actionvoip.com:3478" },
    { urls: "stun:stun.advfn.com:3478" },
    { urls: "stun:stun.alberon.cz:3478" },
    { urls: "stun:stun.allflac.com:3478" },
    { urls: "stun:stun.alphacron.de:3478" },
    { urls: "stun:stun.alpirsbacher.de:3478" },
    { urls: "stun:stun.altar.com.pl:3478" },
    { urls: "stun:stun.anlx.net:3478" },
    { urls: "stun:stun.antisip.com:3478" },
    { urls: "stun:stun.arkh-edu.ru:3478" },
    { urls: "stun:stun.atagverwarming.nl:3478" },
    { urls: "stun:stun.autosystem.com:3478" },
    { urls: "stun:stun.avigora.fr:3478" },
    { urls: "stun:stun.avoxi.com:3478" },
    { urls: "stun:stun.axeos.nl:3478" },
    { urls: "stun:stun.axialys.net:3478" },
    { urls: "stun:stun.b2b2c.ca:3478" },
    { urls: "stun:stun.babelforce.com:3478" },
    { urls: "stun:stun.baltmannsweiler.de:3478" },
    { urls: "stun:stun.bandyer.com:3478" },
    { urls: "stun:stun.bau-ha.us:3478" },
    { urls: "stun:stun.bcs2005.net:3478" },
    { urls: "stun:stun.bearstech.com:3478" },
    { urls: "stun:stun.beebeetle.com:3478" },
    { urls: "stun:stun.bergophor.de:3478" },
    { urls: "stun:stun.bernardoprovenzano.net:3478" },
    { urls: "stun:stun.bernies-bergwelt.com:3478" },
    { urls: "stun:stun.bethesda.net:3478" },
    { urls: "stun:stun.bitburger.de:3478" },
    { urls: "stun:stun.bluesip.net:3478" },
    { urls: "stun:stun.bridesbay.com:3478" },
    { urls: "stun:stun.budgetsip.com:3478" },
    { urls: "stun:stun.business-isp.nl:3478" },
    { urls: "stun:stun.cablenet-as.net:3478" },
    { urls: "stun:stun.callromania.ro:3478" },
    { urls: "stun:stun.callwithus.com:3478" },
    { urls: "stun:stun.carlovizzini.it:3478" },
    { urls: "stun:stun.cdosea.org:3478" },
    { urls: "stun:stun.cellmail.com:3478" },
    { urls: "stun:stun.chaosmos.de:3478" },
    { urls: "stun:stun.chatous.com:3478" },
    { urls: "stun:stun.cheapvoip.com:3478" },
    { urls: "stun:stun.chewinggum.nl:3478" },
    { urls: "stun:stun.cibercloud.com.br:3478" },
    { urls: "stun:stun.clickphone.ro:3478" },
    { urls: "stun:stun.cloopen.com:3478" },
    { urls: "stun:stun.coffee-sen.com:3478" },
    { urls: "stun:stun.comrex.com:3478" },
    { urls: "stun:stun.connecteddata.com:3478" },
    { urls: "stun:stun.cope.es:3478" },
    { urls: "stun:stun.counterpath.com:3478" },
    { urls: "stun:stun.counterpath.net:3478" },
    { urls: "stun:stun.cozy.org:3478" },
    { urls: "stun:stun.crimeastar.net:3478" },
    { urls: "stun:stun.crononauta.com:3478" },
    { urls: "stun:stun.ctafauni.it:3478" },
    { urls: "stun:stun.dcalling.de:3478" },
    { urls: "stun:stun.deepfinesse.com:3478" },
    { urls: "stun:stun.degaronline.com:3478" },
    { urls: "stun:stun.demos.ru:3478" },
    { urls: "stun:stun.demos.su:3478" },
    { urls: "stun:stun.deutscherskiverband.de:3478" },
    { urls: "stun:stun.diallog.com:3478" },
    { urls: "stun:stun.dls.net:3478" },
    { urls: "stun:stun.dowlatow.ru:3478" },
    { urls: "stun:stun.draci.info:3478" },
    { urls: "stun:stun.dreifaltigkeit-stralsund.de:3478" },
    { urls: "stun:stun.dukun.de:3478" },
    { urls: "stun:stun.dunyatelekom.com:3478" },
    { urls: "stun:stun.dus.net:3478" },
    { urls: "stun:stun.eaclipt.org:3478" },
    { urls: "stun:stun.easter-eggs.com:3478" },
    { urls: "stun:stun.easycall.pl:3478" },
    { urls: "stun:stun.easyvoip.com:3478" },
    { urls: "stun:stun.edwin-wiegele.at:3478" },
    { urls: "stun:stun.effexx.com:3478" },
    { urls: "stun:stun.einfachcallback.de:3478" },
    { urls: "stun:stun.ekir.de:3478" },
    { urls: "stun:stun.eleusi.com:3478" },
    { urls: "stun:stun.elitetele.com:3478" },
    { urls: "stun:stun.engineeredarts.co.uk:3478" },
    { urls: "stun:stun.eol.co.nz:3478" },
    { urls: "stun:stun.eoni.com:3478" },
    { urls: "stun:stun.epygi.com:3478" },
    { urls: "stun:stun.eurosys.be:3478" },
    { urls: "stun:stun.exoplatform.org:3478" },
    { urls: "stun:stun.expandable.io:3478" },
    { urls: "stun:stun.fairytel.at:3478" },
    { urls: "stun:stun.faktortel.com.au:3478" },
    { urls: "stun:stun.fathomvoice.com:3478" },
    { urls: "stun:stun.fbsbx.com:3478" },
    { urls: "stun:stun.fiberpipe.net:3478" },
    { urls: "stun:stun.files.fm:3478" },
    { urls: "stun:stun.finsterwalder.com:3478" },
    { urls: "stun:stun.fitauto.ru:3478" },
    { urls: "stun:stun.fixup.net:3478" },
    { urls: "stun:stun.fmo.de:3478" },
    { urls: "stun:stun.foad.me.uk:3478" },
    { urls: "stun:stun.fondazioneroccochinnici.it:3478" },
    { urls: "stun:stun.framasoft.org:3478" },
    { urls: "stun:stun.freecall.com:3478" },
    { urls: "stun:stun.freeswitch.org:3478" },
    { urls: "stun:stun.freevoipdeal.com:3478" },
    { urls: "stun:stun.frozenmountain.com:3478" },
    { urls: "stun:stun.funwithelectronics.com:3478" },
    { urls: "stun:stun.futurasp.es:3478" },
    { urls: "stun:stun.galeriemagnet.at:3478" },
    { urls: "stun:stun.geesthacht.de:3478" },
    { urls: "stun:stun.genymotion.com:3478" },
    { urls: "stun:stun.geonet.ro:3478" },
    { urls: "stun:stun.gigaset.net:3478" },
    { urls: "stun:stun.globalmeet.com:3478" },
    { urls: "stun:stun.gmx.de:3478" },
    { urls: "stun:stun.gmx.net:3478" },
    { urls: "stun:stun.gocoderz.com:3478" },
    { urls: "stun:stun.golden.net:3478" },
    { urls: "stun:stun.gotevot.ru:3478" },
    { urls: "stun:stun.gradwell.com:3478" },
    { urls: "stun:stun.grancanariaweb.com:3478" },
    { urls: "stun:stun.grandstream.com:3478" },
    { urls: "stun:stun.greatnet.de:3478" },
    { urls: "stun:stun.groobie.net:3478" },
    { urls: "stun:stun.gsmfirmwares.com:3478" },
    { urls: "stun:stun.halonet.pl:3478" },
    { urls: "stun:stun.hellonanu.com:3478" },
    { urls: "stun:stun.hiq.nl:3478" },
    { urls: "stun:stun.hivelocity.net:3478" },
    { urls: "stun:stun.hoiio.com:3478" },
    { urls: "stun:stun.hosteurope.de:3478" },
    { urls: "stun:stun.hosteur.com:3478" },
    { urls: "stun:stun.hosting4less.com:3478" },
    { urls: "stun:stun.hyperglobe.net:3478" },
    { urls: "stun:stun.i3d.net:3478" },
    { urls: "stun:stun.ideasip.com:3478" },
    { urls: "stun:stun.ignitionrobotics.org:3478" },
    { urls: "stun:stun.immmr.com:3478" },
    { urls: "stun:stun.infra.net:3478" },
    { urls: "stun:stun.internetcalls.com:3478" },
    { urls: "stun:stun.intervoip.com:3478" },
    { urls: "stun:stun.ipcomms.net:3478" },
    { urls: "stun:stun.ipfire.org:3478" },
    { urls: "stun:stun.ippi.fr:3478" },
    { urls: "stun:stun.ipshka.com:3478" },
    { urls: "stun:stun.iptel.org:3478" },
    { urls: "stun:stun.irian.at:3478" },
    { urls: "stun:stun.it1.hr:3478" },
    { urls: "stun:stun.ivao.aero:3478" },
    { urls: "stun:stun.jappix.com:3478" },
    { urls: "stun:stun.jumblo.com:3478" },
    { urls: "stun:stun.justvoip.com:3478" },
    { urls: "stun:stun.kabatology.com:3478" },
    { urls: "stun:stun.kallistec.com:3478" },
    { urls: "stun:stun.katalaksi.ru:3478" },
    { urls: "stun:stun.kiwilink.co.nz:3478" },
    { urls: "stun:stun.kiwivoip.com:3478" },
    { urls: "stun:stun.kundenserver.de:3478" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l-f-o.net:3478" },
    { urls: "stun:stun.lakedaemon.net:3478" },
    { urls: "stun:stun.linphone.org:3478" },
    { urls: "stun:stun.liveo.fr:3478" },
    { urls: "stun:stun.lowratevoip.com:3478" },
    { urls: "stun:stun.lugosoft.com:3478" },
    { urls: "stun:stun.lundimatin.fr:3478" },
    { urls: "stun:stun.magnet.ie:3478" },
    { urls: "stun:stun.manle.com:3478" },
    { urls: "stun:stun.mgn.ru:3478" },
    { urls: "stun:stun.mitake.com.tw:3478" },
    { urls: "stun:stun.mitake.com.tw:3479" },
    { urls: "stun:stun.miwifi.com:3478" },
    { urls: "stun:stun.modulus.gr:3478" },
    { urls: "stun:stun.mozcom.com:3478" },
    { urls: "stun:stun.myvoiptraffic.com:3478" },
    { urls: "stun:stun.mywatson.it:3478" },
    { urls: "stun:stun.nas.net:3478" },
    { urls: "stun:stun.neotel.co.za:3478" },
    { urls: "stun:stun.netappel.com:3478" },
    { urls: "stun:stun.netappel.fr:3478" },
    { urls: "stun:stun.netgsm.com.tr:3478" },
    { urls: "stun:stun.nfon.net:3478" },
    { urls: "stun:stun.noc.ams-ix.net:3478" },
  ],
};

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

  const endCallCleanup = useCallback(() => {
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
    if (connectionRef.current) {
      connectionRef.current.close();
      // connectionRef.current = null;
    }
  }, []);

  const leaveCall = useCallback(() => {
    setCallEnded(true);
    endCallCleanup();
    closeModal();
    if (socket) {
      socket.emit("leave");
    }
  }, [socket, endCallCleanup]);

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

      s.on("connect_error", (error) => {
        console.error("SOCKET CONNECTION ERROR", error);
      });

      s.on("get_message", (res) => {
        setSocketResponse({ ...res, createdAt: new Date() });
      });

      s.on("typing", (data) => {
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

        if (connectionRef.current) {
          connectionRef.current
            .setRemoteDescription(new RTCSessionDescription(answer))
            .catch((error) => {
              console.error("Error setting remote description:", error);
            });
        } else {
          console.error("Peer connection is not available");
        }
      });

      s.on("candidate", (candidate) => {
        if (candidate && candidate.candidate) {
          if (connectionRef.current) {
            connectionRef.current
              .addIceCandidate(new RTCIceCandidate(candidate))
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
    const peer = new RTCPeerConnection(peerConnectionConfig);

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("candidate", event.candidate);
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      } else {
        console.error("userVideo.current is not available");
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
        const peer = new RTCPeerConnection(peerConnectionConfig);

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

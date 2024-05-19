// components/ChatWidget.tsx
"use client";
import { colors } from "@/assets/colors";
import { MessageIcon } from "@/assets/icons";
import Conversations from "@/model/Conversations";
import { RootState } from "@/store";
import { CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Form, Input, Spin, Typography } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSelector } from "react-redux";
import ContactButton from "./components/ContactButton";
import ContentMessage from "./components/ContentMessage";
import Image from "next/image";
import User from "@/model/User";

const duplicateItems = (items: Contact[], count: number): Contact[] => {
  const result: Contact[] = [];
  while (result.length < count) {
    result.push(
      ...items.map((item) => ({ ...item, contactId: result.length + 1 })),
    );
  }
  return result.slice(0, count);
};

const container = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1 },
};

const ChatWidget = () => {
  const user = useSelector((state: RootState) => state.admin);

  // trạng thái mơ chat
  const [chatOpen, setChatOpen] = useState(false);
  // Select user
  const [selectedContact, setSelectedContact] = useState<{
    contactId: number;
    contactName: string;
    conversationId: number;
  }>({
    contactId: 0,
    contactName: "",
    conversationId: 0,
  });

  // API lấy danh sách hội thoại
  const { data: lstConversations, isFetching } = useQuery({
    queryKey: ["getLstConversations"],
    queryFn: async () => {
      const res = await Conversations.getConversations();
      const flattenedArray: Contact[] = res?.data
        ?.flatMap((item: Conversation) =>
          item.grouAttachConvResList.map((val) => ({
            conversationId: item.conversationId,
            ...val,
          })),
        )
        .filter((e: Contact) => e.contactId !== user.userId);
      return flattenedArray;
    },
  });

  // API lấy message
  const { data: lstMessage, isFetching: isFetchingMessage } = useQuery({
    queryKey: ["getMessage", selectedContact.conversationId],
    queryFn: async () => {
      const res = await Conversations.getMessage(
        selectedContact?.conversationId,
      );
      if (res.data) {
        const sortedMessages = res.data?.sort(
          (
            a: { created: string | number | Date },
            b: { created: string | number | Date },
          ) => {
            const dateA: any = new Date(a.created);
            const dateB: any = new Date(b.created);
            return dateA - dateB;
          },
        );
        return sortedMessages;
      } else {
        return [];
      }
    },
    enabled: !!selectedContact.conversationId,
  });

  // API lấy thông tin người muốn nhắn tin
  const { data: userInfo, isFetching: isFetchingUserInfo } = useQuery({
    queryKey: ["getUserInfo", selectedContact.contactId],
    queryFn: async () => {
      const res = await User.getUserInfo(selectedContact.contactId);
      return res.data;
    },
    enabled: !!selectedContact.contactId,
  });

  console.log("lstMessage", lstConversations, lstMessage, userInfo);

  return (
    <Spin spinning={isFetching}>
      <div
        className="fixed bottom-0 right-0 top-0 z-[1000] rounded-md bg-white"
        style={{ width: chatOpen ? "360px" : "60px" }}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex h-20 cursor-pointer items-center justify-between bg-neutral-700 px-4 transition-all">
            <div
              className="flex items-center gap-5 text-white"
              onClick={() => setChatOpen(true)}
            >
              <MessageIcon size={36} color={colors.primary600} />
              {(chatOpen && selectedContact.contactName) || "MY CHAT"}
            </div>
            {chatOpen && (
              <div className="" onClick={() => setChatOpen(false)}>
                <CloseOutlined style={{ color: "white" }} />
              </div>
            )}
          </div>
          {/* content */}
          <div className="relative flex w-full ">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="custom-scrollbar flex h-[700px] w-[60px] shrink-0 flex-col"
            >
              {lstConversations &&
                lstConversations.map((contact) => {
                  return (
                    <motion.div variants={item} key={contact.contactId}>
                      <ContactButton
                        contact={contact}
                        selectedContactId={selectedContact?.contactId}
                        onClick={(value) => {
                          setSelectedContact({
                            contactId: value.contactId,
                            contactName: value.contactName,
                            conversationId: contact.conversationId || 0,
                          });
                          setChatOpen(true);
                        }}
                      />
                    </motion.div>
                  );
                })}
            </motion.div>
            {/* Message */}
            {lstMessage?.length && selectedContact.contactId ? (
              <div
                className="custom-scrollbar  w-full  overscroll-contain px-2 pb-8 pt-4 "
                style={{ height: "calc(100vh - 100px)" }}
              >
                <ContentMessage
                  messages={lstMessage}
                  user={user}
                  userInfo={userInfo}
                  isFetching={isFetchingMessage}
                />
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                  <Image
                    width={400}
                    height={400}
                    alt=""
                    src="/images/chatBg.png"
                  />
                </div>
                <Typography
                  className="text-bold px-16  pt-10 text-center text-title-sm"
                  color="text.secondary"
                >
                  Chat cùng WeSign
                </Typography>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="absolute bottom-20 left-15 right-10 w-2/3 ">
            <Input placeholder="Nhập tin nhắn" />
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ChatWidget;

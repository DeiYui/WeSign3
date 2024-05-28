"use client";
import Conversations from "@/model/Conversations";
import { RootState } from "@/store";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Image } from "antd";
import moment from "moment";
import Link from "next/link";
import { useSelector } from "react-redux";

const ChatCard = () => {
  const user: User = useSelector((state: RootState) => state.admin);
  // API lấy danh sách hội thoại
  const { data: chatData } = useQuery({
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

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Trò chuyện
      </h4>

      <div>
        {chatData &&
          chatData?.map((chat, key) => (
            <Link
              href="#"
              className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
              key={key}
            >
              <div className="relative h-14 w-14 rounded-full">
                <Avatar
                  size={56}
                  src={chat.avatarLocation as any}
                  alt={chat.contactName}
                  icon={<UserOutlined />}
                />

                <span
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-meta-3  `}
                ></span>
              </div>

              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {chat?.contactName}
                  </h5>
                  <p>
                    <span className="text-sm text-black dark:text-white">
                      {/* {chat?.lastMessageRes} */}
                    </span>
                    <span className="text-xs">
                      .{" "}
                      {moment(chat?.lastMessageRes?.created).format(
                        "DD/MM/YYYY hh:mm:ss",
                      )}{" "}
                    </span>
                  </p>
                </div>
                {/* {chat.textCount !== 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <span className="text-sm font-medium text-white">
                    {" "}
                    {chat.textCount}
                  </span>
                </div>
              )} */}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ChatCard;

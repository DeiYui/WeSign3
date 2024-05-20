"use client";
import React, { useState } from "react";
import { Button, List, Avatar, Spin, Tabs, Card, Empty } from "antd";
import { DeleteFilled, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import User from "@/model/User";

interface Friend {
  id: number;
  name: string;
  email: string;
  avatarLocation: string | null;
}

interface FriendRequest {
  userId: number;
  name: string;
  avatarLocation: string | null;
}

const friends: Friend[] = [
  // Your friend data here
];

const friendRequests: FriendRequest[] = [
  // Your friend request data here
];

const Friend = () => {
  const [view, setView] = useState<"friends" | "requests" | "sending">(
    "friends",
  );

  //* API lấy danh sách bạn bè
  const { data: lstFriend, isFetching } = useQuery({
    queryKey: ["getLstFriend"],
    queryFn: async () => {
      const res = await User.getLstFriend();

      // Sắp xếp theo vần
      const sorted = res.data?.length
        ? res.data?.sort((a: any, b: any) => a.name.localeCompare(b.name))
        : [];

      // Đưa các tên theo vần vào 1 nhóm
      const groupedData = sorted?.reduce((acc: any, item: any) => {
        // Lấy ký tự đầu tiên tạo từ điển rồi đưa danh sách theo tên vào
        // dang { A: []}
        const firstLetter = item.name.charAt(0).toUpperCase();
        acc[firstLetter] = acc[firstLetter] || [];
        acc[firstLetter].push(item);
        return acc;
      }, {});

      return groupedData;
    },
    // enabled: view === "friends",
  });

  //* API lấy danh sách lời mời kết bạn
  const { data: lstRequest, isFetching: isFetchingRequest } = useQuery({
    queryKey: ["getLstRequest"],
    queryFn: async () => {
      const res = await User.getLstRequest();
      return res.data || [];
    },
    // enabled: view === "requests",
  });

  //* API lấy danh sách lời mời đã gửi
  const { data: lstSending, isFetching: isFetchingSending } = useQuery({
    queryKey: ["getLstSending"],
    queryFn: async () => {
      const res = await User.getLstSending();
      return res.data || [];
    },
    // enabled: view === "sending",
  });

  console.log("lstFriend", lstFriend);

  const handleRouterChat = (friend: Friend) => {
    // Your navigation logic here
  };

  const handleDeleteFr = (friend: Friend) => {
    // Your delete logic here
  };

  const onAcceptFriends = (userId: number) => {
    // Your accept friend logic here
  };

  const onCancelFriends = (
    userId: number,
    type: "cancelPending" | "cancelRequest",
  ) => {
    // Your cancel friend logic here
  };

  return (
    <div className="py-2 pr-4">
      <Tabs
        className="bg-white px-4 pb-3"
        defaultActiveKey="friends"
        onChange={(key) => setView(key as "friends" | "requests")}
      >
        <Tabs.TabPane
          tab={
            <span className="flex items-center gap-3">
              <UserOutlined size={24} className="pt-[2px]" />
              Bạn bè: (
              {(lstFriend && Object?.entries(lstFriend).length) || "Trống"})
            </span>
          }
          key="friends"
        >
          {lstFriend ? (
            Object.entries(lstFriend).map(([letter, groupItems]: any) => (
              <div key={letter}>
                <div className="pb-2 text-base">{letter}</div>
                <List
                  loading={isFetching}
                  itemLayout="horizontal"
                  dataSource={groupItems}
                  renderItem={(friend: FriendProps) => (
                    <List.Item
                      style={{ paddingLeft: "16px" }}
                      className="group hover:rounded-xl hover:bg-neutral-200"
                      actions={[
                        <Button
                          key={friend.userId}
                          type="text"
                          className=" opacity-0 group-hover:opacity-100"
                          icon={<DeleteFilled />}
                          onClick={(e) => {
                            e.stopPropagation();
                            // handleDeleteFr(friend.userId);
                          }}
                        />,
                      ]}
                      // onClick={() => handleRouterChat(friend.userId)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            className="mt-1"
                            size={32}
                            icon={<UserOutlined />}
                            src={friend?.avatarLocation}
                          />
                        }
                        title={friend?.name}
                        description={friend?.phoneNumber}
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "Không có thông tin" }}
                />
              </div>
            ))
          ) : (
            <Empty description="Không có thông tin"></Empty>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span className="flex items-center gap-3">
              <MailOutlined size={24} className="pt-[2px]" />
              Lời mời kết bạn ({lstRequest?.length ? lstRequest?.length : null})
            </span>
          }
          key="requests"
        >
          {lstRequest?.length ? (
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={lstRequest}
              loading={isFetchingRequest}
              pagination={{
                pageSize: 12,
                total: lstRequest?.length,
              }}
              renderItem={(request: FriendProps, index) => (
                <List.Item className="shadow-12 transition-all hover:scale-[1.02]  ">
                  <div className="rounded-lg bg-white p-4 shadow-lg">
                    <div className="mb-3 flex gap-3">
                      <Avatar
                        icon={<UserOutlined />}
                        size={40}
                        src={request.avatarLocation}
                      />

                      <div className="">
                        <h4 className="">{request.name}</h4>
                        <div className="text-sm font-normal text-slate-400">
                          Bạn đã gửi lời mời
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        danger
                        className="w-full"
                        onClick={() =>
                          onCancelFriends(request.userId, "cancelRequest")
                        }
                      >
                        Huỷ
                      </Button>
                      <Button
                        type="primary"
                        className="w-full"
                        onClick={() =>
                          onCancelFriends(request.userId, "cancelRequest")
                        }
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "Không có thông tin" }}
            />
          ) : (
            <Empty description="Không có thông tin"></Empty>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span className="flex items-center gap-3">
              <MailOutlined size={24} className="pt-[2px]" />
              Lời mời đã gửi: {lstSending?.length ? lstSending?.length : null}
            </span>
          }
          key="sending"
        >
          {lstSending?.length ? (
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={lstSending}
              loading={isFetchingSending}
              pagination={{
                pageSize: 12,
                total: lstSending?.length,
              }}
              renderItem={(sending: FriendProps, index) => (
                <List.Item className="shadow-12 transition-all hover:scale-[1.02]  ">
                  <div className="rounded-lg bg-white p-4 shadow-lg">
                    <div className="mb-3 flex gap-3">
                      <Avatar
                        icon={<UserOutlined />}
                        size={40}
                        src={sending.avatarLocation}
                      />

                      <div className="">
                        <h4 className="">{sending.name}</h4>
                        <div className="text-sm font-normal text-slate-400">
                          Bạn đã gửi lời mời
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        danger
                        className="w-full"
                        onClick={() =>
                          onCancelFriends(sending.userId, "cancelRequest")
                        }
                      >
                        Thu hồi lời mời
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "Không có thông tin" }}
            />
          ) : (
            <Empty description="Không có thông tin"></Empty>
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Friend;

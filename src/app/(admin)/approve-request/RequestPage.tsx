"use client";
import React, { useState } from "react";
import { Avatar, Button, Empty, Image, Modal, Spin, message } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import Learning from "@/model/Learning";
import { UserOutlined } from "@ant-design/icons";
import { isImage } from "@/components/common/constants";
import moment from "moment";

interface ContactItem {
  id: number;
  avatar: string;
  volunteerEmail: string;
  vocabularyContent: string;
}

const RequestPage: React.FC = () => {
  const [previewFile, setPreviewFile] = useState<{
    open: boolean;
    file: any;
  }>({
    open: false,
    file: "",
  });

  // API lấy danh sách  yêu cầu
  const {
    data: listRequests,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getPendingData();
      return res?.data as ContactItem[];
    },
  });

  // từ chối
  const mutationDel = useMutation({
    mutationFn: Learning.deleteData,
    onSuccess: () => {
      message.success("Đã từ chối");
      refetch();
    },
  });

  return (
    <Spin spinning={isFetching}>
      <div className="flex flex-col items-center">
        <div className="mt-6 w-full max-w-3xl">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
            <h2 className="text-lg font-semibold">Danh sách cần phê duyệt</h2>
            <div className="text-gray-500">
              Số lượng yêu cầu: {listRequests?.length}
            </div>
          </div>

          {listRequests?.length ? (
            <div className="mt-4">
              {listRequests.map((item: any, index: number) => (
                <>
                  <div className="py-1">
                    Thời gian gửi:{" "}
                    {moment(item.created).format("DD/MM/YYYY hh:mm:ss")}
                  </div>
                  <div
                    className="mt-2 flex items-center rounded-lg bg-white p-4 shadow-md hover:cursor-pointer hover:bg-neutral-200"
                    key={index}
                  >
                    <div className="mr-4">
                      <Avatar
                        icon={<UserOutlined />}
                        src={item.avatar}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{item.volunteerEmail}</div>
                      <div className="text-gray-600">
                        {item.vocabularyContent}
                      </div>
                    </div>
                    <div className="ml-auto flex gap-3">
                      <Button
                        type="primary"
                        className="rounded-md bg-blue-500 px-4  text-white"
                      >
                        Đồng ý
                      </Button>
                      <Button
                        className="rounded-md  bg-gray-2 px-4"
                        onClick={() =>
                          setPreviewFile({
                            open: true,
                            file: item.dataLocation,
                          })
                        }
                      >
                        Xem lại
                      </Button>
                      <Button className="rounded-md bg-orange-200 px-4  ">
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <Empty description="Không có yêu cầu phê duyệt nào." />
            </div>
          )}
        </div>

        {/* Modal xem lại */}
        <Modal
          open={previewFile.open}
          onCancel={() => setPreviewFile({ open: false, file: "" })}
          footer={null}
          width={800}
        >
          <div className="flex w-full items-center justify-center p-4">
            {previewFile && (
              <>
                {isImage(previewFile.file) ? (
                  <Image className="w-full" alt="" src={previewFile.file} />
                ) : (
                  <div className="w-full">
                    <video controls style={{ width: "100%", height: "auto" }}>
                      <source src={previewFile.file} />
                    </video>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default RequestPage;

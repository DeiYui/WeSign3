/* eslint-disable @next/next/no-img-element */
// ChatComponent.js
import React, { useState } from "react";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Input, Popover, Upload } from "antd";
import EmojiPicker from "emoji-picker-react";
import { EmojiIcon, ImageIcon } from "@/assets/icons";
import UploadModel from "@/model/UploadModel";

const FilePreview = ({ selectedFiles, setSelectedFiles, isImage }: any) => {
  return (
    <>
      {selectedFiles.length > 0 && (
        <div
          className="custom-scrollbar flex items-center gap-3 overflow-x-auto p-4"
          style={{ maxWidth: "220px" }}
        >
          {selectedFiles.map((file: any, index: number) => (
            <div className="relative" key={index}>
              {isImage(file) ? (
                <img
                  className="flex items-center justify-center object-contain"
                  style={{
                    borderRadius: "12px",
                    width: "48px",
                    height: "48px",
                    maxWidth: "80px",
                  }}
                  src={file}
                  alt="Preview"
                />
              ) : (
                <video
                  className="flex items-center justify-center object-contain"
                  style={{
                    borderRadius: "12px",
                    width: "48px",
                    height: "48px",
                    maxWidth: "80px",
                  }}
                >
                  <source src={file} type="video/mp4" />
                </video>
              )}
              <div
                className="absolute -right-2 -top-2.5 cursor-pointer rounded-lg bg-white px-1 hover:bg-slate-300"
                onClick={() =>
                  setSelectedFiles(
                    selectedFiles.filter((_: any, i: number) => i !== index),
                  )
                }
              >
                <CloseOutlined
                  style={{
                    fontSize: 12,
                    color: "black",
                    fontWeight: "bold",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const ChatInput = ({
  selectedFiles,
  setSelectedFiles,
}: {
  selectedFiles: any;
  setSelectedFiles: any;
}) => {
  const handleFileChange = async ({ file }: any) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await UploadModel.uploadFile(formData);
    setSelectedFiles([...selectedFiles, res]);
  };

  const isImage = (file: { type: string }) => {
    return typeof file === "string" || file.type.startsWith("image/");
  };

  return (
    <div className="absolute bottom-0 left-16 w-[280px] bg-white pb-2 ">
      <div className="flex items-center gap-2.5">
        <Upload
          id="file-input"
          accept="image/*, video/*"
          beforeUpload={() => false}
          onChange={handleFileChange}
          showUploadList={false}
        >
          <Button className="border-none" icon={<ImageIcon size={22} />} />
        </Upload>
        <div className="w-full rounded-lg bg-neutral-100 ">
          <FilePreview
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            isImage={isImage}
          />
          <Input
            suffix={
              <div className="flex items-center gap-3">
                <Popover
                  content={<EmojiPicker />}
                  title="Emoji"
                  trigger="click"
                  placement="topRight"
                >
                  <div className="relative ml-3 cursor-pointer">
                    <EmojiIcon size={22} />
                  </div>
                </Popover>
                <SendOutlined className="cursor-pointer" />
              </div>
            }
            size="large"
            placeholder="Nhập tin nhắn"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

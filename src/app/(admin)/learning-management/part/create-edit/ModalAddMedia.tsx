import BasicDrawer from "@/components/UI/draw/BasicDraw";
import { isImage } from "@/components/common/constants";
import MediaModel from "@/model/MediaModel";
import UploadModel from "@/model/UploadModel";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Collapse, Image, Modal, Upload, message } from "antd";
import React, { useState } from "react";
import styled from "styled-components";
import { TYPE_VOCABULARY } from "../PartList";

const CustomCollapse = styled(Collapse)`
  &&& {
    border: none;
    border-radius: 0;
    background-color: white;
    box-shadow: none;
  }

  .ant-collapse-header-text {
    color: "#0F131A";
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0.07px;
  }

  &.ant-collapse > .ant-collapse-item:first-child .ant-collapse-header {
    color: red;
  }

  &.ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding: 0 0 8px;
  }

  &.ant-collapse .ant-collapse-content > .ant-collapse-content-box {
    &:nth-child(n + 2) {
      padding: 8px 0;
    }
    padding: 0;
  }

  &.ant-collapse-borderless > .ant-collapse-item {
    &:nth-child(n + 2) {
      padding: 16px 0 8px;
    }
    padding-bottom: 8px;
    border-bottom: none;
    &:nth-child(n + 2) {
      border-top: 1px solid #e2e8f3;
    }
  }
`;

interface ModalAddMediaProps {
  isShowModalAddMedia: boolean;
  recordMedia?: any;
  refetch: () => void;
  onClose?: any;
}

const ModalAddMedia: React.FC<ModalAddMediaProps> = ({
  isShowModalAddMedia,
  recordMedia,
  refetch,
  onClose,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewFile, setPreviewFile] = useState<any>("");
  const [isLoading, setIsLoading] = useState(false);
  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("files", file.originFileObj);
      });

      const res = await UploadModel.upLoadList(formData);
      if (res.code === 200) {
        const images = res.data
          ?.filter(
            (item: { imageLocation: null }) => item.imageLocation !== null,
          )
          .map((item: { imageLocation: any }) => item.imageLocation);
        const videos = res.data
          ?.filter(
            (item: { videoLocation: null }) => item.videoLocation !== null,
          )
          .map((item: { videoLocation: any }) => item.videoLocation);

        const bodyListImage = images?.map((imageLocation: any) => ({
          imageLocation,
          partId: recordMedia.partId,
        }));

        const bodyListVideo = videos?.map((videoLocation: any) => ({
          videoLocation,
          partId: recordMedia.partId,
        }));

        // Only make API calls if there are items to upload
        let success = true;
        if (bodyListImage.length) {
          const responseImage = await MediaModel.postImagePart(bodyListImage);
          if (responseImage.code !== 200) {
            message.error("Lỗi upload images");
            success = false;
          }
        }

        if (bodyListVideo.length) {
          const responseVideo = await MediaModel.postVideoPart(bodyListVideo);
          if (responseVideo.code !== 200) {
            message.error("Lỗi upload video");
            success = false;
          }
        }

        if (success) {
          message.success("Thêm danh sách hình ảnh/video thành công");
          setFileList([]);
          onClose();
          refetch();
        }
      } else {
        message.error("Lỗi upload files");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Có lỗi xảy ra khi tải lên");
    }
    setIsLoading(false);
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onloadend = () => resolve(reader.result as string);
      });
    }
    setPreviewFile({ open: true, file: file });
  };

  const handleChange = ({ fileList }: any) => {
    const containsOtherFileType = fileList.some(
      (file: { type: string }) =>
        !file.type.startsWith("image/") && !file.type.startsWith("video/"),
    );
    if (containsOtherFileType) {
      return;
    }
    setFileList(fileList);
  };

  const beforeUpload = (file: any) => {
    const isImageOrVideo =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isImageOrVideo) {
      message.error(`"${file.name}" không phải là tệp hình ảnh hoặc video!`);
    }
    // Return false to stop auto upload
    return false;
  };

  const items = [
    {
      key: "1",
      label: "Thêm các video/hình ảnh khác",
      children: (
        <div className="max-h-[600px] overflow-y-scroll py-2">
          <Upload
            listType="text"
            multiple
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            accept="image/*,video/*"
            beforeUpload={beforeUpload}
            customRequest={({ onSuccess }) => {
              if (onSuccess) onSuccess("ok");
            }}
          >
            <Button icon={<UploadOutlined />}>Chọn File</Button>
          </Upload>
        </div>
      ),
    },
  ];

  return (
    <>
      <BasicDrawer
        width={450}
        onClose={onClose}
        open={isShowModalAddMedia}
        title={`Bổ sung hình ảnh/video cho ${recordMedia.partName}`}
        footer={[
          <Button key="back" onClick={onClose}>
            Hủy bỏ
          </Button>,
          <Button
            className="ml-4"
            loading={isLoading}
            key="submit"
            type="primary"
            disabled={!fileList.length}
            onClick={handleUpload}
          >
            Tải lên
          </Button>,
        ]}
        destroyOnClose
      >
        <CustomCollapse
          defaultActiveKey={["1"]}
          items={items}
          bordered={false}
        />
      </BasicDrawer>

      <Modal
        open={previewFile.open}
        onCancel={() => setPreviewFile({ open: false, file: "" })}
        footer={null}
        width={600}
        closeIcon={null}
      >
        <div className="flex w-full items-center justify-center">
          {previewFile && (
            <>
              {previewFile.file?.originFileObj?.type?.startsWith("image/") ? (
                <Image
                  className="w-full"
                  alt=""
                  src={previewFile.file.preview}
                />
              ) : (
                <div className="w-full">
                  <video controls style={{ width: "100%", height: "auto" }}>
                    <source src={previewFile.file.preview} />
                  </video>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ModalAddMedia;

"use client";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import { AvatarUpload } from "@/components/UI/Upload/AvatarUpload";
import Learning from "@/model/Learning";
import UploadModel from "@/model/UploadModel";
import { validateRequireInput } from "@/utils/validation/validtor";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
  Select,
  Tabs,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Topic {
  content: string;
  imageLocation: string;
  videoLocation?: string;
}

interface FilterParams {
  page: number;
  size: number;
  topicId: number;
  content: string;
}

// Danh sách các đuôi file ảnh
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

// Hàm kiểm tra đuôi file có thuộc danh sách ảnh hay không
export function isImageLocation(url: string) {
  for (let ext of imageExtensions) {
    if (url?.toLowerCase().endsWith(ext)) {
      return true;
    }
  }
  return false;
}

const { TabPane } = Tabs;
const { TextArea } = Input;

const VocabularyCreateUpdate: React.FC = () => {
  const router = useRouter();
  const [form] = useForm();

  //state
  const [tabKey, setTabKey] = useState("1");

  // Modal thêm mới
  const [preview, setPreview] = useState<{
    fileImage: string;
    fileVideo: string;
  }>({
    fileImage: "",
    fileVideo: "",
  });

  // API lấy danh sách  topics
  const { data: allTopics } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      return res?.data?.map((item: { topicId: any; content: any }) => ({
        id: item.topicId,
        value: item.topicId,
        label: item.content,
        text: item.content,
      }));
    },
  });

  // Thêm mới / chỉnh sửa  topics
  const mutationCreate = useMutation({
    mutationFn: Learning.addVocabulary,
    onSuccess: () => {
      message.success("Thêm mới từ thành công");
      router.back();
    },
  });

  // Upload file
  const uploadFileMutation = useMutation({
    mutationFn: UploadModel.uploadFile,
    onSuccess: async (res: any) => {
      if (isImageLocation(res)) {
        setPreview({
          ...preview,
          fileImage: res,
        });
        form.setFieldsValue({
          vocabularyImageReqs: [
            {
              imageLocation: res,
              primary: true,
            },
          ],
        });
      } else {
        setPreview({
          ...preview,
          fileVideo: res,
        });
        form.setFieldValue("vocabularyVideoReqs", [
          {
            videoLocation: res,
            primary: true,
          },
        ]);
      }
    },
    onError: (error: Error) => {
      console.error(error);
      message.error("File đã được lưu trước đó");
    },
  });

  // upload
  const props: UploadProps = {
    name: "file",
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    customRequest: ({ file }: { file: any }) => {
      const formData = new FormData();
      formData.append("file", file);
      uploadFileMutation.mutate(formData);
    },
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      strokeWidth: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  return (
    <div className="w-full p-4">
      <Breadcrumb
        pageName="Thêm mới từ vựng"
        itemBreadcrumb={[
          { pathName: "/", name: "Trang chủ" },
          {
            pathName: "/learning-management/vocabulary",
            name: "Danh sách từ vựng",
          },
          { pathName: "#", name: "Thêm mới từ vựng" },
        ]}
      />
      <div className="w-full bg-white">
        <Form
          layout="vertical"
          className="px-4 pb-4"
          onFinish={(value) => {
            console.log("value", value);
          }}
        >
          <Tabs activeKey={tabKey} onChange={(key) => setTabKey(key)}>
            <TabPane tab="Thêm một" key="1">
              <Form.Item
                name="topicId"
                label="Chủ đề liên quan"
                required
                rules={[
                  validateRequireInput("Chủ đề liên quan không được bỏ trống"),
                ]}
                className="mb-2"
              >
                <Select
                  size="large"
                  className="w-full"
                  allowClear
                  placeholder="Chọn chủ đề"
                  options={allTopics}
                />
              </Form.Item>
              <Form.Item
                name="content"
                label="Ngôn ngữ văn bản"
                required
                rules={[
                  validateRequireInput("Chủ đề liên quan không được bỏ trống"),
                ]}
                className="mb-2"
              >
                <Input maxLength={50} placeholder="Nhập từ vựng" />
              </Form.Item>
              <Form.Item name="note" label="Mô tả">
                <TextArea maxLength={200} showCount placeholder="Nhập mô tả" />
              </Form.Item>
              <Form.Item name="vocabularyType" hidden />
              <div className="flex gap-4">
                <Form.Item name="vocabularyImageReqs" label="Ảnh">
                  <Upload {...props} showUploadList={false} accept="image/*">
                    <Button icon={<UploadOutlined />}>Tải file lên</Button>
                  </Upload>
                  {/* <AvatarUpload
                    size={160}
                    listType="picture-card"
                    onChange={(value) => {
                      setPreview({ ...preview, fileImage: value });
                    }}
                  >
                    {preview.fileImage ? (
                      <Image
                        className=""
                        src={preview.fileImage}
                        alt="Ảnh chủ đề"
                        style={{ width: 300 }}
                      />
                    ) : (
                      <div className="flex justify-center">Tải file</div>
                    )}
                  </AvatarUpload> */}
                </Form.Item>
                <Form.Item name="vocabularyVideoReqs" label="Video">
                  <Upload {...props} showUploadList={false} accept="video/*">
                    <Button icon={<UploadOutlined />}>Tải file lên</Button>
                  </Upload>
                </Form.Item>
              </div>
              <div className="mb-3 flex items-center justify-center gap-4">
                {preview.fileImage ? (
                  <Image
                    className=""
                    src={preview.fileImage}
                    alt="Ảnh chủ đề"
                    style={{ width: 300 }}
                  />
                ) : null}
                {preview.fileVideo ? (
                  <video controls style={{ width: 400, height: "auto" }}>
                    <source src={preview.fileVideo} />
                  </video>
                ) : null}
              </div>
            </TabPane>
            <TabPane tab="Thêm nhiều" key="2">
              <Form.Item></Form.Item>
            </TabPane>
          </Tabs>
          <div className="flex w-full items-center justify-center gap-4">
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VocabularyCreateUpdate;

/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { filterOption } from "@/components/Dashboard/DashboardApp";
import Breadcrumb from "@/components/UI/Breadcrumbs/Breadcrumb";
import Learning from "@/model/Learning";
import Lesson from "@/model/Lesson";
import UploadModel from "@/model/UploadModel";
import { validateRequireInput } from "@/utils/validation/validtor";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Spin,
  Tabs,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { setTimeout } from "timers";

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

interface ClassItem {
  classRoomId: string;
  content: string;
}

const PartCreateUpdate = ({ setOpenCreateModal }: any) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [form] = useForm();
  const [formUpload] = useForm();
  const { partId } = useParams();

  // State variables
  const [tabKey, setTabKey] = useState("1");
  const [preview, setPreview] = useState<{
    fileImage: string;
    fileVideo: string;
  }>({
    fileImage: "",
    fileVideo: "",
  });
  const [fileList, setFileList] = useState([]);
  const [previewFile, setPreviewFile] = useState<{ open: boolean; file: any }>({
    open: false,
    file: "",
  });
  const [isLoadingUploadLst, setIsLoadingUploadLst] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [classList, setClassList] = useState<ClassItem[]>([]);

  // Watch for changes in lessonId
  const lessonId = Form.useWatch("lessonId", form);
  const classRoomId = Form.useWatch("classRoomId", form);
  const classRoomIdUpload = Form.useWatch("classRoomId", formUpload);

  useEffect(() => {
    form.resetFields();
  }, [tabKey]);

  // Fetch all classes
  const { data: allClass, isFetching: isFetchingClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      const data = res.data?.map((item: ClassItem) => ({
        label: item.content,
        value: item.classRoomId,
      }));
      setClassList(data);
      return data;
    },
  });

  // Fetch all lessons based on selected class
  const { data: allLesson, isFetching: isFetchingTopic } = useQuery({
    queryKey: ["getLstLessonByClass", classRoomId],
    queryFn: async () => {
      const res = await Lesson.getLstLessonByClass({
        classRoomId: classRoomId,
      });
      return res?.data?.map((item: { lessonId: any; lessonName: any }) => ({
        id: item.lessonId,
        value: item.lessonId,
        label: item.lessonName,
        text: item.lessonName,
      }));
    },
    enabled: !!classRoomId,
  });

  // Fetch all lessons based on selected class for formUpload
  const { data: allLessonUpload, isFetching: isFetchingTopicUpload } = useQuery(
    {
      queryKey: ["getLstLessonByClass", classRoomIdUpload],
      queryFn: async () => {
        const res = await Lesson.getLstLessonByClass({
          classRoomId: classRoomIdUpload,
        });
        return res?.data?.map((item: { lessonId: any; lessonName: any }) => ({
          id: item.lessonId,
          value: item.lessonId,
          label: item.lessonName,
          text: item.lessonName,
        }));
      },
      enabled: !!classRoomIdUpload,
    },
  );

  // Fetch all parts based on selected lesson
  const { data: allPart, isFetching: isFetchingPart } = useQuery({
    queryKey: ["getPartAll", lessonId],
    queryFn: async () => {
      const res = await Learning.getPartAll({
        lessonId: lessonId,
      });
      return res?.data?.map((item: { partId: any; partName: any }) => ({
        id: item.partId,
        value: item.partName,
        label: item.partName,
        text: item.partName,
      }));
    },
    enabled: !!lessonId,
  });

  // Fetch part details for update
  const { data: partDetails, isFetching: isFetchingPartDetails } = useQuery({
    queryKey: ["getPartDetail", partId],
    queryFn: async () => {
      const res = await Learning.getPartDetail(partId);
      return res.data;
    },
    enabled: !!partId,
  });

  useEffect(() => {
    if (partDetails) {
      form.setFieldsValue({
        classRoomId: partDetails.classRoomId,
        lessonId: partDetails.lessonId,
        partName: partDetails.partName,
        partImageReqs: partDetails.partImageReqs,
        partVideoReqs: partDetails.partVideoReqs,
      });
      setPreview({
        fileImage: partDetails.partImageReqs?.[0]?.imageLocation || "",
        fileVideo: partDetails.partVideoReqs?.[0]?.videoLocation || "",
      });
    }
  }, [partDetails, form]);

  // Mutation for creating a new part
  const mutationCreate = useMutation({
    mutationFn: Learning.addPart,
    onSuccess: () => {
      message.success("Thêm mới phần học thành công");
      setOpenCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ["getPartAll"] });
    },
    onError: ({ response }: any) => {
      const { data } = response;
      if (data.code === 409) {
        message.error("Phần đã tồn tại");
        return;
      }
      message.error("Thêm mới phần thất bại");
    },
  });

  // Mutation for updating a part
  const mutationUpdate = useMutation({
    mutationFn: (partData) => {
      if (typeof partId === "string") {
        return Learning.updatePart(partId, partData);
      }
      throw new Error("Invalid partId");
    },
    onSuccess: () => {
      message.success("Cập nhật phần học thành công");
      router.push("/learning-management/part/public");
    },
    onError: ({ response }: any) => {
      const { data } = response;
      if (data.code === 409) {
        message.error("Phần đã tồn tại");
        return;
      }
      message.error("Cập nhật phần thất bại");
    },
  });

  // Mutation for uploading a file
  const uploadFileMutation = useMutation({
    mutationFn: UploadModel.uploadFile,
    onSuccess: async (res: any) => {
      if (isImageLocation(res)) {
        setPreview({
          ...preview,
          fileImage: res,
        });
        form.setFieldValue("partImageReqs", [
          {
            imageLocation: res,
          },
        ]);
      } else {
        setPreview({
          ...preview,
          fileVideo: res,
        });
        form.setFieldValue("partVideoReqs", [
          {
            videoLocation: res,
          },
        ]);
      }
    },
    onError: (error: Error) => {
      console.error(error);
      message.error("File đã được lưu trước đó");
    },
  });

  // Upload properties
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

  // Handle file preview
  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onloadend = () => resolve(reader.result);
      });

      setPreviewFile({ open: true, file: file });
    }
  };

  // Handle file change
  const handleChange = ({ fileList }: any) => {
    setIsLoadingFile(true);
    const containsOtherFileType = fileList.some(
      (file: any) =>
        !file.type.startsWith("image/") && !file.type.startsWith("video/"),
    );
    if (containsOtherFileType) {
      message.error("Chỉ chấp nhận tệp ảnh và video!");
      return;
    }

    setFileList(fileList);
    setTimeout(() => {
      setIsLoadingFile(false);
    }, 2000);
  };

  // Handle file upload
  const handleUpload = async (value: any) => {
    setIsLoadingUploadLst(true);
    const formData = new FormData();
    fileList.forEach((file: any) => {
      formData.append("files", file.originFileObj);
    });

    const res = await UploadModel.upLoadList(formData);

    if (res.code === 200) {
      const body = res.data?.map(
        (e: {
          partName: any;
          imageLocation: any;
          vocabularyId: any;
          videoLocation: any;
        }) => ({
          partName: value.partName,
          partImageReqs: [
            {
              imageLocation: e?.imageLocation,
            },
          ],
          partVideoReqs: [
            {
              videoLocation: e?.videoLocation,
            },
          ],
          lessonId: value.lessonId,
          classRoomId: value.classRoomId,
        }),
      );
      const response = await Learning.addListPart(body);
      if (response.code === 200) {
        message.success("Thêm danh sách phần thành công");
        setFileList([]);
        router.push("/learning-management/part/public");
      } else {
        message.error("Thêm thất bại");
        setFileList([]);
      }
    } else {
      message.error("Lỗi tải file");
    }
    setIsLoadingUploadLst(false);
  };

  return (
    <Spin spinning={isLoadingUploadLst}>
      <div className="w-full">
        <Breadcrumb
          pageName=""
          itemBreadcrumb={[
            { pathName: "/", name: "Trang chủ" },
            {
              pathName: "/learning-management/part/public",
              name: "Danh sách phần",
            },
            { pathName: "#", name: "Thêm mới phần" },
          ]}
        />
        <div className="w-full bg-white">
          <Tabs
            className="px-4"
            activeKey={tabKey}
            onChange={(key) => setTabKey(key)}
          >
            <TabPane tab="Thêm một" key="1">
              <Form
                form={form}
                layout="vertical"
                className="px-4 pb-4"
                onFinish={(value) => {
                  if (partId) {
                    mutationUpdate.mutate({
                      ...value,
                      partId,
                      partImageReqs: value?.partImageReqs || undefined,
                      partVideoReqs: value?.partVideoReqs || undefined,
                    });
                  } else {
                    mutationCreate.mutate({
                      ...value,
                      partImageReqs: value?.partImageReqs || undefined,
                      partVideoReqs: value?.partVideoReqs || undefined,
                      classRoomId: value.classRoomId,
                    });
                  }
                }}
              >
                <Form.Item
                  name="classRoomId"
                  label="Lớp học"
                  required
                  rules={[validateRequireInput("Lớp học không được bỏ trống")]}
                  className="mb-2"
                >
                  <Select
                    size="large"
                    className="w-full"
                    allowClear
                    placeholder="Chọn lớp học"
                    options={allClass}
                    loading={isFetchingClass}
                    showSearch
                    filterOption={filterOption}
                    notFoundContent={
                      isFetchingClass ? (
                        <Spin size="small" />
                      ) : (
                        "Không tìm thấy lớp học"
                      )
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="lessonId"
                  label="Bài học liên quan"
                  required
                  rules={[
                    validateRequireInput(
                      "Bài học liên quan không được bỏ trống",
                    ),
                  ]}
                  className="mb-2"
                >
                  <Select
                    size="large"
                    className="w-full"
                    allowClear
                    placeholder="Chọn bài học"
                    options={allLesson}
                    loading={isFetchingTopic}
                    showSearch
                    filterOption={filterOption}
                    notFoundContent={
                      isFetchingTopic ? (
                        <Spin size="small" />
                      ) : (
                        "Không tìm thấy bài học"
                      )
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="partName"
                  label="Phần"
                  required
                  rules={[validateRequireInput("Phần không được bỏ trống")]}
                  className="mb-2"
                >
                  <Input placeholder="Nhập tên phần" />
                </Form.Item>

                <div className="flex flex-col gap-4">
                  <Form.Item name="partImageReqs" noStyle />
                  <Form.Item name="partVideoReqs" noStyle />

                  <Upload {...props} showUploadList={false} accept="image/*">
                    <Button icon={<UploadOutlined />}>Tải file ảnh</Button>
                  </Upload>
                  <Upload {...props} showUploadList={false} accept="video/*">
                    <Button icon={<UploadOutlined />}>Tải file video</Button>
                  </Upload>
                </div>
                <div className="mb-3 flex items-center justify-center gap-4">
                  {preview.fileImage ? (
                    <>
                      <Image
                        className=""
                        src={preview.fileImage}
                        alt="Ảnh chủ đề"
                        style={{ width: 300 }}
                      />
                      <Button
                        onClick={() => {
                          setPreview({
                            ...preview,
                            fileImage: "",
                          });
                          form.setFieldValue("vocabularyImageReqs", undefined);
                        }}
                      >
                        Xoá ảnh
                      </Button>
                    </>
                  ) : null}
                  {preview.fileVideo ? (
                    <>
                      <video controls style={{ width: 400, height: "auto" }}>
                        <source src={preview.fileVideo} />
                      </video>
                      <Button
                        onClick={() => {
                          setPreview({
                            ...preview,
                            fileVideo: "",
                          });
                          form.setFieldValue("vocabularyVideoReqs", undefined);
                        }}
                      >
                        Xoá video
                      </Button>
                    </>
                  ) : null}
                </div>
                <div className="flex w-full items-center justify-center gap-4">
                  <Button onClick={() => setOpenCreateModal(false)}>Huỷ</Button>
                  <Button type="primary" htmlType="submit">
                    {partId ? "Cập nhật" : "Tạo"}
                  </Button>
                </div>
              </Form>
            </TabPane>

            <TabPane tab="Thêm nhiều" key="2">
              <Form
                form={formUpload}
                layout="vertical"
                className="px-4 pb-4"
                onFinish={(value) => {
                  handleUpload(value);
                }}
              >
                <Form.Item
                  name="classRoomId"
                  label="Lớp học"
                  required
                  rules={[validateRequireInput("Lớp học không được bỏ trống")]}
                  className="mb-2"
                >
                  <Select
                    size="large"
                    className="w-full"
                    allowClear
                    placeholder="Chọn lớp học"
                    options={allClass}
                    loading={isFetchingClass}
                    showSearch
                    filterOption={filterOption}
                    notFoundContent={
                      isFetchingClass ? (
                        <Spin size="small" />
                      ) : (
                        "Không tìm thấy lớp học"
                      )
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="lessonId"
                  label="Bài học liên quan"
                  required
                  rules={[
                    validateRequireInput(
                      "Bài học liên quan không được bỏ trống",
                    ),
                  ]}
                  className="mb-2"
                >
                  <Select
                    size="large"
                    className="w-full"
                    allowClear
                    placeholder="Chọn bài học"
                    options={allLessonUpload}
                    loading={isFetchingTopicUpload}
                    showSearch
                    filterOption={filterOption}
                    notFoundContent={
                      isFetchingTopicUpload ? (
                        <Spin size="small" />
                      ) : (
                        "Không tìm thấy bài học"
                      )
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="partName"
                  label="Phần"
                  required
                  rules={[validateRequireInput("Phần không được bỏ trống")]}
                  className="mb-2"
                >
                  <Input placeholder="Nhập tên phần" />
                </Form.Item>

                <div className="max-h-[600px] overflow-y-scroll">
                  <CustomUpload
                    listType="text"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    multiple
                    customRequest={async ({ file }: any) => {
                      const isImageOrVideo =
                        file.type.startsWith("image/") ||
                        file.type.startsWith("video/");
                      if (!isImageOrVideo) {
                        message.error("Chỉ được chọn file video hoặc ảnh.");
                      }
                    }}
                    accept="image/*,video/*"
                  >
                    <Button loading={isLoadingFile} icon={<UploadOutlined />}>
                      Chọn File
                    </Button>
                  </CustomUpload>
                </div>
                <div className="flex w-full items-center justify-center gap-4">
                  <Button onClick={() => setOpenCreateModal(false)}>Huỷ</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isLoadingFile}
                    style={{background: "#2f54eb"}}
                  >
                    Tạo
                  </Button>
                </div>
              </Form>
            </TabPane>
          </Tabs>
        </div>

        {/* Modal */}
        {/* Modal xem trước */}
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
      </div>
    </Spin>
  );
};

export default PartCreateUpdate;
export const CustomUpload = styled(Upload)`
  .ant-upload-icon {
    display: none;
  }
`;

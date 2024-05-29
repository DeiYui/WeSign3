"use client";
import { colors } from "@/assets/colors";
import { CloseIcon } from "@/assets/icons";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import UploadModel from "@/model/UploadModel";
import { validateRequireInput } from "@/utils/validation/validtor";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Table,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useState } from "react";
import { CustomTable } from "../check-list/ExamList";

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

const VocabularyList: React.FC = () => {
  const [form] = useForm();
  // danh sách topics
  const [filterParams, setFilterParams] = useState<FilterParams>({
    page: 1,
    size: 999999,
    topicId: 0,
    content: "",
  });
  const [lstTopics, setLstTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // Modal thêm mới
  const [modalCreate, setModalCreate] = useState<{
    open: boolean;
    file: string;
    typeModal: string;
  }>({
    open: false,
    file: "",
    typeModal: "create",
  });

  const [modalPreview, setModalPreview] = useState<{
    open: boolean;
    file: string;
  }>({
    open: false,
    file: "",
  });

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  // API lấy danh sách từ vựng

  const { data: allVocabulary, isFetching } = useQuery({
    queryKey: ["getAllVocalizations", filterParams],
    queryFn: async () => {
      const res = await Learning.getAllVocabulary(filterParams);
      // Sắp xếp priamry lên đầu
      res?.data.forEach(
        (item: {
          vocabularyImageResList: any[];
          vocabularyVideoResList: any[];
        }) => {
          item.vocabularyImageResList.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
          item.vocabularyVideoResList.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
        },
      );
      return res.data;
    },
  });

  // Thêm mới / chỉnh sửa  topics
  const mutationCreateUpdate = useMutation({
    mutationFn:
      modalCreate.typeModal === "create"
        ? Learning.addTopics
        : Learning.editTopics,
    onSuccess: (res) => {
      message.success(
        `${modalCreate.typeModal === "create" ? "Thêm mới thành công" : "Cập nhật thành công"}`,
      );
    },
  });

  // Xoá chủ đề
  const mutationDel = useMutation({
    mutationFn: Learning.deleteTopics,
    onSuccess: () => {
      message.success("Xoá chủ đề thành công");
    },
  });

  // Upload file
  const uploadFileMutation = useMutation({
    mutationFn: UploadModel.uploadFile,
    onSuccess: async (res: any) => {
      form.setFieldValue("file", res);
      setModalCreate({ ...modalCreate, file: res });
    },
    onError: (error: Error) => {
      console.error(error);
      message.error("File đã được lưu trước đó");
    },
  });

  // Column
  const columns = [
    {
      title: "Từ vựng",
      dataIndex: "content",
      key: "content",
      render: (content: any, record: any) => (
        <span
          className="cursor-pointer "
          style={{ fontWeight: 500, color: colors.primary600 }}
        >
          {content}
        </span>
      ),
    },
    {
      title: "Chủ đề",
      dataIndex: "topicContent",
      key: "topicContent",
      render: (content: string) => (
        <span style={{ fontWeight: 500 }}>{content}</span>
      ),
    },
    {
      title: "Ảnh minh hoạ",
      dataIndex: "imageLocation",
      key: "imageLocation",
      render: (
        imageLocation: any,
        record: {
          vocabularyImageResList: string | any[];
          content: string | undefined;
        },
      ) => {
        if (
          record.vocabularyImageResList?.length &&
          record.vocabularyImageResList[0].imageLocation
        ) {
          return (
            <Image
              width={100} // Adjust image width as needed
              src={record.vocabularyImageResList[0].imageLocation}
              alt={record.content}
            />
          );
        } else {
          return <span>Không có minh họa</span>;
        }
      },
    },
    {
      title: "Video minh hoạ",
      dataIndex: "videoLocation",
      key: "videoLocation",
      align: "center",
      render: (
        videoLocation: any,
        record: { vocabularyVideoResList: string | any[] },
      ) => {
        if (
          record.vocabularyVideoResList?.length &&
          record.vocabularyVideoResList[0].videoLocation
        ) {
          return (
            <EyeOutlined
              style={{ fontSize: "1.5rem" }}
              onClick={() =>
                setModalPreview({
                  open: true,
                  file: record.vocabularyVideoResList[0].videoLocation,
                })
              }
            />
          );
        } else {
          return <span>Không video có minh họa</span>;
        }
      },
      width: 200,
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
    },
  ];

  //upload
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

  const isLoading = isFetching || mutationCreateUpdate.isPending;

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách từ vựng</h1>
      <div className="mb-4 flex  items-center justify-between">
        {/* Filter */}
        <div className="flex w-2/3 gap-4">
          <Select
            size="large"
            className="w-full"
            allowClear
            placeholder="Chọn chủ đề"
            options={allTopics}
            onChange={(value, option: any) =>
              setFilterParams({ ...filterParams, topicId: value })
            }
          />
          <Input
            onChange={(e) => {
              setFilterParams({ ...filterParams, content: e.target.value });
            }}
            size="large"
            allowClear
            placeholder="Nhập từ vựng"
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            setModalCreate({ ...modalCreate, open: true, typeModal: "create" })
          }
        >
          Thêm mới
        </Button>
      </div>
      <CustomTable
        columns={columns as any}
        dataSource={allVocabulary}
        loading={isLoading}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />

      {/* Thêm chủ đề */}
      {/* <BasicDrawer
        width={460}
        title={
          modalCreate.typeModal === "create"
            ? "Thêm mới chủ đề"
            : "Chỉnh sửa chủ đề"
        }
        onClose={() => {
          setModalCreate({ ...modalCreate, open: false, file: "" });
          form.resetFields();
        }}
        open={modalCreate.open}
        destroyOnClose
        onOk={() => {
          form.submit();
        }}
        maskClosable={false}
        extra={
          <div className="flex items-center gap-x-4">
            <Button
              className="hover:opacity-60 "
              onClick={() => {
                setModalCreate({ ...modalCreate, open: false, file: "" });
                form.resetFields();
              }}
              type="link"
              style={{ padding: 0 }}
            >
              <CloseIcon size={20} />
            </Button>
          </div>
        }
      >
        <div className="">
          <Form
            form={form}
            layout="vertical"
            onFinish={(value) =>
              mutationCreateUpdate.mutate({
                content: value.content,
                imageLocation: value.file,
                videoLocation: "",
              })
            }
          >
            <Form.Item
              name="content"
              label="Tên chủ đề"
              className="mb-2"
              required
              rules={[validateRequireInput("Tên chủ đề không được bỏ trống")]}
            >
              <Input placeholder="Nhập tên chủ đề muốn thêm" />
            </Form.Item>
            <Form.Item name="file" label="Ảnh">
              <Upload {...props} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Tải file lên</Button>
              </Upload>
            </Form.Item>
            <div className="flex w-full items-center justify-center">
              {modalCreate.file ? (
                <Image
                  className=""
                  src={modalCreate.file}
                  alt="Ảnh chủ đề"
                  style={{ width: 300 }}
                />
              ) : null}
            </div>
          </Form>
        </div>
      </BasicDrawer> */}

      {/* Modal preview */}
      <Modal
        open={modalPreview.open}
        onCancel={() => setModalPreview({ file: "", open: false })}
        footer={null}
        width={1000}
        closeIcon={null}
        centered
      >
        <div className="flex w-full items-center justify-center">
          {modalPreview.file && (
            <div className="w-full">
              <video controls style={{ width: "100%", height: "auto" }}>
                <source src={modalPreview.file} />
              </video>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VocabularyList;

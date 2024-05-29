"use client";
import { CloseIcon } from "@/assets/icons";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import UploadModel from "@/model/UploadModel";
import { validateRequireInput } from "@/utils/validation/validtor";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
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

const TopicList: React.FC = () => {
  const [form] = useForm();
  // danh sách topics
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

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // API lấy danh sách topics
  const { isFetching, refetch } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      setLstTopics(res.data);
      return res.data as Topic[];
    },
  });

  // Tìm kiếm
  const mutation = useMutation({
    mutationFn: Learning.searchTopics,
    onSuccess: (res) => {
      setLstTopics(res.data.data);
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
      refetch();
    },
  });

  // Xoá chủ đề
  const mutationDel = useMutation({
    mutationFn: Learning.deleteTopics,
    onSuccess: () => {
      message.success("Xoá chủ đề thành công");
      refetch();
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

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
      width: 50,
    },
    {
      title: "Tên chủ đề",
      dataIndex: "content",
      key: "content",
      render: (value: string) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Minh họa",
      dataIndex: "imageLocation",
      key: "image",
      render: (text: string) => (
        <>
          {text ? (
            <Image src={text} alt="" />
          ) : (
            <div className="">Không có ảnh minh hoạ</div>
          )}
        </>
      ),
      width: 200,
    },
    {
      title: "Hành động",
      key: "topicId",
      dataIndex: "topicId",
      render: (value: any, record: Topic) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                content: record.content,
                file: record.imageLocation,
              });
              setModalCreate({
                ...modalCreate,
                open: true,
                file: record.imageLocation,
                typeModal: "edit",
              });
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => mutationDel.mutate(value)}
          />
        </div>
      ),
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
      <h1 className="mb-4 text-2xl font-bold">Danh sách chủ đề</h1>
      <div className="mb-4 flex  items-center justify-between">
        <InputPrimary
          allowClear
          onClear={() => {
            refetch();
            setCurrentPage(1);
          }}
          className="mb-4"
          style={{ width: 400 }}
          placeholder="Tìm kiếm chủ đề"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.currentTarget.value) {
                mutation.mutate({
                  page: 1,
                  size: 999999,
                  text: e.currentTarget.value,
                  ascending: true,
                  orderBy: "",
                });
              } else {
                refetch();
              }
            }
          }}
        />

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
        dataSource={lstTopics}
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
      <BasicDrawer
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
      </BasicDrawer>
    </div>
  );
};

export default TopicList;

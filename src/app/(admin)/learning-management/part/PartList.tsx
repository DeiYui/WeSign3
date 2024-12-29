"use client";
import { CloseIcon } from "@/assets/icons";
import { ConfirmModal } from "@/components/UI/Modal/ConfirmModal";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import Lesson from "@/model/Lesson";
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
  Upload,
  UploadProps,
  message,
  Spin,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { CustomTable } from "../check-list/ExamList";
import ModalListMedia from "./create-edit/ModalListMedia";
import PartCreateUpdate from "./create-edit/PartCreateUpdate";

export const TYPE_VOCABULARY = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
};

const filterOption = (input: string, option: any) =>
  option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
const isImageLocation = (res: any) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif"];
  const fileExtension = res.split(".").pop().toLowerCase();
  return imageExtensions.includes(fileExtension);
};
const PartList = ({ isPrivate }: any) => {
  const router = useRouter();
  const [form] = useForm();
  const [filterParams, setFilterParams] = useState({
    classRoomId: 0,
    lessonId: 0,
    contentSearch: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalPreview, setModalPreview] = useState({
    open: false,
    file: "",
  });

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [allParts, setAllParts] = useState([]);
  const [allPartsSearch, setAllPartsSearch] = useState([]);
  const [editingPartId, setEditingPartId] = useState<number | null>(null);

  const [modalConfirm, setModalConfirm] = useState({
    open: false,
    rowId: 0,
    typeVocabulary: "",
  });

  const [preview, setPreview] = useState({
    fileImage: "",
    fileVideo: "",
  });

  const [detailVocabulary, setDetailVocabulary] = useState({
    open: false,
    record: "",
  });

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const { data: allClass, isFetching: isFetchingClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res.data?.map((item: { content: any; classRoomId: any }) => ({
        label: item.content,
        value: item.classRoomId,
      }));
    },
  });

  const { data: allLesson, isFetching: isFetchingLesson } = useQuery({
    queryKey: ["getLstLessonByClass", filterParams.classRoomId],
    queryFn: async () => {
      const res = await Lesson.getLstLessonByClass({
        classRoomId: filterParams.classRoomId,
      });
      return res?.data?.map((item: { lessonId: any; lessonName: any }) => ({
        id: item.lessonId,
        value: item.lessonId,
        label: item.lessonName,
        text: item.lessonName,
      }));
    },
    enabled: !!filterParams.classRoomId,
  });

  const { isFetching, refetch } = useQuery({
    queryKey: ["getPartAll", filterParams],
    queryFn: async () => {
      const res = await Learning.getPartAll({
        ...filterParams,
      });
      res?.data?.forEach(
        (item: { partImageResList: any[]; partVideoResList: any[] }) => {
          item.partImageResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
          item.partVideoResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
        },
      );
      setAllParts(res?.data);
      setAllPartsSearch(res?.data);
      return res.data;
    },
  });

  useEffect(() => {
    if (filterParams.contentSearch) {
      const filteredParts = allParts.filter((part: any) =>
        part.partName
          .toLowerCase()
          .includes(filterParams.contentSearch.toLowerCase()),
      );
      setAllPartsSearch(filteredParts);
    } else {
      setAllPartsSearch(allParts);
    }
  }, [filterParams.contentSearch, allParts]);

  const mutationDel = useMutation({
    mutationFn: Learning.deletePart,
    onSuccess: () => {
      message.success("Xoá phần thành công");
      refetch();
    },
  });

  const mutationCreate = useMutation({
    mutationFn: Learning.editPart,
    onSuccess: () => {
      message.success("Cập nhật phần thành công");
      setOpenEdit(false);
      refetch();
    },
    onError: () => {
      message.error("Cập nhật phần thất bại");
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: UploadModel.uploadFile,
    onSuccess: async (res: any) => {
      if (isImageLocation(res)) {
        setPreview({
          ...preview,
          fileImage: res,
        });
        form.setFieldValue("vocabularyImageReqs", [
          {
            imageLocation: res,
            primary: true,
          },
        ]);
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

  const columns = [
    {
      title: "Lớp học",
      dataIndex: "classRoomName",
      key: "classRoomName",
      render: (content: string) => <div>{content}</div>,
      ellipsis: true,
      width: 100,
    },
    {
      title: "Bài học",
      dataIndex: "lessonName",
      key: "lessonName",
      render: (content: string) => <div>{content}</div>,
      ellipsis: true,
      width: 100,
    },
    {
      title: "Tên phần",
      dataIndex: "partName",
      key: "partName",
      render: (content: string, record: any) => (
        <div
          className="text-primary-700 hover:cursor-pointer"
          style={{ fontWeight: 500 }}
          onClick={() => setDetailVocabulary({ open: true, record: record })}
        >
          {content}
        </div>
      ),
      ellipsis: true,
      width: 100,
    },
    {
      title: "Ảnh minh hoạ",
      dataIndex: "partImageResList",
      key: "partImageResList",
      render: (
        imageLocation: any,
        record: {
          partImageResList: string | any[];
          content: string | undefined;
        },
      ) => {
        if (
          record.partImageResList?.length &&
          record.partImageResList[0].imageLocation
        ) {
          return (
            <Image
              width={100}
              src={record.partImageResList[0].imageLocation}
              alt={record.content}
            />
          );
        } else {
          return <span>Không có minh họa</span>;
        }
      },
      width: 120,
    },
    {
      title: "Video minh hoạ",
      dataIndex: "partVideoResList",
      key: "partVideoResList",
      align: "center",
      render: (
        videoLocation: any,
        record: { partVideoResList: string | any[] },
      ) => {
        if (
          record.partVideoResList?.length &&
          record.partVideoResList[0].videoLocation
        ) {
          return (
            <EyeOutlined
              style={{ fontSize: "1.5rem" }}
              onClick={() =>
                setModalPreview({
                  open: true,
                  file: record.partVideoResList[0].videoLocation,
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
      dataIndex: "partId",
      key: "partId",
      align: "center",
      render: (value: any, record: any) => (
        <div className="flex justify-center space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setOpenEdit(true);
              setEditingPartId(record.partId);
              setPreview({
                fileImage: record?.partImageResList[0]?.imageLocation,
                fileVideo: record?.partVideoResList[0]?.videoLocation,
              });
              setFilterParams({
                ...filterParams,
                classRoomId: record.classRoomId,
              });
              form.setFieldsValue(record);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() =>
              setModalConfirm({
                open: true,
                rowId: value,
                typeVocabulary: "",
              })
            }
          />
        </div>
      ),
      width: 100,
    },
  ];

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

  const isLoading = isFetching;

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách phần</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex w-2/3 gap-4">
          <Select
            size="large"
            className="w-1/3"
            allowClear
            showSearch
            placeholder="Chọn lớp học"
            options={allClass}
            onChange={(value) =>
              setFilterParams({ ...filterParams, classRoomId: value })
            }
            filterOption={filterOption}
          />
          <Select
            size="large"
            className="w-1/3"
            allowClear
            showSearch
            placeholder="Chọn bài học"
            options={allLesson}
            onChange={(value) =>
              setFilterParams({ ...filterParams, lessonId: value })
            }
            filterOption={filterOption}
          />
          <Input
            size="large"
            className="w-1/3"
            placeholder="Nhập tên phần"
            onChange={(e) =>
              setFilterParams({
                ...filterParams,
                contentSearch: e.target.value,
              })
            }
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // router.push(`/learning-management/part/create-edit`);
            setOpenCreateModal(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      <CustomTable
        columns={columns as any}
        dataSource={allPartsSearch}
        loading={isLoading}
        rowKey={(record) => record.partId}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />

      {/* Chỉnh sửa */}
      <BasicDrawer
        width={680}
        title={`Chỉnh sửa`}
        onClose={() => setOpenEdit(false)}
        open={openEdit}
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
                setOpenEdit(false);
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
            className="px-4 pb-4"
            onFinish={(value) => {
              mutationCreate.mutate({
                ...value,
                partId: editingPartId,
                private: isPrivate,
              });
            }}
          >
            <Form.Item name="partId" noStyle hidden />

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
              />
            </Form.Item>

            <Form.Item
              name="lessonId"
              label="Bài học liên quan"
              required
              rules={[
                validateRequireInput("Bài học liên quan không được bỏ trống"),
              ]}
              className="mb-2"
            >
              <Select
                size="large"
                className="w-full"
                allowClear
                placeholder="Chọn bài học"
                options={allLesson}
                loading={isFetchingLesson}
                showSearch
                filterOption={filterOption}
                notFoundContent={
                  isFetchingLesson ? (
                    <Spin size="small" />
                  ) : (
                    "Không tìm thấy bài học"
                  )
                }
              />
            </Form.Item>

            <Form.Item
              name="partName"
              label="Tên phần"
              required
              rules={[validateRequireInput("Tên phần không được bỏ trống")]}
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
              <Button onClick={() => router.back()}>Huỷ</Button>
              <Button type="primary" htmlType="submit">
                {editingPartId ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </Form>
        </div>
      </BasicDrawer>

      {/* Tạo mới */}
      {openCreateModal && (
        <BasicDrawer
          width={680}
          title="Thêm mới phần"
          onClose={() => setOpenCreateModal(false)}
          open={openCreateModal}
          destroyOnClose
          onOk={() => {
            form.submit();
          }}
          maskClosable={false}
          footer={null}
          extra={
            <div className="flex items-center gap-x-4">
              <Button
                className="hover:opacity-60 "
                onClick={() => {
                  setOpenCreateModal(false);
                }}
                type="link"
                style={{ padding: 0 }}
              >
                <CloseIcon size={20} />
              </Button>
            </div>
          }
        >
          <PartCreateUpdate setOpenCreateModal={setOpenCreateModal} />
        </BasicDrawer>
      )}

      <Modal
        open={modalPreview.open}
        onCancel={() => setModalPreview({ file: "", open: false })}
        footer={null}
        width={1000}
        closeIcon={null}
        centered
        zIndex={1000}
      >
        <div className="flex w-full items-center justify-center">
          {modalPreview.file && (
            <div className="w-full">
              <video
                key={modalPreview.file}
                controls
                style={{ width: "100%", height: "auto" }}
              >
                <source src={modalPreview.file} />
              </video>
            </div>
          )}
        </div>
      </Modal>

      <ModalListMedia
        showModalLstMedia={detailVocabulary.open}
        record={detailVocabulary.record}
        refetch={refetch}
        onClose={() => {
          setDetailVocabulary({ open: false, record: "" });
        }}
      />

      <ConfirmModal
        visible={modalConfirm.open}
        iconType="DELETE"
        title={`Xóa khỏi phần`}
        content={`Hành động này sẽ xóa phần vĩnh viễn khỏi bài học hiện tại`}
        confirmButtonText="Xác nhận"
        onClick={() => {
          mutationDel.mutate(modalConfirm.rowId);
        }}
        onCloseModal={() => setModalConfirm({ ...modalConfirm, open: false })}
      />
    </div>
  );
};

export default PartList;

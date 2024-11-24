"use client";
import { colors } from "@/assets/colors";
import { CloseIcon } from "@/assets/icons";
import { ConfirmModal } from "@/components/UI/Modal/ConfirmModal";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import UploadModel from "@/model/UploadModel";
import { validateRequireInput } from "@/utils/validation/validtor";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddFilled,
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
} from "antd";
import { useForm } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CustomTable } from "../check-list/ExamList";
import ModalListMedia from "./create-edit/ModalListMedia";
import { isImageLocation } from "./create-edit/PartCreateUpdate";
import { filterOption } from "@/components/Dashboard/DashboardApp";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Lesson from "@/model/Lesson";

interface FilterParams {
  lessonId: number;
  contentSearch: string;
}

export const TYPE_VOCABULARY: { [key: string]: string } = {
  WORD: "Từ",
  SENTENCE: "Câu",
  PARAGRAPH: "Đoạn văn",
};

const PartList = ({ isPrivate }: any) => {
  //Hooks
  const router = useRouter();
  const [form] = useForm();
  const user: User = useSelector((state: RootState) => state.admin);

  // danh sách topics
  const [filterParams, setFilterParams] = useState<FilterParams>({
    lessonId: 0,
    contentSearch: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalPreview, setModalPreview] = useState<{
    open: boolean;
    file: string;
  }>({
    open: false,
    file: "",
  });

  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [allParts, setAllParts] = useState([]);
  const [allPartsSearch, setAllPartsSearch] = useState([]);

  // modal xác nhận xoá
  const [modalConfirm, setModalConfirm] = useState<{
    open: boolean;
    rowId: number;
    typeVocabulary?: string;
  }>({
    open: false,
    rowId: 0,
    typeVocabulary: "",
  });

  // Modal thêm mới
  const [preview, setPreview] = useState<{
    fileImage: string;
    fileVideo: string;
  }>({
    fileImage: "",
    fileVideo: "",
  });

  // Chi tiết từ
  const [detailVocabulary, setDetailVocabulary] = useState<{
    open: boolean;
    record: any;
  }>({
    open: false,
    record: "",
  });

  // Thêm từ vào chủ đề
  const [modalAddVocabularyTopic, setModalAddVocabularyTopic] = useState<{
    open: boolean;
    topicId: number;
  }>({ open: false, topicId: 0 });

  // lưu những row được chọn
  const [selectedRowId, setSelectedRowId] = useState<string[]>([]);

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // API lấy danh sách bài học
  const { data: allLesson } = useQuery({
    queryKey: ["getAllLesson"],
    queryFn: async () => {
      const res = await Lesson.getLstLessonByClass();
      return res?.data?.map((item: { lessonId: any; lessonName: any }) => ({
        id: item.lessonId,
        value: item.lessonId,
        label: item.lessonName,
        text: item.lessonName,
      }));
    },
  });

  // API lấy danh sách từ vựng
  const { isFetching, refetch } = useQuery({
    queryKey: ["getAllVocalizations", filterParams],
    queryFn: async () => {
      const res = await Learning.getPartAll({
        ...filterParams,
      });
      // Sắp xếp priamry lên đầu
      res?.data?.forEach(
        (item: { partImageResList: any[]; partVideoResList: any[] }) => {
          item.partImageResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
          item.partVideoResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
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

  // Xoá chủ đề
  const mutationDel = useMutation({
    mutationFn: Learning.deletePart,
    onSuccess: () => {
      message.success("Xoá phần thành công");
      refetch();
    },
  });

  // Thêm mới / chỉnh sửa  topics
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

  // Upload file
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

  // Column
  const columns = [
    {
      title: "Tên phần",
      dataIndex: "partName",
      key: "partName",
      render: (content: string) => (
        <span style={{ fontWeight: 500 }}>{content}</span>
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
              setPreview({
                fileImage: record?.partImageResList[0]?.imageLocation,
                fileVideo: record?.partVideoResList[0]?.videoLocation,
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
              })
            }
          />
        </div>
      ),
      width: 100,
    },
  ];

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

  const isLoading = isFetching;

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách phần</h1>
      <div className="mb-4 flex  items-center justify-between">
        {/* Filter */}
        <div className="flex w-2/3 gap-4">
          <Select
            size="large"
            className="w-1/2"
            allowClear
            showSearch
            placeholder="Chọn bài học"
            options={allLesson}
            onChange={(value, option: any) =>
              setFilterParams({ ...filterParams, lessonId: value })
            }
            filterOption={filterOption}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            router.push(`/learning-management/part/create-edit`);
          }}
        >
          Thêm mới
        </Button>
      </div>

      <CustomTable
        columns={columns as any}
        dataSource={allPartsSearch}
        loading={isLoading}
        rowKey={(record) => record.vocabularyId}
        // scroll={{ x: 600 }}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />

      {/* Edit */}
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
              mutationCreate.mutate({ ...value, private: isPrivate });
            }}
          >
            <Form.Item name="partId" noStyle hidden />

            <Form.Item
              name="partName"
              label="Tên phần"
              required
              rules={[
                validateRequireInput("Tên phần liên quan không được bỏ trống"),
              ]}
              className="mb-2"
            >
              <TextArea maxLength={200} showCount placeholder="Nhập mô tả" />
            </Form.Item>
          </Form>
        </div>
      </BasicDrawer>

      {/* Modal preview */}
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

      {/* Modal chi tiết nội dung từ */}
      <ModalListMedia
        showModalLstMedia={detailVocabulary.open}
        record={detailVocabulary.record}
        refetch={refetch}
        onClose={() => {
          setDetailVocabulary({ open: false, record: "" });
        }}
      />

      {/* Modal thêm từ vào chủ đề */}
      <Modal
        title="Thêm từ vựng vào chủ đề"
        open={modalAddVocabularyTopic.open}
        onCancel={() =>
          setModalAddVocabularyTopic({
            ...modalAddVocabularyTopic,
            open: false,
          })
        }
        onOk={async () => {
          const req = {
            ids: selectedRowId,
            topicId: modalAddVocabularyTopic.topicId,
          };
          const res = await Learning.addVocabularyTopic(req);
          if (res.code === 200) {
            message.success("Thêm từ vào chủ đề thành công");
            setModalAddVocabularyTopic({ open: false, topicId: 0 });
            setSelectedRowId([]);
            refetch();
          } else {
            message.success("Thêm từ vào chủ đề thất bại");
            setModalAddVocabularyTopic({
              ...modalAddVocabularyTopic,
              open: false,
            });
            refetch();
          }
        }}
        cancelText="Huỷ"
        okText="Thêm"
        destroyOnClose
      >
        <Select
          size="large"
          className="w-full"
          allowClear
          placeholder="Chọn chủ đề"
          options={allLesson}
          onChange={(value) =>
            setModalAddVocabularyTopic({
              ...modalAddVocabularyTopic,
              topicId: value,
            })
          }
        />
      </Modal>

      <ConfirmModal
        visible={modalConfirm.open}
        iconType="DELETE"
        title={`Xóa khỏi phần`}
        content={`Hành động này sẽ xóa phần vĩnh viễn khỏi chủ đề hiện tại`}
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

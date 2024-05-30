"use client";
import { colors } from "@/assets/colors";
import Learning from "@/model/Learning";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Image,
  Input,
  Modal,
  Select,
  UploadProps,
  message,
} from "antd";
import React, { useState } from "react";
import { CustomTable } from "../check-list/ExamList";
import { useRouter } from "next/navigation";

interface FilterParams {
  page: number;
  size: number;
  topicId: number;
  content: string;
}

const VocabularyList: React.FC = () => {
  //Hooks
  const router = useRouter();
  // danh sách topics
  const [filterParams, setFilterParams] = useState<FilterParams>({
    page: 1,
    size: 999999,
    topicId: 0,
    content: "",
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

  // Xoá chủ đề
  const mutationDel = useMutation({
    mutationFn: Learning.deleteTopics,
    onSuccess: () => {
      message.success("Xoá chủ đề thành công");
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
              width={100}
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

  const isLoading = isFetching;

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
          onClick={() => {
            router.push("/learning-management/vocabulary/create-edit");
          }}
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

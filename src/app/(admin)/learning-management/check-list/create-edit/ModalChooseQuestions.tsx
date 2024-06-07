import { colors } from "@/assets/colors";
import { CaretRightIcon } from "@/assets/icons";
import { isImage } from "@/components/common/constants";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Empty, Image, Input, Modal, Table, Tag } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";
import { CustomTable } from "../ExamList";

interface Answer {
  id: number;
  content: string;
  correct: boolean;
}

interface Question {
  id: number;
  question: string;
  files: UploadFile[];
  answers: Answer[];
  type: "single" | "multiple";
}

interface ModalChooseQuestionsProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
}

const { Panel } = Collapse;

export const renderAnswerValue = (listValue: any) => {
  const columns = [
    {
      dataIndex: "content",
      align: "left",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-y-3 bg-white ">
      <CustomTable
        showHeader={false}
        pagination={false}
        columns={columns as any}
        dataSource={listValue}
      />
    </div>
  );
};

const ModalChooseQuestions: React.FC<ModalChooseQuestionsProps> = ({
  open,
  onClose,
  questions,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");

  // Lưu rowKey của những row đang được mở
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  // lưu những row được chọn
  const [selectedRowId, setSelectedRowId] = useState<string[]>([]);

  // preview
  const [preview, setPreview] = useState<{ open: boolean; file: string }>({
    open: false,
    file: "",
  });

  const handleViewImage = (record: any) => {
    setPreview({
      open: true,
      file: record?.imageLocation || record?.videoLocation,
    });
  };

  const columns = [
    Table.SELECTION_COLUMN,
    Table.EXPAND_COLUMN,
    {
      title: "Tên câu hỏi",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "Hình ảnh/Video",
      dataIndex: "imageLocation",
      key: "imageLocation",
      render: (imageLocation: string, record: any) => (
        <div>
          <Button onClick={() => handleViewImage(imageLocation)}>Xem</Button>
        </div>
      ),
    },
    {
      title: "Đáp án",
      dataIndex: "answerResList",
      key: "answerResList",
      render: (answerResList: Answer[]) => {
        const answersCorrect = answerResList?.filter(
          (answer) => answer.correct,
        );
        return (
          <Tag className="bg-green-500">
            {answersCorrect.map((answer, index) => (
              <div key={index} className="p-1 text-sm font-bold text-white">
                {answer.content}
              </div>
            ))}
          </Tag>
        );
      },
    },
  ];

  const handleAddQuestion = (id: number) => {
    // Logic to handle adding question with id
  };

  // hàm toggle đóng mở 1 hàng
  const toggleExpandRow = (key: number) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter((item) => item !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  const rowSelection = {
    fixed: true,
    columnWidth: 50,
    selectedRowKeys: selectedRowId,
    onChange: (value: any) => setSelectedRowId(value),
  };

  return (
    <>
      <Modal
        width={1000}
        title="Ngân hàng câu hỏi theo chủ đề"
        open={open}
        onCancel={onClose}
      >
        <div className="container mx-auto p-4">
          <Input
            placeholder="Tìm kiếm câu hỏi"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {selectedRowId?.length > 0 && (
            <div className="my-2 flex items-center gap-x-3 rounded-lg bg-neutral-100 px-4 py-1">
              <div
                aria-hidden="true"
                className="body-14-medium flex cursor-pointer select-none items-center gap-x-2 p-1 text-primary-600"
              >
                <PlusOutlined color={colors.primary600} />
                Thêm
              </div>
            </div>
          )}

          <CustomTable
            className="mt-4"
            rowSelection={rowSelection}
            rowKey={(record: any) => record.questionId}
            columns={columns}
            dataSource={questions}
            pagination={false}
            expandable={{
              rowExpandable: (record: any) => !!record.answerResList,
              expandedRowKeys,
              expandedRowRender: (record: any) =>
                renderAnswerValue(record.answerResList),
              expandIcon: ({ expanded, record }: any) => {
                if (!record.answerResList) return <div className="w-5" />;
                return (
                  <div
                    className={`flex transform items-center justify-center ${
                      expanded ? "rotate-90" : ""
                    } transition-all duration-300`}
                    onClick={() => toggleExpandRow(record.questionId)}
                  >
                    <CaretRightIcon />
                  </div>
                );
              },
            }}
            locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
          />
        </div>
      </Modal>

      <Modal
        open={preview.open}
        onCancel={() => setPreview({ file: "", open: false })}
        footer={null}
        width={1000}
        centered
      >
        <div className="flex w-full items-center justify-center p-4">
          {preview.file && (
            <div className="w-full">
              {isImage(preview.file) ? (
                <Image
                  preview={false}
                  className=""
                  src={preview.file}
                  alt="Ảnh chủ đề"
                  style={{ width: 400, height: 400, objectFit: "contain" }}
                />
              ) : (
                <video controls style={{ width: "100%", height: "auto" }}>
                  <source src={preview.file} />
                </video>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ModalChooseQuestions;

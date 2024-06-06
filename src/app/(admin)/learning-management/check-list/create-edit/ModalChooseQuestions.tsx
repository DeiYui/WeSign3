import {
  Collapse,
  Modal,
  Input,
  Table,
  Checkbox,
  Button,
  Tag,
  Empty,
} from "antd";
import React, { useState } from "react";
import { UploadFile } from "antd/es/upload/interface";
import { CustomTable } from "../ExamList";
import { PlusOutlined } from "@ant-design/icons";
import { colors } from "@/assets/colors";

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

const ModalChooseQuestions: React.FC<ModalChooseQuestionsProps> = ({
  open,
  onClose,
  questions,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");

  // lưu những row được chọn
  const [selectedRowId, setSelectedRowId] = useState<string[]>([]);

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
          {/* <Button onClick={() => handleViewImage(record)}>Xem</Button> */}
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

  const expandedRowRender = (record: Question) => (
    <div>
      <p>{record.question}</p>
      {/* Render any additional content related to the question */}
    </div>
  );

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
            // expandable={{
            //   rowExpandable: (record: any) => !!record.variantInfo,
            //   expandedRowKeys,
            //   expandedRowRender: (record: any) => (
            //     <RenderVariantInfo variant={record} key={record.variantGenId} variantConfig={variantConfig} />
            //   ),
            //   expandIcon: ({ expanded, record }: any) => {
            //     if (!record.variantInfo) return <div className="w-5" />
            //     return (
            //       <div
            //         className={`flex items-center justify-center transform ${
            //           expanded ? 'rotate-90' : ''
            //         } duration-300 transition-all`}
            //         onClick={() => toggleExpandRow(record.variantGenId)}
            //       >
            //         <CaretRightIcon />
            //       </div>
            //     )
            //   },
            // }}
            locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
          />
        </div>
      </Modal>
    </>
  );
};

export default ModalChooseQuestions;

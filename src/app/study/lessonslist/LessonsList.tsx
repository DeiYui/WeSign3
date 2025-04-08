"use client";
import { Table, Input, Spin, Image, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import Lesson from "@/model/Lesson"; 

export interface SectionHero2Props {
  className?: string;
}

const LessonsList: FC<SectionHero2Props> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classRoomId = Number(searchParams.get("classRoomId"));
  const [searchText, setSearchText] = useState<string>("");
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);

  if (!classRoomId) {
    return <div>Không xác định lớp học. Vui lòng quay lại và chọn lại lớp.</div>;
  }

  const { data: allLessonPublic, isFetching: lessonsIsFetching } = useQuery({
    queryKey: ["getLstLessonByClass", classRoomId],
    queryFn: async () => {
      const res = await Lesson.getLstLessonByClass({ classRoomId });
      if (!res?.data || res?.data?.length === 0) {
        message.warning("Không có bài học cho lớp học này.");
        return [];
      }
      return res.data;
    },
    onError: () => {
      message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
    },
  });

  useEffect(() => {
    if (allLessonPublic) {
      setFilteredLessons(
        allLessonPublic.filter((lesson: any) =>
          lesson?.lessonName?.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, allLessonPublic]);

  const leftTableData = filteredLessons.slice(0, 40);
  const rightTableData = filteredLessons.slice(40);

  const getColumns = (offset = 0) => [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1 + offset,
      width: 50,
    },
    {
      title: "Tên bài học",
      dataIndex: "lessonName",
      key: "lessonName",
      render: (text: string, record: any) => (
        <div
          className="text-blue-600 hover:cursor-pointer"
          onClick={() =>
            router.push(`/study/lessons/?classRoomId=${classRoomId}&&lessonId=${record.lessonId}`)
          }
        >
          {text}
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageLocation",
      key: "imageLocation",
      render: (image: string) => (
        <Image
          src={image || "/default-preview.png"}
          alt="Preview"
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
      ),
      width: 80,
    },
  ];

  return (
    <Spin spinning={lessonsIsFetching}>
      <div className="mb-4 flex justify-between">
        <Input
          size="middle"
          placeholder="Tìm kiếm bài học"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "300px" }}
        />
      </div>
      <div className="flex gap-4 h-[700px]">
        {/* Bảng bên trái: tối đa 40 bài */}
        <div className="w-1/2 overflow-y-auto border rounded-md">
          <Table
            columns={getColumns(0)}
            dataSource={leftTableData}
            rowKey="lessonId"
            pagination={false}
          />
        </div>
        {/* Bảng bên phải: phần còn lại */}
        <div className="w-1/2 overflow-y-auto border rounded-md">
          <Table
            columns={getColumns(40)}
            dataSource={rightTableData}
            rowKey="lessonId"
            pagination={false}
          />
        </div>
      </div>
    </Spin>
  );
};

export default LessonsList;

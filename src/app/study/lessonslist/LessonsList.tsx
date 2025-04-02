"use client";
import { Table, Input, Spin, Image, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

export interface SectionHero2Props {
  className?: string;
}

const LessonsList: FC<SectionHero2Props> = ({ className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classRoomId = Number(searchParams.get("classRoomId"));
  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<any[]>([]);

  // API to fetch lessons by class
  const { data: allLessonPublic, isFetching } = useQuery({
    queryKey: ["getLstLessonByClass", classRoomId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons?classRoomId=${classRoomId}`);
      const data = await res.json();
      return data;
    },
    onError: () => {
      message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
    },
  });

  // Filter lessons based on search text
  useEffect(() => {
    if (allLessonPublic) {
      setFilteredTopics(
        allLessonPublic.filter((lesson: any) =>
          lesson?.lessonName?.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, allLessonPublic]);

  // Split lessons into two groups for two tables
  const leftTableData = filteredTopics.slice(0, Math.ceil(filteredTopics.length / 2));
  const rightTableData = filteredTopics.slice(Math.ceil(filteredTopics.length / 2));

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
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
    <Spin spinning={isFetching}>
      <div className="mb-4 flex justify-between">
        <Input
          size="middle"
          placeholder="Tìm kiếm bài học"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "300px" }}
        />
      </div>
      <div className="flex gap-4">
        {/* Left Table */}
        <div className="w-1/2">
          <Table
            columns={columns}
            dataSource={leftTableData}
            rowKey="lessonId"
            pagination={{ pageSize: 10 }}
          />
        </div>
        {/* Right Table */}
        <div className="w-1/2">
          <Table
            columns={columns}
            dataSource={rightTableData}
            rowKey="lessonId"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
    </Spin>
  );
};

export default LessonsList;

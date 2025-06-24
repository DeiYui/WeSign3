"use client";
import { Table, Input, Spin, Image, message } from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import axios from "axios";
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
  const userId = useSelector((state: RootState) => state.admin.userId);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_ROOT_NODE;

  const { mutate: incrementLessonView } = useMutation({
    mutationFn: async (lessonId: number) => {
      await axios.post(`${API_BASE_URL}/api/user/lesson/view`, { userId, lessonId });
    },
  });

  const { data: allLessonPublic, isFetching: lessonsIsFetching } = useQuery<any[], Error>({
    queryKey: ["getLstLessonByClass", classRoomId],
    queryFn: async () => {
      try {
      const res = await Lesson.getLstLessonByClass({ classRoomId });
      if (!res?.data || res?.data?.length === 0) {
        message.warning("Không có bài học cho lớp học này.");
        return [];
      }
      return res.data;
// <<<<<<< HEAD
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
      return [];
    }
    },
    enabled: !!classRoomId,
// =======
//     },
//     onError: () => {
//       message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
//     },
// >>>>>>> 861763e8cbc6162e5f3d6e6ba3cc4785ef1abff8
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

  const handleLessonClick = (lessonId: number) => {
    incrementLessonView(lessonId);
    router.push(`/study/lessons/?classRoomId=${classRoomId}&&lessonId=${lessonId}`);
  };

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
            handleLessonClick(record.lessonId)}
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

// <<<<<<< HEAD
export default LessonsList;
// =======
// export default LessonsList;
// >>>>>>> 861763e8cbc6162e5f3d6e6ba3cc4785ef1abff8

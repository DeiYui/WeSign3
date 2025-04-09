// "use client";
// import { Table, Input, Spin, Image, message } from "antd";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter, useSearchParams } from "next/navigation";
// import { FC, useEffect, useState } from "react";

// export interface SectionHero2Props {
//   className?: string;
// }
// const API_BASE_URL = 'http://localhost:8088';
// const LessonsList: FC<SectionHero2Props> = ({ className = "" }) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const classRoomId = Number(searchParams.get("classRoomId"));
//   const [searchText, setSearchText] = useState<string>("");
//   const [filteredTopics, setFilteredTopics] = useState<any[]>([]);

//   // API to fetch lessons by class
//   // const { data: allLessonPublic, isFetching } = useQuery({
//   //   queryKey: ["getLstLessonByClass", classRoomId],
//   //   queryFn: async () => {
//   //     const res = await fetch(`${API_BASE_URL}/api/lessons?classRoomId=${classRoomId}`);
//   //     const data = await res.json();
//   //     return data;
//   //   },
//   //   onError: () => {
//   //     message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
//   //   },
//   // });
//   const { data: allLessonPublic, isFetching, error } = useQuery({
//     queryKey: ["getLstLessonByClass", classRoomId],
//     queryFn: async () => {
//       const res = await fetch(`${API_BASE_URL}/api/lessons?classRoomId=${classRoomId}`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch lessons");
//       }
//       return res.json();
//     },
//   });
  
//   // Xử lý lỗi trong useEffect
//   useEffect(() => {
//     if (error) {
//       message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
//     }
//   }, [error]);
  

//   // Filter lessons based on search text
//   useEffect(() => {
//     if (allLessonPublic) {
//       setFilteredTopics(
//         allLessonPublic.filter((lesson: any) =>
//           lesson?.lessonName?.toLowerCase().includes(searchText.toLowerCase())
//         )
//       );
//     }
//   }, [searchText, allLessonPublic]);

//   // Split lessons into two groups for two tables
//   const leftTableData = filteredTopics.slice(0, Math.ceil(filteredTopics.length / 2));
//   const rightTableData = filteredTopics.slice(Math.ceil(filteredTopics.length / 2));

//   const columns = [
//     {
//       title: "STT",
//       key: "index",
//       render: (_: any, __: any, index: number) => index + 1,
//       width: 50,
//     },
//     {
//       title: "Tên bài học",
//       dataIndex: "lessonName",
//       key: "lessonName",
//       render: (text: string, record: any) => (
//         <div
//           className="text-blue-600 hover:cursor-pointer"
//           onClick={() =>
//             router.push(`/study/lessons/?classRoomId=${classRoomId}&&lessonId=${record.lessonId}`)
//           }
//         >
//           {text}
//         </div>
//       ),
//     },
//     // {
//     //   title: "Hình ảnh",
//     //   dataIndex: "imageLocation",
//     //   key: "imageLocation",
//     //   render: (image: string) => (
//     //     <Image
//     //       src={image || "/default-preview.png"}
//     //       alt="Preview"
//     //       width={50}
//     //       height={50}
//     //       style={{ objectFit: "cover", borderRadius: "8px" }}
//     //     />
//     //   ),
//     //   width: 80,
//     // },
//     {
//       title: "Hình ảnh",
//       dataIndex: "imageLocation",
//       key: "imageLocation",
//       render: (image: string | null) => 
//         image ? (
//           <Image
//             src={image}
//             alt="Preview"
//             width={50}
//             height={50}
//             style={{ objectFit: "cover", borderRadius: "8px" }}
//           />
//         ) : null, // Không hiển thị gì nếu không có ảnh
//       width: 80,
//     }
    
//   ];

//   return (
//     <Spin spinning={isFetching}>
//       <div className="mb-4 flex justify-between">
//         <Input
//           size="middle"
//           placeholder="Tìm kiếm bài học"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           style={{ width: "300px" }}
//         />
//       </div>
//       <div className="flex gap-4">
//         {/* Left Table */}
//         <div className="w-1/2">
//           <Table
//             columns={columns}
//             dataSource={leftTableData}
//             rowKey="lessonId"
//             pagination={{ pageSize: 10 }}
//           />
//         </div>
//         {/* Right Table */}
//         <div className="w-1/2">
//           <Table
//             columns={columns}
//             dataSource={rightTableData}
//             rowKey="lessonId"
//             pagination={{ pageSize: 10 }}
//           />
//         </div>
//       </div>
//     </Spin>
//   );
// };

// export default LessonsList;
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

  // if (!classRoomId) {
  //   return <div>Không xác định lớp học. Vui lòng quay lại và chọn lại lớp.</div>;
  // }

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
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tải danh sách bài học.");
      return [];
    }
    },
    enabled: !!classRoomId,
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
/* eslint-disable react-hooks/exhaustive-deps */
// export default Students;
"use client";
import { default as Learning } from "@/model/Learning";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Input, Table, message } from "antd";
import { FC, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import User from "@/model/User";
import Item from "antd/es/list/Item";
import dayjs from 'dayjs';

interface Student {
  name: string;
  classroom: any;
  classRoomId: number;
  studentProfile: any;
  classStudents: any;
}

const Students: FC = () => {
  const user: User = useSelector((state: RootState) => state.admin);

  const [lstStudents, setLstStudents] = useState<Student[]>([]);
  const [filteredLstStudents, setFilteredLstStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 10;

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
  };
  const [total, setTotal] = useState<number>(0);
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListStudents", searchText, currentPage],
    queryFn: async () => {
      const res = await User.allStudentList({
        name: searchText,
        page: currentPage - 1,  // Thêm tham số page
        take: pageSize,  
        orderBy: "userId",  
        sortBy: "DESC"  
      });
      setTotal(res.meta.itemCount);
      // Tạo lại dữ liệu với cấu trúc phù hợp
      const mappedData = res.content.map((item: any) => ({
        name: item.name,
        studentId: item.userId,
        classRoomId: item.classroomId,
        classroom: item.classRoomName,
        studentProfile: {
          // Giả sử các thông tin về học sinh, nếu có
          // birthDay: item.birthDay && dayjs(item.birthDay).isValid()
          //           ? dayjs(item.birthDay).add(0, 'day').format('YYYY-MM-DD') 
          //           : "Không có",
          schoolName: item.schoolName || "Không có",
          // address: item.city || "Không có",
          // email: item.email || "Không có",
        },
        classStudents: [item], // Mỗi bản ghi là một lớp học sinh tham gia
      }));
  
      // Cập nhật dữ liệu
      setLstStudents(mappedData);
      setFilteredLstStudents(mappedData);
      return mappedData;
    },
  });
  

  const handleSearch = useCallback(
    debounce((searchText: string) => {
      refetch();
    }, 300),

    [lstStudents],
  );

  const isLoading = isFetching;

  const columns = [
    {
      title: "STT", // Index
      key: "index",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
      width: 50,
    },
    {
      title: "Tên", // Name
      dataIndex: "name",
      key: "name",
      render: (value: string) => <div className="text-lg">{value}</div>,
      width: 300,
    },
    // {
    //   title: "Ngày sinh", // Date of birth
    //   dataIndex: "studentProfile",
    //   key: "birthDay",
    //   render: (value: any) => (
    //     <div className="text-lg">{value?.birthDay || "Không có"}</div>
    //   ),
    //   width: 200,
    // },
    {
      title: "Lớp", // Class
      dataIndex: "classroom",
      key: "classroom",
      render: (value: string, record: Student) => (
        <div className="text-lg">
          {record?.classStudents?.length > 0 &&
            record?.classStudents[0]?.classRoomName}
        </div>
      ),
      width: 200,
    },
    {
      title: "Trường", // School
      dataIndex: "studentProfile",
      key: "schoolName",
      render: (value: any) => (
        <div className="text-lg">{value?.schoolName || "Không có"}</div>
      ),
      width: 200,
    },
    // {
    //   title: "Địa chỉ", // Address
    //   dataIndex: "studentProfile",
    //   key: "address",
    //   render: (value: any) => (
    //     <div className="text-lg">{value?.address || "Không có"}</div>
    //   ),
    //   width: 200,
    // },
    // {
    //   title: "Email", // Email
    //   dataIndex: "studentProfile",
    //   key: "email",
    //   render: (value: any) => (
    //     <div className="text-lg">{value?.email || "Không có"}</div>
    //   ),
    //   width: 200,
    // },
  ];

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách học sinh</h1>
      <div className="mb-4 flex items-center justify-between">
        <Input
          allowClear
          onClear={() => {
            refetch();
            setCurrentPage(1);
            setSearchText("");
          }}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            handleSearch(e.target.value);
          }}
          className="mb-4"
          style={{ width: 400 }}
          placeholder="Tìm kiếm tên học sinh"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e.currentTarget.value);
            }
          }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredLstStudents}
        loading={isLoading}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          total: total,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
        onChange={handleTableChange}
        rowClassName="student-row"
      />
      <style jsx>{`
        .student-row {
          background-color: #f9f9f9;
        }
        .student-row:hover {
          background-color: #e6f7ff;
        }
        .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: bold;
        }
        .ant-table-tbody > tr > td {
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default Students;




/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { CloseIcon } from "@/assets/icons";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import { validateRequireInput } from "@/utils/validation/validtor";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, Select, message } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useCallback, useState } from "react";
import { CustomTable } from "../../learning-management/check-list/ExamList";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import User from "@/model/User";
import Auth from "@/model/Auth";
import { useRouter } from "next/navigation";

interface Student {
  name: string;
  classroom: any;
  classRoomId: number;
  studentProfile: any;
  classStudents: any;
  studentId: number;
}

const StudentList: React.FC = () => {
  const user: User = useSelector((state: RootState) => state.admin);
  const router = useRouter();

  const [form] = useForm();
  const [lstStudents, setLstStudents] = useState<Student[]>([]);
  const [filteredLstStudents, setFilteredLstStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 10;
  const [modalCreate, setModalCreate] = useState<{
    open: boolean;
    typeModal: string;
  }>({
    open: false,
    typeModal: "create",
  });
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);

  const navigateToStudentLearningProcess = (studentId: number) => {
    router.push(`/student-learning-process/${studentId}`);
  };

  // Fetching the list of classes
  const { data: allClasses, isFetching: isFetchingClasses } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClasses();
      return res.content.map((item: { name: string; classRoomId: number }) => ({
        label: item.name,
        value: Number(item.classRoomId),
      }));
    },
  });

  // Fetching the list of schools
  const { data: allSchools, isFetching: isFetchingSchools } = useQuery({
    queryKey: ["getListSchool"],
    queryFn: async () => {
      const res = await Learning.getListSchool();
      return res.content.map((item: { name: string; schoolId: number }) => ({
        label: item.name,
        value: Number(item.schoolId),
      }));
    },
  });

  // Fetching the list of students
  const [total, setTotal] = useState<number>(0);
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListStudents", searchText, selectedClass, selectedSchool, currentPage],
    queryFn: async () => {
      const res = await User.studentList({
        name: searchText,
        classRoomId: selectedClass,
        schoolId: selectedSchool,
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
        classRoomId: item.classroomId|| "Không có",
        classroom: item.classRoomName|| "Không có",
        studentProfile: {
          // Giả sử các thông tin về học sinh, nếu có
          dateOfBirth: item.birthDay || "Không có",
          schoolName: item.schoolName || "Không có",
          address: item.city || "Không có",
          email: item.email || "Không có",
        },
        classStudents: [item], // Mỗi bản ghi là một lớp học sinh tham gia
      }));
  
      // Cập nhật dữ liệu
      setLstStudents(mappedData);
      setFilteredLstStudents(mappedData);
      return mappedData;
    },
    });

  // Adding or editing a student
  const mutationCreateUpdate = useMutation({
    mutationFn: async (data: any) => {
      if (modalCreate.typeModal === "create") {
        // Call API to create a student
        return await User.createStudent(data);
      } else {
        // Call API to update a student
        // return await User.updateStudent(data);
        const { studentId, ...rest } = data;
        return await User.updateUser(studentId, rest);
      }
    },
    onSuccess: (res, variables) => {
      refetch();

      const updatedStudent = {
        ...variables,
        name: res.name,
        classroom: allClasses?.find((cls: { value: any; }) => cls.value === variables.classroom)?.label,
        studentProfile: {
          schoolName: allSchools?.find((sch: { value: any; }) => sch.value === variables.school)?.label,
          dateOfBirth: variables.dateOfBirth || "Không có",
          address: variables.address || "Không có",
          // email: `${variables.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        },
      };

      setLstStudents((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedStudent]
          : prevLst.map((student) =>
              student.studentId === res.userId ? updatedStudent : student,
            ),
      );
      setFilteredLstStudents((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedStudent]
          : prevLst.map((student) =>
              student.studentId === res.userId ? updatedStudent : student,
            ),
      );

      message.success(
        `${modalCreate.typeModal === "create" ? "Thêm mới học sinh thành công" : "Cập nhật học sinh thành công"}`,
      );

      setModalCreate({ ...modalCreate, open: false });
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.data?.message);
    },
  });

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
      // render: (value: string) => <div className="text-lg">{value}</div>,
      render: (value: string, record: Student) => (
        <div 
          className="text-lg text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigateToStudentLearningProcess(record.studentId)}
        >
          {value}
        </div>
      ),
      width: 300,
    },
    {
      title: "Ngày sinh", // Date of birth
      dataIndex: "studentProfile",
      key: "dateOfBirth",
      render: (value: any) => (
        <div className="text-lg">{value?.dateOfBirth || "Không có"}</div>
      ),
      width: 200,
    },
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
    {
      title: "Địa chỉ", // Address
      dataIndex: "studentProfile",
      key: "address",
      render: (value: any) => (
        <div className="text-lg">{value?.address || "Không có"}</div>
      ),
      width: 300,
    },
    {
      title: "Email", // Email
      dataIndex: "studentProfile",
      key: "email",
      render: (value: any) => (
        <div className="text-lg">{value?.email || "Không có"}</div>
      ),
      width: 200,
    },
    ["ADMIN", "TEACHER"].includes(user?.role)
      ? {
          title: "Hành động",
          key: "name",
          dataIndex: "name",
          render: (value: any, record: Student) => (
            <div className="flex space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setCurrentStudentId(record.studentId);
                  form.setFieldsValue({
                    name: record.name,
                    classroom: allClasses?.find((c: { label: any; }) => c.label === record.classroom)?.value,
                    school: record.studentProfile.schoolId || allSchools?.find((s: { label: any; }) => s.label === record.studentProfile.schoolName)?.value,
                    dateOfBirth: record.studentProfile.dateOfBirth,
                    address: record.studentProfile.address,
                    studentId: record.studentId,
                  });
                  setModalCreate({
                    ...modalCreate,
                    open: true,
                    typeModal: "edit",
                  });
                }}
              />
            </div>
          ),
          width: 150,
        }
      : {},
  ];

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchText(value);
    }, 300),
    [],
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <InputPrimary
            placeholder="Tìm kiếm học sinh"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            options={allClasses || []}
            placeholder="Lọc theo lớp"
            loading={isFetchingClasses}
            allowClear
            onChange={(value) => setSelectedClass(value)}
          />
          <Select
            options={allSchools || []}
            placeholder="Lọc theo trường"
            loading={isFetchingSchools}
            allowClear
            onChange={(value) => setSelectedSchool(value)}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalCreate({ open: true, typeModal: "create" });
            form.resetFields();
          }}
        >
          Thêm học sinh
        </Button>
      </div>
      <CustomTable
        columns={columns}
        dataSource={filteredLstStudents}
        loading={isFetching}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: handleTableChange,
        }}
      />

      {/* Thêm học sinh */}
      <BasicDrawer
        width={460}
        title={
          modalCreate.typeModal === "create"
            ? "Thêm mới học sinh"
            : "Chỉnh sửa học sinh"
        }
        onClose={() => {
          setModalCreate({ ...modalCreate, open: false });
          form.resetFields();
        }}
        open={modalCreate.open}
        destroyOnClose
        onOk={() => {
          form.submit();
        }}
        maskClosable={false}
        extra={
          <div className="flex items-center gap-x-4">
            <Button
              className="hover:opacity-60"
              onClick={() => {
                setModalCreate({ ...modalCreate, open: false });
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
        <div>
          <Form
            form={form}
            layout="vertical"
            onFinish={(value) => {
              console.log("value", value);
              mutationCreateUpdate.mutate({
                ...value,
                classroom: value.classroom,
                classRoomName:
                  allClasses?.find(
                    (cls: { value: number }) => cls.value === value.classroom
                  )?.label || "",
                school: value.school,
                schoolName:
                  allSchools?.find(
                    (sch: { value: number }) => sch.value === value.school
                  )?.label || "",
                studentId: currentStudentId,
              });
            }}
          >
            <Form.Item
              name="name"
              label="Tên học sinh"
              className="mb-2"
              required
              rules={[validateRequireInput("Tên học sinh không được bỏ trống")]}
            >
              <Input placeholder="Nhập tên học sinh" />
            </Form.Item>
            <Form.Item
              name="classroom"
              label="Lớp"
              className="mb-2"
              required
              rules={[{ required: true, message: "Lớp không được bỏ trống" }]}
            >
              <Select
                options={allClasses || []}
                placeholder="Lựa chọn lớp"
                loading={isFetchingClasses}
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              name="school"
              label="Trường"
              className="mb-2"
              required
              rules={[validateRequireInput("Trường không được bỏ trống")]}
            >
              <Select
                options={allSchools || []}
                placeholder="Lựa chọn trường"
                loading={isFetchingSchools}
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Form>
        </div>
      </BasicDrawer>
    </div>
  );
};

export default StudentList;
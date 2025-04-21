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

interface Teacher {
  name: string;
  classroom: any;
  classroomTeacher: any;
  classRoomId: number;
  teacherProfile: any;
  classTeachers: any;
}

const TeacherList: React.FC = () => {
  const user: User = useSelector((state: RootState) => state.admin);

  const [form] = useForm();
  const [lstTeachers, setLstTeachers] = useState<Teacher[]>([]);
  const [filteredLstTeachers, setFilteredLstTeachers] = useState<Teacher[]>([]);
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

  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Fetching the list of teachers
  const [total, setTotal] = useState<number>(0);
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListTeacher", searchText, selectedClass, selectedSchool, currentPage],
    queryFn: async () => {
      const res = await User.teacherList({
        name: searchText,
        classRoomId: selectedClass,
        schoolId: selectedSchool,
        page: currentPage - 1,  // Thêm tham số page
        take: pageSize,  
      });
      setTotal(res.meta.itemCount);
      const mappedData = res.content.map((item: any) => ({
        name: item.name,
        teacherId: item.userId,
        classRoomId: item.classroomId,
        classroom: item.classRoomName,
        teacherProfile: {
          // Giả sử các thông tin về học sinh, nếu có
          dateOfBirth: item.birthDay || "Không có",
          schoolName: item.schoolName || "Không có",
          address: item.city || "Không có",
          email: item.email || "Không có",
        },
        classTeachers: [item], // Mỗi bản ghi là một lớp học sinh tham gia
      }));
      setLstTeachers(mappedData);
      setFilteredLstTeachers(mappedData);
      return mappedData;
    },
  });

  const { data: allClasses, isFetching: isFetchingClasses } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res.map((item: { content: string; classRoomId: number }) => ({
        label: item.content,
        value: item.classRoomId,
      }));
    },
  });

  const { data: allSchools, isFetching: isFetchingSchools } = useQuery({
    queryKey: ["getListSchool"],
    queryFn: async () => {
      const res = await Learning.getListSchool();
      return res.map((item: { name: string; schoolId: number }) => ({
        label: item.name,
        value: item.schoolId,
      }));
    },
  });

  // Adding or editing a teacher
  const mutationCreateUpdate = useMutation({
    mutationFn: async (data: any) => {
      if (modalCreate.typeModal === "create") {
        // Generate account for the teacher
        const email = `${data.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
        await Auth.register({
          name: data.name,
          email: email,
          password: "123456",
          role: "TEACHER",
        });

        // Call API to create a teacher
        return await User.createTeacher(data);
      } else {
        // Call API to update a teacher
        return await User.updateTeacher(data);
      }
    },
    onSuccess: (res, variables) => {
      refetch();

      const updatedTeacher = {
        ...variables,
        name: res.name,
        classroom: allClasses?.find((cls) => cls.value === variables.classroomTeacher)?.label,
        teacherProfile: {
          schoolName: allSchools?.find((sch) => sch.value === variables.schoolName)?.label,
          dateOfBirth: variables.dateOfBirth || "Không có",
          address: variables.address || "Không có",
          email: `${variables.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        },
      };

      setLstTeachers((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedTeacher]
          : prevLst.map((teacher) =>
              teacher.name === res.name ? updatedTeacher : teacher,
            ),
      );
      setFilteredLstTeachers((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedTeacher]
          : prevLst.map((teacher) =>
              teacher.name === res.name ? updatedTeacher : teacher,
            ),
      );

      message.success(
        `${modalCreate.typeModal === "create" ? "Thêm mới giáo viên thành công" : "Cập nhật giáo viên thành công"}`,
      );

      setModalCreate({ ...modalCreate, open: false });
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.data?.message || "Đã xảy ra lỗi");
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
      render: (value: string) => <div className="text-lg">{value}</div>,
      width: 300,
    },
    {
      title: "Ngày sinh", // Date of birth
      dataIndex: "teacherProfile",
      key: "dateOfBirth",
      render: (value: any) => (
        <div className="text-lg">{value?.dateOfBirth || "Không có"}</div>
      ),
      width: 200,
    },
    {
      title: "Lớp", // Class
      dataIndex: "classroomTeacher",
      key: "classroomTeacher",
      render: (value: string, record: any) => (
        <div className="text-lg">{record?.classroom}</div>
      ),
      width: 200,
    },
    {
      title: "Trường", // School
      dataIndex: "teacherProfile",
      key: "schoolName",
      render: (value: any) => (
        <div className="text-lg">{value?.schoolName || "Không có"}</div>
      ),
      width: 200,
    },
    {
      title: "Địa chỉ", // Address
      dataIndex: "teacherProfile",
      key: "address",
      render: (value: any) => (
        <div className="text-lg">{value?.address || "Không có"}</div>
      ),
      width: 300,
    },
    {
      title: "Email", // Email
      dataIndex: "teacherProfile",
      key: "email",
      render: (value: any) => (
        <div className="text-lg">{value?.email || "Không có"}</div>
      ),
      width: 200,
    },
    {
      title: "Hành động", // Actions
      key: "actions",
      render: (_: any, record: Teacher) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                name: record.name,
                classroomTeacher: record.classroom,
                schoolName: record.teacherProfile.schoolId,
                address: record.teacherProfile.address,
              });
              setModalCreate({
                open: true,
                typeModal: "edit",
              });
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              // Handle delete logic
              setLstTeachers((prev) =>
                prev.filter((teacher) => teacher.name !== record.name)
              );
              setFilteredLstTeachers((prev) =>
                prev.filter((teacher) => teacher.name !== record.name)
              );
              message.success("Xóa giáo viên thành công");
            }}
          />
        </div>
      ),
    },
  ];

  const handleSearch = useCallback(
    debounce((searchText: string) => {
      // if (searchText) {
      //   setFilteredLstTeachers(
      //     lstTeachers.filter((item: any) =>
      //       (item?.name ?? "")
      //         .toLowerCase()
      //         .includes(searchText.toLowerCase()),
      //     ),
      //   );
      // } else {
      //   setFilteredLstTeachers(lstTeachers);
      // }
      refetch();
    }, 300),
    [lstTeachers],
  );

  const isLoading = isFetching || mutationCreateUpdate.isPending;

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách giáo viên</h1>
      <div className="mb-4 flex items-center justify-between">
        <InputPrimary
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
          placeholder="Tìm kiếm tên giáo viên"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e.currentTarget.value);
            }
          }}
        />
        <Select
          options={allClasses}
          placeholder="Lọc theo lớp"
          onChange={(value) => {
            setSelectedClass(value);
            refetch();
          }}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          options={allSchools}
          placeholder="Lọc theo trường"
          onChange={(value) => {
            setSelectedSchool(value);
            refetch();
          }}
          allowClear
          style={{ width: 200 }}
        />
        <Button
          hidden={!(user?.role === "ADMIN")}
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalCreate({ ...modalCreate, open: true, typeModal: "create" });
            form.resetFields();
          }}
        >
          Thêm mới
        </Button>
      </div>
      <CustomTable
        columns={columns as any}
        dataSource={filteredLstTeachers}
        loading={isLoading}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          total: total,
          onChange: handleTableChange,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
      />
      <BasicDrawer
        width={460}
        title={
          modalCreate.typeModal === "create"
            ? "Thêm mới giáo viên"
            : "Chỉnh sửa giáo viên"
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
        <div className="">
          <Form
            form={form}
            layout="vertical"
            onFinish={(value) => {
              mutationCreateUpdate.mutate({
                ...value,
                classroomTeacher: value.classroomTeacher,
                schoolName: value.schoolName,
              });
            }}
          >
            <Form.Item
              name="name"
              label="Tên giáo viên"
              className="mb-2"
              required
              rules={[validateRequireInput("Tên giáo viên không được bỏ trống")]}
            >
              <Input placeholder="Nhập tên giáo viên" />
            </Form.Item>
            <Form.Item
              name="classroomTeacher"
              label="Lớp"
              className="mb-2"
              required
              rules={[{ required: true, message: "Lớp không được bỏ trống" }]}
            >
              <Select options={allClasses} placeholder="Lựa chọn lớp" />
            </Form.Item>
            <Form.Item
              name="schoolName"
              label="Trường"
              className="mb-2"
              required
              rules={[validateRequireInput("Trường không được bỏ trống")]}
            >
              <Select options={allSchools} placeholder="Lựa chọn trường" />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              className="mb-2"
            >
              <Input placeholder="Nhập ngày sinh" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ"
              className="mb-2"
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Form>
        </div>
      </BasicDrawer>
    </div>
  );
};

export default TeacherList;

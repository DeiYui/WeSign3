/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { CloseIcon } from "@/assets/icons";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import { validateRequireInput } from "@/utils/validation/validtor";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, Select, message, DatePicker } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useCallback, useState } from "react";
import { CustomTable } from "../../learning-management/check-list/ExamList";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import User from "@/model/User";
import Auth from "@/model/Auth";
import dayjs from 'dayjs';
interface Teacher {
  name: string;
  classroom: any;
  classRoomId: number;
  teacherProfile: any;
  classTeachers: any;
  teacherId: number;
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
  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
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

  // Fetching the list of teachers
  const [total, setTotal] = useState<number>(0);
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListTeachers", searchText, selectedClass, selectedSchool, selectedClass, selectedSchool, currentPage],
    queryFn: async () => {
      const res = await User.teacherList({
        name: searchText,
        classRoomId: selectedClass,
        schoolId: selectedSchool,
        page: currentPage - 1,
        take: pageSize,
        orderBy: "userId",  
        sortBy: "DESC"  
      });
      setTotal(res.meta.itemCount);
      // Tạo lại dữ liệu với cấu trúc phù hợp
      const mappedData = res.content.map((item: any) => ({
        name: item.name,
        teacherId: item.userId,
        classRoomId: item.classroomId,
        classroom: item.classRoomName,
        teacherProfile: {
          // Giả sử các thông tin về giáo viên, nếu có
          birthDay: item.birthDay && dayjs(item.birthDay).isValid()
          ? dayjs(item.birthDay).add(0, 'day').format('YYYY-MM-DD') 
          : "Không có",
          schoolId: item.schoolId || "Không có",
          schoolName: item.schoolName || "Không có",
          address: item.city || "Không có",
          email: item.email || "Không có",
        },
        classTeachers: [item], // Mỗi bản ghi là một lớp giáo viên tham gia
      }));
  
      // Cập nhật dữ liệu
      setLstTeachers(mappedData);
      setFilteredLstTeachers(mappedData);
      return mappedData;
    },
  });

  // Adding or editing a teacher
  const mutationCreateUpdate = useMutation({
    mutationFn: async (data: any) => {
      if (modalCreate.typeModal === "create") {
        // Call API to create a teacher
        return await User.createTeacher(data);
      } else {
        // Call API to update a teacher
        const { teacherId, ...rest } = data;
        return await User.updateUser(teacherId, rest);
      }
    },
    onSuccess: (res, variables) => {
      refetch();

      const updatedTeacher = {
        ...variables,
        name: variables.name,
        classroom: allClasses?.find((cls: { value: any; }) => cls.value === variables.classroom)?.label,
        teacherProfile: {
          schoolName: allSchools?.find((sch: { value: any; }) => sch.value === variables.school)?.label,
          birthDay: variables.birthDay || "Không có",
          address: variables.address || "Không có",
          // email: `${variables.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        },
      };

      setLstTeachers((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedTeacher]
          : prevLst.map((teacher) =>
              teacher.teacherId === updatedTeacher.teacherId ? updatedTeacher : teacher,
            ),
      );
      setFilteredLstTeachers((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedTeacher]
          : prevLst.map((teacher) =>
              teacher.teacherId === updatedTeacher.teacherId ? updatedTeacher : teacher,
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
      key: "birthDay",
      render: (value: any) => (
        <div className="text-lg">{value?.birthDay || "Không có"}</div>
      ),
      width: 200,
    },
    {
      title: "Lớp", // Class
      dataIndex: "classroom",
      key: "classroom",
      render: (value: string, record: Teacher) => (
        <div className="text-lg">
          {record?.classTeachers?.length > 0 &&
            record?.classTeachers[0]?.classRoomName}
        </div>
      ),
      width: 200,
    },
    {
      title: "Trường", // School
      dataIndex: "teacherProfile",
      key: "school",
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
    user?.role === "ADMIN"
      ? {
          title: "Hành động", // Actions
          key: "actions",
          render: (_: any, record: Teacher) => (
            <div className="flex space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setCurrentTeacherId(record.teacherId);
                  const birthDay = record.teacherProfile.birthDay && 
                                    record.teacherProfile.birthDay !== "Không có" ? 
                                    dayjs(record.teacherProfile.birthDay) : null;
                  form.setFieldsValue({
                    name: record.name,
                    classroom: record.classRoomId || allClasses?.find((c: { label: any; }) => c.label === record.classroom)?.value,
                    school: allSchools?.find((s: { label: any; }) => s.label === record.teacherProfile.schoolName)?.value,
                    birthDay: birthDay,
                    address: record.teacherProfile.address,
                    teacherId: record.teacherId,
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
                onClick={async() => {
                  try {
                      await User.deleteUser(record.teacherId); // record.id là id của học sinh

                      // Nếu thành công thì mới cập nhật lại danh sách ở FE
                      setLstTeachers((prev) => prev.filter((teacher) => teacher.teacherId !== record.teacherId));
                      setFilteredLstTeachers((prev) => prev.filter((teacher) => teacher.teacherId !== record.teacherId));

                      message.success("Xóa giáo viên thành công");
                    } catch (error) {
                      console.error(error);
                      message.error("Xóa giáo viên thất bại");
                    }
                }}
              />
            </div>
          ),
        }
      : null,
  ]?.filter((item) => item);

  const handleSearch = useCallback(
    debounce((searchText: string) => {
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
            setCurrentPage(1);
          }}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          options={allSchools}
          placeholder="Lọc theo trường"
          onChange={(value) => {
            setSelectedSchool(value);
            setCurrentPage(1);
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

      {/* Thêm giáo viên */}
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
                classroom: value.classroom, 
                classRoomName: allClasses?.find((cls: { value: number }) => cls.value === value.classroom)?.label || "",
                school: value.school,
                schoolName: allSchools?.find((sch: { value: number }) => sch.value === value.school)?.label || "",
                teacherId: currentTeacherId,
                birthDay: value.birthDay ? value.birthDay.format("YYYY-MM-DD") : null,
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
              name="classroom"
              label="Lớp"
              className="mb-2"
              required
              rules={[{ required: true, message: "Lớp không được bỏ trống" }]}
            >
              <Select options={allClasses} placeholder="Lựa chọn lớp" />
            </Form.Item>
            <Form.Item
              name="school"
              label="Trường"
              className="mb-2"
              required
              rules={[validateRequireInput("Trường không được bỏ trống")]}
            >
              <Select options={allSchools} placeholder="Lựa chọn lớp" />
            </Form.Item>
            <Form.Item
              name="birthDay"
              label="Ngày sinh"
              className="mb-2"
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
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
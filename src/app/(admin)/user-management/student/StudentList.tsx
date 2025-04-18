/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
// import { CloseIcon } from "@/assets/icons";
// import InputPrimary from "@/components/UI/Input/InputPrimary";
// import BasicDrawer from "@/components/UI/draw/BasicDraw";
// import Learning from "@/model/Learning";
// import { validateRequireInput } from "@/utils/validation/validtor";
// import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Button, Form, Input, Select, message } from "antd";
// import { useForm } from "antd/es/form/Form";
// import React, { useCallback, useState } from "react";
// import { CustomTable } from "../../learning-management/check-list/ExamList";
// import { debounce } from "lodash";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import User from "@/model/User";

// interface Student {
//   name: string;
//   classroom: any;
//   classRoomId: number;
//   studentProfile: any;
//   classStudents: any;
// }

// const StudentList: React.FC = () => {
//   const user: User = useSelector((state: RootState) => state.admin);

//   const [form] = useForm();
//   const [lstStudents, setLstStudents] = useState<Student[]>([]);
//   const [filteredLstStudents, setFilteredLstStudents] = useState<Student[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchText, setSearchText] = useState("");
//   const pageSize = 10;
//   const [modalCreate, setModalCreate] = useState<{
//     open: boolean;
//     typeModal: string;
//   }>({
//     open: false,
//     typeModal: "create",
//   });

//   const handleTableChange = (newPage: number) => {
//     setCurrentPage(newPage);
//   };

//   // Fetching the list of classes
//   const { data: allClasses, isFetching: isFetchingClasses } = useQuery({
//     queryKey: ["getListClass"],
//     queryFn: async () => {
//       const res = await Learning.getListClass();
//       return res.content.map((item: { name: string; id: number }) => ({
//         label: item.name,
//         value: item.id,
//       }));
//     },
//   });

//   // Fetching the list of students
//   const { isFetching, refetch } = useQuery({
//     queryKey: ["getListStudents", searchText],
//     queryFn: async () => {
//       const res = await User.getAllUser({
//         code: "STUDENT",
//         name: searchText,
//       });
//       setLstStudents(res.content);
//       setFilteredLstStudents(res.content);
//       return res as Student[];
//     },
//   });

//   // Adding or editing a student
//   const mutationCreateUpdate = useMutation({
//     mutationFn:
//       modalCreate.typeModal === "create"
//         ? Learning.joinClass
//         : Learning.updateStudentClass,
//     onSuccess: (res, variables) => {
//       refetch();

//       const updatedStudent = {
//         ...variables,
//         studentName: res.studentName,
//       };

//       setLstStudents((prevLst) =>
//         modalCreate.typeModal === "create"
//           ? [...prevLst, updatedStudent]
//           : prevLst.map((student) =>
//               student.name === res.name ? updatedStudent : student,
//             ),
//       );
//       setFilteredLstStudents((prevLst) =>
//         modalCreate.typeModal === "create"
//           ? [...prevLst, updatedStudent]
//           : prevLst.map((student) =>
//               student.name === res.name ? updatedStudent : student,
//             ),
//       );

//       message.success(
//         `${modalCreate.typeModal === "create" ? "Thêm mới học sinh thành công" : "Cập nhật học sinh thành công"}`,
//       );

//       setModalCreate({ ...modalCreate, open: false });
//       form.resetFields();
//     },
//     onError: (error: any) => {
//       message.error(error?.data?.message);
//     },
//   });

//   const columns = [
//     {
//       title: "STT", // Index
//       key: "index",
//       render: (_: any, __: any, index: number) =>
//         (currentPage - 1) * pageSize + index + 1,
//       width: 50,
//     },
//     {
//       title: "Tên", // Name
//       dataIndex: "name",
//       key: "name",
//       render: (value: string) => <div className="text-lg">{value}</div>,
//       width: 150,
//     },
//     {
//       title: "Ngày sinh", // Date of birth
//       dataIndex: "studentProfile",
//       key: "dateOfBirth",
//       render: (value: any) => (
//         <div className="text-lg">{value?.dateOfBirth || "Không có"}</div>
//       ),
//       width: 150,
//     },
//     {
//       title: "Lớp", // Class
//       dataIndex: "classroom",
//       key: "classroom",
//       render: (value: string, record: Student) => (
//         <div className="text-lg">
//           {record?.classStudents?.length > 0 &&
//             record?.classStudents[0]?.classroom.name}
//         </div>
//       ),
//       width: 150,
//     },
//     {
//       title: "Trường", // School
//       dataIndex: "studentProfile",
//       key: "schoolName",
//       render: (value: any) => (
//         <div className="text-lg">{value?.schoolName || "Không có"}</div>
//       ),
//       width: 200,
//     },
//     {
//       title: "Địa chỉ", // Address
//       dataIndex: "studentProfile",
//       key: "address",
//       render: (value: any) => (
//         <div className="text-lg">{value?.address || "Không có"}</div>
//       ),
//       width: 300,
//     },
//     {
//       title: "Email", // Email
//       dataIndex: "studentProfile",
//       key: "email",
//       render: (value: any) => (
//         <div className="text-lg">{value?.email || "Không có"}</div>
//       ),
//       width: 200,
//     },
//     user?.role === "ADMIN"
//       ? {
//           title: "Hành động",
//           key: "name",
//           dataIndex: "name",
//           render: (value: any, record: Student) => (
//             <div className="flex space-x-2">
//               <Button
//                 icon={<EditOutlined />}
//                 onClick={() => {
//                   form.setFieldsValue({
//                     name: record.name,
//                     classroom: record.classroom,
//                   });
//                   setModalCreate({
//                     ...modalCreate,
//                     open: true,
//                     typeModal: "edit",
//                   });
//                 }}
//               />
//               {/* <Button
//                 icon={<DeleteOutlined />}
//                 danger
//                 onClick={() => mutationDel.mutate(value)}
//               /> */}
//             </div>
//           ),
//         }
//       : null,
//   ]?.filter((item) => item);

//   const handleSearch = useCallback(
//     debounce((searchText: string) => {
//       // if (searchText) {
//       //   setFilteredLstStudents(
//       //     lstStudents.filter((item: any) =>
//       //       (item?.studentName ?? "")
//       //         .toLowerCase()
//       //         .includes(searchText.toLowerCase()),
//       //     ),
//       //   );
//       // } else {
//       //   setFilteredLstStudents(lstStudents);
//       // }
//       refetch();
//     }, 300),
//     [lstStudents],
//   );

//   const isLoading = isFetching || mutationCreateUpdate.isPending;

//   return (
//     <div className="w-full p-4">
//       <h1 className="mb-4 text-2xl font-bold">Danh sách học sinh</h1>
//       <div className="mb-4 flex items-center justify-between">
//         <InputPrimary
//           allowClear
//           onClear={() => {
//             refetch();
//             setCurrentPage(1);
//             setSearchText("");
//           }}
//           value={searchText}
//           onChange={(e) => {
//             setSearchText(e.target.value);
//             handleSearch(e.target.value);
//           }}
//           className="mb-4"
//           style={{ width: 400 }}
//           placeholder="Tìm kiếm tên học sinh"
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               handleSearch(e.currentTarget.value);
//             }
//           }}
//         />

//         <Button
//           hidden={!(user?.role === "ADMIN" || user?.role === "TEACHER")}
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={() => {
//             setModalCreate({ ...modalCreate, open: true, typeModal: "create" });
//             form.resetFields();
//           }}
//         >
//           Thêm mới
//         </Button>
//       </div>
//       <CustomTable
//         columns={columns as any}
//         dataSource={filteredLstStudents}
//         loading={isLoading}
//         pagination={{
//           pageSize: pageSize,
//           current: currentPage,
//           onChange: handleTableChange,
//           showSizeChanger: false,
//           position: ["bottomCenter"],
//         }}
//       />

//       {/* Thêm học sinh */}
//       <BasicDrawer
//         width={460}
//         title={
//           modalCreate.typeModal === "create"
//             ? "Thêm mới học sinh"
//             : "Chỉnh sửa học sinh"
//         }
//         onClose={() => {
//           setModalCreate({ ...modalCreate, open: false });
//           form.resetFields();
//         }}
//         open={modalCreate.open}
//         destroyOnClose
//         onOk={() => {
//           form.submit();
//         }}
//         maskClosable={false}
//         extra={
//           <div className="flex items-center gap-x-4">
//             <Button
//               className="hover:opacity-60 "
//               onClick={() => {
//                 setModalCreate({ ...modalCreate, open: false });
//                 form.resetFields();
//               }}
//               type="link"
//               style={{ padding: 0 }}
//             >
//               <CloseIcon size={20} />
//             </Button>
//           </div>
//         }
//       >
//         <div className="">
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={(value) => {
//               mutationCreateUpdate.mutate({
//                 studentCode: value.studentCode,
//                 id: value.classroom,
//                 name: value.name, // Add the name field here
//               });
//             }}
//           >
//             <Form.Item
//               name="name"
//               label="Tên học sinh"
//               className="mb-2"
//               required
//               rules={[validateRequireInput("Tên học sinh không được bỏ trống")]}
//             >
//               <Input placeholder="Nhập tên học sinh" />
//             </Form.Item>
//             <Form.Item
//               name="studentCode"
//               label="Mã số học sinh"
//               className="mb-2"
//               required
//               rules={[validateRequireInput("Mã số học sinh không được bỏ trống")]}
//             >
//               <Input type="number" placeholder="Nhập mã số học sinh" />
//             </Form.Item>
//             <Form.Item
//               name="classroom"
//               label="Lớp"
//               className="mb-2"
//               required
//               rules={[{ required: true, message: "Lớp không được bỏ trống" }]}
//             >
//               <Select options={allClasses} placeholder="Lựa chọn lớp" />
//             </Form.Item>
//           </Form>
//         </div>
//       </BasicDrawer>
//     </div>
//   );
// };

// export default StudentList;
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

interface Student {
  name: string;
  classroom: any;
  classRoomId: number;
  studentProfile: any;
  classStudents: any;
}

const StudentList: React.FC = () => {
  const user: User = useSelector((state: RootState) => state.admin);

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

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Fetching the list of classes
  const { data: allClasses, isFetching: isFetchingClasses } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      console.log("classlist", res.data)
      return res.data.map((item: { content: string; classRoomId: number }) => ({
        label: item.content,
        value: Number(item.classRoomId),
      }));
    },
  });

  // Fetching the list of schools
  const { data: allSchools, isFetching: isFetchingSchools } = useQuery({
    queryKey: ["getListSchool"],
    queryFn: async () => {
      const res = await Learning.getListSchool();
      console.log("schoollist", res.content)
      return res.content.map((item: { name: string; schoolId: number }) => ({
        label: item.name,
        value: Number(item.schoolId),
      }));
    },
  });

  // Fetching the list of students
  const [total, setTotal] = useState<number>(0);
    const { isFetching, refetch } = useQuery({
      queryKey: ["getListStudents", searchText, currentPage],
      queryFn: async () => {
        const res = await User.studentList({
          name: searchText,
          page: currentPage - 1,  // Thêm tham số page
          take: pageSize,      // Thêm tham số take
        });
        console.log("data nhận", res.content)
        setTotal(res.meta.itemCount);
        // Tạo lại dữ liệu với cấu trúc phù hợp
        const mappedData = res.content.map((item: any) => ({
          name: item.name,
          studentId: item.userId,
          classRoomId: item.classroomId,
          classroom: item.classRoomName,
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
    mutationFn:
      modalCreate.typeModal === "create"
        ? Learning.joinClass
        : Learning.updateStudentClass,
    onSuccess: (res, variables) => {
      refetch();

      const updatedStudent = {
        ...variables,
        studentName: res.studentName,
      };

      setLstStudents((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedStudent]
          : prevLst.map((student) =>
              student.name === res.name ? updatedStudent : student,
            ),
      );
      setFilteredLstStudents((prevLst) =>
        modalCreate.typeModal === "create"
          ? [...prevLst, updatedStudent]
          : prevLst.map((student) =>
              student.name === res.name ? updatedStudent : student,
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
      render: (value: string) => <div className="text-lg">{value}</div>,
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
    user?.role === "ADMIN" || "TEACHER"
      ? {
          title: "Hành động",
          key: "name",
          dataIndex: "name",
          render: (value: any, record: Student) => (
            <div className="flex space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  form.setFieldsValue({
                    name: record.name,
                    classroom: record.classroom,
                  });
                  setModalCreate({
                    ...modalCreate,
                    open: true,
                    typeModal: "edit",
                  });
                }}
              />
              {/* <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => mutationDel.mutate(value)}
              /> */}
            </div>
          ),
        }
      : null,
  ]?.filter((item) => item);

  const handleSearch = useCallback(
    debounce((searchText: string) => {
      // if (searchText) {
      //   setFilteredLstStudents(
      //     lstStudents.filter((item: any) =>
      //       (item?.studentName ?? "")
      //         .toLowerCase()
      //         .includes(searchText.toLowerCase()),
      //     ),
      //   );
      // } else {
      //   setFilteredLstStudents(lstStudents);
      // }
      refetch();
    }, 300),
    [lstStudents],
  );

  const isLoading = isFetching || mutationCreateUpdate.isPending;

  return (
    <div className="w-full p-4">
      <h1 className="mb-4 text-2xl font-bold">Danh sách học sinh</h1>
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
          placeholder="Tìm kiếm tên học sinh"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e.currentTarget.value);
            }
          }}
        />

        <Button
          hidden={!(user?.role === "ADMIN" || user?.role === "TEACHER")}
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
              className="hover:opacity-60 "
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
              console.log("value", value)
              mutationCreateUpdate.mutate({
                school: value.schoolName,
                classroom: value.classroomName,
                name: value.name, // Add the name field here
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

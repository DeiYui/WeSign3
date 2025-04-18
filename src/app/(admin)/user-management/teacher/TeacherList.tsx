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

// interface Teacher {
//   name: string;
//   classroomTeacher: any;
//   classRoomId: number;
// }

// const TeacherList: React.FC = () => {
//   const user: User = useSelector((state: RootState) => state.admin);

//   const [form] = useForm();
//   const [lstTeachers, setLstTeachers] = useState<Teacher[]>([]);
//   const [filteredLstTeachers, setFilteredLstTeachers] = useState<Teacher[]>([]);
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

//   // Fetching the list of teachers
//   const { isFetching, refetch } = useQuery({
//     queryKey: ["getListTeacher", searchText],
//     queryFn: async () => {
//       const res = await User.getAllAccount({
//         roleCode: "TEACHER",
//         name: searchText,
//       });
//       setLstTeachers(res.content);
//       setFilteredLstTeachers(res.content);
//       return res as Teacher[];
//     },
//   });

//   const { data: allClasses, isFetching: isFetchingClasses } = useQuery({
//     queryKey: ["getListClass"],
//     queryFn: async () => {
//       const res = await Learning.getListClass();
//       return res.content.map((item: { classroom: string }) => ({
//         label: item.classroom,
//         value: item.classroom,
//       }));
//     },
//   });

//   // Adding or editing a teacher
//   const mutationCreateUpdate = useMutation({
//     mutationFn:
//       modalCreate.typeModal === "create"
//         ? User.createTeacher
//         : User.updateTeacher,
//     onSuccess: (res, variables) => {
//       refetch();

//       const updatedTeacher = {
//         ...variables,
//         name: res.name,
//         classroomTeacher: res.classroomTeacher,
//         schoolName: res.schoolName,
//         address: res.address,
//       };

//       setLstTeachers((prevLst) =>
//         modalCreate.typeModal === "create"
//           ? [...prevLst, updatedTeacher]
//           : prevLst.map((teacher) =>
//               teacher.name === res.name ? updatedTeacher : teacher,
//             ),
//       );
//       setFilteredLstTeachers((prevLst) =>
//         modalCreate.typeModal === "create"
//           ? [...prevLst, updatedTeacher]
//           : prevLst.map((teacher) =>
//               teacher.name === res.name ? updatedTeacher : teacher,
//             ),
//       );

//       message.success(
//         `${modalCreate.typeModal === "create" ? "Thêm mới giáo viên thành công" : "Cập nhật giáo viên thành công"}`,
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
//       dataIndex: "teacherProfile",
//       key: "dateOfBirth",
//       render: (value: any) => (
//         <div className="text-lg">{value?.dateOfBirth || "Không có"}</div>
//       ),
//       width: 150,
//     },
//     {
//       title: "Lớp", // Class
//       dataIndex: "classroomTeacher",
//       key: "classroomTeacher",
//       render: (value: string, record: any) => (
//         <div className="text-lg">{record?.classroomTeacher?.name}</div>
//       ),
//       width: 150,
//     },
//     {
//       title: "Trường", // School
//       dataIndex: "teacherProfile",
//       key: "schoolName",
//       render: (value: any) => (
//         <div className="text-lg">{value?.schoolName || "Không có"}</div>
//       ),
//       width: 200,
//     },
//     {
//       title: "Địa chỉ", // Address
//       dataIndex: "teacherProfile",
//       key: "address",
//       render: (value: any) => (
//         <div className="text-lg">{value?.address || "Không có"}</div>
//       ),
//       width: 300,
//     },
//     {
//       title: "Email", // Email
//       dataIndex: "teacherProfile",
//       key: "email",
//       render: (value: any) => (
//         <div className="text-lg">{value?.email || "Không có"}</div>
//       ),
//       width: 200,
//     },
//   ];

//   const handleSearch = useCallback(
//     debounce((searchText: string) => {
//       // if (searchText) {
//       //   setFilteredLstTeachers(
//       //     lstTeachers.filter((item: any) =>
//       //       (item?.name ?? "")
//       //         .toLowerCase()
//       //         .includes(searchText.toLowerCase()),
//       //     ),
//       //   );
//       // } else {
//       //   setFilteredLstTeachers(lstTeachers);
//       // }
//       refetch();
//     }, 300),
//     [lstTeachers],
//   );

//   const isLoading = isFetching || mutationCreateUpdate.isPending;

//   return (
//     <div className="w-full p-4">
//       <h1 className="mb-4 text-2xl font-bold">Danh sách giáo viên</h1>
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
//           placeholder="Tìm kiếm tên giáo viên"
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               handleSearch(e.currentTarget.value);
//             }
//           }}
//         />
//         <Button
//           hidden={!(user?.role === "ADMIN")}
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
//         dataSource={filteredLstTeachers}
//         loading={isLoading}
//         pagination={{
//           pageSize: pageSize,
//           current: currentPage,
//           onChange: handleTableChange,
//           showSizeChanger: false,
//           position: ["bottomCenter"],
//         }}
//       />
//       <BasicDrawer
//         width={460}
//         title={
//           modalCreate.typeModal === "create"
//             ? "Thêm mới giáo viên"
//             : "Chỉnh sửa giáo viên"
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
//                 name: value.name,
//                 classroomTeacher: value.classroomTeacher,
//                 schoolName: value.schoolName,
//                 address: value.address,
//               });
//             }}
//           >
//             <Form.Item
//               name="name"
//               label="Tên giáo viên"
//               className="mb-2"
//               required
//               rules={[validateRequireInput("Tên giáo viên không được bỏ trống")]}
//             >
//               <Input placeholder="Nhập tên giáo viên" />
//             </Form.Item>
//             <Form.Item
//               name="classroomTeacher"
//               label="Lớp"
//               className="mb-2"
//               required
//               rules={[{ required: true, message: "Lớp không được bỏ trống" }]}
//             >
//               <Select options={allClasses} placeholder="Lựa chọn lớp" />
//             </Form.Item>
//             <Form.Item
//               name="schoolName"
//               label="Trường"
//               className="mb-2"
//               required
//               rules={[validateRequireInput("Trường không được bỏ trống")]}
//             >
//               <Input placeholder="Nhập tên trường" />
//             </Form.Item>
//             <Form.Item
//               name="address"
//               label="Địa chỉ"
//               className="mb-2"
//               required
//               rules={[validateRequireInput("Địa chỉ không được bỏ trống")]}
//             >
//               <Input placeholder="Nhập địa chỉ" />
//             </Form.Item>
//           </Form>
//         </div>
//       </BasicDrawer>
//     </div>
//   );
// };

// export default TeacherList;
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

  const handleTableChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Fetching the list of teachers
  const [total, setTotal] = useState<number>(0);
  const { isFetching, refetch } = useQuery({
    queryKey: ["getListTeacher", searchText, currentPage],
    queryFn: async () => {
      const res = await User.teacherList({
        name: searchText,
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
          schoolId: item.schoolId || "Không có",
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
      return res.content.map((item: { classroom: string }) => ({
        label: item.classroom,
        value: item.classroom,
      })); // check hàm này sau
    },
  });

  // Adding or editing a teacher
  const mutationCreateUpdate = useMutation({
    mutationFn:
      modalCreate.typeModal === "create"
        ? User.createTeacher
        : User.updateTeacher,
    onSuccess: (res, variables) => {
      refetch();

      const updatedTeacher = {
        ...variables,
        name: res.name,
        classroomTeacher: res.classroomTeacher,
        schoolName: res.schoolName,
        address: res.address,
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
              mutationCreateUpdate.mutate({
                name: value.name,
                classroomTeacher: value.classroomTeacher,
                schoolName: value.schoolName,
                address: value.address,
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
              <Input placeholder="Nhập tên trường" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ"
              className="mb-2"
              required
              rules={[validateRequireInput("Địa chỉ không được bỏ trống")]}
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

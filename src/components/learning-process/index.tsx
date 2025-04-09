"use client";
import { AlphabetIcon, ClassIcon, ExamIcon, TopicIcon } from "@/assets/icons";
import React, { useState, useEffect } from "react";
import CardDataStats from "../CardDataStats";
import { useQuery } from "@tanstack/react-query";
import Learning from "@/model/Learning";
import { Select, Spin, Table } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const filterOption = (input: string, option: any) =>
  (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const LearningProcess: React.FC = () => {
  const router = useRouter();
  const user: User = useSelector((state: RootState) => state.admin);

  const [selectedStatistic, setSelectedStatistic] = useState<string>("vocabulary"); // Default to "Theo từ vựng"
  const [statisticData, setStatisticData] = useState<any[]>([]);

  // Fetch user statistics
  const { data: userStatistic, isFetching: isFetchingProcess, refetch } = useQuery({
    queryKey: ["getLearningProcess"],
    queryFn: async () => {
      const res = await Learning.leaningProcess(user.userId as number);
      return res;
    },
  });

// <<<<<<< HEAD
  // API lấy danh sách từ theo topics
  // const { data: classJoined, isFetching } = useQuery({
  //   queryKey: ["userClasslist"],
  //   queryFn: async () => {
  //     const res = await Learning.classJoined();
  //     return res;
  //   },
  // });
  // console.log("classJoin", user.userId);
  // console.log("Type of userId:", typeof user.userId);

  // const { data: classJoined, isFetching } = useQuery({
  //   queryKey: ["userClasslist", userId], // Include userId in the query key
  //   queryFn: async () => {
  //     const res = await Learning.classJoined(userId);
  //     return res;
  //   },
  // });
//   const { data: classJoined, isFetching } = useQuery({
//     queryKey: ["userClasslist"],
// =======
  // Fetch vocabulary views or lesson views based on the selected statistic
  const { data: statisticDetails, isFetching: isFetchingStatisticDetails } = useQuery({
    queryKey: ["getStatisticDetails", selectedStatistic],
// >>>>>>> 861763e8cbc6162e5f3d6e6ba3cc4785ef1abff8
    queryFn: async () => {
      if (selectedStatistic === "vocabulary") {
        const res = await Learning.getVocabularyViews(user.userId as number);
        return res;
      } else if (selectedStatistic === "lesson") {
        const res = await Learning.getLessonViews(user.userId as number);
        return res;
      }
      return [];
    },
    onSuccess: (data) => {
      setStatisticData(data);
    },
  });

  // Add a useEffect to refetch data when the user navigates back
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch]);

  // Columns for the statistics table
  const columns = [
    {
      title: selectedStatistic === "vocabulary" ? "Từ vựng" : "Bài học", // Vocabulary or Lesson
      dataIndex: "name",
      key: "name",
      render: (value: string) => <div className="text-lg">{value}</div>,
    },
  ];

  return (
    <Spin spinning={isFetchingProcess || isFetchingStatisticDetails}>
      <div className="mb-3 flex justify-between text-xl font-semibold uppercase">
        <div className="font-bold ">Tiến độ học tập</div>
      </div>
      <div className="flex justify-between gap-4">
        <CardDataStats
          title="Lớp học tham gia"
          total={`${userStatistic?.totalClassesJoined}`}
        >
          <ClassIcon size={24} color="#3C50E0" />
        </CardDataStats>

        <CardDataStats
          title="Lượt học từ vựng"
          total={`${userStatistic?.vocabularyViews}`}
        >
          <AlphabetIcon size={24} color="#3C50E0" />
        </CardDataStats>

        <CardDataStats
          title="Lượt học bài"
          total={`${userStatistic?.lessonViews}`}
        >
          <TopicIcon size={24} color="#3C50E0" />
        </CardDataStats>

        <CardDataStats
          title="Bài kiểm tra hoàn thành"
          total={`${userStatistic?.testsCompleted}`}
          onClick={() => router.push("/exam")}
        >
          <ExamIcon size={24} color="#3C50E0" />
        </CardDataStats>

        <CardDataStats
          title="Điểm trung bình"
          total={`${userStatistic?.averageScore}`}
        >
          <TopicIcon size={24} color="#3C50E0" />
        </CardDataStats>
      </div>
      <div className="my-3 flex flex-col justify-between text-xl font-semibold ">
{/* <<<<<<< HEAD
        <div className="font-bold uppercase ">Lớp học của tôi</div>
        <div className="mt-3 grid grid-cols-4 gap-4">
          {React.Children.toArray(
            classJoined?.map((item: any) => (
              <div
                key={item.classroomId}
                className="cursor-pointer rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark"
              >
                <div className="items-between flex h-full flex-col justify-between gap-3">
                  <Image
                    src={GenerateUtils.genUrlImage(item?.imageLocation)}
                    alt=""
                  />
                  <div
                    className="text-start font-bold text-blue-500"
                    onClick={() => {
                      router.push(`/class/${item.classroomId}`);
                    }}
                  >
                    {`${item.name}`}
                  </div>
                </div>
              </div>
            )),
          )}
======= */}
        <div className="font-bold uppercase ">Thống kê</div>
        <div className="mt-2">
          <Select
            showSearch
            allowClear
            placeholder="Chọn thống kê"
            suffixIcon={null}
            style={{ width: "60%" }}
            options={[
              { label: "Theo từ vựng", value: "vocabulary" },
              { label: "Theo bài", value: "lesson" },
            ]}
            onChange={(value) => setSelectedStatistic(value || "vocabulary")}
            filterOption={filterOption}
          />
        </div>
        <div className="mt-4">
          <Table
            columns={columns}
            dataSource={statisticData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
{/* >>>>>>> 861763e8cbc6162e5f3d6e6ba3cc4785ef1abff8 */}
        </div>
      </div>
    </Spin>
  );
};

export default LearningProcess;

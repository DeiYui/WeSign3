"use client";
import { AlphabetIcon, ClassIcon, ExamIcon, TopicIcon } from "@/assets/icons";
import React, { useState, useEffect } from "react";
import CardDataStats from "../CardDataStats";
import { useQuery } from "@tanstack/react-query";
import Learning from "@/model/Learning";
import { Select, Spin, Table, Modal, Button } from "antd";
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
  const [isLessonModalVisible, setIsLessonModalVisible] = useState<boolean>(false);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState<boolean>(false);
  const [isVocabularyModalVisible, setIsVocabularyModalVisible] = useState<boolean>(false);
  const [vocabularyList, setVocabularyList] = useState<any[]>([]);
  const [isLoadingVocabulary, setIsLoadingVocabulary] = useState<boolean>(false);
  const [testsList, setTestsList] = useState<any[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState<boolean>(false);
  const [isTestsModalVisible, setIsTestsModalVisible] = useState<boolean>(false);
  
  // Fetch user statistics
  const { data: userStatistic, isFetching: isFetchingProcess, refetch } = useQuery({
    queryKey: ["getLearningProcess"],
    queryFn: async () => {
      const res = await Learning.leaningProcess(user.userId as number);
      return res;
    },
  });

  // Fetch vocabulary views or lesson views based on the selected statistic
  const { data: statisticDetails, isFetching: isFetchingStatisticDetails } = useQuery({
    queryKey: ["getStatisticDetails", selectedStatistic],
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
  });
  useEffect(() => {
    if (statisticDetails) {
      setStatisticData(statisticDetails);
    }
  }, [statisticDetails]);

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

  const handleShowLessons = async () => {
      setIsLoadingLessons(true);
      setIsLessonModalVisible(true);
      try {
        // Assuming you have an API endpoint to get all lessons learned by a student
        const lessons = await Learning.getFullLessonViews(user.userId);
        setLessonsList(lessons);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setIsLoadingLessons(false);
      }
    };

    const handleShowTests = async () => {
      setIsLoadingTests(true);
      setIsTestsModalVisible(true);
      try {
        // Assuming you have an API endpoint to get all lessons learned by a student
        const tests = await Learning.getFullTestsCompleted(user.userId);
        setTestsList(tests);
      } catch (error) {
        console.error("Error fetching Tests:", error);
      } finally {
        setIsLoadingTests(false);
      }
    };

    const handleShowVocabulary = async () => {
      setIsLoadingVocabulary(true);
      setIsVocabularyModalVisible(true);
      try {
        // Assuming you have an API endpoint to get all lessons learned by a student
        const vocabulary = await Learning.getFullVocabularyViews(user.userId);
        setVocabularyList(vocabulary);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setIsLoadingVocabulary(false);
      }
    };

  const getColumns = () => {
    if (selectedStatistic === "vocabulary") {
      return [
        {
          title: "Từ vựng",
          dataIndex: "name",
          key: "name",
          render: (value: string) => <div className="text-lg">{value}</div>,
        },
        {
          title: "Số lượt xem",
          dataIndex: "viewCount",
          key: "viewCount",
          render: (value: number) => <div className="text-lg">{value}</div>,
        },
      ];
    } else if (selectedStatistic === "lesson") {
      return [
        {
          title: "Bài học",
          dataIndex: "name",
          key: "name",
          render: (value: string) => <div className="text-lg">{value}</div>,
        },
        {
          title: "Số lượt xem",
          dataIndex: "viewCount",
          key: "viewCount",
          render: (value: number) => <div className="text-lg">{value}</div>,
        },
      ];
    }
    return [];
  };

  const lessonColumns = [
    {
      title: "Bài học",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Số lượt xem",
      dataIndex: "viewCount",
      key: "viewCount",
      render: (value: number) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Ngày xem gần nhất",
      dataIndex: "lastViewed",
      key: "lastViewed",
      render: (value: string) => <div className="text-lg">{value ? new Date(value).toLocaleDateString("vi-VN") : "N/A"}</div>,
    }
  ];

  const vocabularyColumns = [
    {
      title: "Từ vựng",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Số lượt xem",
      dataIndex: "viewCount",
      key: "viewCount",
      render: (value: number) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Ngày xem gần nhất",
      dataIndex: "lastViewed",
      key: "lastViewed",
      render: (value: string) => <div className="text-lg">{value ? new Date(value).toLocaleDateString("vi-VN") : "N/A"}</div>,
    }
  ];

  const testColumns = [
    {
      title: "Tên bài kiểm tra",
      dataIndex: "examName",
      key: "examName",
      render: (value: string) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Số lần đã làm",
      dataIndex: "attemptCount",
      key: "attemptCount",
      render: (value: number) => <div className="text-lg">{value}</div>,
    },
    {
      title: "Điểm số (Thang điểm 10)",
      dataIndex: "score",
      key: "score",
      render: (value: number | string) => {
        const num = Number(value);
        return <b>{!isNaN(num) ? num.toFixed(1) : "0.0"}</b>;
      },
    }
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
          title="Số từ vựng đã học"
          total={`${userStatistic?.vocabularyViews}`}
          onClick={handleShowVocabulary}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <AlphabetIcon size={24} color="#3C50E0" />
        </CardDataStats>

        <CardDataStats
          title="Số bài đã học"
          total={`${userStatistic?.lessonViews}`}
          onClick={handleShowLessons}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <TopicIcon size={24} color="#3C50E0" />
        </CardDataStats>

        <CardDataStats
          title="Số bài kiểm tra hoàn thành"
          total={`${userStatistic?.testsCompleted}`}
          onClick={handleShowTests}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
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
            columns={getColumns()}
            dataSource={statisticData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </div>
      </div>

      {/* Modal for showing lessons learned */}
      <Modal
        title={`Danh sách bài học đã học`}
        open={isLessonModalVisible}
        onCancel={() => setIsLessonModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsLessonModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={isLoadingLessons}>
          <Table
            columns={lessonColumns}
            dataSource={lessonsList}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Spin>
      </Modal>

      {/* Modal for showing lessons learned */}
      <Modal
        title={`Danh sách từ vựng đã học`}
        open={isVocabularyModalVisible}
        onCancel={() => setIsVocabularyModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsVocabularyModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={isLoadingVocabulary}>
          <Table
            columns={vocabularyColumns}
            dataSource={vocabularyList}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Spin>
      </Modal>

      <Modal
        title={`Danh sách bài kiểm tra đã làm`}
        open={isTestsModalVisible}
        onCancel={() => setIsTestsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsTestsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={isLoadingTests}>
          <Table
            columns={testColumns}
            dataSource={testsList}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Spin>
      </Modal>
    </Spin>
  );
};

export default LearningProcess;

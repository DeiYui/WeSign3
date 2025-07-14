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
import { PlayCircleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

export const filterOption = (input: string, option: any) =>
  (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const getFullVideoUrl = (videoUrl: string): string => {
  // If it's already a full URL, return as is
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }
  
  // Get the base URL from the current window location
  const baseUrl = "http://202.191.56.11:8088/videos";
  
  // Ensure the videoUrl starts with /
  const cleanUrl = videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`;
  
  return `${baseUrl}${cleanUrl}`;
};

// Video Modal Component
const VideoModal = ({ 
  visible, 
  onClose, 
  videoUrls, 
  initialIndex = 0 
}: {
  visible: boolean;
  onClose: () => void;
  videoUrls: string[];
  initialIndex?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const fullVideoUrls = videoUrls.map(url => getFullVideoUrl(url));


  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : fullVideoUrls.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < fullVideoUrls.length - 1 ? prev + 1 : 0));
  };

  // Reset index when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex, videoUrls]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [videoUrls]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, fullVideoUrls.length]);

   // Don't render if no videos
  if (!fullVideoUrls.length) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex justify-between items-center">
          <span>Video Player</span>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {fullVideoUrls.length}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button 
          key="previous" 
          icon={<LeftOutlined />} 
          onClick={handlePrevious}
          disabled={fullVideoUrls.length <= 1}
        >
          Previous
        </Button>,
        <Button 
          key="next" 
          icon={<RightOutlined />} 
          onClick={handleNext}
          disabled={fullVideoUrls.length <= 1}
        >
          Next
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={900}
      centered
    >
      <div className="flex flex-col items-center">
        <video
          key={`${currentIndex}-${fullVideoUrls[currentIndex]}`}
          controls
          width="100%"
          height="500"
          className="mb-4 rounded-lg"
          preload="metadata"
        >
          <source src={fullVideoUrls[currentIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </Modal>
  );
};

const LearningProcess: React.FC = () => {
  const router = useRouter();
  const user: User = useSelector((state: RootState) => state.admin);

  const [selectedStatistic, setSelectedStatistic] = useState<string>("vocabulary");
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
  const [testResultsList, setTestResultsList] = useState<any[]>([]);
  const [isLoadingTestResults, setIsLoadingTestResults] = useState<boolean>(false);
  const [isTestResultsModalVisible, setIsTestResultsModalVisible] = useState<boolean>(false);
  const [selectedExamName, setSelectedExamName] = useState<string>('');
  
  // Video modal states
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);

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
      const tests = await Learning.getFullTestsCompleted(user.userId);
      setTestsList(tests);
    } catch (error) {
      console.error("Error fetching Tests:", error);
    } finally {
      setIsLoadingTests(false);
    }
  };

  const handleShowTestResults = async (record: any) => {
    setSelectedExamName(record.examName);
    setIsLoadingTestResults(true);
    setIsTestResultsModalVisible(true);
    try {
      const tests = await Learning.getFullTestResults(record);
      setTestResultsList(tests);
      console.log('test ne', tests);
    } catch (error) {
      console.error("Error fetching Tests:", error);
    } finally {
      setIsLoadingTestResults(false);
    }
  };

  const handleShowVocabulary = async () => {
    setIsLoadingVocabulary(true);
    setIsVocabularyModalVisible(true);
    try {
      const vocabulary = await Learning.getFullVocabularyViews(user.userId);
      setVocabularyList(vocabulary);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoadingVocabulary(false);
    }
  };

  // Handle video modal
  const handleShowVideos = (videoUrls: string[]) => {
    setCurrentVideoUrls(videoUrls);
    setVideoModalVisible(true);
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
      render: (value: string, record: any) => {
        return (
          <div
            className="text-lg text-blue-600 cursor-pointer hover:underline"
            onClick={() => handleShowTestResults(record)}
          >
            {value}
          </div>
        );
      },
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

  const showVideoColumn = testResultsList.some(item => item.type === "practice");
  
  const testResultsColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>,
    },
    {
      title: "Điểm số (Thang điểm 10)",
      dataIndex: "score",
      key: "score",
      render: (value: number | string) => {
        const num = Number(value);
        return <b>{!isNaN(num) ? num.toFixed(1) : "0.0"}</b>;
      },
    },
    ...(showVideoColumn
      ? [
          {
            title: "Video đã thực hiện",
            dataIndex: "attemptCount",
            key: "attemptCount",
            render: (_: any, record: any) => (
              <div className="flex items-center gap-2">
                <div className="text-lg">{record.attemptCount}</div>
                {record.videoUrls && record.videoUrls.length > 0 && (
                  <Button
                    type="primary"
                    style={{background: "#2f54eb"}}
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleShowVideos(record.videoUrls)}
                  >
                    View Videos ({record.videoUrls.length})
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
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

      {/* Modal for showing vocabulary learned */}
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

      {/* Modal for showing tests completed */}
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

      {/* Modal for showing test results */}
      <Modal
        title={`Danh sách các lần thực hiện: ${selectedExamName}`}
        open={isTestResultsModalVisible}
        onCancel={() => setIsTestResultsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsTestResultsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={isLoadingTestResults}>
          <Table
            columns={testResultsColumns}
            dataSource={testResultsList}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Spin>
      </Modal>

      {/* Video Modal */}
      <VideoModal
        visible={videoModalVisible}
        onClose={() => setVideoModalVisible(false)}
        videoUrls={currentVideoUrls}
        initialIndex={0}
      />
    </Spin>
  );
};

export default LearningProcess;
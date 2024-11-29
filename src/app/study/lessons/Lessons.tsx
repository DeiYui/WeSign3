"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning } from "@/model/Learning";
import Lesson from "@/model/Lesson";
import { RootState } from "@/store";
import { LeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Input,
  List,
  message,
  Modal,
  Select,
  Skeleton,
  Spin,
  Tabs,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

export interface SectionHero2Props {
  className?: string;
}
interface Hero2DataType {
  headingImg?: string;
  image: string;
  heading: string;
  subHeading: string;
  btnText: string;
}
interface FilterParams {
  lessonId?: number;
  contentSearch: string;
  vocabularyType?: string;
}

interface SectionTab {
  key: string;
  title: string;
  content: string;
}

const CustomTab = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    padding: 8px;
    background: #f8fafc;
    border-radius: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .ant-tabs-nav::before {
    display: none;
  }

  .ant-tabs-nav-wrap {
    display: flex;
    justify-content: center;
  }

  .ant-tabs-tab {
    margin: 0 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    color: #64748b;
    background: white;
    border: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      color: #3b82f6;
      background: #eff6ff;
    }
  }

  .ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: #2563eb !important;
    }
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    background: #dbeafe;
    border-color: #60a5fa;
  }

  .ant-tabs-ink-bar {
    display: none;
  }

  .ant-tabs-content-holder {
    padding: 24px;
    background: white;
    border-radius: 16px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }

  // Animation for tab content
  .ant-tabs-tabpane {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // Responsive styles
  @media (max-width: 768px) {
    .ant-tabs-tab {
      padding: 8px 16px;
      font-size: 14px;
    }
  }

  // Custom scrollbar for overflow
  .ant-tabs-nav-list {
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 transparent;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #94a3b8;
      border-radius: 20px;
    }
  }
`;

function transformData(inputData: any) {
  return {
    vocabularyId: inputData.partId || null,
    content: inputData.partName || null,
    note: null,
    vocabularyType: "WORD",
    vocabularyImageResList: inputData.partImageResList.length
      ? inputData.partImageResList.map(
          (image: { partImageId: any; imageLocation: any }) => ({
            vocabularyImageId: image.partImageId || null,
            imageLocation: image.imageLocation || null,
            vocabularyId: inputData.partId || null,
            vocabularyContent: inputData.partName || null,
            primary: true,
          }),
        )
      : [],
    vocabularyVideoResList: inputData.partVideoResList.length
      ? inputData.partVideoResList.map(
          (video: { partVideoId: any; videoLocation: any }) => ({
            vocabularyVideoId: video.partVideoId || null,
            videoLocation: video.videoLocation || null,
            vocabularyId: inputData.partId || null,
            vocabularyContent: inputData.partName || null,
            primary: true,
          }),
        )
      : [],
    topicId: inputData.lessonId || null,
    topicContent: null,
  };
}

const Lessons: FC<SectionHero2Props> = ({ className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = Number(searchParams.get("lessonId"));
  const classRoomId = Number(searchParams.get("classRoomId"));
  const user: User = useSelector((state: RootState) => state.admin);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    lessonId: lessonId,
    contentSearch: "",
    vocabularyType: "",
  });
  const [showModal, setShowModal] = useState<{
    open: boolean;
    lessonId?: number;
  }>({
    open: false,
    lessonId: 0,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [lstVocabularyPart, setLstVocabularyPart] = useState<any[]>([]);

  // API lấy danh sách bài học
  const { data: allLessonPublic, isFetching } = useQuery({
    queryKey: ["getLstLessonByClass", classRoomId],
    queryFn: async () => {
      const res = await Lesson.getLstLessonByClass({
        classRoomId: classRoomId,
      });
      return res.data as Topic[];
    },
    enabled: showModal.open,
  });

  // API lấy danh sách phần
  const { data: allPart, isFetching: isFetchingVocabulary } = useQuery({
    queryKey: ["getPartAll", filterParams.lessonId],
    queryFn: async () => {
      const res = await Learning.getPartAll({
        lessonId: filterParams.lessonId,
      });
      if (!res.data?.length) {
        message.error("Bài học chưa có phần nào!");
        setLstVocabularyPart([]);
        return;
      }
      const data = Array.isArray(res.data)
        ? res?.data?.map((part: any) => transformData(part))
        : [];

      setLstVocabularyPart(data);
      return data;
    },
    enabled: !!lessonId,
  });

  useEffect(() => {
    if (lessonId) {
      setShowModal({ open: false, lessonId });
    }
  }, [lessonId]);

  // Tìm kiếm
  useEffect(() => {
    if (allLessonPublic) {
      setFilteredTopics(
        allLessonPublic.filter((lesson) =>
          lesson?.lessonName?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
  }, [searchText, allLessonPublic]);

  return (
    <Spin spinning={isFetchingVocabulary}>
      <div className="mb-4 flex items-center gap-3">
        {/* <Input
          onChange={(e) => {
            setFilterParams({
              ...filterParams,
              contentSearch: e.target.value,
            });
          }}
          className="w-1/3"
          size="large"
          allowClear
          placeholder="Nhập từ vựng"
        /> */}
      </div>
      <ButtonSecondary
        className="mb-4 mr-3 border border-solid border-neutral-700"
        onClick={() => {
          router.back();
        }}
      >
        <LeftOutlined /> Quay lại
      </ButtonSecondary>
      <ButtonSecondary
        className="mb-4 border border-solid border-neutral-700"
        onClick={() => setShowModal({ ...showModal, open: true })}
      >
        Lựa chọn bài học
      </ButtonSecondary>

      <StudyComponent allVocabulary={lstVocabularyPart} />

      {/* Modal */}
      <Modal
        width={1000}
        title="Danh sách bài học"
        open={showModal.open}
        centered
        footer={null}
        onCancel={() => setShowModal({ ...showModal, open: false })}
      >
        <Input
          size="large"
          placeholder="Nhập bài học muốn tìm kiếm"
          className="w-2/3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex w-full gap-4"></div>
        <div className="flex w-full items-center gap-4">
          <div className="flex-1">
            <List
              className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
              loading={isFetching}
              itemLayout="horizontal"
              dataSource={filteredTopics}
              bordered
              renderItem={(lesson) => (
                <List.Item
                  className={`${showModal.lessonId === lesson.lessonId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                  onClick={() => {
                    setFilterParams({
                      ...filterParams,
                      lessonId: lesson.lessonId,
                    });
                    setShowModal({ lessonId: lesson.lessonId, open: false });
                  }}
                >
                  <Skeleton avatar title={false} loading={isFetching} active>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          className="mt-1"
                          size={50}
                          src={lesson?.imageLocation}
                        />
                      }
                      title={
                        <div className="mt-3 text-base font-semibold">
                          {lesson?.lessonName}
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              )}
              locale={{ emptyText: "Không có kết quả tìm kiếm" }}
            />
          </div>
        </div>
      </Modal>
    </Spin>
  );
};

export default Lessons;

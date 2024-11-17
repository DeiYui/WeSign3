"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning } from "@/model/Learning";
import { RootState } from "@/store";
import { LeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Input,
  List,
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
  topicId: number;
  contentSearch: string;
  vocabularyType?: string;
}

interface SectionTab {
  key: string;
  title: string;
  content: string;
}

const sections: SectionTab[] = [
  { key: "1", title: "Phần 1", content: "Nội dung Phần 1" },
  { key: "2", title: "Phần 2", content: "Nội dung Phần 2" },
  { key: "3", title: "Phần 3", content: "Nội dung Phần 3" },
  { key: "4", title: "Phần 4", content: "Nội dung Phần 4" },
  { key: "5", title: "Phần 5", content: "Nội dung Phần 5" },
  { key: "6", title: "Phần 6", content: "Nội dung Phần 6" },
];

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

const Lessons: FC<SectionHero2Props> = ({ className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topicId"));
  const classRoomId = Number(searchParams.get("classRoomId"));
  const user: User = useSelector((state: RootState) => state.admin);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    topicId: topicId,
    contentSearch: "",
    vocabularyType: "",
  });
  const [showModal, setShowModal] = useState<{
    open: boolean;
    topicId: number;
  }>({
    open: false,
    topicId: 0,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [topicPrivates, setTopicPrivates] = useState<Topic[]>([]);
  const [activeKey, setActiveKey] = useState<string>("1");

  const token = localStorage.getItem("access_token");

  // API lấy danh sách topics
  const { data: allTopicsPublic, isFetching } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: "false",
        classRoomId: classRoomId,
      });
      return res.data as Topic[];
    },
    enabled: showModal.open,
  });

  const { data: allTopicsPrivate, isFetching: isFetchingPrivate } = useQuery({
    queryKey: ["getAllTopicsPrivate"],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: "true",
        classRoomId: classRoomId,
      });

      return res.data as Topic[];
    },
    enabled: showModal.open && user.role !== "USER",
  });

  // API lấy danh sách từ vựng
  const {
    data: allVocabulary,
    isFetching: isFetchingVocabulary,
    refetch,
  } = useQuery({
    queryKey: ["getAllVocalizations", filterParams],
    queryFn: async () => {
      const res = await Learning.getAllVocabulary({
        ...filterParams,
      });
      // Sắp xếp priamry lên đầu
      res?.data?.forEach(
        (item: {
          vocabularyImageResList: any[];
          vocabularyVideoResList: any[];
        }) => {
          item.vocabularyImageResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
          item.vocabularyVideoResList?.sort(
            (a: { primary: any }, b: { primary: any }) => {
              // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
              return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
            },
          );
        },
      );
      return res.data || [];
    },
    enabled: !!showModal.topicId,
  });

  useEffect(() => {
    if (topicId) {
      setShowModal({ open: false, topicId });
    }
  }, [topicId]);

  // Tìm kiếm
  useEffect(() => {
    if (allTopicsPublic) {
      setFilteredTopics(
        allTopicsPublic.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
    if (allTopicsPrivate) {
      setTopicPrivates(
        allTopicsPrivate.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
  }, [searchText, allTopicsPublic, allTopicsPrivate]);

  return (
    <Spin spinning={isFetchingVocabulary}>
      <div className="mb-4 flex items-center gap-3">
        <Input
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
        />
        <Select
          allowClear
          className="w-1/4"
          style={{ width: 400, height: 40, borderRadius: 20 }}
          placeholder="Loại từ vựng"
          size="large"
          options={[
            {
              label: "Từ",
              value: "WORD",
            },
            {
              label: "Câu",
              value: "SENTENCE",
            },
            {
              label: "Đoạn",
              value: "PARAGRAPH",
            },
          ]}
          onChange={(value) =>
            setFilterParams({ ...filterParams, vocabularyType: value })
          }
        />
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

      <CustomTab
        defaultActiveKey="1"
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        className="rounded-lg bg-white px-4 pb-4 shadow"
        tabBarGutter={16}
        tabBarStyle={{ marginBottom: "20px" }}
      >
        {sections.map((section) => (
          <Tabs.TabPane
            key={section.key}
            tab={<div className="text-base font-semibold">{section.title}</div>}
          >
            <div className="p-4">
              <StudyComponent allVocabulary={allVocabulary} />
            </div>
          </Tabs.TabPane>
        ))}
      </CustomTab>

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
        <div className="flex w-full gap-4">
          <div className="mt-2  flex-1 text-base font-bold">Bài học chung</div>
          {user && user?.role === "USER" ? null : (
            <div className="mt-2 w-1/2 text-base font-bold ">Bài học riêng</div>
          )}
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex-1">
            <List
              className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
              loading={isFetching}
              itemLayout="horizontal"
              dataSource={filteredTopics}
              bordered
              renderItem={(topic) => (
                <List.Item
                  className={`${showModal.topicId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                  onClick={() => {
                    setShowModal({ topicId: topic.topicId, open: false });
                    setFilterParams({
                      ...filterParams,
                      topicId: topic.topicId,
                    });
                  }}
                >
                  <Skeleton avatar title={false} loading={isFetching} active>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          className="mt-1"
                          size={50}
                          src={topic?.imageLocation}
                        />
                      }
                      title={
                        <div className="mt-3 text-base font-semibold">
                          {topic?.content}
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              )}
              locale={{ emptyText: "Không có kết quả tìm kiếm" }}
            />
          </div>
          {user.role === "USER" ? null : (
            <div className="w-1/2">
              <List
                className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
                loading={isFetchingPrivate}
                itemLayout="horizontal"
                dataSource={topicPrivates}
                bordered
                renderItem={(topic) => (
                  <List.Item
                    className={`${showModal.topicId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                    onClick={() => {
                      setShowModal({ topicId: topic.topicId, open: false });
                      setFilterParams({
                        ...filterParams,
                        topicId: topic.topicId,
                      });
                    }}
                  >
                    <Skeleton
                      avatar
                      title={false}
                      loading={isFetchingPrivate}
                      active
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            className="mt-1"
                            size={50}
                            src={topic?.imageLocation}
                          />
                        }
                        title={
                          <div className="mt-3 text-base font-semibold">
                            {topic?.content}
                          </div>
                        }
                      />
                    </Skeleton>
                  </List.Item>
                )}
                locale={{ emptyText: "Không có kết quả tìm kiếm" }}
              />
            </div>
          )}
        </div>
      </Modal>
    </Spin>
  );
};

export default Lessons;

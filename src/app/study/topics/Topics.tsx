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
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
  topicId?: number;
  contentSearch: string;
  vocabularyType?: string;
}

const Topics: FC<SectionHero2Props> = ({ className = "" }) => {
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
    topicId?: number;
  }>({
    open: false,
    topicId: 0,
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [topicPrivates, setTopicPrivates] = useState<Topic[]>([]);

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
        Lựa chọn chủ đề
      </ButtonSecondary>

      <StudyComponent allVocabulary={allVocabulary} />

      {/* Modal */}
      <Modal
        width={1000}
        title="Danh sách chủ đề"
        open={showModal.open}
        centered
        footer={null}
        onCancel={() => setShowModal({ ...showModal, open: false })}
      >
        <Input
          size="large"
          placeholder="Nhập chủ đề muốn tìm kiếm"
          className="w-2/3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex w-full gap-4">
          <div className="mt-2  flex-1 text-base font-bold">Chủ đề chung</div>
          {user && user?.role === "USER" ? null : (
            <div className="mt-2 w-1/2 text-base font-bold ">Chủ đề riêng</div>
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
                    setShowModal({ topicId: topic?.topicId, open: false });
                    setFilterParams({
                      ...filterParams,
                      topicId: topic?.topicId,
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
                      setShowModal({ topicId: topic?.topicId, open: false });
                      setFilterParams({
                        ...filterParams,
                        topicId: topic?.topicId,
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

export default Topics;

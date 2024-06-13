"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning, default as Topic } from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Image, Input, List, Modal, Skeleton } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

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

const Topics: FC<SectionHero2Props> = ({ className = "" }) => {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topicId"));

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

  // API lấy danh sách topics
  const { data: allTopics, isFetching } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      setTopicPrivates(
        res.data?.filter((item: { private: boolean }) => item.private),
      );
      return res.data?.filter(
        (item: { private: boolean }) => !item.private,
      ) as Topic[];
    },
    enabled: showModal.open,
  });

  // API lấy danh sách từ theo topics
  const { data: allVocabulary } = useQuery({
    queryKey: ["getVocabularyTopic", showModal.topicId],
    queryFn: async () => {
      const res = await Learning.getVocabularyTopic(showModal.topicId);
      return (res?.data as Vocabulary[]) || [];
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
    if (allTopics) {
      setFilteredTopics(
        allTopics.filter((topic) =>
          topic?.content?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
  }, [searchText, allTopics]);

  return (
    <>
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
          placeholder="Nhập chủ đè muốn tìm kiếm"
          className="w-2/3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex w-full gap-4">
          <div className="mt-2 w-1/2 text-base font-bold">Chủ đề chung</div>
          <div className="mt-2 w-1/2 text-base font-bold">Chủ đề riêng</div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="w-1/2">
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
          <div className="w-1/2">
            <List
              className="custom-scrollbar mt-4 max-h-[450px] overflow-y-auto pb-4"
              loading={isFetching}
              itemLayout="horizontal"
              dataSource={topicPrivates}
              bordered
              renderItem={(topic) => (
                <List.Item
                  className={`${showModal.topicId === topic.topicId ? "bg-green-200" : ""} hover:cursor-pointer hover:bg-neutral-300`}
                  onClick={() => {
                    setShowModal({ topicId: topic.topicId, open: false });
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
        </div>
      </Modal>
    </>
  );
};

export default Topics;

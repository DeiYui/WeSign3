"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning, default as Topic } from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Image, Input, List, Modal, Skeleton } from "antd";
import { useRouter } from "next/navigation";
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

export const HERO2_DEMO_DATA: Hero2DataType[] = [
  {
    headingImg: "/images/study/heading-study-topic.svg",
    image: "/images/study/study-topics.svg",
    heading: "Lựa chọn chủ đề học tập",
    subHeading: "Học tập theo chủ đề",
    btnText: "Lựa chọn",
  },
];

const Topics: FC<SectionHero2Props> = ({ className = "" }) => {
  const [showModal, setShowModal] = useState<{
    open: boolean;
    topicId: number;
  }>({
    open: false,
    topicId: 0,
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);

  // API lấy danh sách topics
  const { data: allTopics, isFetching } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      return res.data as Topic[];
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

  // Tìm kiếm
  useEffect(() => {
    if (allTopics) {
      setFilteredTopics(
        allTopics.filter((topic) =>
          topic.content.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
  }, [searchText, allTopics]);

  const renderItem = (index: number) => {
    const item = HERO2_DEMO_DATA[index];

    return (
      <div
        className={`relative  top-10 flex flex-col-reverse overflow-hidden lg:flex-col ${className}`}
        key={index}
      >
        {/* BG */}
        <div className="absolute inset-0 bg-[#E3FFE6]"></div>

        <div className="container relative pb-0 pt-14 sm:pt-20 lg:py-44">
          <div className="absolute bottom-1/2 end-0 left-8 top-10">
            <Image preview={false} src={item.headingImg} alt={item.heading} />
          </div>
          <div className="relative z-[1] w-full max-w-3xl space-y-8 pl-8 sm:space-y-14">
            <div className="space-y-5 sm:space-y-6">
              <span className=" block text-base font-semibold text-slate-700 md:text-xl">
                {item.subHeading}
              </span>
              <h2 className=" text-3xl font-bold !leading-[114%] text-slate-900 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
                {item.heading}
              </h2>
              <ButtonPrimary
                onClick={() => {
                  setShowModal({ ...showModal, open: true });
                }}
              >
                {item.btnText}
              </ButtonPrimary>
            </div>
          </div>
          <div className="absolute bottom-1/2 end-0 right-4 top-1/2">
            <Image preview={false} src={item.image} alt={item.heading} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showModal.topicId !== 0 ? (
        <>
          <ButtonSecondary
            className="mb-4 border border-solid border-neutral-700"
            onClick={() => setShowModal({ ...showModal, open: true })}
          >
            Lựa chọn chủ đề
          </ButtonSecondary>
          <StudyComponent allVocabulary={allVocabulary} />
        </>
      ) : (
        <>{HERO2_DEMO_DATA.map((_: any, index: any) => renderItem(index))}</>
      )}

      {/* Modal */}
      <Modal
        width={700}
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
      </Modal>
    </>
  );
};

export default Topics;

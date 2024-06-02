"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning, default as Topic } from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Image,
  Input,
  List,
  Modal,
  Select,
  Skeleton,
} from "antd";
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
const { Option } = Select;

const Rooms: FC<SectionHero2Props> = ({ className = "" }) => {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topicId"));

  const [showModal, setShowModal] = useState<{
    open: boolean;
    topicId: number;
    classRoomId: number;
  }>({
    open: false,
    topicId: 0,
    classRoomId: 0,
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);

  // API lấy danh sách topics
  const { data: allTopics, isFetching } = useQuery({
    queryKey: ["getAllTopics", showModal.classRoomId],
    queryFn: async () => {
      const res = await Learning.getAllTopicsPrivate(showModal.classRoomId);
      return res.data;
    },
    enabled: !!showModal.classRoomId,
  });

  const { data: allCLass, isFetching: isFetchingClass } = useQuery({
    queryKey: ["getListClass"],
    queryFn: async () => {
      const res = await Learning.getListClass();
      return res.data?.map(
        (e: { content: any; classRoomId: any; imageLocation: string }) => ({
          label: e.content,
          value: e.classRoomId,
          imageLocation: e.imageLocation,
        }),
      );
    },
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

  // useEffect(() => {
  //   if (topicId) {
  //     setShowModal({ open: false, topicId });
  //   }
  // }, [topicId]);

  // Tìm kiếm
  useEffect(() => {
    if (allTopics) {
      setFilteredTopics(
        allTopics.filter((topic: any) =>
          topic?.content?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
  }, [searchText, allTopics]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Select
          className="w-2/3"
          placeholder="Lựa chọn lớp học"
          size="large"
          // options={allCLass}
          loading={isFetchingClass}
          onSelect={(value) => {
            setShowModal({ ...showModal, classRoomId: value });
          }}
          optionLabelProp="label"
        >
          {allCLass?.map((item: any) => (
            <Option key={item.value} value={item.value} label={item.label}>
              <div className="">
                <Avatar
                  size={40}
                  src={item.imageLocation}
                  alt={item.label}
                  className=""
                />
                <span className="ml-2">{item.label}</span>
              </div>
            </Option>
          ))}
        </Select>
        {allTopics?.length ? (
          <ButtonSecondary
            disabled={isFetching}
            className="mb-4 w-1/4 border border-solid border-neutral-700"
            onClick={() => setShowModal({ ...showModal, open: true })}
          >
            Lựa chọn chủ đề
          </ButtonSecondary>
        ) : null}

        <StudyComponent allVocabulary={allVocabulary} />
      </div>

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
                setShowModal({
                  ...showModal,
                  topicId: topic.topicId,
                  open: false,
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
      </Modal>
    </>
  );
};

export default Rooms;

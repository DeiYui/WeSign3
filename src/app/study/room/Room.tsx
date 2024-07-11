"use client";
import StudyComponent from "@/components/Study/StudyComponent";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import { default as Learning } from "@/model/Learning";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Input,
  List,
  Modal,
  Select,
  Skeleton,
  Spin,
  message,
} from "antd";
import { useSearchParams } from "next/navigation";
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
const { Option } = Select;

const Rooms: FC<SectionHero2Props> = ({ className = "" }) => {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topicId"));
  const user: User = useSelector((state: RootState) => state.admin);

  const [showModal, setShowModal] = useState<{
    open: boolean;
    topicId: number;
    classRoomId: number;
    classRoomName?: string;
    isPrivate?: string;
  }>({
    open: false,
    topicId: 0,
    classRoomId: 0,
    classRoomName: "",
    isPrivate: "false",
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [lstVocabulary, setLstVocabulary] = useState<any[]>([]);

  // API lấy danh sách topics
  const { data: allTopics, isFetching } = useQuery({
    queryKey: ["getAllTopics", showModal],
    queryFn: async () => {
      const res = await Learning.getAllTopics({
        isPrivate: user.role === "USER" ? "false" : showModal.isPrivate,
        classRoomId: showModal.classRoomId,
      });
      if (!res.data?.length) {
        const className = allCLass?.find(
          (item: { value: any }) => item.value === showModal.classRoomId,
        )?.label;
        message.error(`Không có chủ đề theo lớp ${className} `);
        return;
      }
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
  const { data: allVocabulary, isFetching: isFetchingVocabulary } = useQuery({
    queryKey: ["getVocabularyTopic", showModal.topicId],
    queryFn: async () => {
      const res = await Learning.getVocabularyTopic(showModal.topicId);
      if (!res.data?.length) {
        message.error(`Không có từng vựng theo chủ đề đã chọn `);
        return;
      }
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
      setLstVocabulary(res.data);
      return (res.data as Vocabulary[]) || [];
    },
    enabled: !!showModal.topicId,
  });

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
    <Spin spinning={isFetchingVocabulary}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Select
            className="w-1/4"
            placeholder="Lựa chọn lớp học"
            size="large"
            allowClear
            onClear={() => {
              setShowModal({
                ...showModal,
                classRoomId: 0,
              });
              setLstVocabulary([]);
            }}
            loading={isFetchingClass}
            onSelect={(value) => {
              setShowModal({
                ...showModal,
                classRoomId: value,
              });
              setLstVocabulary([]);
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

          {(user?.role === "ADMIN" || user?.role === "TEACHER") && (
            <Select
              size="large"
              className="w-1/4"
              allowClear
              placeholder="Loại bài kiểm tra"
              defaultValue={"false"}
              options={[
                {
                  label: "Chung",
                  value: "false",
                },
                {
                  label: "Riêng",
                  value: "true",
                },
              ]}
              onChange={(value, option: any) => {
                setShowModal({
                  ...showModal,
                  isPrivate: value,
                });
                setLstVocabulary([]);
              }}
            />
          )}
        </div>

        {allTopics?.length ? (
          <ButtonSecondary
            disabled={isFetching}
            className="mb-4 w-1/4 border border-solid border-neutral-700"
            onClick={() => setShowModal({ ...showModal, open: true })}
          >
            Lựa chọn chủ đề
          </ButtonSecondary>
        ) : null}

        {lstVocabulary?.length ? (
          <StudyComponent allVocabulary={lstVocabulary} />
        ) : null}
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
    </Spin>
  );
};

export default Rooms;

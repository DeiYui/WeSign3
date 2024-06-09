"use client";
import { SearchIcon } from "@/assets/icons";
import StudyComponent from "@/components/Study/StudyComponent";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import Learning from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Select, message } from "antd";
import Image, { StaticImageData } from "next/image";
import { FC, useState } from "react";

export interface SectionHero2Props {
  className?: string;
}

const Vocabulary: FC<SectionHero2Props> = ({ className = "" }) => {
  //value search
  const [filterParams, setFilerParams] = useState<{
    topicId?: number;
    isPrivate?: boolean;
    vocabularyType?: string;
    contentSearch?: string;
  }>({});

  // API lấy danh sách từ khi tìm kiếm
  const { data: allVocabulary } = useQuery({
    queryKey: ["searchVocabulary", filterParams],
    queryFn: async () => {
      const res = await Learning.getAllVocabulary(filterParams);
      if (!res?.data?.length) {
        message.warning("Không có kết quả tìm kiếm");
        return;
      }
      return (res?.data as Vocabulary[]) || [];
    },
  });

  return (
    <>
      <div className="flex w-full gap-4">
        <InputPrimary
          allowClear
          className="relative mb-4"
          style={{ width: 400 }}
          placeholder="Tìm kiếm từ vựng"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilerParams({
                ...filterParams,
                contentSearch: e.currentTarget.value,
              });
            }
          }}
          suffixIcon={<SearchIcon size={24} />}
          onSuffixClick={(value) => {
            setFilerParams({ ...filterParams, contentSearch: value });
          }}
          onClear={() => {
            setFilerParams({ ...filterParams, contentSearch: "" });
          }}
        />
        <Select
          allowClear
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
            setFilerParams({ ...filterParams, vocabularyType: value })
          }
        />
      </div>

      <StudyComponent allVocabulary={allVocabulary} />
    </>
  );
};

export default Vocabulary;

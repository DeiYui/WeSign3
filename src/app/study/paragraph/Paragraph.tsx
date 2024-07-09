"use client";
import { SearchIcon } from "@/assets/icons";
import StudyComponent from "@/components/Study/StudyComponent";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import Learning from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Spin, message } from "antd";
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
  const { data: allVocabulary, isFetching } = useQuery({
    queryKey: ["searchVocabulary", filterParams],
    queryFn: async () => {
      const res = await Learning.getAllVocabulary({
        ...filterParams,
        vocabularyType: "PARAGRAPH",
      });

      return (res?.data as Vocabulary[]) || [];
    },
  });

  return (
    <Spin spinning={isFetching}>
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
      </div>

      <StudyComponent allVocabulary={allVocabulary} />
    </Spin>
  );
};

export default Vocabulary;

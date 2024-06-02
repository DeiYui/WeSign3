"use client";
import { SearchIcon } from "@/assets/icons";
import StudyComponent from "@/components/Study/StudyComponent";
import InputPrimary from "@/components/UI/Input/InputPrimary";
import Learning from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { message } from "antd";
import Image, { StaticImageData } from "next/image";
import { FC, useState } from "react";

export interface SectionHero2Props {
  className?: string;
}

const Vocabulary: FC<SectionHero2Props> = ({ className = "" }) => {
  //value search
  const [valueSearch, setValueSearch] = useState<string>("");

  // API lấy danh sách từ khi tìm kiếm
  const { data: allVocabulary } = useQuery({
    queryKey: ["searchVocabulary", valueSearch],
    queryFn: async () => {
      const res = await Learning.searchVocabulary({
        page: 1,
        size: 999999999,
        text: valueSearch,
        ascending: true,
      });
      if (!res?.data?.length) {
        message.warning("Không có kết quả tìm kiếm");
        return;
      }
      return (res?.data as Vocabulary[]) || [];
    },
    enabled: !!valueSearch,
  });

  return (
    <>
      <InputPrimary
        className="mb-4"
        style={{ width: "50%" }}
        placeholder="Tìm kiếm từ vựng"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setValueSearch(e.currentTarget.value);
          }
        }}
        suffixIcon={<SearchIcon size={24} />}
        onSuffixClick={(value) => {
          setValueSearch(value);
        }}
      />
      <StudyComponent allVocabulary={allVocabulary} />
    </>
  );
};

export default Vocabulary;

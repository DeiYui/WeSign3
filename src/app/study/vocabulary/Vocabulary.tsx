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
interface Hero2DataType {
  image: StaticImageData | string;
  heading: string;
  subHeading: string;
  btnText: string;
}

export const HERO2_DEMO_DATA: Hero2DataType[] = [
  {
    image: "/images/study/study-vocabulary.svg",
    heading: "Tìm kiếm từ vựng",
    subHeading: "Học tập theo từ vựng",
    btnText: "Tìm kiếm",
  },
];

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

  const renderItem = (index: number) => {
    const item = HERO2_DEMO_DATA[index];

    return (
      <div
        className={`relative  top-10 flex flex-col-reverse overflow-hidden lg:flex-col ${className}`}
        key={index}
      >
        {/* BG */}
        <div className="absolute inset-0 bg-yellow-100"></div>

        <div className="container relative pb-0 pt-14 sm:pt-20 lg:py-44">
          <div className="relative z-[1] w-full max-w-3xl space-y-8 pl-8 sm:space-y-14">
            <div className="space-y-5 sm:space-y-6">
              <span className=" block text-base font-semibold text-slate-700 md:text-xl">
                {item.subHeading}
              </span>
              <h2 className=" text-3xl font-bold !leading-[114%] text-slate-900 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
                {item.heading}
              </h2>
              <InputPrimary
                style={{ width: "50%" }}
                placeholder={item.btnText}
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
            </div>
          </div>
          <div className="absolute bottom-0 end-0 right-0 top-0 mt-10 w-full max-w-2xl  rtl:-end-28">
            <Image
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className=" h-full w-full object-contain object-right-bottom"
              src={item.image}
              alt={item.heading}
              priority
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {valueSearch ? (
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
      ) : (
        <>{HERO2_DEMO_DATA.map((_: any, index: any) => renderItem(index))}</>
      )}
    </>
  );
};

export default Vocabulary;

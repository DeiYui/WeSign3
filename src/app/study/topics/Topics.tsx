"use client";
import ButtonPrimary from "@/components/UI/Button/ButtonPrimary";
import { StaticImageData } from "next/image";
import { FC } from "react";

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
    image: "",
    heading: "Lựa chọn chủ đề học tập",
    subHeading: "Học tập theo chủ đề",
    btnText: "Lựa chọn",
  },
];

const Topics: FC<SectionHero2Props> = ({ className = "" }) => {
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
          <div className="relative z-[1] w-full max-w-3xl space-y-8 pl-8 sm:space-y-14">
            <div className="space-y-5 sm:space-y-6">
              <span className=" block text-base font-semibold text-slate-700 md:text-xl">
                {item.subHeading}
              </span>
              <h2 className=" text-3xl font-bold !leading-[114%] text-slate-900 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
                {item.heading}
              </h2>
              <ButtonPrimary>{item.btnText}</ButtonPrimary>
            </div>
          </div>
          <div className="bottom-0 end-0 top-0 mt-10 w-full max-w-2xl lg:absolute lg:mt-0 xl:max-w-3xl 2xl:max-w-4xl rtl:-end-28">
            {/* <Image
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="nc-SectionHero2Item__image h-full w-full object-contain object-right-bottom"
              src={item.image}
              alt={item.heading}
              priority
            /> */}
          </div>
        </div>
      </div>
    );
  };

  return <>{HERO2_DEMO_DATA.map((_: any, index: any) => renderItem(index))}</>;
};

export default Topics;

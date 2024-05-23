"use client";
import LearnHome from "@/components/Study/LearnHome";
import { Empty, Image } from "antd";
import React, { useEffect, useState } from "react";

export interface letter {
  name: string;
  image: string;
}

const numbers = ["All", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const ListAlphanumeric = [] as letter[];

const ProjectItems = ({ item }: { item: letter }) => {
  return (
    <div className="flex justify-center">
      <Image className="mb-2 w-full rounded-lg" src={item.image} alt="" />
    </div>
  );
};

const Alphanumeric: React.FC = () => {
  const [alphabet, setAlphabet] = useState<string>("All");
  const [lstLetter, setLstLetter] = useState<letter[]>([]);
  const [active, setActive] = useState<number>(0);

  useEffect(() => {
    if (alphabet === "All") {
      setLstLetter(ListAlphanumeric);
    } else {
      debugger;
      const newLstAlphabet = ListAlphanumeric.filter(
        (item) => item.name === alphabet,
      );
      setLstLetter(newLstAlphabet);
    }
  }, [alphabet]);

  const handleClick = (e: any, index: number) => {
    setAlphabet(e);
    setActive(index);
  };

  return (
    <div className="">
      <div className="flex w-full justify-center">
        <div className="mb-8 flex w-[800px] flex-wrap items-center justify-center space-x-2">
          {numbers.map((item, index) => (
            <span
              onClick={(e) => handleClick(item, index)}
              key={index}
              className={`${active === index ? "bg-gray-800 text-primary" : ""} cursor-pointer rounded px-2 py-1 text-2xl capitalize hover:bg-slate-800 hover:text-white`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      {alphabet === "All" ? (
        <LearnHome />
      ) : (
        <div className="grid justify-center gap-8">
          {ListAlphanumeric?.length ? (
            ListAlphanumeric.map((item) => (
              <ProjectItems item={item} key={item.name} />
            ))
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </div>
      )}
    </div>
  );
};

export default Alphanumeric;

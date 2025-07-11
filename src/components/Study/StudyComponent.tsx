/* eslint-disable @next/next/no-img-element */
"use client";
import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Carousel,
  Empty,
  Image,
  Modal,
  Pagination,
  Popover,
  Tooltip,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ButtonPrimary from "../UI/Button/ButtonPrimary";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const PAGE_SIZE = 12;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ROOT_NODE;
const CustomSlider = styled(Carousel)`
  &.ant-carousel {
    width: 100%;
  }
  .slick-slide.slick-active.slick-current {
    display: flex;
    justify-content: center;
  }
`;

const TYPE_VOCABULARY = {
  WORD: "WORD",
  SENTENCE: "SENTENCE",
  PARAGRAPH: "PARAGRAPH",
};

const StudyComponent = ({ allVocabulary = [], isLesson = false }: any) => {
  const userId = useSelector((state: RootState) => state.admin.userId);
  const { mutate: incrementVocabularyView } = useMutation({
    mutationFn: async (vocabularyId: number) => {
      await axios.post(`${API_BASE_URL}/api/user/vocabulary/view`, { userId, vocabularyId });
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showFileDetail, setShowFileDetail] = useState(false);
  const videoRef = useRef<any>(null);
  const [fileIndex, setFileIndex] = useState(0);
  // video
  const slider = useRef<any>(null);
  const [autoplayEnabled, setAutoplay] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoCurrent, setVideoCurrent] = useState<any>();

  // Thu phóng
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  useEffect(() => {
    if (showFileDetail && allVocabulary?.length) {
      setAutoplay(true);
      setVideoCurrent(
        allVocabulary[fileIndex]?.vocabularyVideoResList[0]?.videoLocation,
      );
      setCurrentVideoIndex(0);
    }
  }, [showFileDetail, fileIndex, allVocabulary]);

  const handleNextVideo = () => {
    const nextIndex = currentVideoIndex + 1;
    if (nextIndex < allVocabulary[fileIndex]?.vocabularyVideoResList?.length) {
      setCurrentVideoIndex(nextIndex);
      setAutoplay(true);
      setVideoCurrent(
        allVocabulary[fileIndex]?.vocabularyVideoResList[nextIndex]
          .videoLocation,
      );
    }
  };

  const handlePreviousVideo = () => {
    const previousIndex = currentVideoIndex - 1;
    if (previousIndex >= 0) {
      setCurrentVideoIndex(previousIndex);
      setAutoplay(true);
      setVideoCurrent(
        allVocabulary[fileIndex]?.vocabularyVideoResList[previousIndex]
          .videoLocation,
      );
    }
  };

  //  next allVocabulary
  // const handleNext = () => {
  //   setFileIndex((prevIndex) =>
  //     Math.min(prevIndex + 1, allVocabulary?.length - 1),
  //   );
  // };

  // const handlePrevious = () => {
  //   setFileIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  // };
  const handleNext = () => {
    const nextIndex = Math.min(fileIndex + 1, allVocabulary?.length - 1);
    setFileIndex(nextIndex);
    trackVocabularyView(nextIndex);
  };
  
  const handlePrevious = () => {
    const prevIndex = Math.max(fileIndex - 1, 0);
    setFileIndex(prevIndex);
    trackVocabularyView(prevIndex);
  };

  // Pagination
  useEffect(() => {
    const totalPages =
      allVocabulary?.length > PAGE_SIZE
        ? Math.ceil(allVocabulary?.length / PAGE_SIZE)
        : 1;
    setCurrentPage(Math.min(currentPage, totalPages));
  }, [allVocabulary, currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

//   const handleViewDetail = (index: number) => {
//     setFileIndex(PAGE_SIZE * (currentPage - 1) + index);
//     setShowFileDetail(true);

//   // const handleViewDetail = (index: number) => {
//   //   setFileIndex(PAGE_SIZE * (currentPage - 1) + index);
//   //   setShowFileDetail(true);

//   //   // Increment vocabulary view count
//   //   // incrementVocabularyView();
//   //   const vocabularyId = allVocabulary[index]?.id; // Lấy vocabularyId từ danh sách từ vựng
//   //   if (vocabularyId) {
//   //     incrementVocabularyView(vocabularyId); // Gửi request với vocabularyId
//   //   }
//   // };
  const handleViewDetail = (index: number) => {
    const globalIndex = PAGE_SIZE * (currentPage - 1) + index; // Chuyển index của trang hiện tại sang index toàn cục
    setFileIndex(globalIndex);
    setShowFileDetail(true);
// <<<<<<< HEAD
  
    // const vocabularyId = allVocabulary[globalIndex].vocabularyId; // Lấy ID từ vị trí toàn cục
    // if (vocabularyId) {
    //   incrementVocabularyView(vocabularyId);
    // } else {
    //   console.error("Vocabulary ID is missing.", allVocabulary[globalIndex].vocabularyId);
    // }
    trackVocabularyView(globalIndex);
  };

  const trackVocabularyView = (index: number) => {
    if (allVocabulary && allVocabulary[index]) {
      const vocabularyId = allVocabulary[index].vocabularyId;
      if (vocabularyId) {
        incrementVocabularyView(vocabularyId);
      } else {
        console.error("Vocabulary ID is missing for index:", index, allVocabulary[index]);
      }
    }

// =======

//     // Increment vocabulary view count
//     incrementVocabularyView();
// >>>>>>> 861763e8cbc6162e5f3d6e6ba3cc4785ef1abff8
  };

  const onCloseDetail = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setAutoplay(false);
    setVideoCurrent(null);
    setShowFileDetail(false);
    setIsFullScreen(false);
  };

  // Function to handle image click
  const handleImageClick = (imageLocation: string) => {
    setSelectedImage(imageLocation);
    setIsImageModalVisible(true);
  };

  if (allVocabulary?.length === 0) {
    return (
      <Empty
        className="bg-white p-12"
        style={{ width: "100%" }}
        description={`Không có dữ liệu `}
      />
    );
  }

  return (
    <>
      <div className="w-full">
        <div
          className={
            isLesson
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          }
        >
          {allVocabulary &&
            allVocabulary?.length > 0 &&
            allVocabulary
              ?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              ?.map((item: any, i: number) => {
                return (
                  <>
                    {/* Từ */}
                    {item.vocabularyType === TYPE_VOCABULARY.WORD && (
                      <div key={i} style={{ height: "max-content" }}>
                        <div
                          key={i}
                          className=" border-gray-300 group relative flex h-40 items-center  overflow-hidden rounded-lg border bg-cover bg-center bg-no-repeat object-contain  hover:shadow-3"
                          style={{
                            backgroundImage: `url(${
                              item?.vocabularyImageResList[0]?.imageLocation !==
                              ""
                                ? item?.vocabularyImageResList[0]?.imageLocation
                                : "/images/study/defaultvideo.png"
                            })`,
                            backgroundSize: "contain",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <div className="absolute right-0 top-0 h-full w-full translate-x-0 transform bg-neutral-50 bg-opacity-75 transition-transform duration-500 hover:translate-x-30 group-hover:-translate-x-[100%]">
                            <p className="ml-2 line-clamp-2 py-2 text-2xl font-semibold text-black">
                              {item?.content}
                            </p>
                          </div>
                          <button
                            className="absolute right-0 flex h-full w-full translate-x-[100%] items-center justify-center bg-black bg-opacity-50 text-white  duration-500 group-hover:translate-x-0"
                            onClick={() => handleViewDetail(i)}
                          >
                            Bấm để xem!!!
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Câu, đoạn */}
                    {item.vocabularyType !== TYPE_VOCABULARY.WORD && (
                      <div key={i} style={{ height: "max-content" }}>
                        <div
                          key={i}
                          className=" border-gray-300 group relative flex h-40 items-center  overflow-hidden rounded-lg border bg-cover bg-center bg-no-repeat object-contain  hover:shadow-3"
                          style={{
                            backgroundImage: `url(${
                              item?.vocabularyImageResList[0]?.imageLocation !==
                              ""
                                ? item?.vocabularyImageResList[0]?.imageLocation
                                : "/images/study/defaultvideo.png"
                            })`,
                            backgroundSize: "contain",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <div className="absolute right-0 top-0 h-full w-full translate-x-0 transform bg-neutral-50 bg-opacity-75 transition-transform duration-500 hover:translate-x-30 group-hover:-translate-x-[100%]">
                            <p className="ml-2 line-clamp-2 py-2 text-2xl font-semibold text-black">
                              {item?.content}
                            </p>
                          </div>
                          <button
                            className="absolute right-0 flex h-full w-full translate-x-[100%] items-center justify-center bg-black bg-opacity-50 text-white  duration-500 group-hover:translate-x-0"
                            onClick={() => handleViewDetail(i)}
                          >
                            Bấm để xem!!!
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
        </div>
        {allVocabulary?.length > PAGE_SIZE && (
          <div className="mt-4 flex w-full justify-center pb-3">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={allVocabulary?.length}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* modal hiển thị thông tin từ */}
      <Modal
        open={showFileDetail}
        footer={null}
        onCancel={onCloseDetail}
        title={
          <div className="flex items-center justify-between">
            {allVocabulary &&
            allVocabulary[fileIndex]?.vocabularyType ===
              TYPE_VOCABULARY.WORD ? (
              <div className="line-clamp-1 text-[32px] font-bold">
                {allVocabulary[fileIndex]?.content}
              </div>
            ) : (
              <div>
                {allVocabulary &&
                allVocabulary[fileIndex]?.vocabularyType ===
                  TYPE_VOCABULARY.SENTENCE ? (
                  <div className="line-clamp-1 text-[32px] font-bold">
                    Học tập theo câu văn
                  </div>
                ) : (
                  <div className="line-clamp-1 text-[32px] font-bold">
                    Học tập theo đoạn văn
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Tooltip title={!isFullScreen ? "Phóng to" : "Thu nhỏ"}>
                <Button
                  icon={
                    isFullScreen ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )
                  }
                  onClick={toggleFullScreen}
                  type="text"
                />
              </Tooltip>

              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onCloseDetail}
              />
            </div>
          </div>
        }
        closeIcon={null}
        width={isFullScreen ? "100%" : 1280}
        style={{
          top: isFullScreen ? 0 : "auto",
          maxWidth: isFullScreen ? "100%" : undefined,
        }}
        key={allVocabulary?.length && allVocabulary[fileIndex]?.content}
        centered
      >
        <div className="w-full px-4">
          <div className="w-full ">
            <div className="grid grid-cols-3 items-center gap-3">
              {/* image */}
              <CustomSlider
                ref={slider}
                className=" flex w-full items-center justify-center"
                dots={false}
              >
                {allVocabulary &&
                  allVocabulary[fileIndex]?.vocabularyImageResList?.map(
                    (
                      item: { imageLocation: string | undefined },
                      index: React.Key | null | undefined,
                    ) => (
                      <div key={index}>
                        {item.imageLocation ? (
                          <div className="text-center">
                            <Image
                              preview={false}
                              src={item.imageLocation}
                              alt="imageLocation"
                              className="flex max-h-[400px] w-[400px] items-center justify-center object-scale-down "
                              onClick={() => handleImageClick(item.imageLocation!)}
                            />
                            {allVocabulary && (
                              <>
                                <div
                                  className="line-clamp-[10] w-[420px] overflow-y-auto text-left  text-[18px]"
                                  style={{
                                    display:
                                      allVocabulary[fileIndex]
                                        .vocabularyType !== TYPE_VOCABULARY.WORD
                                        ? "block"
                                        : "none",
                                  }}
                                >
                                  {allVocabulary[fileIndex]?.content}
                                </div>
                                {allVocabulary[fileIndex]?.note && (
                                  <div className="mt-2">
                                    {allVocabulary[fileIndex]?.note}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-xl">
                            Chưa có hình ảnh minh hoạ
                          </div>
                        )}
                      </div>
                    ),
                  )}
              </CustomSlider>

              {/* video */}
              <div className="col-span-2">
                {videoCurrent ? (
                  <video
                    key={videoCurrent}
                    controls
                    ref={videoRef}
                    autoPlay={autoplayEnabled}
                    style={{ width: "100%", height: 550 }}
                    onEnded={() => setAutoplay(false)}
                  >
                    <source src={videoCurrent} type="video/mp4" />
                  </video>
                ) : (
                  <div className="text-center text-xl">
                    Chưa có video minh hoạ
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between px-4">
          <div className="flex w-1/3 justify-center">
            <Button
              style={{
                display:
                  allVocabulary?.length &&
                  allVocabulary[fileIndex]?.vocabularyImageResList?.length < 2
                    ? "none"
                    : "block",
              }}
              icon={<LeftOutlined />}
              onClick={() => slider.current.prev()}
            />
            <Button
              style={{
                display:
                  allVocabulary?.length &&
                  allVocabulary[fileIndex]?.vocabularyImageResList?.length < 2
                    ? "none"
                    : "block",
              }}
              icon={<RightOutlined />}
              onClick={() => slider.current.next()}
            />
          </div>
          <div className="mt-4 flex w-2/3 justify-center">
            <Button
              style={{ display: currentVideoIndex === 0 ? "none" : "block" }}
              icon={<LeftOutlined />}
              onClick={handlePreviousVideo}
            />
            <Button
              style={{
                display:
                  allVocabulary?.length &&
                  currentVideoIndex ===
                    allVocabulary[fileIndex]?.vocabularyVideoResList?.length - 1
                    ? "none"
                    : "block",
              }}
              icon={<RightOutlined />}
              onClick={handleNextVideo}
            />
          </div>
        </div>
        <div className="mt-4 flex w-full justify-center gap-3">
          <ButtonPrimary disabled={fileIndex === 0} onClick={handlePrevious}>
            Lùi lại
          </ButtonPrimary>
          <ButtonPrimary
            disabled={fileIndex === allVocabulary?.length - 1}
            onClick={handleNext}
          >
            Kế tiếp
          </ButtonPrimary>
        </div>
      </Modal>

      {/* New modal for displaying the clicked image */}
      <Modal
        visible={isImageModalVisible}
        footer={null}
        onCancel={() => setIsImageModalVisible(false)}
        width={800}
      >
        <img src={selectedImage || ''} alt="Zoomed" style={{ width: '100%' }} />
      </Modal>
    </>
  );
};

export default StudyComponent;

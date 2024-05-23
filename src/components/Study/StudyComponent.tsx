"use client";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Carousel, Empty, Modal, Pagination } from "antd";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ButtonPrimary from "../UI/Button/ButtonPrimary";

const PAGE_SIZE = 12;
const CustomSlider = styled(Carousel)`
  &.ant-carousel {
    width: 100%;
  }
`;

const StudyComponent: React.FC = ({ files = [] }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFileDetail, setShowFileDetail] = useState(false);
  const videoRef = useRef<any>(null);
  const [fileIndex, setFileIndex] = useState(0);

  // video
  const slider = useRef<any>(null);
  const [autoplayEnabled, setAutoplay] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoCurrent, setVideoCurrent] = useState<any>();

  useEffect(() => {
    if (showFileDetail) {
      setAutoplay(true);
      setVideoCurrent(
        files[fileIndex]?.vocabularyVideoResList[0].videoLocation,
      );
      setCurrentVideoIndex(0);
    }
  }, [showFileDetail, fileIndex, files]);

  const handleNextVideo = () => {
    const nextIndex = currentVideoIndex + 1;
    if (nextIndex < files[fileIndex]?.vocabularyVideoResList?.length) {
      setCurrentVideoIndex(nextIndex);
      setAutoplay(true);
      setVideoCurrent(
        files[fileIndex]?.vocabularyVideoResList[nextIndex].videoLocation,
      );
    }
  };

  const handlePreviousVideo = () => {
    const previousIndex = currentVideoIndex - 1;
    if (previousIndex >= 0) {
      setCurrentVideoIndex(previousIndex);
      setAutoplay(true);
      setVideoCurrent(
        files[fileIndex]?.vocabularyVideoResList[previousIndex].videoLocation,
      );
    }
  };

  //  next files
  const handleNext = () => {
    setFileIndex((prevIndex) => Math.min(prevIndex + 1, files?.length - 1));
  };

  const handlePrevious = () => {
    setFileIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // CHia page
  useEffect(() => {
    const totalPages =
      files?.length > PAGE_SIZE ? Math.ceil(files?.length / PAGE_SIZE) : 1;
    setCurrentPage(Math.min(currentPage, totalPages));
  }, [files, currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewDetail = () => {
    setShowFileDetail(true);
  };

  const onCloseDetail = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setAutoplay(false);
    setVideoCurrent(null);
    setShowFileDetail(false);
  };

  return (
    <>
      <div className="">
        <div className="flex flex-wrap gap-4">
          {files && files?.length ? (
            files
              ?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              ?.map((item: any, i: number) => {
                return (
                  <div key={i} style={{ height: "max-content" }}>
                    <div
                      key={i}
                      className="searchWord-item "
                      style={{
                        backgroundImage: `url(${
                          item?.vocabularyImageResList[0]?.imageLocation !== ""
                            ? item?.vocabularyImageResList[0]?.imageLocation
                            : "/images/study/defaultvideo.png"
                        })`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div className="searchWord-item-detail">
                        <p
                          style={{
                            fontWeight: "600",
                            fontSize: "28px",
                            marginLeft: "10px",
                          }}
                        >
                          {item?.content}
                        </p>
                      </div>
                      <button
                        className="searchWord-item-play"
                        onClick={() => {
                          handleViewDetail();
                          setFileIndex(i + (currentPage - 1) * PAGE_SIZE);
                        }}
                      >
                        Bấm để xem!!!
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            <Empty
              style={{ width: "100%" }}
              description={`Không có dữ liệu cho .`}
            />
          )}
          {files?.length > PAGE_SIZE && (
            <div className="flex w-full justify-center pb-3">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={files?.length}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showFileDetail}
        footer={null}
        onCancel={onCloseDetail}
        style={{ top: 20 }}
        title={
          <div className="text-[32px] font-bold">
            {files[fileIndex]?.content}
          </div>
        }
        width={1300}
        key={files[fileIndex]?.content}
        centered
      >
        <div className="w-full px-4  ">
          <div className="w-full ">
            <div className="grid grid-cols-3 gap-4">
              {/* image */}
              <div className="col-span-1 flex items-center justify-center">
                <CustomSlider ref={slider} className="w-full" dots={false}>
                  {files[fileIndex]?.vocabularyImageResList?.map(
                    (
                      item: { imageLocation: string | undefined },
                      index: React.Key | null | undefined,
                    ) => (
                      <div key={index}>
                        {item.imageLocation ? (
                          <img
                            src={item.imageLocation}
                            alt="Uploaded"
                            style={{ width: "100%", height: "auto" }}
                          />
                        ) : (
                          <div className="text-center text-xl">
                            Chưa có hình ảnh minh hoạ
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </CustomSlider>
              </div>
              {/* video */}
              <div className="col-span-2">
                {videoCurrent ? (
                  <video
                    key={videoCurrent}
                    controls
                    ref={videoRef}
                    autoPlay={autoplayEnabled}
                    className="w-full"
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
                  files[fileIndex]?.vocabularyImageResList?.length < 2
                    ? "none"
                    : "block",
              }}
              icon={<LeftOutlined />}
              onClick={() => slider.current.prev()}
            />
            <Button
              style={{
                display:
                  files[fileIndex]?.vocabularyImageResList?.length < 2
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
                  currentVideoIndex ===
                  files[fileIndex]?.vocabularyVideoResList?.length - 1
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
            Previous (Lùi lại)
          </ButtonPrimary>
          <ButtonPrimary
            disabled={fileIndex === files?.length - 1}
            onClick={handleNext}
          >
            Next (Kế tiếp)
          </ButtonPrimary>
        </div>
      </Modal>
    </>
  );
};

export default StudyComponent;

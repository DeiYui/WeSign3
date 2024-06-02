import BasicDrawer from "@/components/UI/draw/BasicDraw";
import Learning from "@/model/Learning";
import { useQuery } from "@tanstack/react-query";
import { Collapse, Empty, Form, Image, Modal, Pagination, Radio } from "antd";
import React, { ReactNode, useEffect, useState } from "react";

const PAGE_SIZE = 6;

// Danh sách các đuôi file ảnh
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];

// Hàm kiểm tra đuôi file có thuộc danh sách ảnh hay không
export function isImageLocation(url: string | undefined) {
  for (let ext of imageExtensions) {
    if (url?.toLowerCase().endsWith(ext)) {
      return true;
    }
  }
  return false;
}

interface QuestionModalProps {
  openChooseVideo: boolean;
  setOpenChooseVideo: (value: boolean) => void;
  topicId: number;
  children: ReactNode;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  openChooseVideo,
  setOpenChooseVideo,
  topicId,
  children,
}) => {
  const [currentPageImage, setCurrentPageImage] = useState(1);
  const [currentPageVideo, setCurrentPageVideo] = useState(1);

  // API lấy danh sách từ vựng theo topic
  const { data: listVideoAndImage } = useQuery({
    queryKey: ["listVideo", topicId],
    queryFn: async () => {
      const res = await Learning.getVocabularyTopic(topicId);
      return res.data;
    },
    enabled: !!topicId && openChooseVideo,
  });

  // Làm dữ liệu hiển thị
  const flattenedDataImage = listVideoAndImage?.flatMap((item: any) => {
    const locationsImage: {
      type: number;
      location: string;
      content: string;
    }[] = [];

    if (item.vocabularyImageResList) {
      item.vocabularyImageResList.forEach((image: any) => {
        locationsImage.push({
          type: 1,
          location: image.imageLocation,
          content: image.vocabularyContent,
        });
      });
    }

    return locationsImage;
  });

  const flattenedDataVideo = listVideoAndImage?.flatMap((item: any) => {
    const locationsVideo: {
      type: number;
      location: string;
      content: string;
    }[] = [];

    if (item.vocabularyVideoResList) {
      item.vocabularyVideoResList.forEach((video: any) => {
        locationsVideo.push({
          type: 2,
          location: video.videoLocation,
          content: video.vocabularyContent,
        });
      });
    }

    return locationsVideo;
  });

  // Chia page
  useEffect(() => {
    const totalPagesVideo =
      flattenedDataVideo?.length > PAGE_SIZE
        ? Math.ceil(flattenedDataVideo.length / PAGE_SIZE)
        : 1;
    setCurrentPageVideo(Math.min(currentPageVideo, totalPagesVideo));
  }, [currentPageVideo, flattenedDataVideo]);

  useEffect(() => {
    const totalPagesImage =
      flattenedDataImage?.length > PAGE_SIZE
        ? Math.ceil(flattenedDataImage.length / PAGE_SIZE)
        : 1;
    setCurrentPageImage(Math.min(currentPageImage, totalPagesImage));
  }, [flattenedDataImage, currentPageImage]);

  const items = [
    {
      key: "1",
      label: "Hình ảnh",
      children: (
        <>
          {flattenedDataImage?.length ? (
            <Form.Item name="imageLocation">
              <Radio.Group className="grid grid-cols-3 gap-3 ">
                {flattenedDataImage
                  ?.slice(
                    (currentPageImage - 1) * PAGE_SIZE,
                    currentPageImage * PAGE_SIZE,
                  )
                  ?.map((item: any, i: any) => (
                    <Radio key={i} value={item.location} className="">
                      <div key={i}>
                        {item.type === 1 && (
                          <div className="w-full">
                            <div className="text-xl font-semibold">
                              {item.content}
                            </div>
                            <Image
                              preview={false}
                              src={item.location}
                              alt=""
                              style={{ width: "50%", height: "auto" }}
                            />
                          </div>
                        )}
                      </div>
                    </Radio>
                  ))}
              </Radio.Group>
            </Form.Item>
          ) : (
            <Empty
              style={{ width: "100%" }}
              description={`Không có dữ liệu `}
            />
          )}
          {flattenedDataImage?.length > PAGE_SIZE && (
            <div className="mt-4 flex w-full justify-center">
              <Pagination
                current={currentPageImage}
                pageSize={PAGE_SIZE}
                total={flattenedDataImage?.length}
                onChange={(pageNumber) => setCurrentPageImage(pageNumber)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: "Video",
      children: (
        <>
          {flattenedDataVideo?.length ? (
            <Form.Item name="videoLocation">
              <Radio.Group className="grid grid-cols-3 gap-3 ">
                {flattenedDataVideo
                  ?.slice(
                    (currentPageVideo - 1) * PAGE_SIZE,
                    currentPageVideo * PAGE_SIZE,
                  )
                  ?.map((item: any, i: any) => (
                    <Radio key={i} value={item.location} className="">
                      <div key={i}>
                        {item.type === 2 && (
                          <div className="">
                            <div className="text-xl font-semibold">
                              {item.content}
                            </div>
                            <video controls>
                              <source src={item.location} type="video/mp4" />
                            </video>
                          </div>
                        )}
                      </div>
                    </Radio>
                  ))}
              </Radio.Group>
            </Form.Item>
          ) : (
            <Empty
              style={{ width: "100%" }}
              description={`Không có dữ liệu `}
            />
          )}
          {flattenedDataVideo?.length > PAGE_SIZE && (
            <div className="mt-4 flex w-full justify-center">
              <Pagination
                current={currentPageVideo}
                pageSize={PAGE_SIZE}
                total={flattenedDataVideo?.length}
                onChange={(pageNumber) => setCurrentPageVideo(pageNumber)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="">
        {children}
        <BasicDrawer
          open={openChooseVideo}
          onClose={() => {
            setOpenChooseVideo(false);
          }}
          width={800}
          title="Chọn hình ảnh/video theo chủ đề"
          onOk={() => {
            setOpenChooseVideo(false);
          }}
          destroyOnClose
        >
          <div className="">
            <Collapse
              className="mt-6"
              defaultActiveKey={["1"]}
              items={items}
              bordered={false}
            />
          </div>
        </BasicDrawer>
      </div>
    </>
  );
};

export default QuestionModal;

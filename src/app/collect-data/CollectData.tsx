"use client";

import { CallIcon } from "@/assets/icons";
import ButtonSecondary from "@/components/UI/Button/ButtonSecondary";
import Learning from "@/model/Learning";
import {
  EyeOutlined,
  VideoCameraFilled,
  WarningFilled,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { ReactMediaRecorder } from "react-media-recorder-2";
import {
  Button,
  DatePicker,
  Empty,
  Image,
  Modal,
  Select,
  Table,
  Tooltip,
  message,
} from "antd";

import Webcam from "react-webcam";

import { useRef, useState } from "react";
import UploadModel from "@/model/UploadModel";

interface FilterParams {
  page: number;
  size: number;
  topic: string;
  vocabulary: string;
  ascending?: boolean;
  status: number;
  createdFrom: string;
  createdTo: string;
}

const optionStatus = [
  {
    label: "Đang chờ phê duyệt",
    value: 100,
  },
  {
    label: "Đã phê duyệt",
    value: 200,
  },
  {
    label: "Từ chối",
    value: 300,
  },
];

function normalizeString(inputString: any) {
  let lowercasedString = inputString.toLowerCase();
  let strippedString = lowercasedString
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  let alphanumericString = strippedString.replace(/[^a-z0-9]/g, "");
  return alphanumericString;
}

export default function CollectData() {
  const [filterParams, setFilterParams] = useState<FilterParams>({
    page: 1,
    size: 999999,
    topic: "",
    vocabulary: "",
    ascending: true,
    status: 100,
    createdFrom: "",
    createdTo: "",
  });

  //Modal
  const [showModalPreview, setShowModalPreview] = useState<{
    open: boolean;
    preview: string | undefined;
    type: string;
  }>({ open: false, preview: "", type: "" });

  const [modalVideo, setModalVideo] = useState<{
    open: boolean;
    previewImg: string;
    previewVideo: string;
    type: string;
    vocabularyContent?: string;
  }>({
    open: false,
    previewImg: "",
    previewVideo: "",
    type: "",
    vocabularyContent: "",
  });

  const videoRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);

  // Quay video
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimerId, setRecordingTimerId] = useState(null);

  // API lấy danh sách  table
  const { data: allTableData } = useQuery({
    queryKey: ["getTableDataVolunteer", filterParams],
    queryFn: async () => {
      const res = await Learning.getTableDataVolunteer(filterParams);
      return res?.data || [];
    },
    enabled: !modalVideo.open,
  });

  // API lấy danh sách  topics
  const { data: allTopics } = useQuery({
    queryKey: ["getAllTopics"],
    queryFn: async () => {
      const res = await Learning.getAllTopics();
      return res?.data?.map((item: { topicId: any; content: any }) => ({
        id: item.topicId,
        value: item.topicId,
        label: item.content,
        text: item.content,
      }));
    },
  });

  // API lấy danh sách từ theo topics
  const { data: allVocabulary } = useQuery({
    queryKey: ["getVocabularyTopic", filterParams.topic],
    queryFn: async () => {
      const res = await Learning.getVocabularyTopic(filterParams.topic);
      if (res?.data) {
        return res?.data?.map(
          (item: {
            vocabularyId: any;
            content: any;
            vocabularyImageResList: any;
            vocabularyVideoResList: any;
          }) => ({
            id: item.vocabularyId,
            value: item.vocabularyId,
            label: item.content,
            vocabularyImageResList: item.vocabularyImageResList,
            vocabularyVideoResList: item.vocabularyVideoResList,
          }),
        );
      }
      return [];
    },
    enabled: !!filterParams.topic,
  });

  const columns = [
    {
      title: "Chủ đề",
      dataIndex: "topicContent",
      width: "10%",
    },
    {
      title: "Từ vựng",
      dataIndex: "vocabularyContent",
      width: "10%",
    },
    {
      title: "Người đăng",
      dataIndex: "volunteerEmail",
      width: "20%",
    },
    {
      title: "Ngày đăng",
      dataIndex: "created",
      width: "20%",
      render: (text: string | number | Date) => (
        <span>
          {new Date(text).getHours()}:{new Date(text).getMinutes()}{" "}
          {new Date(text).getDate()}/{new Date(text).getMonth() + 1}/
          {new Date(text).getFullYear()}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "20%",
      render: (status: number) =>
        status === 100 ? (
          <div style={{ display: "table" }}>
            <div style={{ display: "table-cell", verticalAlign: "top" }}>
              <div
                className="dot-status"
                style={{ border: `1px solid gray`, backgroundColor: "gray" }}
              ></div>
            </div>
            <div
              style={{ display: "table-cell", verticalAlign: "top" }}
              className="inline-block"
              data-tooltip="true"
            >
              Đang chờ xét duyệt
            </div>
          </div>
        ) : status === 300 ? (
          <div style={{ display: "table" }}>
            <div style={{ display: "table-cell", verticalAlign: "top" }}>
              <div
                className="dot-status"
                style={{ border: `1px solid red`, backgroundColor: "red" }}
              ></div>
            </div>
            <div
              style={{ display: "table-cell", verticalAlign: "top" }}
              className="inline-block"
              data-tooltip="true"
            >
              Từ chối
            </div>
          </div>
        ) : (
          <div style={{ display: "table" }}>
            <div style={{ display: "table-cell", verticalAlign: "top" }}>
              <div
                className="dot-status"
                style={{ border: `1px solid grean`, backgroundColor: "green" }}
              ></div>
            </div>
            <div
              style={{ display: "table-cell", verticalAlign: "top" }}
              className="inline-block"
              data-tooltip="true"
            >
              Đã xét duyệt
            </div>
          </div>
        ),
    },
    {
      title: "Xem lại",
      dataIndex: "dataLocation",
      key: "dataLocation",
      width: "20%",
      render: (text: string) => (
        <>
          <Button
            key={text}
            icon={<EyeOutlined style={{ fontSize: "1.25rem" }} />}
            onClick={() =>
              setShowModalPreview({ open: true, preview: text, type: "image" })
            }
          >
            Xem lại
          </Button>
        </>
      ),
    },
  ];

  // quay vide
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  // Bắt đầu quay
  const handleStartRecording = (startRecording: any) => {
    startRecording();
    const timerId = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    setRecordingTimerId(timerId as any);
  };

  // Dừng quay
  const handleStopRecording = (stopRecording: any) => {
    stopRecording();
    clearInterval(recordingTimerId as any);
    setRecordingTime(0);
    message.success("Video đã được lưu. Bạn có thể xem lại video ");
    setShowModalPreview({
      ...showModalPreview,
      type: "video",
    });
  };

  // Tải file lên
  const convertToBlob = async (base64Data: string | URL | Request) => {
    const response = await fetch(base64Data);
    const blob: any = await response.blob();
    const metadata = { type: blob.type, lastModified: blob.lastModified };
    const file = new File([blob], `captured_image_${Date.now()}.jpg`, metadata);
    return file;
  };

  const handleDownload = async () => {
    try {
      let link = "";
      const formData = new FormData();
      if (showModalPreview.type === "image") {
        const file = await convertToBlob(showModalPreview.preview as any);
        formData.append("file", file);
        link = await UploadModel.uploadFile(formData);
      } else {
        const response = await fetch(showModalPreview.preview as any);
        const blob: any = await response.blob();
        const metadata = { type: blob.type, lastModified: blob.lastModified };
        const file = new File(
          [blob],
          `volunteer_${modalVideo.vocabularyContent}_${Date.now()}.mp4`,
          metadata,
        );
        formData.append("file", file);
        link = await UploadModel.uploadFile(formData);
      }
      if (link) {
        try {
          const data = {
            videoUrl: link,
          };
          let response = await UploadModel.checkAI(data);

          let body = {
            dataLocation: link,
            vocabularyId: filterParams.vocabulary,
          };
          await Learning.sendData(body);

          if (
            normalizeString(response.content) ===
            normalizeString(modalVideo.vocabularyContent)
          ) {
            message.success(
              `Thêm dữ liệu cho ${modalVideo.vocabularyContent} thành công.`,
            );
          } else {
            message.error(
              `AI nhận diện dữ diệu không hợp lệ (là ${response.content}), vui lòng thử lại`,
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.error("Error fetching and converting to file:", error);
    }
  };

  console.log("modalVideo.previewVideo", modalVideo.previewVideo);

  return (
    <div className="">
      {/* Heding */}
      <div className="mb-4 flex items-center gap-2 text-xl font-bold">
        <VideoCameraFilled /> Danh sách nội dung tình nguyện viên đăng tải
      </div>

      {/* filter */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          className="w-full"
          allowClear
          placeholder="Chọn chủ đề"
          options={allTopics}
          onChange={(value, option: any) =>
            setFilterParams({ ...filterParams, topic: value })
          }
        />
        <Select
          className="w-full"
          allowClear
          placeholder="Chọn từ vựng"
          options={allVocabulary}
          onChange={(value) =>
            setFilterParams({ ...filterParams, vocabulary: value })
          }
        />
        <Select
          className="w-full"
          allowClear
          placeholder="Trạng thái"
          options={optionStatus}
          onChange={(e) => setFilterParams({ ...filterParams, status: e })}
        />
        <DatePicker
          className="w-full"
          format="DD/MM/YYYY"
          placeholder="Thời gian đăng từ"
          allowClear
          onChange={(e: any) => {
            const year = e?.$y;
            const month = (e?.$M + 1).toString().padStart(2, "0");
            const day = e?.$D.toString().padStart(2, "0");
            setFilterParams({
              ...filterParams,
              createdTo: `${year}-${month}-${day}`,
            });
          }}
        />
        <DatePicker
          className="w-full"
          format="DD/MM/YYYY"
          placeholder="Thời gian đăng đến"
          allowClear
          onChange={(e: any) => {
            const year = e?.$y || 2000;
            const month = (e?.$M + 1).toString().padStart(2, "0");
            const day = e?.$D?.toString().padStart(2, "0") || "01";
            setFilterParams({
              ...filterParams,
              createdFrom: `${year}-${month}-${day}`,
            });
          }}
        />
      </div>
      <div className="w-full text-right">
        <ButtonSecondary
          onClick={() => setModalVideo({ ...modalVideo, open: true })}
          className="mt-2 flex items-center justify-end  gap-2 border border-neutral-300  p-2"
        >
          <CallIcon /> Quay video
        </ButtonSecondary>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-lg bg-white p-4">
        <Table
          dataSource={allTableData}
          columns={columns}
          locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
        />
      </div>

      {/* Modal quay video */}
      <Modal
        title="Quay video dành cho tình nguyện viên"
        open={modalVideo?.open}
        onCancel={() => {
          setModalVideo({ ...modalVideo, open: false });
          setFilterParams({
            page: 1,
            size: 999999,
            topic: "",
            vocabulary: "",
            ascending: true,
            status: 0,
            createdFrom: "",
            createdTo: "",
          });
        }}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <div className="flex items-start gap-3">
          <div className="w-1/2">
            <div className="mb-2 text-center text-xl font-semibold">
              Dữ liệu mẫu
            </div>
            <div className="flex gap-4">
              <Select
                className="w-full"
                allowClear
                placeholder="Chọn chủ đề"
                options={allTopics}
                onChange={(value, option: any) =>
                  setFilterParams({ ...filterParams, topic: value })
                }
              />
              <Select
                className="w-full"
                allowClear
                placeholder="Chọn từ vựng"
                options={allVocabulary}
                onChange={(value, option: any) => {
                  if (value) {
                    option?.vocabularyImageResList.sort(
                      (a: { primary: any }, b: { primary: any }) => {
                        // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
                        return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
                      },
                    );
                    option?.vocabularyVideoResList.sort(
                      (a: { primary: any }, b: { primary: any }) => {
                        // Sắp xếp sao cho phần tử có primary = true được đặt lên đầu
                        return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
                      },
                    );
                    setFilterParams({ ...filterParams, vocabulary: value });
                    setModalVideo((prevModalVideo) => ({
                      ...prevModalVideo,
                      previewImg:
                        option?.vocabularyImageResList[0]?.imageLocation,
                      previewVideo:
                        option?.vocabularyVideoResList[0]?.videoLocation,
                      vocabularyContent: option.label,
                    }));
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play();
                    }
                  } else {
                    setModalVideo({
                      ...modalVideo,
                      previewImg: "",
                      previewVideo: "",
                    });
                  }
                }}
              />
            </div>
            {/* Button lựa chọn hiển kiểu dữ liệu mẫu */}
            <div className="mt-4  flex items-center gap-2">
              <ButtonSecondary
                onClick={() => setModalVideo({ ...modalVideo, type: "video" })}
                fontSize="text-sm"
                sizeClass="px-3 py-2"
                className="border border-neutral-400"
              >
                Dữ liệu mẫu theo video
              </ButtonSecondary>
              <ButtonSecondary
                onClick={() => setModalVideo({ ...modalVideo, type: "image" })}
                fontSize="text-sm"
                sizeClass="px-3 py-2"
                className="border border-neutral-400"
              >
                Dữ liệu mẫu theo ảnh
              </ButtonSecondary>
            </div>
            {/* Dữ liệu mẫu */}
            <div className="justify-s= mt-3 flex items-start ">
              {modalVideo.type === "image" && modalVideo.previewImg && (
                <Image
                  src={modalVideo.previewImg}
                  alt="Uploaded"
                  style={{ width: 300, height: 300 }}
                  className="flex items-start justify-start"
                />
              )}
              {modalVideo.type === "video" && modalVideo.previewVideo && (
                <video
                  ref={videoRef}
                  controls
                  style={{ width: 800 }}
                  className="flex items-start justify-start"
                >
                  <source src={modalVideo.previewVideo} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
          <div className="w-1/2">
            <Webcam
              mirrored={true}
              style={{ width: "100%" }}
              audio={false}
              ref={webcamRef}
            />
            <div className="mt-3">
              <ReactMediaRecorder
                video={true}
                render={({
                  status,
                  startRecording,
                  stopRecording,
                  mediaBlobUrl,
                }) => (
                  <div>
                    <p>Recording Status: {status}</p>
                    <Button
                      onClick={() => handleStartRecording(startRecording)}
                      disabled={
                        status === "idle" ||
                        !modalVideo.previewImg ||
                        !modalVideo.previewVideo
                      }
                      icon={
                        <Tooltip
                          title="Thời gian tối đa cho mỗi video là 5s."
                          placement="top"
                          trigger="hover"
                          color="#4096ff"
                        >
                          <WarningFilled style={{ color: "#4096ff" }} />
                        </Tooltip>
                      }
                    >
                      Bắt đầu quay{" "}
                      {recordingTime !== 0 && (
                        <p style={{ color: "red" }}>
                          {formatTime(recordingTime)}
                        </p>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleStopRecording(stopRecording)}
                      disabled={status !== "recording"}
                    >
                      Dừng quay
                    </Button>
                    <Button
                      onClick={() => {
                        setShowModalPreview({
                          ...showModalPreview,
                          preview: webcamRef.current.getScreenshot(),
                          type: "image",
                        });
                        message.success("Chụp ảnh thành công");
                      }}
                    >
                      Chụp ảnh
                    </Button>
                    <Button>Tải lên</Button>
                    <Button
                      disabled={!mediaBlobUrl}
                      onClick={() => {
                        if (showModalPreview.type === "image") {
                          setShowModalPreview({
                            ...showModalPreview,
                            open: true,
                          });
                        } else {
                          setShowModalPreview({
                            ...showModalPreview,
                            open: true,
                            preview: mediaBlobUrl,
                          });
                        }
                      }}
                    >
                      Xem lại file
                    </Button>
                  </div>
                )}
              />

              {/* {duration && <p>Thời gian quay: {duration.toFixed(2)} giây</p>} */}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal xem lại */}
      <Modal
        open={showModalPreview.open}
        onCancel={() =>
          setShowModalPreview({ ...showModalPreview, open: false })
        }
        footer={null}
        title={
          showModalPreview.type === "image" ? "Xem lại ảnh: " : "Xem lại video"
        }
      >
        {!(showModalPreview.type === "image") ? (
          <div>
            <video controls width="100%">
              <source src={showModalPreview.preview} type="video/webm" />
              video không hỗ trợ cho trình duyệt này.
            </video>
          </div>
        ) : (
          <div>
            <Image
              preview={false}
              src={showModalPreview.preview}
              alt="Captured"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

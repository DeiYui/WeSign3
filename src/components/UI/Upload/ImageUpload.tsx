import UploadModel from "@/model/UploadModel";
import { Modal, Upload, message } from "antd";
import { isFunction } from "lodash";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

/** Kiểu dữ liệu của component upload hình ảnh */
interface ImageUploadProps {
  // Giá trị đầu vào
  value?: any[];
  // Function thay đổi giá trị đầu vào
  onChange?: (value: any) => void;
  // Số ảnh tối đa được upload
  limit?: number;
}

const uploadButton = (
  <button
    className="flex flex-col items-center justify-center gap-y-2 border-none bg-none"
    type="button"
  >
    <div className="caption-12-medium text-neutral1100">Tải lên</div>
  </button>
);

const ITEM_DISPLAY = 2;

/** Component upload ảnh */
export const ImageUpload: FC<ImageUploadProps> = ({
  value,
  onChange,
  limit,
}) => {
  /** Danh sách ảnh đã upload */
  const [imageList, setImageList] = useState<any[]>([]);

  /** Xử lý convert dữ liệu đầu vào thành danh sách ảnh hiển thị */
  const fileList: any[] = useMemo(
    () =>
      imageList.map((image) => ({
        ...image,
      })),
    [imageList],
  );

  /** Kiểm tra xem có được phép upload thêm ảnh hay không */
  const canUpload: boolean = useMemo(
    () => !limit || (limit > 0 && imageList.length < limit),
    [limit, imageList],
  );

  /** Xử lý validate định dạng ảnh */
  const validateImg: (file: File) => boolean = useCallback((file) => {
    // Lấy định dạng file
    const fileExtension = file.name.split(".")?.pop()?.toLowerCase() || "";
    // Danh sách định dạng được phép upload
    const imageExtensionList = ["jpeg", "png", "jpg", "webp"];
    // Kiểm tra định dạng file có thỏa mãn không
    const viableExtension = imageExtensionList.includes(fileExtension);
    // Kiểm tra kích thước file có thỏa mãn không
    const viableSize = file.size / 1024 / 1024 < 10;
    // Nếu định dạng không thỏa mãn thì thông báo sai định dạng
    if (!viableExtension)
      message
        .error(
          "Ảnh tải lên định dạng JPEC, JPG, PNG, WEBP dung lượng tối đa 10 MB",
        )
        .then();
    // Nếu kích thước không thỏa mãn thì thông báo sai kích thước
    if (!viableSize)
      message
        .error(
          "Ảnh tải lên định dạng JPEC, JPG, PNG, WEBP dung lượng tối đa 10 MB",
        )
        .then();
    // Trả về kết quả file upload có hợp lệ hay không
    return viableExtension && viableSize;
  }, []);

  /** Xử lý upload ảnh */
  const handleUpload: (value: { file: File }) => void = useCallback(
    ({ file }) => {
      // Kiểm tra định dạng file
      if (validateImg(file)) {
        const formData = new FormData();
        formData.append("file", file);
        UploadModel.uploadFile(formData).then((res) => {
          if (isFunction(onChange)) onChange([...imageList, res]);
          else setImageList([...imageList, res]);
        });
      }
    },
    [onChange, imageList],
  );

  /** Xử lý bỏ ảnh upload */
  const handleRemove: (file: { id: number } | any) => void = useCallback(
    (file) => {
      const newImageList = imageList.filter((image) => image.id !== file.id);
      if (isFunction(onChange)) onChange(newImageList);
      else setImageList(newImageList);
    },
    [onChange, imageList],
  );

  /** Xử lý đặt lại giá trị của danh sách ảnh khi giá trị đầu vào thay đổi */
  useEffect(() => setImageList(value || []), [value]);

  /** Thông tin của popup preview ảnh */
  const [preview, setPreview] = useState<{
    open: boolean;
    image: string;
    title: string;
  }>({
    open: false,
    image: "",
    title: "",
  });

  /** Đóng popup preview ảnh */
  const handleCancel: () => void = useCallback(
    () => setPreview({ open: false, image: "", title: "" }),
    [],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <CustomUpload
          listType="picture-card"
          fileList={fileList}
          showUploadList={false}
          customRequest={handleUpload as any}
          onRemove={handleRemove}
          accept="image/*"
        >
          {canUpload && uploadButton}
        </CustomUpload>
        {fileList?.length > 0 &&
          fileList?.slice(0, ITEM_DISPLAY).map((e: any, index: number) => (
            <div key={index} className="relative ">
              <img className="h-20 w-20 rounded-lg" src={e.thumbUrl} />
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center gap-1 bg-[#1f1c1c] opacity-0 transition-opacity duration-300 hover:opacity-70">
                <span
                  className=""
                  onClick={() =>
                    setPreview({
                      open: true,
                      image: e.thumbUrl,
                      title: e.fileName,
                    })
                  }
                >
                  {/* <ViewIcon color="white" /> */}
                </span>
                <span className="" onClick={() => handleRemove(e)}>
                  {/* <Delete1Icon color="white" /> */}
                </span>
              </div>
            </div>
          ))}

        {fileList?.length > ITEM_DISPLAY && (
          <div className="relative">
            <img
              className="h-20 w-20 rounded-lg"
              src={fileList[ITEM_DISPLAY]?.thumbUrl}
            />
            <div
              className="headline-16-semibold absolute  inset-0 flex items-center  
                  justify-center  rounded-xl text-white"
              style={{ background: "rgba(12, 12, 12, 0.7)" }}
            >
              + {imageList?.length - ITEM_DISPLAY}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={preview.open}
        title={preview.title}
        footer={null}
        onCancel={handleCancel}
      >
        <img
          alt="example"
          style={{
            width: "100%",
          }}
          src={preview.image}
        />
      </Modal>
    </>
  );
};

const CustomUpload = styled(Upload)`
  .ant-upload.ant-upload-select {
    width: 80px !important;
    height: 80px !important;
    .ant-upload {
      display: flex !important;
    }
  }
`;

import { FC } from "react";
import { CheckCircleTwoTone } from "@ant-design/icons";

const HomePage: FC = () => {
  return (
    <div style={{ backgroundColor: "white" }} className="h-full w-full p-15">
      <div className="text-24 mb-20 text-center font-semibold">
        Tính năng dành cho người dùng
      </div>
      <div className="text-16 text-center font-medium">
        WeTalk cung cấp tính năng kiểm tra nhằm giúp người dùng luyện tập vốn từ
        vựng ngôn ngữ ký hiệu nhanh chóng.
      </div>
      <div className="mt-4 flex">
        <div className="mr-8 flex w-full flex-col">
          <div className="mb-15 flex items-start">
            <CheckCircleTwoTone
              style={{
                fontSize: "1.2rem",
                marginRight: "5px",
                position: "relative",
                top: "5px",
              }}
            />
            <div>
              <p className="text-16 font-medium">Giao diện thân thiện</p>
              <p>
                Giao diện câu hỏi và câu trả lời dễ nhìn, dễ hiểu, dễ thao tác
                với mọi đối tượng người dùng.
              </p>
            </div>
          </div>
          <div className="mb-15 flex items-start">
            <CheckCircleTwoTone
              style={{
                fontSize: "1.2rem",
                marginRight: "5px",
                position: "relative",
                top: "5px",
              }}
            />
            <div>
              <p className="text-16 font-medium">Tự do chủ đề</p>
              <p>Người dùng có thể tự do lựa chọn chủ đề câu hỏi cho mình.</p>
            </div>
          </div>
          <div className="mb-15 flex items-start">
            <CheckCircleTwoTone
              style={{
                fontSize: "1.2rem",
                marginRight: "5px",
                position: "relative",
                top: "5px",
              }}
            />
            <div>
              <p className="text-16 font-medium">Đa phương tiện</p>
              <p>Câu hỏi có cả ở dạng ảnh và video, linh hoạt tùy nội dung.</p>
            </div>
          </div>
          <div className="mb-15 flex items-start">
            <CheckCircleTwoTone
              style={{
                fontSize: "1.2rem",
                marginRight: "5px",
                position: "relative",
                top: "5px",
              }}
            />
            <div>
              <p className="text-16 font-medium">Bảo mật kết quả</p>
              <p>
                Bài thi chỉ mang tính chất luyện tập, rèn luyện vốn từ. Vì vậy
                sau khi thi chỉ có thể xem lại kết quả 1 lần duy nhất.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleTwoTone
              style={{
                fontSize: "1.2rem",
                marginRight: "5px",
                position: "relative",
                top: "5px",
              }}
            />
            <div>
              <p className="text-16 font-medium">Thư viện câu hỏi mở</p>
              <p>
                Luôn Luôn sẵn sàng tiếp nhận các câu hỏi tạo bởi người dùng và
                thêm vào thư viện câu hỏi chung.
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center">
          <img
            src={"/images/examBlank.png"}
            alt="blank"
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

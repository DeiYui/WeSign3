/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Exam extends Base {
  // Danh sách bài kiểm tra
  getLstExam = async (body?: any) => {
    const res = await this.apiPost(`/exams/all-exams`, body);
    return res.data;
  };

  // Thêm bài kiểm tra
  addExam = async (body?: any) => {
    const res = await this.apiPost(`/exams`, body);
    return res.data;
  };
}

export default new Exam("learning-service");

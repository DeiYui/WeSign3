/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Exam extends Base {
  // Danh sách bài kiểm tra
  getLstExam = async (body?: any) => {
    return this.apiPost("/exams/all-exams", body);
  };

  // Danh sách bài kiểm tra cho user
  getLstExamUser = async (params?: any) => {
    const res = await this.apiGet(`/exams/all-exams-of-user`, params);
    return res.data;
  };

  // Thêm bài kiểm tra
  addExam = async (body?: any) => {
    const res = await this.apiPost(`/exams`, body);
    return res.data;
  };

  // Thêm bài kiểm tra cho user
  addExamForUser = async (body?: any) => {
    const res = await this.apiPost(`/exams/exams-for-user`, body);
    return res.data;
  };
}

export default new Exam("learning-service");

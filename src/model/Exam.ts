/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Exam extends Base {
  // Danh sách bài kiểm tra
  getLstExam = async (param?: any) => {
    const res = await this.apiGetWithoutPrefixNode("/exam/all-exams", param);
    return res;
  };

  // Danh sách bài kiểm tra cho user
  getLstExamUser = async (params?: any) => {
    const res = await this.apiGet(`/exams/all-exams-of-user`, params);
    return res.data;
  };

  // Chỉnh sửa bài kiểm tra
  editExams = async (body?: any) => {
    const res = await this.apiPut(`/exams`, body);
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

  // Chi tiết bài kiểm tra
  getDetailExam = async (id: number) => {
    const res = await this.apiGet(`/exams/${id}`);
    return res.data;
  };

  // Chấm điểm bài kiểm tra
  markExam = async (body: any) => {
    const res = await this.apiPostWithoutPrefixNode(`/exam/exam-scoring`, body);
    console.log('score', res)
    return res.config.data;
  };

  // Lưu kết quả câu hỏi bài kiểm tra
  saveExam = async (body: any) => {
    const res = await this.apiPost(`/exams/exam-saved`, body);
    return res.data;
  };

  // Chi tiết bài kiểm tra đã lưu
  getDetailExamSave = async (examId: any) => {
    const res = await this.apiGet(`/exams/exam-saved/${examId}`);
    return res.data;
  };
  
  // Xoá bài kiểm tra
  deleteExam = async (id: number) => {
    const res = await this.apiDelete(`/exams/${id}`);
    return res.data;
  };

  // Xoá bài kiểm tra cho user
  deleteExamUser = async (id: number) => {
    const res = await this.apiDelete(`/exams/delete-exam-of-user/${id}`);
    return res.data;
  };

  // Reset bài kiểm tra để làm lại
  resetExam = async (examId: number, body?: any) => {
    const res = await this.apiPostWithoutPrefixNode(`/exam/reset/${examId}`, body);
    console.log('reset', res)
    return res.data;
  };

  // Lấy lịch sử làm bài kiểm tra
  getExamHistory = async (examId: number) => {
    const res = await this.apiGet(`/exams/history/${examId}`);
    return res.data;
  };
}

export default new Exam("learning-service");
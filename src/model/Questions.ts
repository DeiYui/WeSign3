/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Questions extends Base {
  // Danh sách câu hỏi
  getQuestionTopic = async (params?: any) => {
    const res = await this.apiGet(`/questions/limits-topic/v2`, params);
    return res.data;
  };

  // danh sách câu hỏi limit
  getLimitQuestionTopic = async (params?: any) => {
    const res = await this.apiGet(`/questions/limits-topic/v2`, params);
    return res.data;
  };

  // Tạo câu hỏi
  addQuestion = async (body?: any) => {
    const res = await this.apiPost(`/questions/add-list`, body);
    return res.data;
  };

  // Sửa câu hỏi
  editQuestion = async (body?: any) => {
    const res = await this.apiPut(`/questions`, body);
    return res.data;
  };

  // Xoá câu bỏi
  deleteQuestion = async (id?: number) => {
    const res = await this.apiDelete(`/questions/${id}`);
    return res.data;
  };
}

export default new Questions("learning-service");

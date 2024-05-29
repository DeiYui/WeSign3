/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Learning extends Base {
  // Danh sách topic
  getAllTopics = async () => {
    const res = await this.apiGet("/topics/all");
    return res.data;
  };

  // Tìm kiếm chủ đề
  searchTopics = async (params: any) => {
    const res = await this.apiGet("/topics/search/v2", params);
    return res.data;
  };

  // Thêm mới topics
  addTopics = async (body: any) => {
    const res = await this.apiPost("/topics", body);
    return res.data;
  };

  // Chỉnh sửa topics
  editTopics = async (body: any) => {
    const res = await this.apiPut("/topics", body);
    return res.data;
  };

  // Xoá chủ đề
  deleteTopics = async (id: any) => {
    const res = await this.apiDelete(`/topics/${id}`);
    return res.data;
  };

  // Danh sách từ vựng
  getAllVocabulary = async (param?: any) => {
    const res = await this.apiGet("/vocabularies/all", param);
    return res.data;
  };

  // Danh sách từ vựng theo topics
  getVocabularyTopic = async (topicId: number | string) => {
    const res = await this.apiGet(`/vocabularies/${topicId}`);
    return res.data;
  };

  // Tìm kiếm tử
  searchVocabulary = async (params: any) => {
    const res = await this.apiPost(`/vocabularies/search`, params);
    return res.data;
  };

  // Danh sách nội dung tình nguyện viền đăng
  getTableDataVolunteer = async (params: any) => {
    const res = await this.apiGet(`/data-collection/search-for-me/v2`, params);
    return res.data;
  };

  // Thêm data tình nguyện viên đăng
  sendData = async (body: any) => {
    const res = await this.apiPost(`/data-collection`, body);
    return res.data;
  };
}

export default new Learning("learning-service");

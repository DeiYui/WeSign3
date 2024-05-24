/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Learning extends Base {
  // Danh sách topic
  getAllTopics = async () => {
    const res = await this.apiGet("/topics/all");
    return res.data;
  };

  // Danh sách từ vựng theo topics
  getVocabularyTopic = async (topicId: number) => {
    const res = await this.apiGet(`/vocabularies/${topicId}`);
    return res.data;
  };

  // Tìm kiếm tử
  searchVocabulary = async (params: any) => {
    const res = await this.apiPost(`/vocabularies/search`, params);
    return res.data;
  };
}

export default new Learning("learning-service");

/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Questions extends Base {
  // Danh sách câu hỏi
  getQuestionTopic = async (params?: any) => {
    const res = await this.apiGet(`/questions/limits-topic/v2`, params);
    return res.data;
  };
}

export default new Questions("learning-service");

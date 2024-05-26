/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class Conversations extends Base {
  // Thông tin cá nhân
  getConversations = async () => {
    const res = await this.apiGet("/conversations/all-me");
    return res.data;
  };
  // lấy thông tin hội thoại
  getMessage = async (id: number) => {
    const res = await this.apiGet(`/messages/${id}`);
    return res.data;
  };
  // Lấy hội thoại
  getConversationContactId = async (contactId: number) => {
    const res = await this.apiGet(`/conversations/${contactId}`);
    return res.data;
  };
}

export default new Conversations("service-chat");

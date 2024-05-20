/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class User extends Base {
  // thông tin cá nhân
  getProfile = async () => {
    const res = await this.apiGet("/users/me/v2");
    return res.data;
  };

  // Thông tin người dùng chi tiết
  getUserInfo = async (id: number) => {
    const res = await this.apiGet(`/users/${id}`);
    return res.data;
  };

  // Tìm kiếm bạn bè
  searchFriend = async (param: any) => {
    const res = await this.apiGet(`/users/search/v2`, param);
    return res.data;
  };

  // Danh sách bạn bè
  getLstFriend = async (param?: any) => {
    const res = await this.apiGet(`/friend-ship/friend-list`, param);
    return res.data;
  };

  // Lời mời kết bạn
  getLstRequest = async (param?: any) => {
    const res = await this.apiGet(`/friend-ship/request-list`, param);
    return res.data;
  };

  // Lời mời đã gửi
  getLstSending = async (param?: any) => {
    const res = await this.apiGet(`/friend-ship/sending-list`, param);
    return res.data;
  };
}

export default new User("user-service");

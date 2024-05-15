/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class User extends Base {
  // thông tin cá nhân
  getProfile = async () => {
    const res = await this.apiGet("users/me/v2");
    return res.data;
  };
}

export default new User("user-service");

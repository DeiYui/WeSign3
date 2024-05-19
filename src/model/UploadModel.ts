/* eslint-disable import/no-anonymous-default-export */
import { Base } from "./Base";

class UploadModel extends Base {
  // upload
  uploadFile = async (body: FormData) => {
    const res = await this.apiUploadFile("/api/upload", body);
    return res.data;
  };
}

export default new UploadModel("data-collection-service");

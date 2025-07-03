import http from "@/utils/api/http";

export const API_ROOT = process.env.NEXT_PUBLIC_API_ROOT;
export const API_ROOT_NODE = process.env.NEXT_PUBLIC_API_ROOT_NODE;
export const API_SOCKET = process.env.NEXT_PUBLIC_API_SOCKET;
export class Base {
  private readonly apiRoot: string | undefined;
  private readonly apiRootNode: string | undefined;
  private readonly apiPrefix: string | undefined;
  private readonly apiPrefixNode: string | undefined;

  constructor(apiPrefix: string | null = null) {
    this.apiRoot = API_ROOT;
    this.apiRootNode = API_ROOT_NODE + "/api";
    this.apiPrefix = `${API_ROOT}/${apiPrefix}`;
    this.apiPrefixNode = `${API_ROOT_NODE}/api/${apiPrefix}`;
  }

  normalizeQuery = (query: { [x: string]: any }) => {
    const formatQuery: Record<string, any> = {};
    Object.keys(query).forEach((key) => {
      if (query[key]) {
        if (typeof query[key] === "string") {
          formatQuery[key] = query[key].trim();
        } else if (!Number.isNaN(query[key])) {
          formatQuery[key] = query[key];
        }
      }
    });

    return formatQuery;
  };

// GET
  apiGet = (url: string, query = {}, signal?: any) =>
    http.get(`${this.apiPrefix}${url}`, {
      params: this.normalizeQuery(query),
      signal,
    });

  // NodeJS
  apiGetNode = (url: string, query = {}, signal?: any) =>
    http.get(`${this.apiPrefixNode}${url}`, {
      params: this.normalizeQuery(query),
      signal,
    });

  apiGetWithoutPrefix = (url: string, query = {}, signal?: any) =>
    http.get(`${this.apiRoot}${url}`, {
      params: this.normalizeQuery(query),
      signal,
    });

  // apiGetWithoutPrefixNode = (url: string, query = {}, signal?: any) =>
  //   http.get(`${this.apiRootNode}${url}`, {
  //     params: this.normalizeQuery(query),
  //     signal,
  //   }); 
  apiGetWithoutPrefixNode = (
    url: string,
    query: any = {},
    signal?: any,
    headers: any = {}
  ) => {
    return http.get(`${this.apiRootNode}${url}`, {
      params: this.normalizeQuery(query),
      signal,
      headers,
    });
  };

// POST
  // Java
  apiPost = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiPrefix}${url}`, body, { signal });

  // NodeJS
  apiPostNode = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiPrefixNode}${url}`, body, { signal });

  apiPostWithoutPrefix = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiRoot}${url}`, body, { signal });

  apiPostWithoutPrefixNode = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiRootNode}${url}`, body, { signal });

// PUT
  //Java
  apiPut = (url: string, body: any, signal?: any) =>
    http.put(`${this.apiPrefix}${url}`, body, { signal });

  //NodeJS
  apiPutNode = (url: string, body: any, signal?: any) =>
    http.put(`${this.apiPrefixNode}${url}`, body, { signal });

  apiPutWithoutPrefix = (url: any, body?: any, signal?: any) =>
    http.put(`${this.apiRoot}${url}`, body, { signal });

  apiPutWithoutPrefixNode = (url: string, body?: any, signal?: any) =>
    http.put(`${this.apiRootNode}${url}`, body, { signal });

// DELETE
  // Java
  apiDelete = (url = {}, signal?: any) =>
    http.delete(`${this.apiPrefix}${url}`, { signal });

  apiDeleteBody = (url = "", body: any, signal?: any) => {
    return http.delete(`${this.apiPrefix}${url}`, {
      data: body,
      signal,
    });
  };

  // NodeJS
  apiDeleteNode = (url: string, signal?: any) =>
    http.delete(`${this.apiPrefixNode}${url}`, { signal });

  apiDeleteBodyNode = (url = "", body: any, signal?: any) => {
    return http.delete(`${this.apiRootNode}${url}`, {
      data: body,
      signal,
    });
  };

  apiDeleteWithoutPrefix = (url = {}, signal?: any) =>
    http.delete(`${this.apiRoot}${url}`, { signal });

  apiDeleteWithoutPrefixNode = (url = {}, signal?: any) =>
    http.delete(`${this.apiRootNode}${url}`, { signal });

  apiUploadFile = (url: string, body: any) =>
    http.post(`${this.apiPrefix}${url}`, body, {});

  apiUploadFileNode = (url: string, body: any) =>
    http.post(`${this.apiPrefixNode}${url}`, body, {});

  apiPostUpload = (url: string, body: any) =>
    http.post(`${this.apiPrefix}${url}`, body, {
      headers: {
        "Content-Type":
          "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
      },
      responseType: "blob",
    });

    apiPostUploadNode = (url: string, body: any) =>
      http.post(`${this.apiPrefixNode}${url}`, body, {
        headers: {
          "Content-Type":
            "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
        },
        responseType: "blob",
      });
}

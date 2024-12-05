import axios from "axios";

const server = axios.create({
  baseURL: "http://111.229.210.27", // 替换为你后端的 URL
  headers: {
    "Content-Type": "application/json",
  },
});

interface LoginResponseSuccess {
  success: true;
  username: string;
  jwt: string;
}

interface LoginResponseFailure {
  success: false;
  error: string;
}

// 使用联合类型来合并成功和失败的类型
type LoginResponse = LoginResponseSuccess | LoginResponseFailure;

// 创建一个包含用户相关 API 请求的对象
const userAPI = {
  // 登录方法
  login(username: string, password: string): Promise<LoginResponse> {
    const credentials = { username, password };
    return server
      .post("/api/v1/login/", credentials)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          return {
            success: true,
            username: username,
            jwt: response.data.access,
          } as LoginResponseSuccess; // 登录成功时返回数据
        }
        return {
          success: false,
          error: response.statusText || "Unknown error",
        } as LoginResponseFailure; // 返回错误信息 //TODO
      }) // 返回服务器响应数据
      .catch((error) => {
        console.log(error);
        return {
          success: false,
          error: error.message || "Unknown error",
        };
      });
  },

  register(username: string, password: string) {
    const credentials = { username, password };
    return server
      .post("/api/v1/register/", credentials)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
};

export default userAPI;

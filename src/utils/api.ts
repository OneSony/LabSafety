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

interface RegisterResponseSuccess {
  success: true;
}

interface RegisterResponseFailure {
  success: false;
  error: string;
}

type LoginResponse = LoginResponseSuccess | LoginResponseFailure;
type RegisterResponse = RegisterResponseSuccess | RegisterResponseFailure;

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
      })
      .catch((error) => {
        console.log(error);
        return {
          success: false,
          error: error.message || "Unknown error",
        };
      });
  },

  register(username: string, password: string): Promise<RegisterResponse> {
    const credentials = { username, password };
    return server
      .post("/api/v1/register/", credentials)
      .then((response) => {
        console.log(response);
        if (response.status === 201) {
          return {
            success: true,
          } as RegisterResponseSuccess; // 登录成功时返回数据
        }
        return {
          success: false,
          error: response.statusText || "Unknown error",
        } as RegisterResponseFailure; // 返回错误信息 //TODO
      })
      .catch((error) => {
        console.log(error);
        return {
          success: false,
          error: error.message || "Unknown error",
        };
      });
  },
};

export default userAPI;

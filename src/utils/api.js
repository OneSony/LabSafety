import axios from "axios";

const server = axios.create({
  baseURL: "http://111.229.210.27", // 替换为你后端的 URL
  headers: {
    "Content-Type": "application/json",
  },
});

const getJwt = () => localStorage.getItem("jwt");
const getUsername = () => localStorage.getItem("username");

// 创建一个包含用户相关 API 请求的对象
const userAPI = {
  // 登录方法
  login(username, password) {
    const credentials = { username, password };
    return server
      .post("/api/v1/login/", credentials)
      .then((response) => {
        if (response.data.code === 200) {
          localStorage.setItem("username", username); // 存储用户名
          // localStorage.setItem('jwt', response.data.access); // 存储 JWT
        }

        return response;
      }) // 返回服务器响应数据
      .catch((error) => {
        throw error; // 错误处理
      });
  },

  register(username, password) {
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

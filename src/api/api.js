// src/api/api.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://111.229.210.27/api/v1", // 设置基础URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 请求超时时间
});

// 请求拦截器（可选）
apiClient.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，例如添加Token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器（可选）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理响应错误
    return Promise.reject(error);
  }
);

export default apiClient;

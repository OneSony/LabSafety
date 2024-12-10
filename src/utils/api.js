import axios from "axios";

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: "https://api.example.com", // API 的基础路径
  timeout: 10000, // 超时时间
  headers: { "Content-Type": "application/json" },
});

// 封装 GET 请求
export function getData(endpoint) {
  return apiClient
    .get(endpoint)
    .then((response) => response.data)
    .catch((error) => {
      console.error("GET 请求失败:", error);
      throw error;
    });
}

// 封装 POST 请求
export function postData(endpoint, data) {
  return apiClient
    .post(endpoint, data)
    .then((response) => response.data)
    .catch((error) => {
      console.error("POST 请求失败:", error);
      throw error;
    });
}

// 用户模块
export const userAPI = {
  register: (infos) => apiClient.post("/api/v1/users/register", infos),
  login: (credentials) => apiClient.post("/api/v1/users/login", credentials),
  getUserInfo: (userId) => apiClient.get(`/users/${userId}`),
};

// 商品模块
export const productAPI = {
  getAllProducts: () => apiClient.get("/products"),
  getProductById: (productId) => apiClient.get(`/products/${productId}`),
};

// src/api/auth.js
import apiClient from "./api";

// 用户登录
export function login(credentials) {
  return apiClient.post("/users/login", credentials);
}

// 用户注册
export function register(userData) {
  return apiClient.post("/users/register", userData);
}

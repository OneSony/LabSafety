// src/api/user.js
import apiClient from "./api";

// 获取用户信息
export function getUserInfo(userId) {
  return apiClient.get(`/users/${userId}`);
}

// 更新用户信息
export function updateUserInfo(userId, data) {
  return apiClient.put(`/users/${userId}`, data);
}

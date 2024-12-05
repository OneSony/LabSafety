import { createStore } from "vuex";
import userAPI from "@/utils/api";

const store = createStore({
  state: {
    user: localStorage.getItem("user") || null, // 从 localStorage 获取用户信息
    jwt: localStorage.getItem("jwt") || "", // 从 localStorage 获取 jwt
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true", // 判断是否已认证
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem("user", user);
    },
    setJwt(state, jwt) {
      state.jwt = jwt;
      localStorage.setItem("jwt", jwt);
    },
    setAuthenticationStatus(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
      localStorage.setItem("isAuthenticated", isAuthenticated);
    },
  },
  actions: {
    async login({ commit }, { username, password }) {
      try {
        // 调用 api.ts 中的登录接口
        const result = await userAPI.login(username, password);

        if (result.success) {
          commit("setUser", result.username);
          commit("setToken", result.jwt);
          commit("setAuthenticationStatus", true);
          return { success: true };
        } else {
          commit("setAuthenticationStatus", false);
          // 错误处理，可以设置错误消息
          return { success: false, error: result.error };
        }
      } catch (error: any) {
        // 处理错误
        commit("setAuthenticationStatus", false);
        return { success: false, error: error.message };
      }
    },
    logout({ commit }) {
      //TODO
      // 清除用户信息和 jwt
      commit("setUser", null);
      commit("setJwt", "");
      commit("setAuthenticationStatus", false);
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    getUser: (state) => state.user,
    getJwt: (state) => state.jwt,
  },
});

export default store;

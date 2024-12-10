import axios from "axios";
import { getRowIdentity } from "element-plus/es/components/table/src/util";

// 创建一个axios实例
const server = axios.create({
  baseURL: "http://111.229.210.27", // 替换为你后端的 URL
  headers: {
    "Content-Type": "application/json",
  },
});

// 设置拦截器
server.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

server.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 防止无限重试

      // 如果 token 过期，尝试刷新 token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshResponse = await server.post("/api/v1/refresh-token", {
            refresh: refreshToken,
          });
          if (refreshResponse.status === 200) {
            const newToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", newToken); // 更新本地的 token
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return server(originalRequest); // 重试原始请求
          } else {
            // 刷新失败，跳转到登录页面
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        // 如果没有 refresh token，直接跳转到登录页面
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

interface LoginResponseSuccess {
  success: true;
  role: string;
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
  isLoggedIn(): boolean {
    const token = localStorage.getItem("accessToken");
    return !!token; // 如果存在 token，说明已登录
  },

  getUsername(): string | null {
    return localStorage.getItem("username");
  },

  getRole(): string | null {
    return localStorage.getItem("role");
  },

  // 登录方法
  login(username: string, password: string): Promise<LoginResponse> {
    const credentials = { username, password };
    return server
      .post("/api/v1/users/login/", credentials)
      .then((response) => {
        if (response.status === 200) {
          // 登录成功，保存 token 和刷新 token
          const { access, refresh, role } = response.data;
          localStorage.setItem("accessToken", access);
          localStorage.setItem("refreshToken", refresh);
          localStorage.setItem("username", username);
          localStorage.setItem("role", role);
          return {
            success: true,
            role,
          } as LoginResponseSuccess; // 登录成功时返回数据
        }
        return {
          success: false,
          error: response.data.detail || "Unknown error",
        } as LoginResponseFailure; // 返回错误信息
      })
      .catch((error) => {
        return {
          success: false,
          error: error.response?.data.detail || "Unknown error",
        };
      });
  },

  register(username: string, password: string): Promise<RegisterResponse> {
    const credentials = { username, password };
    return server
      .post("/api/v1/users/register/", credentials)
      .then((response) => {
        if (response.status === 201) {
          return {
            success: true,
          } as RegisterResponseSuccess; // 注册成功
        }
        return {
          success: false,
          error: response.data.detail || "Unknown error",
        } as RegisterResponseFailure; // 注册失败
      })
      .catch((error) => {
        return {
          success: false,
          error: error.response?.data.detail || "Unknown error",
        };
      });
  },
  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "/login"; //todo
  },
};

const courseAPI = {
  getCourseList(): Promise<any> {
    return server
      .get("/api/v1/courses/course")
      .then((response) => {
        if (response.status === 200) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          return {
            success: false,
            error: response.data.detail || "Unknown error",
          };
        }
      })
      .catch((error) => {
        return {
          success: false,
          error: error.response?.data.detail || "Unknown error",
        };
      });
  },

  getClassList(coursename: string): Promise<any> {
    return server
      .get("/api/v1/classes/class")
      .then((response) => {
        if (response.status === 200) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          return {
            success: false,
            error: response.data.detail || "Unknown error",
          };
        }
      })
      .catch((error) => {
        return {
          success: false,
          error: error.response?.data.detail || "Unknown error",
        };
      });
  },
};

export { userAPI, courseAPI };

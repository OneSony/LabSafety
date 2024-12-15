import axios from "axios";

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

    // 如果不是刷新 token 请求才添加 Authorization 头部
    if (token && config.url && !config.url.includes("/api/v1/refresh-token/")) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

server.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 只处理 401 错误，并且确保原请求没有进行过重试
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/v1/refresh-token/")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const refreshResponse = await server.post("/api/v1/refresh-token/", {
            refresh: refreshToken,
          });

          if (refreshResponse.status === 200) {
            const newToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", newToken);
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            // 重试原请求
            return server(originalRequest);
          } else {
            clearTokensAndRedirect();
          }
        } catch (refreshError) {
          console.error("Error during refresh token:", refreshError);
          clearTokensAndRedirect();
        }
      } else {
        clearTokensAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

const clearTokensAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login"; // 跳转到登录页
};

// 通用响应处理函数
const handleResponse = (response: any) => {
  if (response.status === 200 || response.status === 201) {
    return { success: true, data: response.data };
  } else {
    return { success: false, error: response.data.detail || "Unknown error" };
  }
};

// 通用错误处理函数
const handleError = (error: any) => {
  return {
    success: false,
    error: error.response?.data.detail || "Unknown error",
  };
};

interface LoginResponse {
  success: boolean;
  role: string;
}

const userAPI = {
  isLoggedIn(): boolean {
    const token = localStorage.getItem("accessToken");
    return !!token;
  },

  getUsername(): string | null {
    return localStorage.getItem("username");
  },

  getRole(): string | null {
    return localStorage.getItem("role");
  },

  login(username: string, password: string): Promise<any> {
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
          } as LoginResponse; // 登录成功时返回数据
        }
        return {
          success: false,
          error: response.data.detail || "Unknown error",
        }; // 返回错误信息
      })
      .catch((error) => {
        return {
          success: false,
          error: error.response?.data.detail || "Unknown error",
        };
      });
  },

  register(username: string, password: string): Promise<any> {
    const credentials = { username, password };
    return server
      .post("/api/v1/users/register/", credentials)
      .then(handleResponse)
      .catch(handleError);
  },

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "/login"; //todo
  },

  getUserInfo(user_id: number): Promise<any> {
    const params = { user_id: user_id };
    return server
      .get("/api/v1/users/user-info", { params })
      .then(handleResponse)
      .catch(handleError);
  },
};

const courseAPI = {
  getCourseList(): Promise<any> {
    const params = { personal: true };
    return server
      .get("/api/v1/courses/course", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  postCourse(course_name: string): Promise<any> {
    const data = { name: course_name };
    return server
      .post("/api/v1/courses/course", data)
      .then(handleResponse)
      .catch(handleError);
  },

  postClassToCourse(course_id: number, class_id: number): Promise<any> {
    const data = { class_id: class_id, course_id: course_id };
    return server
      .post("/api/v1/courses/classes", data)
      .then(handleResponse)
      .catch(handleError);
  },

  postEnroll(student_ids: number[], course_id: number): Promise<any> {
    const data = { student_ids: student_ids, course_id: course_id };
    return server
      .post("/api/v1/courses/enroll", data)
      .then(handleResponse)
      .catch(handleError);
  },
};

const classAPI = {
  getClass(class_id: number): Promise<any> {
    const params = { class_id: class_id, personal: true };
    return server
      .get("/api/v1/classes/class", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  getClassList(course_id: number): Promise<any> {
    const params = { course_id: course_id, personal: true };
    return server
      .get("/api/v1/classes/class", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  getComments(class_id: number): Promise<any> {
    const params = { class_id: class_id };
    return server
      .get("/api/v1/classes/comments", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  postComment(class_id: number, content: string): Promise<any> {
    const data = { class_id, content };
    return server
      .post("/api/v1/classes/comments", data)
      .then(handleResponse)
      .catch(handleError);
  },

  getLocations(class_id: number): Promise<any> {
    const params = { class_id: class_id };
    return server
      .get("/api/v1/classes/locations", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  getTeachers(class_id: number): Promise<any> {
    const params = { class_id: class_id };
    return server
      .get("/api/v1/classes/teachers", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  postClass(class_name: string, date: string): Promise<any> {
    const params = { name: class_name, start_time: date };
    return server
      .post("/api/v1/classes/class", params)
      .then(handleResponse)
      .catch(handleError);
  },

  postLocation(class_id: number, lab_id: number): Promise<any> {
    const data = { class_id: class_id, lab_id: lab_id };
    return server
      .post("/api/v1/classes/locations", data)
      .then(handleResponse)
      .catch(handleError);
  },

  postTeacher(class_id: number, teacher_id: number): Promise<any> {
    const data = { class_id: class_id, teacher_id: teacher_id };
    return server
      .post("/api/v1/classes/teachers", data)
      .then(handleResponse)
      .catch(handleError);
  },
};

const labAPI = {
  getLabs(lab_id?: number): Promise<any> {
    const params = lab_id ? { lab_id: lab_id } : {};
    return server
      .get("/api/v1/labs/lab", { params })
      .then(handleResponse)
      .catch(handleError);
  },
  getLabById(lab_id: number): Promise<any> {
    return server
      .get(`/labs/lab/${lab_id}`)
      .then(handleResponse)
      .catch(handleError);
  },
  // getLabByName(labName: string): Promise<any> {
  //   return this.getLabs({ lab_name: labName })
  //     .then((response) => {
  //       if (response.success && response.data.length > 0) {
  //         return { success: true, data: response.data[0] };
  //       } else {
  //         return { success: false, error: "实验室未找到" };
  //       }
  //     })
  //     .catch(handleError);
  // },
  // 创建实验室
  createLab(labData: { name: string; location: string }): Promise<any> {
    return server
      .post("/api/v1/labs/lab", labData)
      .then(handleResponse)
      .catch(handleError);
  },

  // 编辑实验室
  editLab(
    labId: number,
    labData: { name: string; location: string }
  ): Promise<any> {
    return server
      .put(`/api/v1/labs/lab/${labId}`, labData)
      .then(handleResponse)
      .catch(handleError);
  },

  // 删除实验室
  deleteLab(labId: number): Promise<any> {
    return server
      .delete(`/api/v1/labs/lab`)
      .then(handleResponse)
      .catch(handleError);
  },
};

export { userAPI, courseAPI, classAPI, labAPI };

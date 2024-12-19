import axios from "axios";

// 创建一个axios实例
const server = axios.create({
  baseURL: "http://111.229.210.27", // 替换为你后端的 URL
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

  async getAvatar(): Promise<string> {
    const avatar = localStorage.getItem("avatar");
    if (avatar) {
      return avatar; // 如果本地存储有头像，直接返回
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      return ""; // 如果没有 userId，返回 null
    }

    try {
      // 获取用户信息并提取头像 URL
      const result = await this.getUserInfo(userId);
      console.log("获取用户信息成功!~:", result); // 调试信息
      if (result.success) {
        const userAvatar = result.data[0].profile_picture;
        if (userAvatar) {
          // 如果获取到头像 URL，存储到 localStorage
          localStorage.setItem("avatar", userAvatar);
          console.log("获取到头像 URL:", userAvatar); // 调试信息
          return userAvatar;
        }
      }
      return ""; // 如果没有头像，返回 null
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return ""; // 如果获取用户信息失败，返回 null
    }
  },

  getUsername(): string | null {
    return localStorage.getItem("username");
  },

  getUserId(): string | null {
    return localStorage.getItem("userId");
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
          console.log(response.data);
          const { access, refresh, role, user_id } = response.data;
          localStorage.setItem("accessToken", access);
          localStorage.setItem("refreshToken", refresh);
          localStorage.setItem("role", role);
          localStorage.setItem("userId", user_id);
          localStorage.setItem("username", username); //TODO
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

  register(user_id: string, username: string, password: string): Promise<any> {
    const credentials = { user_id, username, password };
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
    localStorage.removeItem("userId");
    localStorage.removeItem("avatar");
    window.location.href = "/login"; //todo
  },

  getUserInfo(user_id: string): Promise<any> {
    const params = { user_id: user_id };
    return server
      .get("/api/v1/users/user-info", { params })
      .then(handleResponse)
      .then((response) => {
        if (response.success) {
          console.log("顺便拿到啦", response.data);
          localStorage.setItem("role", response.data[0].role);
          localStorage.setItem("userId", response.data[0].user_id);
          localStorage.setItem("username", response.data[0].username);
          localStorage.setItem("avatar", response.data[0].profile_picture);
        }
        return response;
      })
      .catch(handleError);
  },

  patchUserInfo(formData: FormData): Promise<any> {
    console.log("发送请求：更新用户信息", formData); // 调试信息
    return server
      .patch("/api/v1/users/user-info", formData)
      .then(handleResponse)
      .catch(handleError);
  },
};

const courseAPI = {
  getCourseList(personal?: boolean): Promise<any> {
    if (personal === undefined) {
      const params = { personal: true };
      return server
        .get("/api/v1/courses/course", { params })
        .then(handleResponse)
        .catch(handleError);
    } else {
      return server
        .get("/api/v1/courses/course")
        .then(handleResponse)
        .catch(handleError);
    }
  },

  postCourse(
    course_name: string,
    course_code: string,
    course_sequence: string,
    department: string
  ): Promise<any> {
    const data = {
      name: course_name,
      course_code: course_code,
      course_sequence: course_sequence,
      department: department,
    };
    return server
      .post("/api/v1/courses/course", data)
      .then(handleResponse)
      .catch(handleError);
  },

  postClassToCourse(
    class_id: number,
    course_code: string,
    course_sequence: string
  ): Promise<any> {
    const data = {
      class_id: class_id,
      course_code: course_code,
      course_sequence: course_sequence,
    };
    return server
      .post("/api/v1/courses/classes", data)
      .then(handleResponse)
      .catch(handleError);
  },

  postEnroll(
    student_ids: string[],
    course_code: string,
    course_sequence: string
  ): Promise<any> {
    const data = {
      student_user_ids: student_ids,
      course_code: course_code,
      course_sequence: course_sequence,
    };
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

  patchClass(
    class_id: number,
    class_name?: string,
    date?: string
  ): Promise<any> {
    const params: { id: number; name?: string; start_time?: string } = {
      id: class_id,
    };

    // 根据传入的参数构建不同的请求体
    if (class_name) {
      params["name"] = class_name;
      console.log("发送请求：仅更新 class_name", params); // 调试信息
    }
    if (date) {
      params["start_time"] = date;
      console.log("发送请求：仅更新 start_time", params); // 调试信息
    }
    // 如果两个参数都没有传，返回默认的请求
    if (!class_name && !date) {
      console.log("发送请求：只包含 class_id", params); // 调试信息
    }

    return server
      .patch("/api/v1/classes/class", params)
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

  postTeacher(class_id: number, teacher_id: string): Promise<any> {
    const data = { class_id: class_id, teacher_id: teacher_id };
    return server
      .post("/api/v1/classes/teachers", data)
      .then(handleResponse)
      .catch(handleError);
  },
};

const labAPI = {
  getLabs(lab_id?: number): Promise<any> {
    const params = lab_id ? { lab_id } : {};
    return server
      .get("/api/v1/labs/lab", { params })
      .then((response) => {
        console.log("Labs response:", response); // 添加这行来查看返回的数据结构
        return handleResponse(response);
      })
      .catch(handleError);
  },
  // 获取单个实验室信息通过ID
  getLabById(lab_id: number): Promise<any> {
    return server
      .get(`/labs/lab/${lab_id}`)
      .then(handleResponse)
      .catch(handleError);
  },
  // 创建实验室
  createLab(labData: {
    name: string;
    location: string;
    safety_equipments: string;
    safety_notes: string;
    lab_image: string;
  }): Promise<any> {
    // 确保数据格式正确
    const formattedData = {
      ...labData,
      // 确保是合法的 JSON 字符串
      safety_equipments:
        typeof labData.safety_equipments === "string"
          ? labData.safety_equipments
          : JSON.stringify(labData.safety_equipments),
      safety_notes:
        typeof labData.safety_notes === "string"
          ? labData.safety_notes
          : JSON.stringify(labData.safety_notes),
    };

    console.log("API sending data:", formattedData);

    return server
      .post("/api/v1/labs/lab", formattedData)
      .then(handleResponse)
      .catch((error) => {
        console.error("API error response:", error.response?.data);
        return handleError(error);
      });
  },

  // 编辑实验室
  editLab(labId: number, labData: any): Promise<any> {
    return server
      .put(`/api/v1/labs/lab`, {
        lab_id: labId,
        ...labData,
      })
      .then(handleResponse)
      .catch(handleError);
  },
  // 添加处理图片上传的方法，添加 File 类型
  async handleImageUpload(file: File): Promise<string> {
    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      throw new Error("请上传图片文件");
    }

    // 检查文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("图片大小不能超过5MB");
    }

    // 将图片转换为 base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("图片读取失败"));
        }
      };
      reader.onerror = () => {
        reject(new Error("图片读取失败"));
      };
    });
  },
  // 删除实验室
  deleteLab(labId: number): Promise<any> {
    return server
      .delete("/api/v1/labs/lab", {
        params: { lab_id: labId }, // 使用查询参数
      })
      .then((response) => {
        if (response.status === 204) {
          return { success: true };
        }
        return handleResponse(response);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          return { success: false, error: "实验室未找到" };
        }
        return handleError(error);
      });
  },
};

export { server, userAPI, courseAPI, classAPI, labAPI };

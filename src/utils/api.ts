import axios, { AxiosError, AxiosInstance } from "axios";

// 创建一个axios实例
const server = axios.create({
  baseURL: "http://111.229.210.27", // 替换为你后端的 URL
});

const instance: AxiosInstance = axios.create({
  baseURL: "http://111.229.210.27/api/v1",
  timeout: 5000,
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
  // axios 的响应总是包装在 data 中
  const data = response.data;

  // 检查响应状态
  if (response.status >= 200 && response.status < 300) {
    return {
      success: true,
      data: data,
      message: data.message || "",
    };
  }

  return {
    success: false,
    error: data.detail || data.message || "Unknown error",
  };
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
// 定义响应数据的接口
interface UserInfo {
  user_id: string;
  email: string;
  role: string;
  phone_number: string;
  profile_picture: string;
  real_name: string;
  department: string;
}

// 定义 API 响应的接口
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
const userAPI = {
  //登陆时存储role和id, realname(usernname)和avatar是在获取用户信息时存储的
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

    // 获取用户信息并提取头像 URL
    const result = await this.getUserInfo(userId);
    if (result.success) {
      return localStorage.getItem("avatar") || ""; // 如果有头像，返回头像
    }
    return ""; // 如果没有头像，返回 null
  },

  async getUsername(): Promise<string> {
    const username = localStorage.getItem("username");
    if (username) {
      return username; // 如果本地存储有头像，直接返回
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      return ""; // 如果没有 userId，返回 null
    }

    const result = await this.getUserInfo(userId);
    if (result.success) {
      return localStorage.getItem("username") || ""; // 如果有头像，返回头像
    }
    return ""; // 如果没有头像，返回 null
  },

  getUserId(): string | null {
    return localStorage.getItem("userId");
  },

  getRole(): string | null {
    return localStorage.getItem("role");
  },

  login(user_id: string, password: string): Promise<any> {
    const credentials = { user_id, password };
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

  register(form: FormData, role: string): Promise<any> {
    if (role === "student") {
      return server
        .post("/api/v1/users/register/", form)
        .then(handleResponse)
        .catch(handleError);
    } else {
      form.append("role", role);
      return server
        .post("/api/v1/users/register-staff", form)
        .then(handleResponse)
        .catch(handleError);
    }
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

  getUserInfo(user_id?: string, role?: string): Promise<any> {
    const params: Record<string, string> = {};

    // 只有当 user_id 不为空字符串时才添加
    if (user_id && user_id.trim()) {
      params.user_id = user_id.trim();
    }

    // 只有当 role 存在且不为空时才添加
    if (role && role.trim()) {
      params.role = role.trim();
    }

    console.log("Requesting user info with params:", params); // 调试日志

    return server
      .get("/api/v1/users/user-info", { params })
      .then(handleResponse)
      .then((response) => {
        console.log("User info response:", response);

        if (response.success && response.data) {
          // 检查是否是当前用户的数据
          if (Array.isArray(response.data)) {
            const currentUser = response.data.find(
              (user) => user.user_id === this.getUserId()
            );
            if (currentUser) {
              localStorage.setItem("username", currentUser.real_name);
              localStorage.setItem("avatar", currentUser.profile_picture || "");
            }
          } else if (response.data.user_id === this.getUserId()) {
            localStorage.setItem("username", response.data.real_name);
            localStorage.setItem("avatar", response.data.profile_picture || "");
          }
        }

        return response;
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        return handleError(error);
      });
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

  getEnroll(course_id: number): Promise<any> {
    const params = { course_id: course_id };
    return server
      .get("/api/v1/courses/enroll", { params })
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

  deleteEnroll(
    student_id: string,
    course_code: string,
    course_sequence: string
  ): Promise<any> {
    return server
      .delete("/api/v1/courses/enroll", {
        params: {
          student_id: student_id,
          course_code: course_code,
          course_sequence: course_sequence,
        },
      })
      .then(handleResponse)
      .catch(handleError);
  },

  getCourseFromClass(class_id: number): Promise<any> {
    const params = {
      class_id: class_id,
    };
    return server
      .get("/api/v1/courses/classes", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  getCourse(course_code: string, course_sequence: string): Promise<any> {
    const params = {
      course_code: course_code,
      course_sequence: course_sequence,
    };
    return server
      .get("/api/v1/courses/course", { params })
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

  getClassList(course_id?: number): Promise<any> {
    const params = course_id
      ? { course_id: course_id, personal: true }
      : { personal: true };
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
    //返回lab_id
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

  deleteLocation(class_id: number, lab_id: number): Promise<any> {
    return server
      .delete("/api/v1/classes/locations", {
        params: { class_id: class_id, lab_id: lab_id },
      })
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

  deleteTeacher(class_id: number, teacher_id: string): Promise<any> {
    return server
      .delete("/api/v1/classes/teachers", {
        params: { class_id: class_id, teacher_id: teacher_id },
      })
      .then(handleResponse)
      .catch(handleError);
  },

  postExperiment(formData: FormData): Promise<any> {
    return server
      .post("/api/v1/classes/experiments/", formData)
      .then(handleResponse)
      .catch(handleError);
  },

  patchExperiment(formData: FormData): Promise<any> {
    return server
      .patch("/api/v1/classes/experiments/", formData)
      .then(handleResponse)
      .catch(handleError);
  },

  getExperiments(class_id: number): Promise<any> {
    const params = { class_id: class_id };
    return server
      .get("/api/v1/classes/experiments/", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  deleteExperiment(experiment_id: number): Promise<any> {
    return server
      .delete("/api/v1/classes/experiments/", {
        params: { experiment_id: experiment_id },
      })
      .then(handleResponse)
      .catch(handleError);
  },
};
interface CreateLabRequest {
  name: string;
  location: string;
}
export interface LabDetails {
  id?: number;
  name: string;
  location: string;
  safety_equipments: string;
  safety_notes: string;
  lab_image: string;
  map_image: string;
}

export interface LabResponse {
  success: boolean;
  data?: LabDetails;
  error?: string;
}

export interface UpdateLabRequest {
  lab_id: number;
  name?: string;
  location?: string;
  safety_equipments?: string;
  safety_notes?: string;
}
export interface LabManager {
  manager_user_id: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  lab_id: number;
}

export interface BindManagerRequest {
  manager_user_id: string;
  lab_id: number;
}

export interface BindManagerResponse {
  manager_user_id: string;
  lab_id: number;
}

export interface ManagerResponse {
  success: boolean;
  data?: LabManager | LabManager[];
  error?: string;
}

export interface BindManagerApiResponse {
  success: boolean;
  data?: BindManagerResponse;
  error?: string;
}

const labAPI = {
  getLabs(lab_id?: number, personal?: boolean): Promise<any> {
    //返回id, 不是lab_id

    const params: { lab_id?: number; personal?: boolean } = lab_id
      ? { lab_id }
      : {};
    if (personal) {
      params["personal"] = true;
    }
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
      .get(`/api/v1/labs/lab`, { params: { id: lab_id } })
      .then(handleResponse)
      .catch(handleError);
  },

  getLabname(): string | null {
    return localStorage.getItem("name");
  },
  getLabId(): string | null {
    return localStorage.getItem("id");
  },

  // 创建实验室
  createLab(labData: CreateLabRequest): Promise<any> {
    // 只发送必填字段
    const data = {
      name: labData.name,
      location: labData.location,
    };

    return server
      .post("/api/v1/labs/lab", data)
      .then(handleResponse)
      .catch(handleError);
  },

  editLab(
    labId: number,
    labData: Partial<UpdateLabRequest>
  ): Promise<LabResponse> {
    const data = {
      id: labId, // 确保传入 id 字段
      ...labData,
    };

    console.log("Sending update request with data:", data);

    return server
      .patch("/api/v1/labs/lab", data)
      .then(handleResponse)
      .catch(handleError);
  },

  async updateLabEquipments(
    labId: number,
    equipmentsJson: string,
    equipmentImage?: File
  ): Promise<LabResponse> {
    const formData = new FormData();
    formData.append("id", String(labId));
    formData.append("safety_equipments", equipmentsJson);

    if (equipmentImage) {
      formData.append("lab_image", equipmentImage);
    }

    return server
      .patch("/api/v1/labs/lab", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(handleResponse)
      .catch(handleError);
  },

  async patchLabPhoto(
    labId: number | string,
    file: File
  ): Promise<LabResponse> {
    // 创建 FormData 对象
    const formData = new FormData();
    // 添加实验室ID
    formData.append("id", String(labId));
    // 添加图片文件
    formData.append("lab_image", file);

    // 添加调试日志
    for (const pair of formData.entries()) {
      console.log("FormData:", pair[0], pair[1]);
    }

    return server
      .patch("/api/v1/labs/lab", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Upload response:", response);
        return handleResponse(response);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        return handleError(error);
      });
  },
  async patchLabMap(labId: number | string, file: File): Promise<LabResponse> {
    // 创建 FormData 对象
    const formData = new FormData();
    // 添加实验室ID
    formData.append("id", String(labId));
    // 添加图片文件
    formData.append("map_image", file);

    // 添加调试日志
    for (const pair of formData.entries()) {
      console.log("FormData:", pair[0], pair[1]);
    }

    return server
      .patch("/api/v1/labs/lab", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Upload response:", response);
        return handleResponse(response);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        return handleError(error);
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
  async getLabManagers(params: {
    lab_id?: number;
    manager_name?: string;
  }): Promise<ManagerResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.lab_id) {
        queryParams.append("lab_id", params.lab_id.toString());
      }
      if (params.manager_name) {
        queryParams.append("manager_name", params.manager_name);
      }

      const url = `/api/v1/labs/managers${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      // 明确指定响应类型
      const response = await axios.get<LabManager[]>(url);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("获取安全员列表失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取安全员列表失败",
      };
    }
  },

  // 绑定实验室安全员
  async bindLabManager(
    request: BindManagerRequest
  ): Promise<BindManagerApiResponse> {
    try {
      const response = await axios.post<BindManagerResponse>(
        "/api/v1/labs/managers",
        request
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("绑定安全员失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "绑定安全员失败",
      };
    }
  },

  // 解绑实验室安全员
  async unbindLabManager(
    lab_id: number,
    manager_user_id: string
  ): Promise<ManagerResponse> {
    try {
      const response = await axios.delete<LabManager>(
        `/api/v1/labs/managers/${lab_id}/${manager_user_id}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("解绑安全员失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "解绑安全员失败",
      };
    }
  },

  getManagerToLab(lab_id?: number, manager_name?: string): Promise<any> {
    let params;
    if (lab_id) {
      params = { lab_id: lab_id };
    }
    if (manager_name) {
      params = { manager_name: manager_name };
    }
    return server
      .get("/api/v1/labs/managers", {
        params,
      })
      .then(handleResponse)
      .catch(handleError);
  },

  postManagerToLab(manager_id: string, lab_id: number): Promise<any> {
    const data = { manager_user_id: manager_id, lab_id: lab_id };
    return server
      .post("/api/v1/labs/managers", data)
      .then(handleResponse)
      .catch(handleError);
  },

  deleteManagerToLab(manager_id: string, lab_id: number): Promise<any> {
    return server
      .delete("/api/v1/labs/managers", {
        params: { manager_user_id: manager_id, lab_id: lab_id },
      })
      .then(handleResponse)
      .catch(handleError);
  },
};

const noticeAPI = {
  getNotices(classId?: number, labId?: number): Promise<any> {
    const params: { [key: string]: number | string } = {};
    if (classId) {
      params["class_or_lab_id"] = classId;
      params["notice_type"] = "class";
    } else if (labId) {
      params["class_or_lab_id"] = labId;
      params["notice_type"] = "lab";
    }
    return server
      .get("/api/v1/notices/notices", { params })
      .then(handleResponse)
      .catch(handleError);
  },

  postNotices(
    senderId: string,
    classId?: number,
    labId?: number
  ): Promise<any> {
    const params: { [key: string]: number | string } = {};
    params["sender"] = senderId;
    params["post_time"] = new Date().toISOString();
    params["end_time"] = new Date().toISOString();
    if (classId) {
      params["class_or_lab_id"] = Number(classId);
      params["notice_type"] = "class";
    } else if (labId) {
      params["class_or_lab_id"] = Number(labId);
      params["notice_type"] = "lab";
    }
    console.log("发送请求：发布通知", params); // 调试信息
    return server
      .post("/api/v1/notices/notices", params)
      .then(handleResponse)
      .catch(handleError);
  },

  postContent(formData: FormData): Promise<any> {
    return server
      .post("/api/v1/notices/notice-contents", formData)
      .then(handleResponse)
      .catch(handleError);
  },

  postContentToNotice(
    order_num: number,
    notice_id: number,
    content_id: number
  ): Promise<any> {
    const data = {
      order_num: order_num,
      notice_id: notice_id,
      notice_content_id: content_id,
    };
    console.log("发送请求：发布通知内容", data); // 调试信息
    return server
      .post("/api/v1/notices/notice-rows", data)
      .then(handleResponse)
      .catch(handleError);
  },

  deleteContentToNotice(row_id: number) {
    return server
      .delete("/api/v1/notices/notice-rows", { params: { row_id: row_id } })
      .then(handleResponse)
      .catch(handleError);
  },

  deleteContent(content_id: number) {
    return server
      .delete("/api/v1/notices/notice-contents", {
        params: { content_id: content_id },
      })
      .then(handleResponse)
      .catch(handleError);
  },

  deleteNotice(notice_id: number) {
    return server
      .delete("/api/v1/notices/notices", { params: { notice_id: notice_id } })
      .then(handleResponse)
      .catch(handleError);
  },
};

export { server, userAPI, courseAPI, classAPI, labAPI, noticeAPI };

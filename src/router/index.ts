import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TeacherDashboard from "../views/TeacherDashboard.vue";
import UserLogin from "../views/UserLogin.vue";
// import DashboardView/ from "../views/Dashboard.vue";
import CourseManagement from "../views/CourseManagement.vue";
import NotificationManagement from "../views/NotificationManagement.vue";
import CommentManagement from "../views/CommentManagement.vue";
import UserProfile from "../views/Profile.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import LabManagerDashboard from "../views/LabManagerDashboard.vue";
import { userAPI } from "@/utils/api";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    // 通过守卫动态加载对应的组件，而不为其设置固定的 path
    component: () => import("@/views/ParentDashboard.vue"), // 父组件
    beforeEnter: (to, from, next) => {
      const role = userAPI.getRole(); // 获取当前用户角色
      console.log("role", role);

      if (role === "student") {
        // 如果目标页面不是 "StudentDashboard"，则重定向到该页面
        if (to.name !== "StudentDashboard") {
          next({ name: "StudentDashboard" });
        } else {
          next(); // 如果已经是学生页面，则继续
        }
      } else if (role === "teacher") {
        // 如果目标页面不是 "TeacherDashboard"，则重定向到该页面
        if (to.name !== "TeacherDashboard") {
          next({ name: "TeacherDashboard" });
        } else {
          next(); // 如果已经是老师页面，则继续
        }
      } else if (role === "manager") {
        // 如果目标页面不是 "TeacherDashboard"，则重定向到该页面
        if (to.name !== "LabManagerDashboard") {
          next({ name: "LabManagerDashboard" });
        } else {
          next(); // 如果已经是老师页面，则继续
        }
      } else {
        next("/login"); // 如果角色无法识别，跳转到登录页面
      }
    },
    children: [
      {
        path: "student",
        name: "StudentDashboard",
        component: StudentDashboard,
      },
      {
        path: "teacher",
        name: "TeacherDashboard",
        component: TeacherDashboard,
      },
      {
        path: "labmanager",
        name: "LabManagerDashboard",
        component: LabManagerDashboard,
      },
    ],
  },
  {
    path: "/login",
    component: UserLogin,
  },
  {
    path: "/profile",
    component: UserProfile,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  // 如果访问的页面需要登录，且用户没有登录
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 检查是否有登录状态
    console.log("check login status", userAPI.isLoggedIn());
    if (!userAPI.isLoggedIn()) {
      next("/login");
    } else {
      next(); // 允许进入目标页面
    }
  } else if (to.path === "/login" && userAPI.isLoggedIn()) {
    // 如果用户已经登录，且访问的是登录页面，跳转到上一个页面或主页
    next(from.fullPath || "/"); // 返回上一个页面或首页
  } else {
    next(); // 直接进入目标页面
  }
});

export default router;

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TeacherDashboard from "../views/TeacherDashboard.vue";
import UserLogin from "../views/UserLogin.vue";
// import DashboardView/ from "../views/Dashboard.vue";
import CourseManagement from "../views/CourseManagement.vue";
import NotificationManagement from "../views/NotificationManagement.vue";
import CommentManagement from "../views/CommentManagement.vue";
import UserProfile from "../views/Profile.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import { userAPI } from "@/utils/api";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/student_dashboard",
  },
  {
    path: "/teacher_dashboard",
    component: TeacherDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/student_dashboard",
    component: StudentDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: UserLogin,
  },
  {
    path: "/courses",
    component: CourseManagement,
  },
  {
    path: "/profile",
    component: UserProfile,
  },
  {
    path: "/notifications",
    component: NotificationManagement,
  },
  {
    path: "/comments",
    component: CommentManagement,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
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

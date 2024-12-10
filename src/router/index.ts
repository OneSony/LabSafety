import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TeacherDashboard from "../views/TeacherDashboard.vue";
import UserLogin from "../views/UserLogin.vue";
// import DashboardView/ from "../views/Dashboard.vue";
// import CourseManagement from "../views/CourseManagement.vue";
import NotificationManagement from "../views/NotificationManagement.vue";
import CommentManagement from "../views/CommentManagement.vue";
import UserProfile from "../views/Profile.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import LabManagerDashboard from "../views/LabManagerDashboard.vue";
import NotificationEditor from "@/views/NotificationEditor.vue";
import { userAPI } from "@/utils/api";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: (to) => {
      const role = userAPI.getRole(); // 获取当前用户角色
      console.log("role", role);

      if (role === "student") {
        return { name: "StudentDashboard" };
      } else if (role === "teacher") {
        return { name: "TeacherDashboard" };
      } else if (role === "manager") {
        return { name: "LabManagerDashboard" };
      } else {
        return "/login"; // 如果角色无法识别，跳转到登录页面
      }
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: UserProfile,
  },
  {
    path: "/login",
    component: UserLogin,
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
  {
    path: "/notifications",
    component: NotificationManagement,
  },
  {
    path: "/comments",
    component: CommentManagement,
  },
  {
    path: "/create-course",
    name: "CreateCourse",
    component: () => import("../views/CreateCourse.vue"), // 懒加载组件
  },
  {
    path: "/notifications/:labId",
    name: "NotificationEditor",
    component: NotificationEditor,
    props: true,
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
    //是可以的，如果是refresh进来的，已经清空了accessToken，是notLoggedIn的
    // 如果用户已经登录，且访问的是登录页面，跳转到上一个页面或主页
    next(from.fullPath || "/"); // 返回上一个页面或首页
  } else {
    next(); // 直接进入目标页面
  }
});

export default router;

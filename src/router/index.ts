import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TeacherDashboard from "../views/TeacherDashboard.vue";
// import UserLogin from "../components/Login.vue";
// import DashboardView/ from "../views/Dashboard.vue";
// import CourseManagement from "../views/CourseManagement.vue";
import NotificationManagement from "../views/NotificationManagement.vue";
import CommentManagement from "../views/CommentManagement.vue";
import UserProfile from "../views/Profile.vue";
// import CreateCourse from "../views/CreateCourse.vue";
// import LabManagerDashboard from "../views/LabManagerDashboard.vue";
import NotificationEditor from "../views/NotificationEditor.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/profile",
    name: "Profile",
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
    path: "/dashboard",
    name: "TeacherDashboard",
    component: TeacherDashboard,
    // component: LabManagerDashboard,
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

export default router;

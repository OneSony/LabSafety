import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TeacherDashboard from "../views/TeacherDashboard.vue";
// import UserLogin from "../components/Login.vue";
// import DashboardView/ from "../views/Dashboard.vue";
import CourseManagement from "../views/CourseManagement.vue";
import NotificationManagement from "../views/NotificationManagement.vue";
import CommentManagement from "../views/CommentManagement.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    component: TeacherDashboard,
  },
  {
    path: "/courses",
    component: CourseManagement,
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

export default router;

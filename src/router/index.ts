import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import UserLogin from "@/views/UserLogin.vue";
import UserProfile from "@/views/ProfilePage.vue";
import LabManagerDashboard from "@/views/LabManagerDashboard.vue";
import CreateCourse from "@/views/CreateCourse.vue";
import ClassPage from "@/views/ClassPage.vue";
import LabDetail from "@/views/LabDetail.vue";
import Dashboard from "@/views/Dashboard.vue";
import ParentDashboard from "@/views/ParentDashboard.vue";
import { userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: () => {
      const role = userAPI.getRole(); // 获取当前用户角色
      console.log("role", role);

      if (role === "student") {
        return { name: "StudentDashboard" };
      } else if (role === "teacher") {
        return { name: "TeacherDashboard" };
      } else if (role === "manager") {
        return { name: "LabManagerDashboard" };
      } else if (role == "teachingAffairs") {
        return { name: "TeachingAffairs" };
      } else {
        return "/login"; // 如果角色无法识别，跳转到登录页面
      }
    },
  },
  {
    path: "/course/:courseId/class/:classId",
    name: "class-page",
    component: ClassPage,
    props: true, // 将 classId 作为 prop 传递到组件
  },
  {
    path: "/login",
    component: UserLogin,
    meta: { title: "登录" },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: ParentDashboard,
    beforeEnter: (to, from, next) => {
      const role = userAPI.getRole(); // 获取当前用户角色
      console.log("role", role);

      if (role === "student") {
        if (to.name !== "StudentDashboard") {
          next({ name: "StudentDashboard" });
        } else {
          next();
        }
      } else if (role === "teacher") {
        if (to.name !== "TeacherDashboard") {
          next({ name: "TeacherDashboard" });
        } else {
          next();
        }
      } else if (role === "manager") {
        if (to.name !== "LabManagerDashboard") {
          next({ name: "LabManagerDashboard" });
        } else {
          next();
        }
      } else if (role == "teachingAffairs") {
        if (to.name !== "TeachingAffairs") {
          next({ name: "TeachingAffairs" });
        } else {
          next();
        }
      } else {
        next("/login"); // 如果角色无法识别，跳转到登录页面
      }
    },
    children: [
      {
        path: "",
        name: "StudentDashboard",
        component: Dashboard,
      },
      {
        path: "",
        name: "TeacherDashboard",
        component: Dashboard,
      },
      {
        path: "",
        name: "LabManagerDashboard",
        component: LabManagerDashboard,
      },
      {
        path: "",
        name: "TeachingAffairs",
        component: Dashboard,
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
    path: "/create-course",
    name: "CreateCourse",
    component: CreateCourse,
    meta: {
      teachingAffairs: true,
      title: "创建课程",
    },
  },
  {
    path: "/lab/:id",
    name: "LabPage",
    component: LabDetail,
    meta: {title: "实验室详情"},
    props: true, // 将路由参数作为 props 传递给组件
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log("to", to);
  console.log("from", from);
  console.log("login", userAPI.isLoggedIn());
  document.title = (to.meta.title as string) || "清华大学实验室安全助手";
  //除了login页面，其他页面都需要登录
  if (to.path !== "/login" && !userAPI.isLoggedIn()) {
    ElMessage.error("请先登录");
    next("/login");
    return;
  }

  if (to.path === "/login" && userAPI.isLoggedIn()) {
    next(from.fullPath || "/");
    return;
  }

  // 如果访问的页面需要登录，且用户没有登录
  if (to.matched.some((record) => record.meta.teachingAffairs)) {
    if (userAPI.getRole() !== "teachingAffairs") {
      ElMessage.error("您没有权限访问该页面");
      next(from.fullPath || "/");
    } else {
      next();
    }
  }

  next();
});

export default router;

<template>
  <Transition name="fade">
    <Vue3Lottie
      v-if="isLoading"
      :animation-data="loadingAnimation"
      :height="200"
      :width="200"
      :loop="true"
      :autoPlay="true"
    />
  </Transition>
  <div class="page-container">
    <div class="dashboard">
      <SidebarMenu @updateCurrentComponent="updateComponent" />
      <div class="content">
        <keep-alive>
          <component
            :is="currentComponent"
            :classItem="classItem"
            @show-class-panel="toClassPage"
          />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import loadingAnimation from "@/assets/loading.json";
import StudentCoursePanel from "@/components/StudentCoursePanel.vue";
import TeacherCoursePanel from "@/components/TeacherCoursePanel.vue";
import NotificationPanel from "@/components/NotificationPanel.vue";
import TeacherFilePanel from "@/components/TeacherFilePanel.vue";
import StudentFilePanel from "@/components/StudentFilePanel.vue";
import CoursePanelAffair from "@/components/CoursePanelAffair.vue";
import StudentPanelAffair from "@/components/StudentPanelAffair.vue";
import TeacherPanelAffair from "@/components/TeacherPanelAffair.vue";
import SidebarMenu from "@/components/Sidebar.vue";
import { useRouter } from "vue-router";
import { userAPI } from "@/utils/api";

export default {
  name: "TeacherDashboard",
  components: {
    SidebarMenu,
    StudentCoursePanel,
    TeacherCoursePanel,
    NotificationPanel,
    TeacherFilePanel,
    StudentFilePanel,
    CoursePanelAffair,
    StudentPanelAffair,
    TeacherPanelAffair,
  },
  data() {
    return {
      isLoading: true,
    };
  },
  setup() {
    const router = useRouter();
    const classItem = ref(null); // 存储当前选中的 classItem
    const isTeacher = userAPI.getRole() === "teacher";
    const isAffair = userAPI.getRole() === "teachingAffairs";
    const currentComponent = ref(
      isTeacher
        ? TeacherCoursePanel
        : isAffair
        ? CoursePanelAffair
        : StudentCoursePanel
    );

    // 切换到 ClassPanel
    const toClassPage = (class_id, course_id) => {
      console.log("Selected class dashboard:", class_id, course_id);
      router.push({
        name: "class-page",
        params: { classId: class_id, courseId: course_id },
      });
    };

    const updateComponent = (componentName) => {
      if (componentName === "CoursePanel") {
        currentComponent.value = isTeacher
          ? TeacherCoursePanel
          : StudentCoursePanel;
      } else if (componentName === "FilePanel") {
        currentComponent.value = isTeacher
          ? TeacherFilePanel
          : StudentFilePanel;
      } else {
        currentComponent.value = componentName;
      }
    };
    return {
      currentComponent,
      toClassPage,
      updateComponent,
      classItem,
      isTeacher,
      loadingAnimation,
    };
  },
  mounted() {
    // 在组件挂载后设置一个定时器来关闭加载动画
    setTimeout(() => {
      this.isLoading = false;
    }, 1500); // 1.5秒后关闭动画
  },
  methods: {
    navigateToCreateCourse() {
      if (this.$router) {
        this.$router.push("/create-course");
      } else {
        console.error("Router instance is not available.");
      }
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 添加loading时的背景遮罩 */
.Vue3Lottie {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.9);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.page-container {
  background: radial-gradient(
      circle at 20% 20%,
      rgba(185, 230, 249, 0.8) 0%,
      rgba(232, 240, 245, 0.4) 35%,
      transparent 70%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(187, 231, 217, 0.8) 0%,
      rgba(232, 245, 242, 0.4) 35%,
      transparent 70%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(230, 245, 245, 0.8) 0%,
      rgba(232, 245, 242, 0.4) 45%,
      transparent 80%
    ),
    radial-gradient(
      circle at 85% 15%,
      rgba(202, 223, 172, 0.7) 0%,
      rgba(230, 245, 240, 0.3) 50%,
      transparent 75%
    ),
    radial-gradient(
      circle at 15% 85%,
      rgba(230, 245, 242, 0.7) 0%,
      rgba(232, 245, 245, 0.3) 40%,
      transparent 75%
    ),
    linear-gradient(135deg, #e6f5f5 0%, #e8f0f5 50%, #e6f5f0 100%);
}
.dashboard {
  display: flex;
}
.content {
  margin: 20px;
  flex: 1;
}
</style>

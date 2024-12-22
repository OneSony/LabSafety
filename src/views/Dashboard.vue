<template>
  <div class="page-container">
    <div class="dashboard">
      <SidebarMenu @updateCurrentComponent="updateComponent" />
      <div class="content">
        <keep-alive>
          <component :is="currentComponent" />
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
    const isTeacher = userAPI.getRole() === "teacher";
    const isAffair = userAPI.getRole() === "teachingAffairs";
    const currentComponent = ref(
      isTeacher
        ? TeacherCoursePanel
        : isAffair
        ? CoursePanelAffair
        : StudentCoursePanel
    );

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
      updateComponent,
      isTeacher,
      loadingAnimation,
    };
  },
};
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white; /* 或者与你的页面背景色匹配 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 过渡动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

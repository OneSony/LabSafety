<template>
  <div class="dashboard">
    <SidebarMenu @updateCurrentComponent="updateComponent" />
    <div class="content">
      <component
        :is="currentComponent"
        :classItem="classItem"
        @show-class-panel="toClassPage"
      />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import StudentCoursePanel from "@/components/StudentCoursePanel.vue";
import TeacherCoursePanel from "@/components/TeacherCoursePanel.vue";
import NotificationPanel from "@/components/NotificationPanel.vue";
import TeacherFilePanel from "@/components/TeacherFilePanel.vue";
import StudentFilePanel from "@/components/StudentFilePanel.vue";
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
  },
  setup() {
    const router = useRouter();
    const classItem = ref(null); // 存储当前选中的 classItem
    const isTeacher = userAPI.getRole() === "teacher";
    const currentComponent = ref(
      isTeacher ? TeacherCoursePanel : StudentCoursePanel
    );

    // 切换到 ClassPanel
    const toClassPage = (class_id) => {
      router.push({ name: "class-page", params: { classId: class_id } });
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
    };
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
.dashboard {
  display: flex;
}
.content {
  margin: 20px;
  flex: 1;
}
</style>

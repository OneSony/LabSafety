<template>
  <div class="dashboard">
    <SidebarMenu @updateCurrentComponent="updateComponent" />
    <div class="content">
      <!-- 动态加载组件 -->
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
import CoursePanel from "@/components/CoursePanel.vue";
import NotificationPanel from "@/components/NotificationPanel.vue";
import FilePanel from "@/components/StudentFilePanel.vue";
import SidebarMenu from "@/components/Sidebar.vue";
import { useRouter } from "vue-router";

export default {
  name: "StudentDashboard",
  components: {
    SidebarMenu,
    CoursePanel,
    NotificationPanel,
    FilePanel,
  },
  setup() {
    const router = useRouter();
    const currentComponent = ref(CoursePanel); // 默认显示 CoursePanel
    const classItem = ref(null); // 存储当前选中的 classItem

    // 切换到 ClassPanel
    const toClassPage = (class_id) => {
      console.log("Show class panel:", class_id);
      router.push({ name: "class-page", params: { classId: class_id } });
    };

    const updateComponent = (componentName) => {
      console.log("Update component!!:", componentName);
      currentComponent.value = componentName;
    };

    return {
      currentComponent,
      toClassPage,
      updateComponent,
      classItem, // classItem 数据
    };
  },
};
</script>

<style scoped>
.dashboard {
  height: 100vh;
  /* 确保父容器的高度充满视窗 */
  display: flex;
}

.content {
  margin: 20px;
  flex: 1;
}
</style>

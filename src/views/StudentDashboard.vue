<template>
  <div class="dashboard">
    <SidebarMenu />
    <div class="content">
      <!-- 动态加载组件 -->
      <component
        :is="currentComponent"
        :classItem="classItem"
        @go-back-to-course-panel="backToCoursePanel"
        @show-class-panel="showClassPanel"
      />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import CoursePanel from "@/components/CoursePanel.vue";
import ClassPanel from "@/components/ClassPanel.vue";
import SidebarMenu from "@/components/Sidebar.vue";

export default {
  name: "StudentDashboard",
  components: {
    SidebarMenu,
    CoursePanel,
    ClassPanel,
  },
  setup() {
    const currentComponent = ref(CoursePanel); // 默认显示 CoursePanel
    const classItem = ref(null); // 存储当前选中的 classItem

    // 切换到 ClassPanel
    const showClassPanel = (item) => {
      classItem.value = item; // 存储传递过来的 classItem
      currentComponent.value = ClassPanel; // 切换到 ClassPanel
    };

    // 切换回 CoursePanel
    const backToCoursePanel = () => {
      currentComponent.value = CoursePanel; // 切换回 CoursePanel
    };

    return {
      currentComponent,
      showClassPanel,
      backToCoursePanel,
      classItem, // classItem 数据
    };
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
}
.content {
  flex: 1;
}
</style>

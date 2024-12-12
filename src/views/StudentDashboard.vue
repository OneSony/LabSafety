<template>
  <div class="dashboard">
    <SidebarMenu />
    <div class="content">
      <!-- 动态加载组件 -->
      <component
        :is="currentComponent"
        :classItem="classItem"
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
import { useRouter } from "vue-router";

export default {
  name: "StudentDashboard",
  components: {
    SidebarMenu,
    CoursePanel,
    ClassPanel,
  },
  setup() {
    const router = useRouter();
    const currentComponent = ref(CoursePanel); // 默认显示 CoursePanel
    const classItem = ref(null); // 存储当前选中的 classItem

    // 切换到 ClassPanel
    const showClassPanel = (class_id) => {
      console.log("Show class panel:", class_id);
      router.push({ name: "class-page", params: { classId: class_id } });
    };

    return {
      currentComponent,
      showClassPanel,
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

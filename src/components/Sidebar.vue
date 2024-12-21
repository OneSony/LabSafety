<template>
  <div class="sidebar-wrapper">
    <el-menu :default-active="activeIndex" class="sidebar-menu">
      <el-sub-menu index="1" v-if="!isAffair">
        <template #title>
          <i class="el-icon-setting"></i>
          <span>我的</span>
        </template>
        <el-menu-item index="1-1" @click="changeComponent('CoursePanel')">
          <el-icon><House /></el-icon>实验
        </el-menu-item>
        <el-menu-item index="1-2" @click="changeComponent('NotificationPanel')">
          <el-icon><ChatRound /></el-icon>通知
        </el-menu-item>
        <el-menu-item index="1-3" @click="changeComponent('FilePanel')">
          <el-icon><Paperclip /></el-icon>文件
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2" v-if="isAffair">
        <template #title>
          <i class="el-icon-setting"></i>
          <span>管理</span>
        </template>
        <el-menu-item index="2-1" @click="changeComponent('CoursePanelAffair')">
          <el-icon><Star /></el-icon>课程
        </el-menu-item>
        <el-menu-item
          index="2-2"
          @click="changeComponent('StudentPanelAffair')"
        >
          <el-icon><User /></el-icon>学生
        </el-menu-item>
        <el-menu-item
          index="2-3"
          @click="changeComponent('TeacherPanelAffair')"
        >
          <el-icon><DataBoard /></el-icon>老师
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <i class="el-icon-setting"></i>
          <span>设置</span>
        </template>
        <el-menu-item index="3-1" @click="navigateToProfile">
          <el-icon><Operation /></el-icon>个人中心
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script>
import { userAPI } from "@/utils/api";
export default {
  name: "SidebarMenu",
  setup() {
    const isAffair = userAPI.getRole() === "teachingAffairs";
    const activeIndex = isAffair ? "2-1" : "1-1";
    return { isAffair, activeIndex };
  },
  methods: {
    changeComponent(componentName) {
      console.log("Change component:", componentName);
      this.$emit("updateCurrentComponent", componentName);
    },
    navigateToProfile() {
      this.$router.push("/profile");
    },
  },
};
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
  height: 100vh;
  width: 200px;
}

.sidebar-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  z-index: -1;
}

.sidebar-menu {
  height: 100%;
  width: 100%;
  background: transparent;
  border: none;
}

:deep(.el-menu) {
  background-color: transparent !important;
  border-right: none !important;
}

:deep(.el-sub-menu__title) {
  background-color: transparent !important;
  color: #2c3e50 !important;
  transition: all 0.3s ease;
}

:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.el-menu-item) {
  background-color: transparent !important;
  color: #2c3e50 !important;
  transition: all 0.3s ease;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.4) 100%
  ) !important;
  color: #409eff !important;
  backdrop-filter: blur(4px);
}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  padding: 0 20px !important;
}

:deep(.el-icon) {
  margin-right: 8px;
  font-size: 18px;
}
.sidebar-menu {
  height: 100vh;
  width: 200px;
  border-right: 1px solid #ebeef5;
}
</style>

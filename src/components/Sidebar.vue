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
@supports not (backdrop-filter: blur(10px)) {
  .sidebar-wrapper {
    background: rgba(255, 255, 255, 0.95);
  }
}
.sidebar-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.6); /* 半透明背景 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
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
  background-color: rgba(255, 255, 255, 0.3) !important;
}

/* 子菜单弹出层样式 */
:deep(.el-menu--popup) {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
  background: rgba(64, 158, 255, 0.1) !important;
  color: #409eff !important;
}

/* 美化图标和文字间距 */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 12px;
  font-size: 18px;
  vertical-align: middle;
}

/* 添加阴影和边框效果 */
.sidebar-wrapper::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 1px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0.1)
  );
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .sidebar-wrapper {
    width: 60px;
    transition: width 0.3s;
  }

  .sidebar-wrapper:hover {
    width: 200px;
  }
}

/* 保持内容间距一致 */
:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  padding: 0 16px !important;
}

.sidebar-menu {
  height: 100vh;
  width: 200px;
  border-right: 1px solid #ebeef5;
}
</style>

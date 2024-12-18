<template>
  <el-menu :default-active="activeIndex" class="sidebar-menu">
    <el-sub-menu index="1" v-if="!isAffair">
      <template #title><i class="el-icon-setting"></i>我的</template>
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
      <template #title><i class="el-icon-setting"></i>管理</template>
      <el-menu-item index="2-1" @click="changeComponent('CoursePanelAffair')">
        <el-icon><Star /></el-icon>课程
      </el-menu-item>
      <el-menu-item index="2-2" @click="changeComponent('StudentPanelAffair')">
        <el-icon><User /></el-icon>学生
      </el-menu-item>
      <el-menu-item index="2-3" @click="changeComponent('TeacherPanelAffair')">
        <el-icon><DataBoard /></el-icon>老师
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title><i class="el-icon-setting"></i> 设置</template>
      <el-menu-item index="3-1" @click="navigateToProfile">
        <el-icon><Operation /></el-icon>个人中心</el-menu-item
      >
    </el-sub-menu>
  </el-menu>
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
.sidebar-menu {
  height: 100vh;
  width: 200px;
  border-right: 1px solid #ebeef5;
}
</style>

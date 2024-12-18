<template>
  <el-menu :default-active="activeIndex" class="sidebar-menu">
    <el-sub-menu index="1">
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
    <el-sub-menu index="2">
      <template #title><i class="el-icon-setting"></i> 设置</template>
      <el-menu-item index="2-1" @click="navigateToProfile">
        <el-icon><Operation /></el-icon>个人中心</el-menu-item
      >
    </el-sub-menu>
  </el-menu>
</template>

<script>
export default {
  name: "SidebarMenu",
  data() {
    return {
      activeIndex: "1-1",
    };
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

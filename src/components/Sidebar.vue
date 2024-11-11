<template>
  <el-menu :default-active="activeIndex" router class="sidebar-menu">
    <el-menu-item index="1"
      ><i class="el-icon-s-home"></i> 我的实验</el-menu-item
    >
    <el-menu-item index="2"
      ><i class="el-icon-s-comment"></i> 学生互助</el-menu-item
    >
    <el-menu-item index="3"
      ><i class="el-icon-s-data"></i> 安全报告</el-menu-item
    >
    <el-menu-item index="4"
      ><i class="el-icon-s-check"></i> 安全测评</el-menu-item
    >
    <el-menu-item index="5"
      ><i class="el-icon-s-tools"></i> 实验知识</el-menu-item
    >
    <el-sub-menu index="6">
      <template #title><i class="el-icon-setting"></i> 设置</template>
      <el-menu-item index="6-1">个人中心</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script>
export default {
  name: "SidebarMenu",
  data() {
    return {
      activeIndex: "1",
    };
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

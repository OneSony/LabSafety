<template>
  <el-header class="header">
    <img src="@/assets/tlsa.png" alt="Logo" class="logo" />
    <!-- <span class="title">TLSA</span> -->
  </el-header>
</template>

<script>
export default {
  name: "HeaderComponent",
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: start;
  background-color: #f5f7fa;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #ebeef5;
}
.logo {
  height: 40px;
  margin-right: 15px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}
</style>

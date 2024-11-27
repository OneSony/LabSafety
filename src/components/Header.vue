<template>
  <el-header class="header">
    <div class="logo-container">
      <img src="@/assets/tlsa.png" alt="Logo" class="logo" />
      <span class="role-text">{{ roleText }}</span>
    </div>
    <div class="user-info" @click="navigateToProfile">
      <img class="avatar" :src="user.avatar" alt="头像" />
      <span class="username">{{ user.name }}</span>
    </div>
  </el-header>
</template>

<script>
export default {
  name: "HeaderComponent",
  data() {
    return {
      user: {
        name: "张三", // 示例用户数据
        avatar: "https://via.placeholder.com/40", // 默认头像链接
        role: "student", // 示例角色
      },
    };
  },
  computed: {
    roleText() {
      switch (this.user.role) {
        case "student":
          return "学生";
        case "teacher":
          return "教师";
        case "lab_manager":
          return "实验室安全员";
        default:
          return "未知角色";
      }
    },
  },
  methods: {
    navigateToProfile() {
      if (this.$router) {
        this.$router.push("/profile");
      } else {
        console.error("Router instance is not available.");
      }
    },
  },
};
</script>

<style scoped>
/* 修改 Logo 后面的角色文本 */
.role-text {
  font-size: 18px; /* 修改字体大小 */
  font-weight: bold; /* 加粗字体 */
  color: #007bff; /* 设置字体颜色为蓝色 */
  font-family: "Arial", sans-serif; /* 设置字体为 Arial */
}

/* 修改用户名的样式 */
.username {
  font-size: 16px; /* 设置字体大小 */
  color: #2c3e50; /* 设置字体颜色 */
  font-family: "Arial", monospace; /* 使用等宽字体 */
}

/* 顶栏整体样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f7fa;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #ebeef5;
}

/* Logo 和角色文字容器 */
.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

/* 用户信息区域 */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>

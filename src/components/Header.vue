<template>
  <el-header class="header">
    <div class="logo-container" @click="navigateToDashboard">
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
        role: "teacher", // 示例角色
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
    navigateToDashboard() {
      this.$router.push("/dashboard"); // 跳转到主页面
    },
    navigateToProfile() {
      this.$router.push("/profile"); // 跳转到个人信息页面
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f7fa;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #ebeef5;
}

.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  height: 40px;
  margin-right: 15px;
}

.role-text {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
}

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

.username {
  font-size: 16px;
  color: #2c3e50;
}
</style>

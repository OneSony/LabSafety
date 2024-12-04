<template>
  <el-header class="header">
    <img src="@/assets/tlsa.png" alt="Logo" class="logo" />
    <div v-if="isUserInfoVisible" class="user-info" @click="navigateToProfile">
      <img class="avatar" :src="user.avatar" alt="头像" />
      <span class="username">{{ user.name }}</span>
    </div>
  </el-header>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "HeaderComponent",
  data() {
    return {
      user: {
        name: "张三", // 示例用户数据
        avatar: "https://via.placeholder.com/40", // 默认头像链接
      },
      isUserInfoVisible: true, // 默认显示用户信息
    };
  },
  watch: {
    // 监听路由变化，判断当前路由是否是需要隐藏 user-info 的页面
    $route(to, from) {
      this.isUserInfoVisible = !["/login"].includes(to.path); // 在登录或注册页面隐藏 user-info
    },
  },
  methods: {
    navigateToProfile() {
      // const router = useRouter();
      if (this.$router) {
        this.$router.push("/profile"); // 确保路由路径正确
      } else {
        console.error("Router instance is not available.");
      } // 跳转到个人信息页面
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右分布 */
  background-color: #f5f7fa;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #ebeef5;
}
.logo {
  height: 40px;
  margin-right: 15px;
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

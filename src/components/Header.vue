<template>
  <el-header class="header">
    <div style="display: flex; align-items: center">
      <router-link to="/" class="logo-link">
        <img src="@/assets/tlsa.png" alt="Logo" class="logo" />
      </router-link>
      <el-tag type="success">{{ roleText }}</el-tag>
    </div>

    <!-- 用户信息部分，加入下拉菜单 -->
    <el-dropdown
      v-model:visible="isDropdownVisible"
      trigger="hover"
      class="user-info-dropdown"
    >
      <div class="user-info">
        <img class="avatar" :src="userPhoto" alt="头像" />
        <span class="username">{{ userName }}</span>
      </div>

      <template v-slot:dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="navigateToProfile"
            >个人信息</el-dropdown-item
          >
          <el-dropdown-item @click="logout">退出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<script>
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { userAPI } from "@/utils/api";
import { ref, watch } from "vue";
import { onMounted } from "vue";

export default {
  name: "HeaderComponent",
  setup() {
    const route = useRoute();
    const isUserInfoVisible = userAPI.isLoggedIn();

    console.log("login status??", isUserInfoVisible);
    console.log("api??", userAPI.isLoggedIn());

    const userName = ref(userAPI.getUsername() || "未登录");
    const roleText = ref("");
    const userPhoto = "https://via.placeholder.com/40";

    watch(route, () => {
      userName.value = userAPI.getUsername() || "未登录";
      const role = userAPI.getRole();
      switch (role) {
        case "student":
          roleText.value = "学生";
          break;
        case "teacher":
          roleText.value = "教师";
          break;
        case "manager":
          roleText.value = "实验室管理员";
          break;
        case "teachingAffairs":
          roleText.value = "教务";
          break;
        default:
          roleText.value = "未知";
      }
      console.log("text: ", roleText.value);
      console.log("route changed");
    });

    return {
      isUserInfoVisible,
      userName,
      roleText,
      //userPhoto,
    };
  },
  methods: {
    navigateToDashboard() {
      this.$router.push("/"); // 跳转到主页面
    },
    navigateToProfile() {
      // const router = useRouter();
      if (this.$router) {
        this.$router.push("/profile"); // 确保路由路径正确
      } else {
        console.error("Router instance is not available.");
      } // 跳转到个人信息页面
    },
    logout() {
      // 退出登录
      userAPI.logout();
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

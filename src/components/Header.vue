<template>
  <el-header class="header">
    <div style="display: flex; align-items: center">
      <router-link to="/" class="logo-link">
        <img src="@/assets/tlsa.png" alt="Logo" class="logo" />
      </router-link>
      <el-tag type="success" v-if="isUserInfoVisible">{{ roleText }}</el-tag>
    </div>

    <!-- 用户信息部分，加入下拉菜单 -->
    <el-dropdown
      v-if="isUserInfoVisible"
      v-model:visible="isDropdownVisible"
      trigger="hover"
      class="user-info-dropdown"
    >
      <div class="user-info">
        <ProfilePhoto :url="userPhoto" size="50px" />
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
import ProfilePhoto from "@/components/ProfilePhoto.vue";

export default {
  name: "HeaderComponent",
  components: {
    ProfilePhoto, // 注册组件
  },
  setup() {
    const route = useRoute();
    const isUserInfoVisible = ref(userAPI.isLoggedIn());

    const userName = ref("");

    const fetchUserName = async () => {
      userName.value = (await userAPI.getUsername()) || "未知";
    };

    fetchUserName();
    const roleText = ref("");
    const userPhoto = ref("");

    const updateUserPhoto = async () => {
      try {
        userPhoto.value = await userAPI.getAvatar();
      } catch (error) {
        console.error("Error fetching avatar:", error);
        userPhoto.value = ""; // ProfilePhoto 组件会使用默认头像
      }
    };

    watch(route, async () => {
      isUserInfoVisible.value = userAPI.isLoggedIn();
      userPhoto.value = (await userAPI.getAvatar()) || "";
      userName.value = (await userAPI.getUsername()) || "未知";
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
    });

    return {
      isUserInfoVisible,
      userName,
      roleText,
      userPhoto,
      updateUserPhoto,
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
  background-color: rgba(245, 247, 250, 0.8);
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
:deep(.el-dropdown) {
  border: none !important;
  outline: none !important;
}

:deep(.el-dropdown:focus) {
  border: none !important;
  outline: none !important;
}

:deep(.el-dropdown:hover) {
  border: none !important;
  outline: none !important;
}

.user-info:hover {
  border: none !important;
  outline: none !important;
}

/* 如果还有边框，可以添加这个来确保边框完全消失 */
:deep(.el-dropdown-selfdefine) {
  border: none !important;
  outline: none !important;
}

.username {
  padding-left: 10px;
  font-size: 16px;
  color: #2c3e50;
}
</style>

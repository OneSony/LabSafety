<template>
  <el-header class="header">
    <router-link to="/" class="logo-link">
      <img src="@/assets/tlsa.png" alt="Logo" class="logo" />
    </router-link>

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
import { useStore } from "vuex"; // 引入 useStore
import { computed } from "vue";

export default {
  name: "HeaderComponent",
  setup() {
    const route = useRoute();
    const isUserInfoVisible = useStore().state.isAuthenticated;

    console.log("login status??", isUserInfoVisible);
    console.log("store??", useStore().state.isAuthenticated);

    const store = useStore();

    const userName = computed(() => store.state.user || "未登录");
    const userPhoto = "https://via.placeholder.com/40";

    return {
      isUserInfoVisible,
      userName,
      //userPhoto,
    };
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
    logout() {
      // 退出登录
      this.$store.dispatch("logout");
      this.$router.push("/login");
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

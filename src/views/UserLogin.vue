<template>
  <div class="page-container">
    <div class="login-container">
      <!-- 左侧欢迎区域 -->
      <div class="welcome-section">
        <h1 class="welcome-title">WELCOME</h1>
        <div class="welcome-image">
          <img src="../assets/welcome.png" alt="Welcome" />
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <h2 class="login-title">Login</h2>
        <el-form
          :model="loginForm"
          @submit.prevent="handleLogin"
          label-width="0"
        >
          <el-form-item prop="user_id">
            <el-input
              v-model="loginForm.user_id"
              placeholder="your account"
              class="custom-input"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              type="password"
              v-model="loginForm.password"
              placeholder="your password"
              class="custom-input"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="login-button"
              >Login</el-button
            >
            <!-- <el-button @click="isDialogVisible = true" class="register-button"
              >注册</el-button
            > -->
          </el-form-item>
        </el-form>

        <!-- 注册对话框 -->
        <el-dialog v-model="isDialogVisible" title="注册" width="400px">
          <!-- 注册表单内容保持不变 -->
          <p>页面会被弃用, 应使用TeachingAffair注册账号</p>
          <el-form
            :model="registerForm"
            @submit.prevent="handleRegister"
            label-width="80px"
          >
            <!-- 注册表单项保持不变 -->
          </el-form>
          <template #footer>
            <el-button @click="isDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleRegister">注册</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router"; // 导入 useRouter
import { onMounted } from "vue"; // 引入 onMounted
import {
  ElDialog,
  ElInput,
  ElButton,
  ElForm,
  ElFormItem,
  ElMessage,
} from "element-plus"; // 导入 Element Plus 组件
import { userAPI } from "../utils/api";

export default {
  name: "UserLogin",

  data() {
    return {
      isDialogVisible: false,
    };
  },

  setup() {
    const loginForm = ref({
      user_id: "",
      password: "",
    });

    const registerForm = ref({
      user_id: "",
      real_name: "",
      password: "",
    });

    onMounted(() => {
      if (!userAPI.isLoggedIn()) {
        ElMessage.warning("请登录以查看更多内容"); // 如果未登录，显示 ElMessage 提示
      } else {
        ElMessage.success("已经登陆"); // 如果已登录，显示欢迎信息
      }
    });

    console.log("login status", userAPI.isLoggedIn());

    return {
      loginForm,
      registerForm,
    };
  },

  methods: {
    async handleLogin() {
      const { user_id, password } = this.loginForm;
      const result = await userAPI.login(user_id, password);

      if (result.success) {
        // 登录成功
        ElMessage.success("登录成功！");
        this.loginError = ""; // 清除错误信息
        this.$router.push("/");
      } else {
        // 登录失败
        this.loginError = result.error || "Login failed"; // 设置错误信息
        ElMessage.error(`错误：${this.loginError}`);
      }
    },

    async handleRegister() {
      const { user_id, real_name, password } = this.registerForm; // 使用 `this.loginForm` 访问表单数据
      const result = await userAPI.register(user_id, real_name, password);

      console.log("rrr status", result);
      if (result.success) {
        ElMessage.success("注册成功！");
        console.log("rrr status");

        this.loginForm.user_id = this.registerForm.user_id;
        this.loginForm.password = this.registerForm.password;
        this.isDialogVisible = false;
        this.handleLogin();
      } else {
        this.loginError = result.error || "Login failed"; // 设置错误信息
        ElMessage.error(`错误：${this.loginError}`);
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  width: 300px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.el-dialog .el-form-item {
  margin-bottom: 20px; /* 自定义间距 */
}
.page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.login-container {
  display: flex;
  width: 900px;
  height: 500px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.welcome-section {
  width: 450px;
  position: relative;
  background: linear-gradient(135deg, #e6d5e0 0%, #d8e1f3 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  border-radius: 20px;
  overflow: hidden;
}

.welcome-title {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 50px;
  top: -150px;
}

.welcome-subtitle {
  font-size: 1.2em;
  margin-bottom: 30px;
}

.welcome-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.welcome-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.welcome-title {
  position: relative;
  z-index: 1;
}

.welcome-subtitle {
  position: relative;
  z-index: 1;
}

.form-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  color: #666;
  font-size: 2em;
  margin-bottom: 40px;
}

.custom-input :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border: none;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  margin-bottom: 15px;
}

.register-button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 15px;
}

:deep(.el-dialog .el-form-item) {
  margin-bottom: 20px;
}
</style>

<template>
  <div class="login-container">
    <el-form
      :model="loginForm"
      @submit.prevent="handleLogin"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          v-model="loginForm.password"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
        <el-button @click="isDialogVisible = true">注册</el-button>

        <el-dialog v-model="isDialogVisible" title="注册" width="400px">
          <!-- 注册表单内容 -->
          <el-form
            :model="registerForm"
            @submit.prevent="handleRegister"
            label-width="80px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
              ></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>
          </el-form>

          <!-- 弹窗底部按钮 -->
          <template #footer>
            <el-button @click="isDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleRegister">注册</el-button>
          </template>
        </el-dialog>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ref } from "vue";
import { useRouter } from "vue-router"; // 导入 useRouter
import { useStore } from "vuex"; // 引入 useStore
import { onMounted } from "vue"; // 引入 onMounted
import {
  ElDialog,
  ElInput,
  ElButton,
  ElForm,
  ElFormItem,
  ElMessage,
} from "element-plus"; // 导入 Element Plus 组件
import userAPI from "../utils/api";

export default {
  name: "UserLogin",

  data() {
    return {
      isDialogVisible: false,
    };
  },

  setup() {
    const loginForm = ref({
      username: "",
      password: "",
    });

    const registerForm = ref({
      username: "",
      password: "",
    });

    onMounted(() => {
      if (!useStore().state.isAuthenticated) {
        ElMessage.warning("请登录以查看更多内容"); // 如果未登录，显示 ElMessage 提示
      } else {
        ElMessage.success("已经登陆"); // 如果已登录，显示欢迎信息
      }
    });

    console.log("login status", useStore().state.isAuthenticated);

    return {
      loginForm,
      registerForm,
    };
  },

  methods: {
    async handleLogin() {
      const { username, password } = this.loginForm;
      const result = await this.$store.dispatch("login", {
        username,
        password,
      });

      if (result.success) {
        // 登录成功
        ElMessage.success("登录成功！");
        console.log("login status", this.$store.state.isAuthenticated);
        this.loginError = ""; // 清除错误信息
        this.$router.push("/dashboard"); // 跳转到 dashboard 或其他页面
      } else {
        // 登录失败
        this.loginError = result.error || "Login failed"; // 设置错误信息
        ElMessage.error(`错误：${this.loginError}`);
      }
    },

    async handleRegister() {
      // 直接用api不经过store
      const { username, password } = this.registerForm; // 使用 `this.loginForm` 访问表单数据
      const result = await userAPI.register(username, password);

      console.log("rrr status", result);
      if (result.success) {
        ElMessage.success("注册成功！");
        console.log("rrr status");

        this.loginForm.username = this.registerForm.username;
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
</style>

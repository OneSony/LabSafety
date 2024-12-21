<template>
  <div class="login-container">
    <el-form
      :model="loginForm"
      @submit.prevent="handleLogin"
      label-width="80px"
    >
      <el-form-item label="id" prop="user_id">
        <el-input v-model="loginForm.user_id" placeholder="请输入id"></el-input>
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
          <p>页面会被弃用, 应使用TeachingAffair注册账号</p>
          <el-form
            :model="registerForm"
            @submit.prevent="handleRegister"
            label-width="80px"
          >
            <el-form-item label="学号" prop="user_id">
              <el-input
                v-model="registerForm.user_id"
                placeholder="请输入学号"
              ></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="real_name">
              <el-input
                v-model="registerForm.real_name"
                placeholder="请输入姓名"
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
</style>

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
import {
  ElDialog,
  ElInput,
  ElButton,
  ElForm,
  ElFormItem,
  ElMessage,
} from "element-plus"; // 导入 Element Plus 组件
import userAPI from "../utils/api.js";

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

    const router = useRouter(); // 使用 useRouter 获取路由实例

    const handleLogin = async () => {
      try {
        console.log("登录信息：", loginForm.value);
        const { username, password } = loginForm.value;
        const response = await userAPI.login(username, password);
        console.log("response", response);
        if (response.status === 200) {
          console.log("登录成功");
          ElMessage.success("登录成功！");
          router.push("/dashboard"); // 跳转到仪表盘
        } else {
          console.error("登录失败，原因：", response.data.message);
          ElMessage.error(response.data.message || "登录失败，未知错误！");
        }
      } catch (error) {
        console.error("登录失败：", error);
        ElMessage.error(`错误：${error.response.statusText || "未知错误！"}`);
      }
    };

    const handleRegister = async () => {
      try {
        console.log("注册信息：", registerForm.value);
        const { username, password } = registerForm.value;
        const response = await userAPI.register(username, password);
        if (response.status === 201) {
          console.log("注册成功");
          //isDialogVisible = false; //TODO
          ElMessage.success("注册成功！");
          loginForm.value = { username, password }; // 注册成功后自动填充登录表单
          handleLogin(); // 注册成功后自动登录
        } else {
          console.error("注册失败，原因：", response.data.message);
          ElMessage.error(response.data.message || "注册失败，未知错误！");
        }
      } catch (error) {
        console.error("注册失败：", error);
        ElMessage.error(`错误：${error.response.statusText || "未知错误！"}`);
      }
    };

    return {
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
    };
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

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
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router"; // 导入 useRouter

export default {
  name: "UserLogin",
  setup() {
    const loginForm = ref({
      username: "",
      password: "",
    });
    const router = useRouter(); // 使用 useRouter 获取路由实例

    const handleLogin = async () => {
      try {
        console.log("登录信息：", loginForm.value);
        const { username, password } = loginForm.value;
        const credentials = { username, password };

        // 假设这里进行 API 调用（登录）
        // const response = await userAPI.login(credentials);

        // 登录成功后跳转到仪表盘
        console.log("登录成功");
        router.push("/dashboard"); // 使用 router.push() 跳转
      } catch (error) {
        console.error("登录失败：", error);
        // 这里可以处理错误，比如显示提示框
      }
    };

    return {
      loginForm,
      handleLogin,
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
</style>

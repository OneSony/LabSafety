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
            <div class="input-with-history">
              <el-input
                v-model="loginForm.user_id"
                placeholder="学号、工作证号或账号"
                class="custom-input"
                @focus="showHistoryPopup = true"
              ></el-input>
              <!-- 历史账号悬浮框 -->
              <div
                v-if="showHistoryPopup && historyAccounts.length"
                class="history-popup"
              >
                <div
                  v-for="account in historyAccounts"
                  :key="account.user_id"
                  class="history-item"
                  @click="fillAccountInfo(account)"
                >
                  <span class="account-id">{{ account.user_id }}</span>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              type="password"
              v-model="loginForm.password"
              placeholder="密码"
              @keyup.enter="handleLogin"
              class="custom-input"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberAccount">记住账号</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="login-button"
              >登录</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { userAPI } from "../utils/api";

export default {
  name: "UserLogin",

  setup() {
    const loginForm = ref({
      user_id: "",
      password: "",
    });

    const historyAccounts = ref([]);
    const rememberAccount = ref(true);
    const showHistoryPopup = ref(false);

    // 从 localStorage 加载历史账号
    const loadHistoryAccounts = () => {
      const accounts = localStorage.getItem("historyAccounts");
      if (accounts) {
        historyAccounts.value = JSON.parse(accounts);
      }
    };

    // 保存账号到历史记录
    const saveToHistory = (account) => {
      if (!rememberAccount.value) return;

      const accounts = [...historyAccounts.value];
      const existingIndex = accounts.findIndex(
        (a) => a.user_id === account.user_id
      );

      const newAccount = {
        ...account,
        lastLogin: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        accounts.splice(existingIndex, 1);
      }

      accounts.unshift(newAccount);

      // 限制最多保存5个历史账号
      if (accounts.length > 5) {
        accounts.pop();
      }

      localStorage.setItem("historyAccounts", JSON.stringify(accounts));
      historyAccounts.value = accounts;
    };

    // 填充账号信息
    const fillAccountInfo = (account) => {
      loginForm.value.user_id = account.user_id;
      loginForm.value.password = account.password || "";
      showHistoryPopup.value = false;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    // 点击外部关闭历史记录弹窗
    const handleClickOutside = (event) => {
      const popup = document.querySelector(".history-popup");
      const input = document.querySelector(".input-with-history");
      if (popup && input && !input.contains(event.target)) {
        showHistoryPopup.value = false;
      }
    };

    onMounted(() => {
      loadHistoryAccounts();
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    const router = useRouter();

    const handleLogin = async () => {
      const { user_id, password } = loginForm.value;
      const result = await userAPI.login(user_id, password);

      if (result.success) {
        if (rememberAccount.value) {
          saveToHistory({ user_id, password });
        }
        ElMessage.success("登录成功！");
        router.push("/");
      } else {
        ElMessage.error(`错误：${result.error || "登录失败"}`);
        loginForm.value.password = "";
      }
    };

    return {
      loginForm,
      historyAccounts,
      rememberAccount,
      showHistoryPopup,
      handleLogin,
      fillAccountInfo,
      formatDate,
    };
  },
};
</script>

<style scoped>
:deep(.el-checkbox__label) {
  color: #666;
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #764ba2; /* 选中后的背景颜色 */
  border-color: #764ba2; /* 选中后的边框颜色 */
}

/* 鼠标悬停时的颜色 */
:deep(.el-checkbox__input.is-checked:hover .el-checkbox__inner) {
  border-color: #6a4494; /* 选中后悬停时的边框颜色 */
}

.input-with-history {
  position: relative;
  width: 100%;
}

.history-popup {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e1dce6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.history-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:hover {
  background-color: #f7f5fa;
}

.account-id {
  font-weight: 500;
}

.last-login {
  color: #999;
  font-size: 0.9em;
}
.page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(
    circle at center,
    #e6f5f5 0%,
    #e8f0f5 25%,
    #e6f5f0 50%,
    #e8f5f2 75%,
    #e6f5f0 100%
  );
}

.login-container {
  top: -20px;
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
  width: 80%;
  height: 50px;
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a71d9 0%, #6a4494 100%);
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #4a61c9 0%, #5a3484 100%);
}

.login-button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.3s ease;
}

.login-button:hover::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
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

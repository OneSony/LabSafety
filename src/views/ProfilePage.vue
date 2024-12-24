<template>
  <div class="page-container">
    <el-button class="back-button" @click="$router.back()">
      <el-icon><Back /></el-icon>
      返回
    </el-button>
    <div class="profile-container">
      <!-- 左侧头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-upload
            ref="upload"
            class="avatar-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <div class="avatar-content">
              <ProfilePhoto
                :url="userInfoForm.avatar || defaultAvatar"
                size="200px"
              />
              <div class="upload-overlay">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
          </el-upload>
        </div>
        <h2 class="username">{{ userInfo.username }}</h2>
        <el-tag type="success" class="role-tag">{{ userInfo.role_str }}</el-tag>
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-section">
        <h2 class="section-title">个人信息</h2>
        <el-form :model="userInfo" label-width="120px">
          <el-form-item :label="userInfo.role === 'student' ? '学号' : '工号'">
            <el-input v-model="userInfo.id" :disabled="true" />
          </el-form-item>
          <el-form-item label="院系">
            <el-input v-model="userInfo.department" :disabled="true" />
          </el-form-item>
          <el-form-item label="手机">
            <el-input v-model="userInfoForm.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userInfoForm.email" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入新密码"
            />
          </el-form-item>
        </el-form>

        <!-- 保存按钮 -->
        <div class="save-button-container">
          <el-button type="primary" @click="saveProfile" class="save-button">
            保存修改
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ProfilePhoto from "@/components/ProfilePhoto.vue";
import { userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import { defineComponent } from "vue";
import { Upload, Back } from "@element-plus/icons-vue";
import defaultAvatar from "@/assets/default-avatar.png";

interface UserInfo {
  role: string;
  role_str: string;
  avatar: string;
  username: string;
  id: string;
  email: string;
  phone: string;
  department: string;
}

export default defineComponent({
  components: {
    ProfilePhoto,
    Upload,
    Back,
  },
  name: "UserProfile",
  data() {
    return {
      userInfo: {
        role: "",
        role_str: "",
        avatar: defaultAvatar, // 添加默认头像
        username: "",
        id: "",
        email: "",
        phone: "",
        department: "",
      } as UserInfo,
      userInfoForm: {
        email: "",
        phone: "",
        avatar: defaultAvatar, // 添加默认头像
      } as UserInfo,
      password: "" as string,
      file: null as File | null,
    };
  },
  mounted() {
    // 模拟获取用户信息
    this.userInfo.id = userAPI.getUserId() || "";
    this.userInfo.role = userAPI.getRole() || "";
    switch (this.userInfo.role) {
      case "student":
        this.userInfo.role_str = "学生";
        break;
      case "teacher":
        this.userInfo.role_str = "教师";
        break;
      case "manager":
        this.userInfo.role_str = "实验室管理员";
        break;
      case "teachingAffairs":
        this.userInfo.role_str = "教务";
        break;
      default:
        this.userInfo.role_str = "未知";
    }
    this.fetchUserInfo();
  },
  methods: {
    handleFileChange(fileObj: any) {
      const selectedFile = fileObj.raw;
      this.file = selectedFile; // 存储文件对象

      // 使用 FileReader 读取本地图片并显示
      const reader = new FileReader();
      reader.onload = () => {
        this.userInfoForm.avatar = reader.result as string; // 显示头像
      };
      reader.readAsDataURL(selectedFile);
    },

    async fetchUserInfo() {
      // 模拟获取用户信息
      //TODO
      const result = await userAPI.getUserInfo(this.userInfo.id);
      console.log("User info!!:", result);
      if (result.success) {
        this.userInfo.username = result.data[0].real_name || "";
        this.userInfo.email = result.data[0].email || "";
        this.userInfo.phone = result.data[0].phone_number || "";
        this.userInfo.department = result.data[0].department || "";
        this.userInfo.avatar = result.data[0].profile_picture || defaultAvatar;

        this.userInfoForm.email = this.userInfo.email;
        this.userInfoForm.phone = this.userInfo.phone;
        this.userInfoForm.avatar = this.userInfo.avatar;

        (this.$root as any).updateHeader(); // `this.$root` 访问到父组件（App.vue）
      } else {
        ElMessage.error("获取用户信息失败");
      }
      console.log("User info:", this.userInfo);
    },
    async saveProfile() {
      console.log("Profile saved:", this.userInfo);
      const formData = new FormData();

      formData.append("user_id", this.userInfo.id);

      if (this.userInfoForm.email !== this.userInfo.email) {
        console.log("Email changed:", this.userInfoForm.email);
        formData.append("email", this.userInfoForm.email);
      }

      if (this.userInfoForm.phone !== this.userInfo.phone) {
        console.log("Phone changed:", this.userInfoForm.phone);
        formData.append("phone_number", this.userInfoForm.phone);
      }

      if (this.file) {
        console.log("Avatar changed:", this.userInfoForm.avatar);
        formData.append("profile_picture", this.file);
      }

      if (this.password !== "") {
        console.log("Password changed");
        formData.append("password", this.password);
      }

      if (
        formData.get("email") === null &&
        formData.get("phone_number") === null &&
        formData.get("profile_picture") === null &&
        formData.get("password") === null
      ) {
        ElMessage.warning("没有修改任何信息");
        return;
      }

      const result = await userAPI.patchUserInfo(formData);
      if (result.success) {
        ElMessage.success("保存成功");
        this.fetchUserInfo();
      } else {
        ElMessage.error("保存失败");
      }
    },
  },
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(125, 197, 228, 0.8) 0%,
      rgba(232, 240, 245, 0.4) 35%,
      transparent 70%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(161, 229, 206, 0.8) 0%,
      rgba(232, 245, 242, 0.4) 35%,
      transparent 70%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(230, 245, 245, 0.8) 0%,
      rgba(232, 245, 242, 0.4) 45%,
      transparent 80%
    ),
    radial-gradient(
      circle at 85% 15%,
      rgba(206, 236, 164, 0.7) 0%,
      rgba(230, 245, 240, 0.3) 50%,
      transparent 75%
    ),
    radial-gradient(
      circle at 15% 85%,
      rgba(230, 245, 242, 0.7) 0%,
      rgba(232, 245, 245, 0.3) 40%,
      transparent 75%
    ),
    linear-gradient(135deg, #e6f5f5 0%, #e8f0f5 50%, #e6f5f0 100%);
}

.profile-container {
  display: flex;
  width: 1000px;
  margin-top: -200px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.back-button {
  position: relative;
  bottom: -250px;
  right: -100px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 16px;
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.back-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  width: 300px;
  background: linear-gradient(135deg, #e0f2f1 0%, #e8f5f2 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.avatar-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-content:hover .upload-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.username {
  font-size: 24px;
  margin: 20px 0 10px;
  color: #333;
}

.role-tag {
  font-size: 14px;
}

.info-section {
  flex: 1;
  padding: 40px;
  background: white;
}

.section-title {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border: none;
  border-radius: 8px;
  padding: 12px;
}

:deep(.el-input__wrapper.is-disabled) {
  background-color: #f0f2f5;
}

.save-button-container {
  margin-top: 40px;
  text-align: right;
}

.save-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a71d9 0%, #6a4494 100%);
}

.save-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #4a61c9 0%, #5a3484 100%);
}
.profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  margin-top: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}
</style>

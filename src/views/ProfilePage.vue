<template>
  <div class="profile">
    <div style="display: flex; align-items: center; gap: 20px">
      <h2 style="margin: 0">编辑个人信息</h2>
      <el-tag type="success">{{ userInfo.role_str }}</el-tag>
    </div>

    <el-form :model="userInfo" label-width="120px" style="margin-top: 40px">
      <el-form-item label="头像">
        <el-upload
          ref="upload"
          class="avatar-uploader"
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
        >
          <el-button size="small" type="primary">选择头像</el-button>
        </el-upload>
        <div class="avatar-preview">
          <ProfilePhoto :url="userInfoForm.avatar" size="120px" />
        </div>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="userInfo.username" :disabled="true" />
      </el-form-item>
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
      <el-form-item>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import ProfilePhoto from "@/components/ProfilePhoto.vue";
import { userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import { defineComponent } from "vue";

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
  },
  name: "UserProfile",
  data() {
    return {
      userInfo: {
        role: "",
        role_str: "",
        avatar: "",
        username: "",
        id: "",
        email: "",
        phone: "",
        department: "",
      } as UserInfo,
      userInfoForm: {
        email: "",
        phone: "",
        avatar: "",
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
        this.userInfo.avatar = result.data[0].profile_picture || "";

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

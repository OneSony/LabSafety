<template>
  <div class="profile">
    <div style="display: flex; align-items: center; gap: 20px">
      <h2 style="margin: 0">编辑个人信息</h2>
      <el-tag type="success">{{ userInfo.role_str }}</el-tag>
    </div>

    <el-form :model="userInfo" label-width="120px" style="margin-top: 40px">
      <el-form-item label="头像">
        <el-upload
          action="/api/upload"
          list-type="picture-card"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
        >
          <img
            v-if="userInfoForm.avatar"
            :src="userInfoForm.avatar"
            class="avatar"
          />
          <i v-else class="el-icon-plus"></i>
        </el-upload>
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
    async fetchUserInfo() {
      // 模拟获取用户信息
      //TODO
      const result = await userAPI.getUserInfo(this.userInfo.id);
      if (result.success) {
        this.userInfo.username = result.data[0].username;
        this.userInfo.email = result.data[0].email;
        this.userInfo.phone = result.data[0].phone_number;
        this.userInfo.department = result.data[0].department;
        this.userInfo.avatar = result.data[0].avatar;

        this.userInfoForm.email = this.userInfo.email;
        this.userInfoForm.phone = this.userInfo.phone;
        this.userInfoForm.avatar = this.userInfo.avatar;
      } else {
        ElMessage.error("获取用户信息失败");
      }
    },
    async saveProfile() {
      console.log("Profile saved:", this.userInfo);
      // TODO: 调用 API 保存个人信息
      let data: {
        email?: string;
        phone_number?: string;
        profile_picture?: string;
        password?: string;
      } = {};

      // 动态添加属性
      if (this.userInfoForm.email !== this.userInfo.email) {
        console.log("Email changed:", this.userInfoForm.email);
        data.email = this.userInfoForm.email;
      }

      if (this.userInfoForm.phone !== this.userInfo.phone) {
        console.log("Phone changed:", this.userInfoForm.phone);
        data.phone_number = this.userInfoForm.phone;
      }

      if (this.userInfoForm.avatar !== this.userInfo.avatar) {
        console.log("Avatar changed:", this.userInfoForm.avatar);
        data.profile_picture = this.userInfoForm.avatar;
      }

      if (this.password !== "") {
        data.password = this.password;
      }

      if (
        data.email === undefined &&
        data.phone_number === undefined &&
        data.profile_picture === undefined &&
        data.password === undefined
      ) {
        ElMessage.warning("没有修改任何信息");
        return;
      }

      const result = await userAPI.patchUserInfo(this.userInfo.id, data);
      if (result.success) {
        ElMessage.success("保存成功");
        this.fetchUserInfo();
      } else {
        ElMessage.error("保存失败");
      }
    },
    handlePreview(file: any) {
      console.log("Preview file:", file);
    },
    handleRemove(file: any) {
      console.log("Removed file:", file);
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
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>

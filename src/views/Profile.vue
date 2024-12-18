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
          <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
          <i v-else class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="userInfo.nickname" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="userInfo.name" :disabled="true" />
      </el-form-item>
      <el-form-item :label="userInfo.role === 'student' ? '学号' : '工号'">
        <el-input v-model="userInfo.id" :disabled="true" />
      </el-form-item>
      <el-form-item label="院系">
        <el-input v-model="userInfo.department" :disabled="true" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="userInfo.email" />
      </el-form-item>
      <el-form-item label="密码">
        <el-button type="text">修改密码</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { userAPI } from "@/utils/api";

export default {
  name: "UserProfile",
  data() {
    return {
      userInfo: {
        role: "",
        role_str: "",
        avatar: "",
        nickname: "",
        name: "",
        id: "",
        email: "",
        department: "",
      },
    };
  },
  mounted() {
    // 模拟获取用户信息
    this.userInfo.id = userAPI.getUserId();
    this.userInfo.role = userAPI.getRole();
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
      default:
        this.userInfo.role_str = "未知";
    }
    this.fetchUserInfo();
  },
  methods: {
    fetchUserInfo() {
      // 模拟获取用户信息
      //TODO
    },
    saveProfile() {
      console.log("Profile saved:", this.user);
      // TODO: 调用 API 保存个人信息
    },
    handlePreview(file) {
      console.log("Preview file:", file);
    },
    handleRemove(file) {
      console.log("Removed file:", file);
    },
  },
};
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

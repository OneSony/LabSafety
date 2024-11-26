<template>
  <div class="profile">
    <h2>编辑个人信息</h2>
    <el-form :model="user" label-width="120px">
      <el-form-item label="姓名">
        <el-input v-model="user.name" />
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          action="/api/upload"
          list-type="picture-card"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
        >
          <img v-if="user.avatar" :src="user.avatar" class="avatar" />
          <i v-else class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "UserProfile",
  data() {
    return {
      user: {
        name: "张三",
        avatar: "https://via.placeholder.com/100",
      },
    };
  },
  methods: {
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

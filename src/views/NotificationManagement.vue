<template>
  <div>
    <!-- 发布通知按钮 -->
    <el-button type="primary" @click="openNotificationDialog"
      >发布通知</el-button
    >

    <!-- 通知列表 -->
    <el-table :data="notifications" style="width: 100%">
      <el-table-column prop="content" label="通知内容" />
      <el-table-column prop="tag" label="标签" />
      <el-table-column prop="post_time" label="发布时间" />
    </el-table>

    <!-- 通知弹窗 -->
    <el-dialog v-model="isNotificationDialogVisible" title="发布通知">
      <el-form :model="notificationForm">
        <el-form-item label="通知内容">
          <el-input type="textarea" v-model="notificationForm.content" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="notificationForm.tag">
            <el-option label="安全" value="安全" />
            <el-option label="课程" value="课程" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 使用 v-slot 替代 slot 属性 -->
      <template v-slot:footer>
        <el-button @click="isNotificationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="publishNotification">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      notifications: [],
      isNotificationDialogVisible: false,
      notificationForm: {
        content: "",
        tag: "",
      },
    };
  },
  methods: {
    async fetchNotifications() {
      try {
        const response = await axios.get("/api/notifications");
        this.notifications = response.data;
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    },
    async publishNotification() {
      try {
        await axios.post("/api/notifications", this.notificationForm);
        this.isNotificationDialogVisible = false;
        this.fetchNotifications();
      } catch (error) {
        console.error("Error publishing notification:", error);
      }
    },
    openNotificationDialog() {
      this.notificationForm = { content: "", tag: "" }; // 清空表单
      this.isNotificationDialogVisible = true;
    },
  },
  created() {
    this.fetchNotifications();
  },
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

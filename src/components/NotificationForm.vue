<template>
  <div class="notification-page">
    <h2>课程通知管理</h2>

    <!-- 通知列表 -->
    <el-table :data="notifications" style="width: 100%; margin-bottom: 20px">
      <el-table-column prop="course_name" label="课程名称" />
      <el-table-column prop="notification_content" label="通知内容" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editNotification(scope.row)">
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteNotification(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加通知按钮 -->
    <el-button type="primary" @click="openNotificationDialog">
      创建通知
    </el-button>

    <!-- 创建/编辑通知弹窗 -->
    <el-dialog v-model="isDialogVisible" title="通知编辑">
      <el-form :model="notificationForm">
        <el-form-item label="课程名称">
          <el-select
            v-model="notificationForm.course_id"
            placeholder="选择课程"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input
            type="textarea"
            v-model="notificationForm.content"
            rows="6"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNotification">保存</el-button>
        <el-button type="info" @click="autoCompleteContent">
          校对和补充内容
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NotificationPage",
  data() {
    return {
      notifications: [],
      courses: [],
      isDialogVisible: false,
      notificationForm: {
        course_id: null,
        content: "",
      },
      editingNotificationId: null, // 用于区分是创建还是编辑通知
    };
  },
  methods: {
    // 获取所有课程
    async fetchCourses() {
      try {
        const response = await axios.get("/api/v1/courses");
        this.courses = response.data;
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    },

    // 获取所有通知
    async fetchNotifications() {
      try {
        const response = await axios.get("/api/v1/classes/notifications");
        this.notifications = response.data;
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    },

    // 打开通知弹窗
    openNotificationDialog() {
      this.isDialogVisible = true;
      this.notificationForm = {
        course_id: null,
        content: "",
      };
      this.editingNotificationId = null; // 设置为创建模式
    },

    // 编辑通知
    editNotification(notification) {
      this.isDialogVisible = true;
      this.notificationForm = {
        course_id: notification.course_id,
        content: notification.notification_content,
      };
      this.editingNotificationId = notification.id; // 设置为编辑模式
    },

    // 保存通知
    async saveNotification() {
      try {
        if (this.editingNotificationId) {
          // 编辑模式
          await axios.put(
            `/api/v1/classes/notifications/${this.editingNotificationId}`,
            this.notificationForm
          );
          this.$message.success("通知更新成功！");
        } else {
          // 创建模式
          await axios.post(
            "/api/v1/classes/notifications",
            this.notificationForm
          );
          this.$message.success("通知创建成功！");
        }
        this.isDialogVisible = false;
        this.fetchNotifications();
      } catch (error) {
        console.error("Error saving notification:", error);
      }
    },

    // 删除通知
    async deleteNotification(notificationId) {
      try {
        await axios.delete(`/api/v1/classes/notifications/${notificationId}`);
        this.$message.success("通知删除成功！");
        this.fetchNotifications();
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },

    // 调用大模型 API 进行校对和补充内容
    async autoCompleteContent() {
      try {
        const response = await axios.post("/api/v1/ai/complete", {
          content: this.notificationForm.content,
        });
        this.notificationForm.content = response.data.suggested_content;
        this.$message.success("内容已校对和补充！");
      } catch (error) {
        console.error("Error completing content with AI:", error);
        this.$message.error("校对和补充内容失败！");
      }
    },
  },
  created() {
    this.fetchCourses();
    this.fetchNotifications();
  },
};
</script>

<style scoped>
.notification-page {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}
</style>

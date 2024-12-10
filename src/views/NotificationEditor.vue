<!-- src/components/NotificationEditor.vue -->
<template>
  <div class="notification-editor">
    <h2>{{ isEditMode ? "编辑通知" : "发布通知" }}</h2>
    <el-form
      :model="notificationForm"
      :rules="notificationRules"
      ref="notificationFormRef"
      label-width="150px"
    >
      <el-form-item label="通知类型" prop="notice_type" required>
        <el-select
          v-model="notificationForm.notice_type"
          placeholder="选择通知类型"
        >
          <el-option
            v-for="type in noticeTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发送者" prop="sender_id" required>
        <el-input
          v-model="notificationForm.sender_id"
          placeholder="请输入发送者ID"
        />
      </el-form-item>
      <el-form-item label="发布时间" prop="post_time" required>
        <el-date-picker
          v-model="notificationForm.post_time"
          type="datetime"
          placeholder="选择发布时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="end_time" required>
        <el-date-picker
          v-model="notificationForm.end_time"
          type="datetime"
          placeholder="选择结束时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="关联实验室" prop="class_or_lab_id" required>
        <el-input
          v-model="notificationForm.class_or_lab_id"
          placeholder="请输入关联实验室ID"
          disabled
        />
      </el-form-item>
      <!-- 如果需要其他字段，可以在这里添加 -->
    </el-form>
    <div class="button-group">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" @click="validateAndSaveNotification"
        >保存</el-button
      >
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";
import { mapState } from "vuex";

export default {
  name: "NotificationEditor",
  props: {
    labId: {
      type: String,
      required: true,
    },
    noticeId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      notificationForm: {
        id: null,
        class_or_lab_id: this.labId,
        sender_id: "", // 可预填充为当前用户ID
        notice_type: "",
        post_time: null,
        end_time: null,
        created_at: null,
        updated_at: null,
      },
      noticeTypes: [
        // 根据实际的 NoticeTypeEnum 填充选项
        { label: "类型1", value: "TYPE1" },
        { label: "类型2", value: "TYPE2" },
        // 添加其他类型
      ],
      notificationRules: {
        // 表单验证规则
        notice_type: [
          { required: true, message: "请选择通知类型", trigger: "change" },
        ],
        sender_id: [
          { required: true, message: "请输入发送者ID", trigger: "blur" },
        ],
        post_time: [
          { required: true, message: "请选择发布时间", trigger: "change" },
        ],
        end_time: [
          { required: true, message: "请选择结束时间", trigger: "change" },
        ],
        class_or_lab_id: [
          { required: true, message: "请输入关联实验室ID", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    ...mapState(["currentUser"]), // 假设您有 currentUser 存储当前用户信息
    isEditMode() {
      return !!this.noticeId;
    },
  },
  methods: {
    async fetchNotification() {
      if (this.isEditMode) {
        try {
          const response = await axios.get(`/notices/${this.noticeId}`);
          const data = response.data;
          this.notificationForm = {
            ...data,
            post_time: data.post_time ? new Date(data.post_time) : null,
            end_time: data.end_time ? new Date(data.end_time) : null,
          };
        } catch (error) {
          ElMessage.error("获取通知信息失败");
          console.error(error.response ? error.response.data : error.message);
        }
      } else {
        // 创建通知时，可预填充 sender_id 为当前用户ID
        if (this.currentUser && this.currentUser.id) {
          this.notificationForm.sender_id = this.currentUser.id;
        }
      }
    },
    validateAndSaveNotification() {
      this.$refs.notificationFormRef.validate((valid) => {
        if (valid) {
          this.saveNotification();
        } else {
          ElMessage.error("请正确填写所有必填项");
          return false;
        }
      });
    },
    async saveNotification() {
      const data = {
        class_or_lab_id: this.notificationForm.class_or_lab_id,
        sender_id: this.notificationForm.sender_id,
        notice_type: this.notificationForm.notice_type,
        post_time: this.notificationForm.post_time
          ? this.notificationForm.post_time.toISOString()
          : null,
        end_time: this.notificationForm.end_time
          ? this.notificationForm.end_time.toISOString()
          : null,
      };

      try {
        if (this.isEditMode) {
          // 编辑通知
          await axios.put(`/notices/${this.noticeId}`, data);
          ElMessage.success("通知更新成功");
        } else {
          // 创建通知
          await axios.post(`/notices`, data);
          ElMessage.success("通知发布成功");
        }
        this.goBack();
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            ElMessage.error("通知操作失败，未授权");
          } else if (error.response.status === 409) {
            ElMessage.error("通知操作失败，通知已存在");
          } else if (error.response.status === 400) {
            ElMessage.error("通知操作失败，请检查输入");
          } else {
            ElMessage.error(`通知操作失败，错误码：${error.response.status}`);
          }
        } else {
          ElMessage.error("通知操作失败，无法连接到服务器");
        }
        console.error("Error:", error.message);
      }
    },
    goBack() {
      this.$router.push({ name: "LabManagerDashboard" });
    },
  },
  created() {
    this.fetchNotification();
  },
};
</script>

<style scoped>
.notification-editor {
  padding: 20px;
}
.button-group {
  text-align: right;
  margin-top: 20px;
}
</style>

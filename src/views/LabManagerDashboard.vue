<template>
  <div class="lab-manager-dashboard">
    <h2>实验室管理控制台</h2>

    <!-- 实验室管理 -->
    <el-button type="primary" @click="openCreateLabDialog"
      >创建实验室</el-button
    >
    <el-table :data="labs" style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="实验室名称" />
      <el-table-column prop="location" label="地点" />
      <el-table-column prop="manager" label="负责人" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="editLab(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteLab(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 安全准则管理 -->
    <el-button
      type="primary"
      @click="openGuidelineDialog"
      style="margin-top: 40px"
      >添加安全准则</el-button
    >
    <el-table :data="guidelines" style="width: 100%; margin-top: 20px">
      <el-table-column prop="content" label="安全准则内容" />
      <el-table-column prop="tag" label="标签" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="editGuideline(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteGuideline(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 通知管理 -->
    <el-button
      type="primary"
      @click="openNotificationDialog"
      style="margin-top: 40px"
      >发布通知</el-button
    >
    <el-table :data="notifications" style="width: 100%; margin-top: 20px">
      <el-table-column prop="content" label="通知内容" />
      <el-table-column prop="tag" label="标签" />
      <el-table-column prop="post_time" label="发布时间" />
    </el-table>

    <!-- 创建/编辑实验室弹窗 -->
    <el-dialog v-model="isLabDialogVisible" title="创建/编辑实验室">
      <el-form :model="labForm">
        <el-form-item label="实验室名称">
          <el-input v-model="labForm.name" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="labForm.location" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="labForm.manager" placeholder="选择负责人">
            <el-option
              v-for="user in managers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isLabDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLab">保存</el-button>
      </template>
    </el-dialog>

    <!-- 安全准则弹窗 -->
    <el-dialog v-model="isGuidelineDialogVisible" title="添加/编辑安全准则">
      <el-form :model="guidelineForm">
        <el-form-item label="准则内容">
          <el-input type="textarea" v-model="guidelineForm.content" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="guidelineForm.tag">
            <el-option label="安全" value="安全"></el-option>
            <el-option label="操作" value="操作"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isGuidelineDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGuideline">保存</el-button>
      </template>
    </el-dialog>

    <!-- 通知弹窗 -->
    <el-dialog v-model="isNotificationDialogVisible" title="发布通知">
      <el-form :model="notificationForm">
        <el-form-item label="通知内容">
          <el-input type="textarea" v-model="notificationForm.content" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="notificationForm.tag">
            <el-option label="安全" value="安全"></el-option>
            <el-option label="课程" value="课程"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
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
      labs: [],
      managers: [],
      guidelines: [],
      notifications: [],
      isLabDialogVisible: false,
      isGuidelineDialogVisible: false,
      isNotificationDialogVisible: false,
      labForm: { name: "", location: "", manager: "" },
      guidelineForm: { content: "", tag: "" },
      notificationForm: { content: "", tag: "" },
    };
  },
  methods: {
    fetchLabs() {
      axios.get("/api/labs").then((res) => (this.labs = res.data));
    },
    fetchManagers() {
      axios
        .get("/api/users?role=manager")
        .then((res) => (this.managers = res.data));
    },
    fetchGuidelines() {
      axios.get("/api/guidelines").then((res) => (this.guidelines = res.data));
    },
    fetchNotifications() {
      axios
        .get("/api/notifications")
        .then((res) => (this.notifications = res.data));
    },
    openCreateLabDialog() {
      this.isLabDialogVisible = true;
      this.labForm = { name: "", location: "", manager: "" };
    },
    saveLab() {
      axios.post("/api/labs", this.labForm).then(() => {
        this.isLabDialogVisible = false;
        this.fetchLabs();
      });
    },
    openGuidelineDialog() {
      this.isGuidelineDialogVisible = true;
      this.guidelineForm = { content: "", tag: "" };
    },
    saveGuideline() {
      axios.post("/api/guidelines", this.guidelineForm).then(() => {
        this.isGuidelineDialogVisible = false;
        this.fetchGuidelines();
      });
    },
    openNotificationDialog() {
      this.isNotificationDialogVisible = true;
      this.notificationForm = { content: "", tag: "" };
    },
    publishNotification() {
      axios.post("/api/notifications", this.notificationForm).then(() => {
        this.isNotificationDialogVisible = false;
        this.fetchNotifications();
      });
    },
  },
  created() {
    this.fetchLabs();
    this.fetchManagers();
    this.fetchGuidelines();
    this.fetchNotifications();
  },
};
</script>

<style>
.lab-manager-dashboard {
  padding: 20px;
}
</style>

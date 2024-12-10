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
        <!-- <template #default="scope">
          <el-button @click="editLab(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteLab(scope.row.id)"
            >删除</el-button
          >
        </template> -->
        <template #default="scope">
          <el-button @click="editLab(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteLab(scope.row.id)"
            >删除</el-button
          >
          <el-button type="info" @click="openNotificationEditor(scope.row)">
            通知
          </el-button>
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
import { ElMessage } from "element-plus";
// import store from "./store";
// axios.interceptors.request.use(
//   (config) => {
//     const token = store.state.token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

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
    // 获取实验室列表
    fetchLabs() {
      axios
        .get("http://111.229.210.27/api/v1/labs") // 根据实际 API 调整 URL
        .then((res) => {
          this.labs = res.data;
        })
        .catch((error) => {
          ElMessage.error("获取实验室列表失败");
          console.error(error.response ? error.response.data : error.message);
        });
    },

    // 打开创建实验室弹窗
    openCreateLabDialog() {
      this.isLabDialogVisible = true;
      this.labForm = { class_id: null, name: "", location: "" };
    },

    // 打开编辑实验室弹窗
    editLab(lab) {
      this.isLabDialogVisible = true;
      this.labForm = { ...lab };
    },

    // 保存实验室（创建或编辑）
    saveLab() {
      const data = {
        name: this.labForm.name,
        location: this.labForm.location,
      };

      if (this.labForm.class_id) {
        // 编辑实验室
        axios
          .post(
            `http://111.229.210.27/api/v1/labs/lab/${this.labForm.class_id}`,
            data
          )
          .then(() => {
            ElMessage.success("实验室更新成功");
            this.isLabDialogVisible = false;
            this.fetchLabs();
          })
          .catch((error) => {
            ElMessage.error("实验室更新失败");
            console.error(error.response ? error.response.data : error.message);
          });
      } else {
        // 创建实验室
        axios
          .post("http://111.229.210.27/api/v1/labs/lab", data)
          .then((response) => {
            console.log(response.data);
            ElMessage.success("实验室创建成功");
            this.isLabDialogVisible = false;
            this.fetchLabs();
          })
          .catch((error) => {
            ElMessage.error("实验室创建失败");
            console.error(error.response ? error.response.data : error.message);
          });
      }
    },
    // 删除实验室
    deleteLab(classId) {
      axios
        .delete(`http://111.229.210.27/api/v1/labs/lab/${classId}`)
        .then(() => {
          ElMessage.success("实验室删除成功");
          this.fetchLabs();
        })
        .catch((error) => {
          ElMessage.error("实验室删除失败");
          console.error(error.response ? error.response.data : error.message);
        });
    },
    created() {
      this.fetchLabs();
      this.fetchManagers();
      this.fetchGuidelines();
      this.fetchNotifications();
    },
  },
};
</script>

<style>
.lab-manager-dashboard {
  padding: 20px;
}
</style>

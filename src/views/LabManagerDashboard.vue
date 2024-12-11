<template>
  <div class="lab-manager-dashboard">
    <h2>实验室管理控制台</h2>

    <!-- 实验室管理 -->
    <el-button type="primary" @click="openCreateLabDialog"
      >创建实验室</el-button
    >
    <el-table
      :data="labs"
      style="width: 100%; margin-top: 20px"
      @row-click="goToLabDetail"
    >
      <el-table-column prop="name" label="实验室名称" />
      <el-table-column prop="location" label="地点" />
      <el-table-column prop="manager" label="负责人" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click.stop="editLab(scope.row)">编辑</el-button>
          <el-button type="danger" @click.stop="deleteLab(scope.row.lab_id)"
            >删除</el-button
          >
          <el-button type="info" @click.stop="openNotificationEditor(scope.row)"
            >通知</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑实验室弹窗 -->
    <el-dialog
      v-model="isLabDialogVisible"
      :title="labForm.lab_id ? '编辑实验室' : '创建实验室'"
    >
      <el-form :model="labForm">
        <el-form-item label="实验室名称" :required="true">
          <el-input v-model="labForm.name" placeholder="请输入实验室名称" />
        </el-form-item>
        <el-form-item label="地点" :required="true">
          <el-input v-model="labForm.location" placeholder="请输入实验室地点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isLabDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLab">保存</el-button>
      </template>
    </el-dialog>

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

    <!-- 安全准则弹窗 -->
    <el-dialog v-model="isGuidelineDialogVisible" title="添加/编辑安全准则">
      <el-form :model="guidelineForm">
        <el-form-item label="准则内容" :required="true">
          <el-input
            type="textarea"
            v-model="guidelineForm.content"
            placeholder="请输入准则内容"
          />
        </el-form-item>
        <el-form-item label="标签" :required="true">
          <el-select v-model="guidelineForm.tag" placeholder="请选择标签">
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
        <el-form-item label="通知内容" :required="true">
          <el-input
            type="textarea"
            v-model="notificationForm.content"
            placeholder="请输入通知内容"
          />
        </el-form-item>
        <el-form-item label="标签" :required="true">
          <el-select v-model="notificationForm.tag" placeholder="请选择标签">
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
import { ElMessage } from "element-plus";
import { labAPI } from "../utils/api"; // 正确引入 labAPI
import { useRouter } from "vue-router"; // 引入 Vue Router

export default {
  data() {
    return {
      labs: [], // 存储实验室数据
      guidelines: [],
      notifications: [],
      isLabDialogVisible: false, // 控制创建/编辑实验室对话框的显示
      isGuidelineDialogVisible: false, // 控制安全准则对话框的显示
      isNotificationDialogVisible: false, // 控制通知对话框的显示
      labForm: { lab_id: null, name: "", location: "" }, // 表单模型，添加 lab_id 用于编辑
      guidelineForm: { content: "", tag: "" },
      notificationForm: { content: "", tag: "" },
    };
  },
  methods: {
    // 获取实验室列表
    fetchLabs() {
      labAPI
        .getLabs()
        .then((response) => {
          if (response.success) {
            this.labs = response.data; // 确保 response.data 包含 name 和 location
          } else {
            ElMessage.error(response.error);
          }
        })
        .catch((error) => {
          ElMessage.error("获取实验室列表失败！");
          console.error(error);
        });
    },

    // 打开创建实验室对话框
    openCreateLabDialog() {
      this.isLabDialogVisible = true;
      this.labForm = { lab_id: null, name: "", location: "" }; // 重置表单
    },

    // 保存实验室（创建或编辑）
    saveLab() {
      // 校验表单
      if (!this.labForm.name || !this.labForm.location) {
        ElMessage.warning("实验室名称和地点不能为空");
        return;
      }

      const labData = {
        name: this.labForm.name,
        location: this.labForm.location,
      };

      if (this.labForm.lab_id) {
        // 编辑实验室
        labAPI
          .editLab(this.labForm.lab_id, labData)
          .then((response) => {
            if (response.success) {
              ElMessage.success("实验室更新成功！");
              this.isLabDialogVisible = false;
              this.fetchLabs(); // 刷新实验室列表
            } else {
              ElMessage.error(response.error || "编辑实验室失败");
            }
          })
          .catch((error) => {
            ElMessage.error("编辑实验室失败，请稍后重试！");
            console.error(error);
          });
      } else {
        // 创建实验室
        labAPI
          .createLab(labData)
          .then((response) => {
            if (response.success) {
              ElMessage.success("实验室创建成功！");
              this.isLabDialogVisible = false;
              this.fetchLabs(); // 刷新实验室列表
            } else {
              ElMessage.error(response.error || "创建实验室失败");
            }
          })
          .catch((error) => {
            ElMessage.error("创建实验室失败，请稍后重试！");
            console.error(error);
          });
      }
    },

    // 编辑实验室逻辑
    editLab(lab) {
      this.labForm = {
        lab_id: lab.lab_id,
        name: lab.name,
        location: lab.location,
      };
      this.isLabDialogVisible = true;
    },

    // 删除实验室逻辑
    deleteLab(labId) {
      this.$confirm("确定要删除这个实验室吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          labAPI
            .deleteLab(labId)
            .then((response) => {
              if (response.success) {
                ElMessage.success("实验室删除成功！");
                this.fetchLabs(); // 刷新实验室列表
              } else {
                ElMessage.error(response.error || "删除实验室失败");
              }
            })
            .catch((error) => {
              ElMessage.error("删除实验室失败，请稍后重试！");
              console.error(error);
            });
        })
        .catch(() => {
          // 用户取消删除
        });
    },

    // 打开通知编辑器
    openNotificationEditor(lab) {
      this.$router.push({
        name: "NotificationEditor",
        params: { labId: lab.lab_id },
      });
    },

    // 打开安全准则对话框
    openGuidelineDialog() {
      this.isGuidelineDialogVisible = true;
      this.guidelineForm = { content: "", tag: "" }; // 重置表单
    },

    // 保存安全准则
    saveGuideline() {
      // 安全准则保存逻辑
      ElMessage.success("安全准则功能尚未实现！");
      this.isGuidelineDialogVisible = false;
    },

    // 发布通知
    publishNotification() {
      // 通知发布逻辑
      ElMessage.success("发布通知功能尚未实现！");
      this.isNotificationDialogVisible = false;
    },

    // 跳转到实验室详细信息页面
    goToLabDetail(labName) {
      // 使用 labName 来进行路由跳转
      this.$router.push({ name: "LabDetail", params: { labName: labName } });
    },
  },

  mounted() {
    this.fetchLabs(); // 页面加载时获取实验室列表
  },
};
</script>

<style scoped>
.lab-manager-dashboard {
  padding: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>

<!-- src/views/LabManagerDashboard.vue -->
<template>
  <div class="lab-manager-dashboard">
    <h2>实验室管理控制台</h2>

    <!-- 实验室管理 -->
    <el-button type="primary" @click="openCreateLabDialog">
      创建实验室
    </el-button>
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
          <el-button
            @click.stop="editLab(scope.row)"
            type="primary"
            size="small"
          >
            编辑
          </el-button>
          <el-button
            @click.stop="deleteLab(scope.row.id)"
            type="danger"
            size="small"
          >
            删除
          </el-button>
          <el-button
            @click.stop="openNotificationEditor(scope.row)"
            type="info"
            size="small"
          >
            通知
          </el-button>
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
        <!-- 添加安全员和联系方式 -->
        <el-form-item label="实验室安全员" :required="false">
          <el-input
            v-model="labForm.safetyOfficer"
            placeholder="请输入安全员姓名"
          />
        </el-form-item>
        <el-form-item label="联系方式" :required="false">
          <el-input v-model="labForm.contact" placeholder="请输入联系方式" />
        </el-form-item>
        <!-- 添加安全器材 -->
        <el-form-item label="安全器材" :required="false">
          <el-button type="dashed" @click="addSafetyEquipment"
            >添加器材</el-button
          >
          <div
            v-for="(equipment, index) in labForm.safety_equipment"
            :key="index"
            class="equipment-item"
          >
            <el-input
              v-model="equipment.name"
              placeholder="器材名称"
              class="equipment-input"
            />
            <el-input
              v-model="equipment.description"
              placeholder="描述"
              class="equipment-input"
            />
            <el-button type="danger" @click="removeSafetyEquipment(index)">
              删除
            </el-button>
          </div>
        </el-form-item>
        <!-- 添加安全注意事项 -->
        <el-form-item label="安全注意事项" :required="false">
          <el-button type="dashed" @click="addSafetyPrecaution">
            添加注意事项
          </el-button>
          <div
            v-for="(precaution, index) in labForm.safety_precautions"
            :key="index"
            class="precaution-item"
          >
            <el-input
              v-model="labForm.safety_precautions[index]"
              placeholder="请输入安全注意事项"
              class="precaution-input"
            />
            <el-button type="danger" @click="removeSafetyPrecaution(index)">
              删除
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isLabDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLab">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessageBox, ElMessage } from "element-plus";
import { labAPI } from "../utils/api"; // 确认路径是否正确

export default {
  data() {
    return {
      labs: [], // 存储实验室数据
      guidelines: [],
      notifications: [],
      isLabDialogVisible: false, // 控制创建/编辑实验室对话框的显示
      isGuidelineDialogVisible: false, // 控制安全准则对话框的显示
      isNotificationDialogVisible: false, // 控制通知对话框的显示
      labForm: {
        lab_id: null,
        name: "",
        location: "",
        photo: "",
        safetyOfficer: "",
        contact: "",
        safety_equipment: [],
        safety_precautions: [],
      }, // 表单模型，添加 lab_id 用于编辑
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
          console.log("Fetched labs:", response); // 添加这行来查看获取的数据
          if (response.success) {
            this.labs = response.data;
          } else {
            ElMessage.error(response.error);
          }
        })
        .catch((error) => {
          console.error("Error fetching labs:", error);
          ElMessage.error("获取实验室列表失败！");
        });
    },

    // 打开创建实验室对话框
    openCreateLabDialog() {
      this.isLabDialogVisible = true;
      this.labForm = {
        lab_id: null,
        name: "",
        location: "",
        photo: "",
        safetyOfficer: "",
        contact: "",
        safety_equipment: [],
        safety_precautions: [],
      }; // 重置表单
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
        photo: this.labForm.photo,
        safety_officer: this.labForm.safetyOfficer,
        contact: this.labForm.contact,
        safety_equipment: this.labForm.safety_equipment,
        safety_precautions: this.labForm.safety_precautions,
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
        photo: lab.photo || "",
        safetyOfficer: lab.safety_officer || "",
        contact: lab.contact || "",
        safety_equipment: lab.safety_equipment || [],
        safety_precautions: lab.safety_precautions || [],
      };
      this.isLabDialogVisible = true;
    },

    // 删除实验室
    deleteLab(labId) {
      ElMessageBox.confirm("确定要删除这个实验室吗？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          labAPI
            .deleteLab(labId)
            .then((response) => {
              if (response.success) {
                // 删除成功后立即更新本地数据
                this.labs = this.labs.filter((lab) => lab.lab_id !== labId);
                ElMessage.success("实验室删除成功！");
                // 为了确保与服务器数据同步，可以重新获取列表
                this.fetchLabs();
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
          ElMessage.info("已取消删除");
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
    goToLabDetail(labId) {
      // 使用 labId 来进行路由跳转
      this.$router.push({ name: "LabDetail", params: { labId: labId } });
    },

    // 处理照片上传成功
    handlePhotoUploadSuccess(response, file, fileList) {
      if (response.success && response.data.photoUrl) {
        this.labForm.photo = response.data.photoUrl;
        ElMessage.success("照片上传成功！");
      } else {
        ElMessage.error("照片上传失败！");
      }
    },

    // 添加安全器材
    addSafetyEquipment() {
      this.labForm.safety_equipment.push({ name: "", description: "" });
    },

    // 删除安全器材
    removeSafetyEquipment(index) {
      this.labForm.safety_equipment.splice(index, 1);
    },

    // 添加安全注意事项
    addSafetyPrecaution() {
      this.labForm.safety_precautions.push("");
    },

    // 删除安全注意事项
    removeSafetyPrecaution(index) {
      this.labForm.safety_precautions.splice(index, 1);
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

.uploaded-photo img {
  width: 200px;
  margin-top: 10px;
}

.equipment-item,
.precaution-item {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.equipment-input,
.precaution-input {
  flex: 1;
  margin-right: 10px;
}

.equipment-item .el-button,
.precaution-item .el-button {
  margin-left: 10px;
}

.lab-card {
  margin-top: 20px;
}
</style>

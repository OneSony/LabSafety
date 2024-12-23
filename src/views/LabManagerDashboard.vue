<template>
  <div class="lab-manager-dashboard">
    <!-- 页面标题区域 -->
    <div class="dashboard-header">
      <div class="title-section">
        <h2 class="main-title">实验室管理控制台</h2>
      </div>
      <el-button
        type="primary"
        class="create-button"
        @click="openCreateLabDialog"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        创建实验室
      </el-button>
    </div>

    <!-- 实验室列表卡片 -->
    <div class="lab-list-container">
      <el-card class="lab-table-card">
        <template #header>
          <div class="card-header">
            <span>实验室列表</span>
            <div class="header-actions">
              <el-input
                v-model="searchQuery"
                placeholder="搜索实验室..."
                class="search-input"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredLabs"
          style="width: 100%"
          @row-click="goToLabDetail"
          :header-cell-style="{ background: '#f5f7fa' }"
          border
          stripe
          highlight-current-row
        >
          <el-table-column prop="name" label="实验室名称" min-width="200">
            <template #default="scope">
              <div class="lab-name-cell">
                <el-icon class="mr-2"><School /></el-icon>
                {{ scope.row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="地点" min-width="200">
            <template #default="scope">
              <div class="lab-location-cell">
                <el-icon class="mr-2"><Location /></el-icon>
                {{ scope.row.location }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button
                  @click.stop="editLab(scope.row)"
                  type="primary"
                  size="small"
                  class="action-button"
                >
                  <el-icon class="mr-1"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  @click.stop="deleteLab(scope.row.id)"
                  type="danger"
                  size="small"
                  class="action-button"
                >
                  <el-icon class="mr-1"><Delete /></el-icon>
                  删除
                </el-button>
                <el-button
                  @click.stop="openNotificationEditor(scope.row)"
                  type="info"
                  size="small"
                  class="action-button"
                >
                  <el-icon class="mr-1"><Bell /></el-icon>
                  通知
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-dialog
      title="编辑通知"
      v-model="noticeEditDialogVisible"
      width="40%"
      @close="fetchNotices"
    >
      <NoticeDialog
        :lab_id="selectedLabId"
        @close-dialog="noticeEditDialogVisible = false"
        v-if="noticeEditDialogVisible"
      />
    </el-dialog>

    <!-- 创建/编辑实验室弹窗 -->
    <el-dialog
      v-model="isLabDialogVisible"
      :title="labForm.lab_id ? '编辑实验室' : '创建实验室'"
      width="500px"
      @closed="handleDialogClosed"
      :before-close="handleBeforeClose"
      destroy-on-close
    >
      <el-form :model="labForm" label-position="top" class="lab-form">
        <el-form-item label="实验室名称" :required="true">
          <el-input
            v-model="labForm.name"
            placeholder="请输入实验室名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="地点" :required="true">
          <el-input
            v-model="labForm.location"
            placeholder="请输入实验室地点"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="saveLab">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { labAPI } from "../utils/api";
import NoticeDialog from "@/components/NoticeDialog.vue";
import {
  Plus,
  Edit,
  Delete,
  Bell,
  Search,
  School,
  Location,
} from "@element-plus/icons-vue";

export default {
  components: {
    Plus,
    Edit,
    Delete,
    Bell,
    Search,
    School,
    Location,
    NoticeDialog,
  },
  data() {
    return {
      labs: [],
      isLabDialogVisible: false,
      labForm: {
        lab_id: null,
        name: "",
        location: "",
        // lab_image: "",
        // // 这里定义为字符串数组，用于安全器材和注意事项
        // safety_equipment_list: [],
        // safety_notes_list: [],
      },
      searchQuery: "",
      noticeEditDialogVisible: false,
      selectedLabId: null,
    };
  },
  computed: {
    filteredLabs() {
      if (!this.searchQuery) return this.labs;
      const query = this.searchQuery.toLowerCase();
      return this.labs.filter(
        (lab) =>
          lab.name.toLowerCase().includes(query) ||
          lab.location.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    fetchLabs() {
      labAPI
        .getLabs()
        .then((response) => {
          if (response.success) {
            this.labs = response.data;
          } else {
            ElMessage.error(response.error || "获取实验室列表失败");
          }
        })
        .catch((error) => {
          console.error("fetchLabs error:", error);
          ElMessage.error("获取实验室列表失败，请稍后重试");
        });
    },

    openCreateLabDialog() {
      this.resetForm();
      this.isLabDialogVisible = true;
    },

    handleBeforeClose(done) {
      this.resetForm();
      done();
    },
    handleCancel() {
      this.resetForm();
      this.isLabDialogVisible = false;
    },
    handleDialogClosed() {
      this.resetForm();
    },

    resetForm() {
      this.labForm = {
        lab_id: null,
        name: "",
        location: "",
        // lab_image: "",
        // safety_equipment_list: [],
        // safety_notes_list: [],
      };
    },

    async handleImageUpload(file) {
      try {
        const selectedFile = file.raw;
        if (!selectedFile.type.startsWith("image/")) {
          throw new Error("请上传图片文件");
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (selectedFile.size > maxSize) {
          throw new Error("图片大小不能超过5MB");
        }

        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("图片读取失败"));
          reader.readAsDataURL(selectedFile);
        });

        this.labForm.lab_image = base64;
        ElMessage.success("图片上传成功");
      } catch (error) {
        ElMessage.error(error.message || "图片上传失败");
        throw error;
      }
    },

    async saveLab() {
      if (!this.labForm.name || !this.labForm.location) {
        ElMessage.warning("实验室名称和地点不能为空");
        return;
      }

      try {
        let response;
        const labData = {
          name: this.labForm.name,
          location: this.labForm.location,
        };

        if (this.labForm.lab_id) {
          // 编辑现有实验室 - 使用 PATCH
          response = await labAPI.editLab(this.labForm.lab_id, {
            id: this.labForm.lab_id, // 确保包含 id
            ...labData,
          });
        } else {
          // 创建新实验室 - 使用 POST
          response = await labAPI.createLab(labData);
        }

        if (response.success) {
          ElMessage.success(
            this.labForm.lab_id ? "实验室更新成功！" : "实验室创建成功！"
          );
          this.isLabDialogVisible = false;
          await this.fetchLabs();
        } else {
          ElMessage.error(response.error || "保存实验室失败");
        }
      } catch (error) {
        console.error("Save lab error:", error);
        ElMessage.error("保存实验室失败，请稍后重试！");
      }
    },

    editLab(lab) {
      try {
        // 后端如果已返回的是数组，可以直接使用，
        // 如果后端返回是数组则无需 JSON.parse()
        // 假设后端数据格式正确，如 lab.safety_equipments 是数组
        this.labForm = {
          lab_id: lab.id,
          name: lab.name,
          location: lab.location,
        };
        this.isLabDialogVisible = true;
      } catch (error) {
        console.error("Parse lab data error:", error);
        ElMessage.error("解析实验室数据失败");
      }
    },

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
                this.labs = this.labs.filter((lab) => lab.id !== labId);
                ElMessage.success("实验室删除成功！");
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

    // 操作安全器材（字符串数组）
    addSafetyEquipment() {
      this.labForm.safety_equipment_list.push("");
    },
    removeSafetyEquipment(index) {
      this.labForm.safety_equipment_list.splice(index, 1);
    },

    // 操作安全注意事项（字符串数组）
    addSafetyPrecaution() {
      this.labForm.safety_notes_list.push("");
    },
    removeSafetyPrecaution(index) {
      this.labForm.safety_notes_list.splice(index, 1);
    },
    goToLabDetail(lab) {
      console.log("id:", lab.id);
      this.$router.push({ name: "LabPage", params: { id: lab.id } });
    },

    openNotificationEditor(lab) {
      console.log("打开通知编辑器", lab);
      this.selectedLabId = lab.id;
      this.noticeEditDialogVisible = true;
    },
  },
  mounted() {
    this.fetchLabs();
  },
};
</script>

<style scoped>
.lab-manager-dashboard {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 24px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
}

.lab-list-container {
  background: transparent;
}

.lab-table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.search-input {
  width: 240px;
}

.lab-name-cell,
.lab-location-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
}

.lab-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-input {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
.lab-manager-dashboard {
  padding: 20px;
}

.upload-demo {
  margin-bottom: 20px;
}

.uploaded-photo {
  margin-top: 10px;
}

.uploaded-photo img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
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

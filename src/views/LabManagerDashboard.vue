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
      @closed="handleDialogClosed"
      :before-close="handleBeforeClose"
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
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="saveLab">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessageBox, ElMessage } from "element-plus";
import { labAPI } from "../utils/api";

export default {
  data() {
    return {
      labs: [],
      isLabDialogVisible: false,
      labForm: {
        lab_id: null,
        name: "",
        location: "",
        lab_image: "",
        // 这里定义为字符串数组，用于安全器材和注意事项
        safety_equipment_list: [],
        safety_notes_list: [],
      },
    };
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
        lab_image: "",
        safety_equipment_list: [],
        safety_notes_list: [],
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

      const labData = {
        name: this.labForm.name,
        location: this.labForm.location,
        lab_image: this.labForm.lab_image,
        safety_equipments: this.labForm.safety_equipment_list,
        safety_notes: this.labForm.safety_notes_list,
      };

      const apiCall = this.labForm.lab_id
        ? labAPI.editLab(this.labForm.lab_id, labData)
        : labAPI.createLab(labData);

      try {
        const response = await apiCall;

        if (response.success) {
          ElMessage.success("实验室创建成功！");
          this.isLabDialogVisible = false;

          // 调用 fetchLabs 重新获取实验室列表
          await this.fetchLabs();

          // 跳转到新建实验室的详情页
          // this.$router.push({
          //   name: "LabPage",
          //   params: { id: response.data.id },
          // });
        } else {
          ElMessage.error(response.error || "保存实验室失败");
        }
      } catch (error) {
        ElMessage.error("保存实验室失败，请稍后重试！");
        console.error("Error:", error);
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
          lab_image: lab.lab_image,
          safety_equipment_list: Array.isArray(lab.safety_equipments)
            ? lab.safety_equipments
            : [],
          safety_notes_list: Array.isArray(lab.safety_notes)
            ? lab.safety_notes
            : [],
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
  },
  mounted() {
    this.fetchLabs();
  },
};
</script>

<style scoped>
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

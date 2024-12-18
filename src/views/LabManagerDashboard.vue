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

        <!-- 添加图片上传 -->
        <el-form-item label="实验室照片" :required="false">
          <el-upload
            class="upload-demo"
            action="#"
            :http-request="handleImageUpload"
            :show-file-list="true"
            :limit="1"
            accept="image/*"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
          <div v-if="labForm.lab_image" class="uploaded-photo">
            <img :src="labForm.lab_image" alt="实验室照片" />
          </div>
        </el-form-item>

        <!-- 添加安全器材 -->
        <el-form-item label="安全器材" :required="false">
          <el-button type="primary" @click="addSafetyEquipment"
            >添加器材</el-button
          >
          <div
            v-for="(equipment, index) in labForm.safety_equipment_list"
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
          <el-button type="primary" @click="addSafetyPrecaution">
            添加注意事项
          </el-button>
          <div
            v-for="(precaution, index) in labForm.safety_notes_list"
            :key="index"
            class="precaution-item"
          >
            <el-input
              v-model="labForm.safety_notes_list[index]"
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
        safety_equipments: "[]",
        safety_notes: "[]",
        safety_equipment_list: [],
        safety_notes_list: [],
      },
    };
  },
  methods: {
    // 打开创建实验室对话框
    openCreateLabDialog() {
      // 重置表单数据
      this.labForm = {
        lab_id: null,
        name: "",
        location: "",
        lab_image: "",
        safety_equipments: "",
        safety_notes: "",
        safety_equipment_list: [],
        safety_notes_list: [],
      };
      // 显示对话框
      this.isLabDialogVisible = true;
    },
    getInitialLabForm() {
      return {
        lab_id: null,
        name: "",
        location: "",
        lab_image: "",
        safety_equipments: "",
        safety_notes: "",
        safety_equipment_list: [],
        safety_notes_list: [],
      };
    },
    // 处理对话框关闭前的操作
    handleBeforeClose(done) {
      this.resetForm();
      done();
    },
    // 处理取消按钮点击
    handleCancel() {
      this.resetForm();
      this.isLabDialogVisible = false;
    },

    // 处理对话框关闭
    handleDialogClose() {
      this.resetForm();
    },

    // 重置表单数据
    resetForm() {
      this.labForm = {
        lab_id: null,
        name: "",
        location: "",
        lab_image: "",
        safety_equipments: "[]",
        safety_notes: "[]",
        safety_equipment_list: [],
        safety_notes_list: [],
      };
    },

    handleDialogClosed() {
      this.labForm = {
        lab_id: null,
        name: "",
        location: "",
        lab_image: "",
        safety_equipments: "",
        safety_notes: "",
        safety_equipment_list: [],
        safety_notes_list: [],
      };
    },
    // 处理图片上传
    async handleImageUpload({ file }) {
      try {
        // 检查文件类型
        if (!file.type.startsWith("image/")) {
          throw new Error("请上传图片文件");
        }

        // 检查文件大小（限制为5MB）
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error("图片大小不能超过5MB");
        }

        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === "string") {
              // 保存完整的 base64 字符串
              this.labForm.lab_image = e.target.result;
              resolve(e.target.result);
            } else {
              reject(new Error("图片读取失败"));
            }
          };
          reader.onerror = () => reject(new Error("图片读取失败"));
          reader.readAsDataURL(file);
        });

        ElMessage.success("图片上传成功");
        return base64;
      } catch (error) {
        ElMessage.error(error.message || "图片上传失败");
        throw error;
      }
    },
    // 转换数据为API所需格式
    prepareLabData() {
      const equipments = this.labForm.safety_equipment_list.map((eq) => ({
        name: eq.name,
        description: eq.description,
      }));

      const labData = {
        name: this.labForm.name,
        location: this.labForm.location,
        lab_image: this.labForm.lab_image,
        safety_equipments: JSON.stringify(equipments),
        safety_notes: JSON.stringify(this.labForm.safety_notes_list),
      };

      if (this.labForm.lab_id) {
        labData.lab_id = this.labForm.lab_id;
      }

      return labData;
    },

    // 表单验证
    validateForm() {
      if (!this.labForm.name.trim()) {
        ElMessage.warning("实验室名称不能为空");
        return false;
      }
      if (!this.labForm.location.trim()) {
        ElMessage.warning("实验室地点不能为空");
        return false;
      }
      return true;
    },

    // 保存实验室
    async saveLab() {
      if (!this.validateForm()) return;

      try {
        // 准备安全设备和注意事项数据
        const equipments = this.labForm.safety_equipment_list.map((eq) => ({
          name: eq.name || "",
          description: eq.description || "",
        }));

        const labData = {
          name: this.labForm.name.trim(),
          location: this.labForm.location.trim(),
          safety_equipments: JSON.stringify(equipments),
          safety_notes: JSON.stringify(this.labForm.safety_notes_list || []),
          lab_image: this.labForm.lab_image.split(",")[1] || "", // 只发送 base64 数据部分
        };

        // 调试日志
        console.log("准备发送的数据:", {
          ...labData,
          lab_image: labData.lab_image ? "(base64图片数据)" : "空",
        });

        const response = this.labForm.lab_id
          ? await labAPI.updateLab(this.labForm.lab_id, labData)
          : await labAPI.createLab(labData);

        if (response.success) {
          ElMessage.success(
            this.labForm.lab_id ? "实验室更新成功！" : "实验室创建成功！"
          );
          this.resetForm();
          this.isLabDialogVisible = false;
          await this.fetchLabs();
        } else {
          throw new Error(response.error || "操作失败");
        }
      } catch (error) {
        console.error("保存失败:", error);
        ElMessage.error(error.message || "保存失败，请稍后重试");
      }
    },
    // 获取实验室列表
    async fetchLabs() {
      try {
        const response = await labAPI.getLabs();
        if (response.success) {
          this.labs = response.data.map((lab) => ({
            ...lab,
            safety_equipment_list: JSON.parse(lab.safety_equipments || "[]"),
            safety_notes_list: JSON.parse(lab.safety_notes || "[]"),
          }));
        } else {
          ElMessage.error(response.error || "获取实验室列表失败");
        }
      } catch (error) {
        console.error("Fetch labs error:", error);
        ElMessage.error("获取实验室列表失败");
      }
    },

    // 编辑实验室
    editLab(lab) {
      try {
        const safety_equipment_list = JSON.parse(lab.safety_equipments || "[]");
        const safety_notes_list = JSON.parse(lab.safety_notes || "[]");

        this.labForm = {
          lab_id: lab.lab_id,
          name: lab.name,
          location: lab.location,
          lab_image: lab.lab_image,
          safety_equipments: lab.safety_equipments,
          safety_notes: lab.safety_notes,
          safety_equipment_list,
          safety_notes_list,
        };
        this.isLabDialogVisible = true;
      } catch (error) {
        console.error("Parse lab data error:", error);
        ElMessage.error("解析实验室数据失败");
      }
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
                this.labs = this.labs.filter((lab) => lab.lab_id !== labId);
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

    // 安全器材相关方法
    addSafetyEquipment() {
      this.labForm.safety_equipment_list.push({ name: "", description: "" });
    },

    removeSafetyEquipment(index) {
      this.labForm.safety_equipment_list.splice(index, 1);
    },

    // 安全注意事项相关方法
    addSafetyPrecaution() {
      this.labForm.safety_notes_list.push("");
    },

    removeSafetyPrecaution(index) {
      this.labForm.safety_notes_list.splice(index, 1);
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

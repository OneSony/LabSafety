<template>
  <div class="lab-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <el-card class="lab-card" v-if="labForm">
      <!-- 实验室名称 -->
      <h1 class="lab-name">
        <span
          v-if="!editingField.name"
          @click="startEditing('name')"
          class="editable-field"
        >
          {{ labForm.name || "未命名实验室" }}
        </span>
        <el-input
          v-else
          v-model="editForm.name"
          placeholder="请输入实验室名称"
          @blur="saveField('name')"
          @keyup.enter="saveField('name')"
        ></el-input>
      </h1>

      <!-- 实验室地点 -->
      <h2 class="lab-location">
        <span
          v-if="!editingField.location"
          @click="startEditing('location')"
          class="editable-field"
        >
          {{ labForm.location || "未设置地点" }}
        </span>
        <el-input
          v-else
          v-model="editForm.location"
          placeholder="请输入实验室地点"
          @blur="saveField('location')"
          @keyup.enter="saveField('location')"
        ></el-input>
      </h2>

      <el-row :gutter="20">
        <!-- 实验室照片 -->
        <el-col :span="8">
          <div class="lab-photo-container">
            <el-image
              v-if="labForm.lab_image"
              :src="labForm.lab_image"
              style="width: 100%; max-height: 300px; object-fit: cover"
              fit="cover"
            ></el-image>
            <div v-else class="no-photo">
              <span>点击上传照片</span>
            </div>

            <el-upload
              class="upload-container"
              :action="null"
              :http-request="customImageUpload"
              :show-file-list="false"
              accept="image/*"
              :before-upload="beforeImageUpload"
            >
              <el-button type="primary">上传照片</el-button>
            </el-upload>
          </div>
        </el-col>

        <!-- 实验室信息 -->
        <el-col :span="16">
          <div class="lab-info">
            <!-- 安全设备 -->
            <div class="safety-equipment">
              <h3>安全设备</h3>
              <span
                v-if="!editingField.safety_equipments"
                @click="startEditing('safety_equipments')"
                class="editable-field"
              >
                {{ labForm.safety_equipments || "暂无安全设备信息" }}
              </span>
              <el-input
                v-else
                v-model="editForm.safety_equipments"
                type="textarea"
                placeholder="请输入安全设备信息"
                @blur="saveField('safety_equipments')"
              ></el-input>
            </div>

            <!-- 安全须知 -->
            <div class="safety-notes" style="margin-top: 20px">
              <h3>安全须知</h3>
              <span
                v-if="!editingField.safety_notes"
                @click="startEditing('safety_notes')"
                class="editable-field"
              >
                {{ labForm.safety_notes || "暂无安全须知" }}
              </span>
              <el-input
                v-else
                v-model="editForm.safety_notes"
                type="textarea"
                placeholder="请输入安全须知"
                @blur="saveField('safety_notes')"
              ></el-input>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import { labAPI } from "../utils/api";
import type {
  LabForm,
  LabResponse,
  EditingField,
  EditForm,
  Lab,
} from "../types/lab";

export default defineComponent({
  name: "LabDetail",

  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      labForm: {
        lab_id: null,
        name: "",
        location: "",
        lab_image: "",
        safety_equipments: "",
        safety_notes: "",
      } as LabForm,
      editForm: {} as Partial<LabForm>,
      editingField: {} as Record<string, boolean>,
      loading: false,
      error: null as string | null,
    };
  },

  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchLabDetails();
        }
      },
    },
  },

  methods: {
    async fetchLabDetails() {
      this.loading = true;
      this.error = null;

      try {
        const labId = parseInt(String(this.id), 10);
        console.log("Fetching lab details for ID:", labId);

        const response = await labAPI.getLabById(labId);
        console.log("API response:", response);

        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            const lab = response.data.find((lab) => lab.id === labId);
            if (lab) {
              this.labForm = {
                lab_id: lab.id,
                name: lab.name,
                location: lab.location,
                lab_image: lab.lab_image || "",
                safety_equipments: lab.safety_equipments || "",
                safety_notes: lab.safety_notes || "",
              };
            } else {
              this.error = "未找到该实验室";
            }
          } else {
            this.labForm = {
              lab_id: response.data.id,
              name: response.data.name,
              location: response.data.location,
              lab_image: response.data.lab_image || "",
              safety_equipments: response.data.safety_equipments || "",
              safety_notes: response.data.safety_notes || "",
            };
          }
        } else {
          this.error = response.error || "获取实验室详情失败";
        }
      } catch (error) {
        console.error("Error fetching lab details:", error);
        this.error =
          error instanceof Error ? error.message : "获取实验室详情失败";
      } finally {
        this.loading = false;
      }
    },

    startEditing(field: keyof LabForm) {
      this.editingField[field] = true;
      this.editForm[field] = this.labForm[field];
    },

    async saveField(field: keyof LabForm) {
      this.editingField[field] = false;

      if (this.labForm[field] === this.editForm[field]) {
        return;
      }

      try {
        const response = await labAPI.editLab(this.labForm.lab_id!, {
          [field]: this.editForm[field],
        });

        if (response.success && response.data) {
          this.labForm[field] = this.editForm[field] as any; // 使用类型断言
          ElMessage.success("更新成功");
        } else {
          throw new Error(response.error || "更新失败");
        }
      } catch (error) {
        console.error("Error updating field:", error);
        ElMessage.error("更新失败，请稍后重试");
      }
    },

    beforeImageUpload(file: File) {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        ElMessage.error("只能上传图片文件!");
        return false;
      }
      if (!isLt5M) {
        ElMessage.error("图片大小不能超过 5MB!");
        return false;
      }
      return true;
    },

    // LabDetail.vue 中的上传方法
    async customImageUpload({ file }: { file: File }) {
      let loadingInstance = null;
      try {
        // 显示加载提示
        loadingInstance = ElLoading.service({
          lock: true,
          text: "上传中...",
          background: "rgba(0, 0, 0, 0.7)",
        });

        console.log("Uploading file:", file.name, file.type, file.size);

        const response = await labAPI.patchLabPhoto(this.labForm.lab_id!, file);

        if (response.success && response.data) {
          // 更新本地图片URL
          this.labForm.lab_image = response.data.lab_image;
          ElMessage.success("图片上传成功");
          // 刷新实验室详情
          await this.fetchLabDetails();
        } else {
          throw new Error(response.error || "上传失败");
        }
      } catch (error) {
        console.error("Upload error:", error);
        ElMessage.error(
          error instanceof Error ? error.message : "图片上传失败"
        );
      } finally {
        if (loadingInstance) {
          loadingInstance.close();
        }
      }
    },
  },
});
</script>

<style scoped>
.lab-detail {
  padding: 20px;
}

.lab-card {
  margin-bottom: 20px;
}

.lab-name {
  font-size: 24px;
  margin-bottom: 10px;
}

.lab-location {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.lab-photo-container {
  position: relative;
  min-height: 200px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-photo {
  color: #999;
  text-align: center;
  padding: 20px;
}

.upload-container {
  margin-top: 10px;
}

.editable-field {
  cursor: pointer;
  color: #409eff;
}

.editable-field:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #666;
}
</style>

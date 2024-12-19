<template>
  <div v-if="labDetails" class="lab-detail">
    <!-- 添加 v-if -->
    <div class="lab-detail">
      <!-- 大标题（实验室名称） -->
      <h1 class="lab-name">
        <span
          v-if="!editingField.name"
          @click="startEditing('name')"
          class="editable-field"
        >
          {{ labDetails.name || "未命名实验室" }}
        </span>
        <el-input
          v-else
          v-model="editForm.name"
          placeholder="请输入实验室名称"
          @blur="saveField('name')"
          @keyup.enter="saveField('name')"
        ></el-input>
      </h1>

      <!-- 小标题（实验室地点） -->
      <h2 class="lab-location">
        <span
          v-if="!editingField.location"
          @click="startEditing('location')"
          class="editable-field"
        >
          {{ labDetails.location || "未设置地点" }}
        </span>
        <el-input
          v-else
          v-model="editForm.location"
          placeholder="请输入实验室地点"
          @blur="saveField('location')"
          @keyup.enter="saveField('location')"
        ></el-input>
      </h2>

      <el-card class="lab-card" v-if="labDetails">
        <el-row :gutter="20">
          <!-- 实验室照片 -->
          <el-col :span="8">
            <div class="lab-photo-container" @click="startEditing('photo')">
              <el-image
                v-if="labDetails.photo"
                :src="labDetails.photo"
                style="width: 100%; max-height: 300px; object-fit: cover"
                fit="cover"
              ></el-image>
              <div v-else class="no-photo">
                <span>点击上传照片</span>
              </div>
              <!-- 图片上传控件，仅在编辑状态下显示 -->
              <el-upload
                v-if="editingField.photo"
                action="/api/v1/upload"
                :headers="uploadHeaders"
                @success="handlePhotoUploadSuccess"
                @error="handlePhotoUploadError"
                :show-file-list="false"
                accept="image/*"
              >
                <el-button type="primary">上传照片</el-button>
              </el-upload>
            </div>
          </el-col>

          <!-- 实验室安全员和联系方式 -->
          <el-col :span="16">
            <div class="lab-info">
              <p>
                <strong>实验室安全员:</strong>
                <span
                  v-if="!editingField.safety_officer"
                  @click="startEditing('safety_officer')"
                  class="editable-field"
                >
                  {{ labDetails.safety_officer || "暂无" }}
                </span>
                <el-input
                  v-else
                  v-model="editForm.safety_officer"
                  placeholder="请输入安全员姓名"
                  @blur="saveField('safety_officer')"
                  @keyup.enter="saveField('safety_officer')"
                ></el-input>
              </p>
              <p>
                <strong>联系方式:</strong>
                <span
                  v-if="!editingField.contact"
                  @click="startEditing('contact')"
                  class="editable-field"
                >
                  {{ labDetails.contact || "暂无" }}
                </span>
                <el-input
                  v-else
                  v-model="editForm.contact"
                  placeholder="请输入联系方式"
                  @blur="saveField('contact')"
                  @keyup.enter="saveField('contact')"
                ></el-input>
              </p>
            </div>
          </el-col>
        </el-row>

        <!-- 实验室安全器材 -->
        <div
          class="safety-equipment"
          v-if="
            labDetails.safety_equipment && labDetails.safety_equipment.length
          "
          style="margin-top: 30px"
        >
          <h3>实验室安全器材</h3>
          <el-table :data="labDetails.safety_equipment" style="width: 100%">
            <el-table-column prop="name" label="器材名称" />
            <el-table-column prop="description" label="描述" />
          </el-table>
        </div>

        <!-- 实验室安全注意事项 -->
        <div
          class="safety-precautions"
          v-if="
            labDetails.safety_precautions &&
            labDetails.safety_precautions.length
          "
          style="margin-top: 30px"
        >
          <h3>安全注意事项</h3>
          <ul class="precautions-list">
            <li
              v-for="(item, index) in labDetails.safety_precautions"
              :key="index"
            >
              {{ index + 1 }}. {{ item }}
            </li>
          </ul>
        </div>
      </el-card>

      <el-button type="primary" @click="goBack" style="margin-top: 20px">
        返回
      </el-button>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
  <!-- 加载中的占位内容 -->
</template>

<script>
import { ElMessage } from "element-plus";
import { labAPI } from "../utils/api";

export default {
  data() {
    return {
      labDetails: {
        name: "",
        location: "",
        photo: null,
        safety_officer: "",
        contact: "",
        safety_equipment: [],
        safety_precautions: [],
      }, // 确保字段有默认值
      editForm: {},
      editingField: {},
      labId: null,
    };
  },
  // created() {
  //   this.labId = parseInt(this.$route.params.id, 10);
  //   if (this.labId) {
  //     this.fetchLabDetails();
  //   }
  // },
  created() {
    this.labId = parseInt(this.$route.params.id, 10);
    if (this.labId) {
      this.fetchLabDetails();
    } else {
      ElMessage.error("未找到实验室 ID");
    }
  },
  methods: {
    // 获取实验室详情
    async fetchLabDetails() {
      try {
        const response = await labAPI.getLabById(this.labId);
        if (response.success) {
          this.labDetails = response.data;
        } else {
          ElMessage.error("获取实验室详情失败");
        }
      } catch (error) {
        console.error("Error fetching lab details:", error);
        ElMessage.error("获取实验室详情失败");
      }
    },

    // 开始编辑某个字段
    startEditing(field) {
      this.editingField[field] = true;
      this.editForm[field] = this.labDetails[field] || "";
    },

    // 保存某个字段
    async saveField(field) {
      this.editingField[field] = false;

      // 数据未变化则不提交
      if (this.labDetails[field] === this.editForm[field]) {
        return;
      }

      const updateData = { [field]: this.editForm[field] };
      try {
        const response = await labAPI.editLab(this.labId, updateData);
        if (response.success) {
          this.labDetails[field] = this.editForm[field];
          ElMessage.success("更新成功");
        } else {
          ElMessage.error("更新失败");
        }
      } catch (error) {
        console.error("Error updating field:", error);
        ElMessage.error("更新失败，请稍后重试");
      }
    },

    // 图片上传成功回调
    handlePhotoUploadSuccess(response) {
      if (response.success) {
        this.labDetails.photo = response.data.url;
        ElMessage.success("图片上传成功");
        this.editingField.photo = false;
      } else {
        ElMessage.error("图片上传失败");
      }
    },
    // 图片上传失败回调
    handlePhotoUploadError(error) {
      console.error("Upload error:", error);
      ElMessage.error("图片上传失败");
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.lab-detail {
  padding: 20px;
}

.lab-name {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
}

.lab-location {
  margin: 10px 0 20px 0;
  font-size: 20px;
  font-weight: normal;
  color: #666;
}

.lab-card {
  margin-bottom: 20px;
}

.lab-photo-container {
  width: 100%;
  height: auto;
  background-color: #fafafa;
  cursor: pointer;
  text-align: center;
  position: relative;
}

.no-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
  background-color: #f0f0f0;
}

.editable-field {
  color: #409eff;
  cursor: pointer;
}

.editable-field:hover {
  text-decoration: underline;
}

.precautions-list {
  list-style-type: decimal;
  margin-left: 20px;
}
</style>

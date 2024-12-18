<template>
  <div class="lab-detail">
    <h2>实验室详细信息</h2>
    <el-card class="lab-card" v-if="labDetails">
      <!-- 显示模式 -->
      <div v-if="!isEditing">
        <el-row :gutter="20">
          <!-- 左侧为实验室照片 -->
          <el-col :span="8">
            <div class="lab-photo-container">
              <el-image
                v-if="labDetails.photo"
                :src="labDetails.photo"
                style="width: 100%; max-height: 300px; object-fit: cover"
                fit="cover"
              ></el-image>
              <div v-else class="no-photo">
                <span>暂无照片</span>
              </div>
            </div>
          </el-col>

          <!-- 右侧为实验室基本信息 -->
          <el-col :span="16">
            <div class="lab-info">
              <p><strong>实验室名称:</strong> {{ labDetails.name }}</p>
              <p>
                <strong>实验室安全员:</strong>
                {{ labDetails.safety_officer || "暂无" }}
              </p>
              <p><strong>地点:</strong> {{ labDetails.location }}</p>
              <p>
                <strong>联系方式:</strong> {{ labDetails.contact || "暂无" }}
              </p>
            </div>
            <el-button
              type="primary"
              @click="toggleEditMode"
              style="margin-top: 10px"
            >
              编辑
            </el-button>
          </el-col>
        </el-row>

        <!-- 下方列出安全器材 -->
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

        <!-- 下方列出安全注意事项 -->
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
      </div>

      <!-- 编辑模式 -->
      <div v-else>
        <el-form :model="editForm" label-width="120px">
          <el-form-item label="实验室名称" :required="true">
            <el-input v-model="editForm.name" placeholder="请输入实验室名称" />
          </el-form-item>
          <el-form-item label="地点" :required="true">
            <el-input
              v-model="editForm.location"
              placeholder="请输入实验室地点"
            />
          </el-form-item>
          <el-form-item label="实验室照片" :required="false">
            <el-upload
              class="upload-demo"
              action="/api/v1/upload"
              :headers="uploadHeaders"
              :on-success="handlePhotoUploadSuccess"
              :on-error="handlePhotoUploadError"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button type="primary">上传照片</el-button>
            </el-upload>
            <div v-if="editForm.photo" class="uploaded-photo">
              <img :src="editForm.photo" alt="实验室照片" />
            </div>
          </el-form-item>
          <el-form-item label="实验室安全员" :required="false">
            <el-input
              v-model="editForm.safetyOfficer"
              placeholder="请输入安全员姓名"
            />
          </el-form-item>
          <el-form-item label="联系方式" :required="false">
            <el-input v-model="editForm.contact" placeholder="请输入联系方式" />
          </el-form-item>
          <el-form-item label="安全器材" :required="false">
            <el-button type="dashed" @click="addSafetyEquipment">
              添加器材
            </el-button>
            <div
              v-for="(equipment, index) in editForm.safety_equipment"
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
          <el-button type="primary" @click="saveLab">保存</el-button>
          <el-button @click="toggleEditMode">取消</el-button>
        </el-form>
      </div>
    </el-card>

    <el-button type="primary" @click="goBack" style="margin-top: 20px">
      返回
    </el-button>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { labAPI } from "../utils/api";

export default {
  data() {
    return {
      isEditing: false,
      labDetails: null, // 初始化为 null
      editForm: {},
      labId: null, // 用于存储当前实验室 ID
      uploadHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    };
  },
  created() {
    // 从路由参数获取实验室 ID
    this.labId = parseInt(this.$route.params.labId);
    if (this.labId) {
      this.fetchLabDetails();
    }
  },
  methods: {
    // 获取实验室详情
    async fetchLabDetails() {
      try {
        const response = await labAPI.getLabs(this.labId);
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

    // 修改保存方法
    async saveLab() {
      if (!this.editForm.name || !this.editForm.location) {
        ElMessage.warning("实验室名称和地点不能为空");
        return;
      }

      try {
        const labData = {
          name: this.editForm.name,
          location: this.editForm.location,
          photo: this.editForm.photo,
          safety_officer: this.editForm.safetyOfficer,
          contact: this.editForm.contact,
          safety_equipment: this.editForm.safety_equipment,
          safety_precautions: this.editForm.safety_precautions,
        };

        const response = await labAPI.editLab(this.labId, labData);
        if (response.success) {
          this.labDetails = { ...this.editForm };
          this.isEditing = false;
          ElMessage.success("实验室信息保存成功");
          // 重新获取实验室详情以确保数据同步
          await this.fetchLabDetails();
        } else {
          ElMessage.error(response.error || "保存失败");
        }
      } catch (error) {
        console.error("Error saving lab:", error);
        ElMessage.error("保存实验室信息失败");
      }
    },

    toggleEditMode() {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        // 创建深拷贝以避免直接修改 labDetails
        this.editForm = JSON.parse(JSON.stringify(this.labDetails));
      }
    },

    // 处理图片上传
    handlePhotoUploadSuccess(response) {
      if (response.success) {
        this.editForm.photo = response.data.url;
        ElMessage.success("图片上传成功");
      } else {
        ElMessage.error("图片上传失败");
      }
    },
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

.lab-card {
  margin-bottom: 20px;
}

.lab-photo-container {
  width: 100%;
  height: auto;
  background-color: #fafafa;
}

.lab-info p {
  margin: 5px 0;
}

.precautions-list {
  list-style-type: decimal;
  margin-left: 20px;
}

.uploaded-photo {
  margin-top: 10px;
  max-width: 100%;
  max-height: 300px;
}
</style>

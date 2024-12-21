<template>
  <div class="lab-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div class="lab-header">
      <h2 class="lab-name">
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
      </h2>

      <h3 class="lab-location">
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
      </h3>
    </div>

    <!-- 下面的卡片部分竖着排列 -->
    <el-row :gutter="20" class="lab-cards">
      <!-- 第一张卡片：实验室照片和安全员信息 -->
      <el-col :span="24">
        <el-card class="info-card">
          <el-row :gutter="20">
            <el-col :span="8">
              <!-- 实验室照片 -->
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

            <el-col :span="16">
              <!-- 安全员信息 -->
              <div class="safety-officer">
                <h3>实验室安全员</h3>
                <div class="safety-info">
                  <span>安全员：</span>
                  <span>{{ labForm.safety_officer || "未设置安全员" }}</span>
                </div>
                <div class="safety-info">
                  <span>电话：</span>
                  <span>{{ labForm.safety_phone || "未设置安全员电话" }}</span>
                </div>
                <div class="safety-info">
                  <span>邮箱：</span>
                  <span>{{ labForm.safety_email || "未设置安全员邮箱" }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 第二张卡片：安全设备 -->
      <el-col :span="24">
        <el-card class="info-card">
          <div class="safety-equipment">
            <div class="equipment-header">
              <h3>安全设备</h3>
              <el-button
                type="primary"
                size="small"
                @click="openEquipmentDialog"
              >
                添加设备
              </el-button>
            </div>

            <!-- 设备列表 -->
            <el-table
              :data="parsedEquipments"
              style="width: 100%"
              v-if="parsedEquipments.length"
            >
              <el-table-column label="设备图片" width="150">
                <template #default="{ row }">
                  <div class="equipment-image-container">
                    <el-image
                      v-if="row.image"
                      :src="row.image"
                      fit="cover"
                      class="equipment-thumb"
                      :preview-src-list="[row.image]"
                    ></el-image>
                    <div v-else class="no-image">暂无图片</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="设备名称" prop="name" width="180" />
              <el-table-column label="设备描述" prop="description" />
              <el-table-column label="操作" width="200" align="center">
                <template #default="{ $index }">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editEquipment($index)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeEquipment($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div v-else class="no-equipment">暂无安全设备信息</div>

            <!-- 编辑对话框 -->
            <el-dialog
              :title="editingIndex === null ? '添加设备' : '编辑设备'"
              v-model="dialogVisible"
              width="500px"
            >
              <el-form :model="currentEquipment" label-width="80px">
                <el-form-item label="设备名称" required>
                  <el-input
                    v-model="currentEquipment.name"
                    placeholder="请输入设备名称"
                  />
                </el-form-item>

                <el-form-item label="设备描述" required>
                  <el-input
                    v-model="currentEquipment.description"
                    type="textarea"
                    rows="3"
                    placeholder="请输入设备描述"
                  />
                </el-form-item>

                <el-form-item label="设备图片">
                  <div class="equipment-image-preview">
                    <el-image
                      v-if="currentEquipment.image"
                      :src="currentEquipment.image"
                      class="preview-image"
                      fit="cover"
                    ></el-image>
                    <div v-else class="no-image">暂无图片</div>
                  </div>
                  <el-upload
                    class="equipment-upload"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleImageChange"
                    accept="image/*"
                  >
                    <el-button type="primary">
                      {{ currentEquipment.image ? "更换图片" : "选择图片" }}
                    </el-button>
                  </el-upload>
                </el-form-item>
              </el-form>

              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveEquipment"
                    >确定</el-button
                  >
                </span>
              </template>
            </el-dialog>
          </div>
        </el-card>
      </el-col>

      <!-- 第三张卡片：安全须知 -->
      <el-col :span="24">
        <el-card class="info-card">
          <div class="safety-notes">
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
        </el-card>
      </el-col>
    </el-row>
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
  // Equipment,
} from "../types/lab";
interface Equipment {
  name: string;
  description: string;
  image: string;
}

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
      // editForm: {} as Partial<LabForm>,
      editingField: {} as Record<string, boolean>,
      loading: false,
      dialogVisible: false,
      error: null as string | null,
      parsedEquipments: [] as Equipment[],
      currentEquipment: {
        name: "",
        description: "",
        image: "",
      } as Equipment,
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
    async fileToBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    },
    // 处理设备图片变更
    async handleImageChange(file: any) {
      const isImage = file.raw.type.startsWith("image/");
      const isLt5M = file.raw.size / 1024 / 1024 < 5;

      if (!isImage) {
        ElMessage.error("只能上传图片文件!");
        return;
      }
      if (!isLt5M) {
        ElMessage.error("图片大小不能超过 5MB!");
        return;
      }

      try {
        // 将文件转换为 base64
        const base64String = await this.fileToBase64(file.raw);
        // 直接更新当前编辑的设备的图片
        this.currentEquipment.image = base64String;
      } catch (error) {
        console.error("Error converting image:", error);
        ElMessage.error("图片处理失败");
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
    // 打开设备编辑对话框
    openEquipmentDialog(index?: number) {
      this.editingIndex = typeof index === "number" ? index : null;
      if (this.editingIndex !== null) {
        // 编辑现有设备，复制所有属性包括图片
        this.currentEquipment = { ...this.parsedEquipments[this.editingIndex] };
      } else {
        // 添加新设备，重置所有字段
        this.currentEquipment = {
          name: "",
          description: "",
          image: "",
        };
      }
      this.dialogVisible = true;
    },

    async handleEquipmentImageUpload({ file }: { file: File }, index: number) {
      try {
        if (!this.beforeImageUpload(file)) {
          return;
        }

        const base64String = await this.fileToBase64(file);

        // 更新设备的图片
        this.parsedEquipments[index].image = base64String;

        // 保存更新后的设备信息
        const response = await labAPI.editLab(this.labForm.lab_id!, {
          safety_equipments: this.stringifyEquipments(this.parsedEquipments),
        });

        if (response.success) {
          ElMessage.success("设备图片上传成功");
        } else {
          throw new Error(response.error || "保存失败");
        }
      } catch (error) {
        console.error("Upload error:", error);
        ElMessage.error(
          error instanceof Error ? error.message : "图片上传失败"
        );
      }
    },
    parseEquipments(equipmentsStr: string): Equipment[] {
      try {
        return JSON.parse(equipmentsStr || "[]");
      } catch (e) {
        console.error("解析设备信息失败:", e);
        return [];
      }
    },

    // 保存设备信息
    async saveEquipment() {
      if (
        !this.currentEquipment.name.trim() ||
        !this.currentEquipment.description.trim()
      ) {
        ElMessage.error("请填写设备名称和描述");
        return;
      }

      try {
        // 处理设备列表
        const updatedEquipments = [...this.parsedEquipments];
        if (this.editingIndex !== null) {
          updatedEquipments[this.editingIndex] = { ...this.currentEquipment };
        } else {
          updatedEquipments.push({ ...this.currentEquipment });
        }

        // 准备要发送的数据
        const updateData = {
          id: this.labForm.lab_id,
          safety_equipments: JSON.stringify(updatedEquipments),
        };

        console.log("Updating equipment with data:", updateData);

        // 发送更新请求
        const response = await labAPI.editLab(this.labForm.lab_id!, updateData);

        if (response.success) {
          ElMessage.success(
            this.editingIndex !== null ? "设备更新成功" : "设备添加成功"
          );
          this.dialogVisible = false;
          this.parsedEquipments = updatedEquipments;
        } else {
          throw new Error(response.error || "保存失败");
        }
      } catch (error) {
        console.error("Save error:", error);
        ElMessage.error("保存失败，请稍后重试");
      }
    },

    // 删除设备
    async removeEquipment(index: number) {
      try {
        await this.$confirm("确认删除该设备?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        // 创建新的设备列表（排除要删除的设备）
        const updatedEquipments = this.parsedEquipments.filter(
          (_, i) => i !== index
        );

        // 准备要发送的数据
        const updateData = {
          id: this.labForm.lab_id,
          safety_equipments: JSON.stringify(updatedEquipments),
        };

        // 发送更新请求
        const response = await labAPI.editLab(this.labForm.lab_id!, updateData);

        if (response.success) {
          ElMessage.success("删除成功");
          this.parsedEquipments = updatedEquipments;
        } else {
          throw new Error(response.error || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("Delete error:", error);
          ElMessage.error("删除失败，请稍后重试");
        }
      }
    },

    // 将设备转换为字符串
    stringifyEquipments(equipments: Equipment[]): string {
      return JSON.stringify(
        equipments.map(({ name, description, image }) => ({
          name,
          description,
          image,
        }))
      );
    },
  },
});
</script>

<style scoped>
.equipment-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.equipment-thumb {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
}

.no-image {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.no-equipment {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.image-upload {
  margin-top: 8px;
}

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
.selected-file {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  padding-top: 20px;
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
.lab-header {
  margin-bottom: 20px;
}

.info-card {
  padding: 20px;
  margin-bottom: 20px;
}

.safety-officer {
  margin-bottom: 20px;
}

.safety-info {
  margin-bottom: 10px;
}

.safety-equipment,
.safety-notes {
  margin-bottom: 20px;
}
</style>

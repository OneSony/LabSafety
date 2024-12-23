<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-container">
      <Vue3Lottie
        :animation-data="loadingAnimation"
        :height="200"
        :width="200"
        :loop="true"
        :autoPlay="true"
      />
    </div>
  </Transition>
  <div class="lab-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div class="lab-header">
      <h2 class="lab-name">
        <span v-if="!editingField.name" @click="startEditing('name')">
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
        <span v-if="!editingField.location" @click="startEditing('location')">
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
          <div class="card-main-title">
            <h3>实验室信息</h3>
          </div>

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
                  <el-button v-if="isManager" type="primary"
                    >上传照片</el-button
                  >
                </el-upload>
              </div>
            </el-col>

            <el-col :span="16">
              <!-- 安全员信息 -->
              <div class="safety-officer">
                <h4 class="section-title">实验室安全员</h4>
                <div class="action-button">
                  <el-button
                    v-if="isManager"
                    type="primary"
                    size="small"
                    @click="openManagerDialog"
                  >
                    添加安全员
                  </el-button>
                </div>
                <!-- 安全员列表 -->
                <div v-if="labManagers.length" class="managers-list">
                  <div
                    v-for="manager in labManagers"
                    :key="manager.manager_user_id"
                    class="manager-card"
                  >
                    <div class="safety-info">
                      <span class="info-label">安全员：</span>
                      <span>{{ manager.manager_name }}</span>
                    </div>
                    <div class="safety-info">
                      <span class="info-label">电话：</span>
                      <span>{{ manager.manager_phone }}</span>
                    </div>
                    <div class="safety-info">
                      <span class="info-label">邮箱：</span>
                      <span>{{ manager.manager_email }}</span>
                    </div>
                    <div class="manager-actions">
                      <el-button
                        v-if="isManager"
                        type="danger"
                        size="small"
                        @click="unbindManager(manager)"
                      >
                        解除绑定
                      </el-button>
                    </div>
                  </div>
                </div>
                <div v-else class="no-managers">暂无安全员信息</div>
                <el-dialog
                  title="添加安全员"
                  v-model="managerDialogVisible"
                  width="600px"
                >
                  <div class="search-box">
                    <el-input
                      v-model="searchManagerName"
                      placeholder="搜索安全员"
                      clearable
                      @input="handleManagerSearch"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>

                  <el-table
                    :data="availableManagers"
                    style="width: 100%"
                    height="300px"
                    v-loading="loadingManagers"
                  >
                    <el-table-column prop="manager_name" label="姓名" />
                    <el-table-column prop="manager_phone" label="电话" />
                    <el-table-column prop="manager_email" label="邮箱" />
                    <el-table-column fixed="right" label="操作" width="120">
                      <template #default="{ row }">
                        <el-button
                          v-if="isManager"
                          type="primary"
                          size="small"
                          @click="bindManager(row)"
                          :disabled="isManagerBound(row)"
                        >
                          {{ isManagerBound(row) ? "已添加" : "添加" }}
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>

                  <template #footer>
                    <span class="dialog-footer">
                      <el-button
                        v-if="isManager"
                        @click="managerDialogVisible = false"
                        >关闭</el-button
                      >
                    </span>
                  </template>
                </el-dialog>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 第二张卡片：安全器材 -->
      <el-col :span="24">
        <el-card class="info-card">
          <div class="safety-equipment">
            <div class="equipment-header">
              <h3>安全器材</h3>
              <el-button
                v-if="isManager"
                type="primary"
                size="small"
                @click="openEquipmentDialog"
              >
                添加器材
              </el-button>
            </div>

            <!-- 器材列表 -->
            <el-table
              :data="parsedEquipments"
              style="width: 100%"
              v-if="parsedEquipments.length"
            >
              <el-table-column label="器材图片" width="150">
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
              <el-table-column label="器材名称" prop="name" width="180" />
              <el-table-column label="器材描述" prop="description" />
              <el-table-column width="200" align="center">
                <template #default="{ $index }">
                  <el-button
                    v-if="isManager"
                    type="primary"
                    size="small"
                    @click="editEquipment($index)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="isManager"
                    type="danger"
                    size="small"
                    @click="removeEquipment($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div v-else class="no-equipment">暂无安全器材信息</div>

            <!-- 编辑对话框 -->
            <el-dialog
              :title="editingIndex === null ? '添加器材' : '编辑器材'"
              v-model="dialogVisible"
              width="500px"
            >
              <el-form :model="currentEquipment" label-width="80px">
                <el-form-item label="器材名称" required>
                  <el-input
                    v-model="currentEquipment.name"
                    placeholder="请输入器材名称"
                  />
                </el-form-item>

                <el-form-item label="器材描述" required>
                  <el-input
                    v-model="currentEquipment.description"
                    type="textarea"
                    rows="3"
                    placeholder="请输入器材描述"
                  />
                </el-form-item>

                <el-form-item label="器材图片">
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
                    <el-button v-if="isManager" type="primary">
                      {{ currentEquipment.image ? "更换图片" : "选择图片" }}
                    </el-button>
                  </el-upload>
                </el-form-item>
              </el-form>

              <template #footer>
                <span class="dialog-footer">
                  <el-button v-if="isManager" @click="dialogVisible = false"
                    >取消</el-button
                  >
                  <el-button
                    v-if="isManager"
                    type="primary"
                    @click="saveEquipment"
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
            <div class="safety-header">
              <h3>安全须知</h3>
              <el-button
                v-if="isManager"
                type="primary"
                size="small"
                @click="openNoteDialog(null)"
              >
                添加须知
              </el-button>
            </div>

            <!-- Safety notes list -->
            <div class="safety-list" v-if="parsedNotes.length">
              <div
                v-for="(note, index) in parsedNotes"
                :key="index"
                class="safety-item"
              >
                <span class="note-number">{{ index + 1 }}</span>
                <el-tag class="note-tag" size="small">{{ note.tag }}</el-tag>
                <span class="note-content">{{ note.content }}</span>
                <div class="note-actions">
                  <el-button
                    v-if="isManager"
                    type="text"
                    @click="openNoteDialog(index)"
                    >编辑</el-button
                  >
                  <el-button
                    v-if="isManager"
                    type="text"
                    class="delete-btn"
                    @click="removeNote(index)"
                    >删除</el-button
                  >
                </div>
              </div>
            </div>
            <div v-else class="no-notes">暂无安全须知</div>

            <!-- Note dialog -->
            <el-dialog
              :title="
                editingNoteIndex === null ? '添加安全须知' : '编辑安全须知'
              "
              v-model="noteDialogVisible"
              width="500px"
            >
              <el-form :model="currentNote" label-width="80px">
                <el-form-item label="类型标签" required>
                  <el-input
                    v-model="currentNote.tag"
                    placeholder="请输入标签"
                    maxlength="10"
                  />
                </el-form-item>
                <el-form-item label="须知内容" required>
                  <el-input
                    v-model="currentNote.content"
                    type="textarea"
                    rows="3"
                    placeholder="请输入须知内容"
                  />
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button v-if="isManager" @click="noteDialogVisible = false"
                    >取消</el-button
                  >
                  <el-button v-if="isManager" type="primary" @click="saveNote"
                    >确定</el-button
                  >
                </span>
              </template>
            </el-dialog>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { defineComponent } from "vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { labAPI } from "../utils/api";
import _ from "lodash";
import type { Lab, LabForm, LabManager, UpdateLabRequest } from "../types/lab";
import loadingAnimation from "@/assets/loading.json";

interface Equipment {
  name: string;
  description: string;
  image: string;
}
interface SafetyNote {
  tag: string;
  content: string;
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
      editingIndex: null as number | null,
      loading: false,
      dialogVisible: false,
      error: null as string | null,
      parsedEquipments: [] as Equipment[],
      currentEquipment: {
        name: "",
        description: "",
        image: "",
      } as Equipment,
      parsedNotes: [] as SafetyNote[],
      noteDialogVisible: false,
      editingNoteIndex: null as number | null,
      currentNote: {
        tag: "",
        content: "",
      } as SafetyNote,
      labManagers: [] as LabManager[],
      availableManagers: [] as LabManager[],
      managerDialogVisible: false,
      searchManagerName: "",
      loadingManagers: false,
      isLoading: true,
      isManager: localStorage.getItem("role") === "manager",
    };
  },
  setup() {
    return {
      loadingAnimation,
    };
  },
  mounted() {
    // 在组件挂载后设置一个定时器来关闭加载动画
    setTimeout(() => {
      this.isLoading = false;
    }, 1500); // 1.5秒后关闭动画
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
          const lab = Array.isArray(response.data)
            ? response.data.find((l: Lab) => l.id === labId)
            : response.data;

          if (lab) {
            console.log("Lab data:", lab);
            console.log("Safety equipments:", lab.safety_equipments);

            this.labForm = {
              lab_id: lab.id,
              name: lab.name,
              location: lab.location,
              lab_image: lab.lab_image || "",
              safety_equipments: lab.safety_equipments || "[]",
              safety_notes: lab.safety_notes || "",
            };

            // 尝试解析器材信息
            try {
              this.parsedEquipments = this.parseEquipments(
                lab.safety_equipments
              );
              console.log("Parsed equipments:", this.parsedEquipments);
            } catch (e) {
              console.error("Error parsing equipments:", e);
              this.parsedEquipments = [];
            }
            // Parse safety notes
            try {
              this.parsedNotes = this.parseNotes(lab.safety_notes || "[]");
              console.log("Parsed safety notes:", this.parsedNotes);
            } catch (e) {
              console.error("Error parsing safety notes:", e);
              this.parsedNotes = [];
            }
            await this.fetchLabManagers();
          }
        }
      } catch (error) {
        console.error("Error in fetchLabDetails:", error);
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
    // 处理器材图片变更
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
        // 直接更新当前编辑的器材的图片
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
    // 打开器材编辑对话框
    openEquipmentDialog(index?: number) {
      this.editingIndex = typeof index === "number" ? index : null;
      if (this.editingIndex !== null) {
        // 编辑现有器材，复制所有属性包括图片
        this.currentEquipment = { ...this.parsedEquipments[this.editingIndex] };
      } else {
        // 添加新器材，重置所有字段
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

        // 更新器材的图片
        this.parsedEquipments[index].image = base64String;

        // 保存更新后的器材信息
        const response = await labAPI.editLab(this.labForm.lab_id!, {
          safety_equipments: this.stringifyEquipments(this.parsedEquipments),
        });

        if (response.success) {
          ElMessage.success("器材图片上传成功");
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

    // 保存器材信息
    // 保存器材信息
    async saveEquipment() {
      if (
        !this.currentEquipment.name.trim() ||
        !this.currentEquipment.description.trim()
      ) {
        ElMessage.error("请填写器材名称和描述");
        return;
      }

      try {
        // 更新器材列表
        const updatedEquipments = [...this.parsedEquipments];
        if (this.editingIndex !== null) {
          updatedEquipments[this.editingIndex] = { ...this.currentEquipment };
        } else {
          updatedEquipments.push({ ...this.currentEquipment });
        }

        // 准备更新数据
        const equipmentsJson = JSON.stringify(updatedEquipments);
        console.log("Saving equipments:", equipmentsJson);

        const updateData = {
          id: this.labForm.lab_id,
          safety_equipments: equipmentsJson,
        };

        // 发送更新请求
        const response = await labAPI.editLab(this.labForm.lab_id!, updateData);
        console.log("Save response:", response);

        if (response.success) {
          // 更新本地数据
          this.parsedEquipments = updatedEquipments;
          this.labForm.safety_equipments = equipmentsJson;

          ElMessage.success(
            this.editingIndex !== null ? "器材更新成功" : "器材添加成功"
          );
          this.dialogVisible = false;

          // 可以选择是否刷新数据
          await this.fetchLabDetails();
        } else {
          throw new Error(response.error || "保存失败");
        }
      } catch (error) {
        console.error("Save error:", error);
        ElMessage.error("保存失败，请稍后重试");
      }
    },
    editEquipment(index: number) {
      try {
        // 直接调用已有的 openEquipmentDialog 方法，传入索引
        this.openEquipmentDialog(index);
      } catch (error) {
        console.error("编辑器材失败:", error);
        ElMessage.error("编辑器材失败，请稍后重试");
      }
    },
    // 解析器材信息
    parseEquipments(equipmentsStr: string): Equipment[] {
      try {
        if (!equipmentsStr) return [];
        const parsed = JSON.parse(equipmentsStr);
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch (e) {
        console.error("解析器材信息失败:", e);
        return [];
      }
    },

    // 将器材信息转换为字符串
    stringifyEquipments(equipments: Equipment[]): string {
      const cleanEquipments = equipments.map(
        ({ name, description, image }) => ({
          name: name.trim(),
          description: description.trim(),
          image: image || "",
        })
      );
      return JSON.stringify(cleanEquipments);
    },

    // 删除器材
    async removeEquipment(index: number) {
      try {
        await ElMessageBox.confirm("确认删除该器材?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        const updatedEquipments = this.parsedEquipments.filter(
          (_, i) => i !== index
        );
        const equipmentsJson = this.stringifyEquipments(updatedEquipments);

        // 移除 id，只传递需要更新的字段
        const response = await labAPI.editLab(this.labForm.lab_id!, {
          safety_equipments: equipmentsJson,
        });

        if (response.success) {
          // 更新本地数据
          this.parsedEquipments = updatedEquipments;
          this.labForm.safety_equipments = equipmentsJson;

          ElMessage.success("删除成功");
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
    parseNotes(notesStr: string): SafetyNote[] {
      try {
        if (!notesStr) return [];
        const parsed = JSON.parse(notesStr);
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch (e) {
        console.error("解析安全须知失败:", e);
        return [];
      }
    },

    openNoteDialog(index: number | null) {
      this.editingNoteIndex = index;
      if (index !== null) {
        // Edit existing note
        this.currentNote = { ...this.parsedNotes[index] };
      } else {
        // Add new note
        this.currentNote = {
          tag: "",
          content: "",
        };
      }
      this.noteDialogVisible = true;
    },

    async saveNote() {
      if (!this.currentNote.tag.trim() || !this.currentNote.content.trim()) {
        ElMessage.error("请填写标签和内容");
        return;
      }

      try {
        const updatedNotes = [...this.parsedNotes];
        if (this.editingNoteIndex !== null) {
          updatedNotes[this.editingNoteIndex] = { ...this.currentNote };
        } else {
          updatedNotes.push({ ...this.currentNote });
        }

        const notesJson = JSON.stringify(updatedNotes);

        const response = await labAPI.editLab(this.labForm.lab_id!, {
          safety_notes: notesJson,
        });

        if (response.success) {
          this.parsedNotes = updatedNotes;
          this.labForm.safety_notes = notesJson;
          ElMessage.success(
            this.editingNoteIndex !== null ? "须知更新成功" : "须知添加成功"
          );
          this.noteDialogVisible = false;
        } else {
          throw new Error(response.error || "保存失败");
        }
      } catch (error) {
        console.error("Save error:", error);
        ElMessage.error("保存失败，请稍后重试");
      }
    },

    async removeNote(index: number) {
      try {
        await ElMessageBox.confirm("确认删除该安全须知?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        const updatedNotes = this.parsedNotes.filter((_, i) => i !== index);
        const notesJson = JSON.stringify(updatedNotes);

        const response = await labAPI.editLab(this.labForm.lab_id!, {
          safety_notes: notesJson,
        });

        if (response.success) {
          this.parsedNotes = updatedNotes;
          this.labForm.safety_notes = notesJson;
          ElMessage.success("删除成功");
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
    // 获取当前实验室的安全员列表
    async fetchLabManagers() {
      try {
        if (!this.labForm.lab_id) {
          return;
        }

        const response = await labAPI.getLabManagers({
          lab_id: this.labForm.lab_id,
        });

        if (response.success && response.data) {
          this.labManagers = Array.isArray(response.data)
            ? response.data
            : [response.data];
        } else {
          throw new Error(response.error || "获取安全员列表失败");
        }
      } catch (error) {
        console.error("获取安全员列表失败:", error);
        ElMessage.error("获取安全员列表失败");
      }
    },

    // 打开选择安全员对话框
    async openManagerDialog() {
      this.managerDialogVisible = true;
      this.searchManagerName = "";
      await this.fetchAvailableManagers();
    },

    // 获取所有可选的安全员列表
    async fetchAvailableManagers() {
      this.loadingManagers = true;
      try {
        const response = await labAPI.getLabManagers({
          manager_name: this.searchManagerName,
        });

        if (response.success && response.data) {
          this.availableManagers = Array.isArray(response.data)
            ? response.data
            : [response.data];
        } else {
          throw new Error(response.error || "获取安全员列表失败");
        }
      } catch (error) {
        console.error("获取安全员列表失败:", error);
        ElMessage.error("获取安全员列表失败");
      } finally {
        this.loadingManagers = false;
      }
    },

    // 处理安全员搜索
    handleManagerSearch: _.debounce(async function (this: any) {
      await this.fetchAvailableManagers();
    }, 300),

    // 检查安全员是否已绑定
    isManagerBound(manager: LabManager): boolean {
      return this.labManagers.some(
        (m) => m.manager_user_id === manager.manager_user_id
      );
    },

    // 绑定安全员
    async bindManager(manager: LabManager) {
      if (this.isManagerBound(manager)) {
        return;
      }

      try {
        const response = await labAPI.bindLabManager({
          manager_user_id: manager.manager_user_id,
          lab_id: this.labForm.lab_id!,
        });

        if (response.success) {
          await this.fetchLabManagers(); // 刷新安全员列表
          ElMessage.success("安全员添加成功");
        } else {
          throw new Error(response.error || "添加失败");
        }
      } catch (error) {
        console.error("添加安全员失败:", error);
        ElMessage.error("添加安全员失败，请稍后重试");
      }
    },

    // 解除绑定安全员
    async unbindManager(manager: LabManager) {
      try {
        await ElMessageBox.confirm("确认解除该安全员的绑定?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        const response = await labAPI.unbindLabManager(
          this.labForm.lab_id!,
          manager.manager_user_id
        );

        if (response.success) {
          await this.fetchLabManagers(); // 刷新安全员列表
          ElMessage.success("解除绑定成功");
        } else {
          throw new Error(response.error || "解除绑定失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("解除绑定失败:", error);
          ElMessage.error("解除绑定失败，请稍后重试");
        }
      }
    },
  },
});
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white; /* 或者与你的页面背景色匹配 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 过渡动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.section-title {
  font-size: 16px;
  color: #606266;
  margin: 0 0 12px 0;
}

.action-button {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.managers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manager-card {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  position: relative;
}

.manager-actions {
  position: absolute;
  top: 16px;
  right: 16px;
}

.safety-info {
  margin-bottom: 12px;
}

.info-label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.search-box {
  margin-bottom: 16px;
}

.no-managers {
  text-align: center;
  color: #909399;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.dialog-footer {
  padding-top: 20px;
}

.card-main-title {
  margin-bottom: 20px;
}

.card-main-title h3 {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.section-title {
  font-size: 16px;
  color: #606266;
  margin: 0 0 12px 0;
}

.action-button {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.manager-card {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  position: relative;
}

.safety-info {
  margin-bottom: 12px;
}

.info-label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.search-box {
  margin-bottom: 16px;
}

.safety-officer {
  padding: 0 12px;
}

.dialog-footer {
  padding-top: 20px;
}
.safety-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.manager-card {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  position: relative;
}

.info-label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.safety-info {
  margin-bottom: 12px;
}

.search-box {
  margin-bottom: 16px;
}
.safety-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.safety-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.safety-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  gap: 12px;
}

.note-number {
  min-width: 24px;
  height: 24px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.note-tag {
  min-width: 60px;
  text-align: center;
}

.note-content {
  flex-grow: 1;
  margin: 0 12px;
}

.note-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  color: #f56c6c;
}

.no-notes {
  text-align: center;
  color: #909399;
  padding: 20px;
}
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

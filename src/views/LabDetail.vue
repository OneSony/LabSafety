<template>
  <div class="page-container">
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
          <el-button type="text" @click="showMap" class="map-button">
            <el-icon><Location /></el-icon>
            查看地图
          </el-button>
        </h3>

        <!-- 地图对话框 -->
        <el-dialog v-model="mapDialogVisible" title="实验室地图" width="600px">
          <div class="map-container">
            <el-image
              v-if="labForm.map_image"
              :src="labForm.map_image"
              fit="contain"
              class="map-image"
            ></el-image>
            <div v-else class="no-map">暂无地图</div>
          </div>
          <div v-if="isManager" class="map-upload">
            <el-upload
              class="upload-demo"
              :action="null"
              :http-request="UploadMap"
              :show-file-list="false"
              accept="image/*"
              :before-upload="beforeMapUpload"
            >
              <el-button type="primary">{{
                labForm.map_image ? "更换地图" : "上传地图"
              }}</el-button>
            </el-upload>
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="mapDialogVisible = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>
      </div>

      <!-- 下面的卡片部分竖着排列 -->
      <el-row :gutter="20" class="lab-cards">
        <!-- 第一张卡片：实验室照片和安全员信息 -->

        <div class="box">
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
                  <span> 点击上传照片</span>
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
                    <el-icon><Plus /></el-icon>
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
                      <el-tooltip
                        v-if="manager.manager_user_id === myUserId"
                        class="item"
                        effect="dark"
                        content="不能解除绑定自己"
                        placement="top"
                      >
                        <el-button
                          v-if="isManager"
                          type="danger"
                          size="small"
                          @click="unbindManager(manager)"
                          :disabled="manager.manager_user_id === myUserId"
                        >
                          解除绑定
                        </el-button>
                      </el-tooltip>
                      <el-button
                        v-else-if="isManager"
                        type="danger"
                        size="small"
                        @click="unbindManager(manager)"
                        :disabled="manager.manager_user_id === myUserId"
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
                  <div v-if="loadingManagers">正在加载...</div>
                  <div
                    v-if="!loadingManagers && availableManagers.length === 0"
                  >
                    未找到匹配的安全员
                  </div>
                  <el-table
                    :data="availableManagers"
                    style="width: 100%"
                    height="300px"
                    v-loading="loadingManagers"
                  >
                    <el-table-column prop="manager_name" label="姓名">
                      <template #default="{ row }">
                        {{ row.manager_name || "未知" }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="manager_phone" label="电话">
                      <template #default="{ row }">
                        {{ row.manager_phone || "未知" }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="manager_email" label="邮箱">
                      <template #default="{ row }">
                        {{ row.manager_email || "未知" }}
                      </template>
                    </el-table-column>
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
        </div>

        <!-- 通知已写好勿动 -->
        <div class="box">
          <h3>通知</h3>
          <el-button
            v-if="isManager"
            type="primary"
            class="card-btn"
            style="position: absolute; top: 20px; right: 20px"
            @click="noticeDialogVisible = true"
          >
            <el-icon><Plus /></el-icon>
            添加通知
          </el-button>
          <el-skeleton :rows="3" animated v-if="!noticeLoaded" />
          <p
            v-if="noticeList.length === 0 && noticeLoaded"
            style="text-align: center; color: #ccc"
          >
            暂无通知
          </p>
          <el-row gutter="20">
            <el-col
              :xs="24"
              :sm="12"
              :md="8"
              v-for="notice in noticeList"
              :key="notice.id"
              :span="8"
              style="
                position: relative;
                display: flex;
                flex-direction: column;
                margin-bottom: 20px;
              "
              class="notice-item"
            >
              <el-button
                type="text"
                @click="deleteNotification(notice)"
                v-if="notice.sender === myUserId"
                style="
                  position: absolute;
                  right: 25px;
                  top: 15px;
                  z-index: 1000;
                "
              >
                删除
              </el-button>
              <el-button
                type="text"
                @click="notice.noticeEditDialogVisible = true"
                v-if="notice.sender === myUserId"
                style="
                  position: absolute;
                  right: 65px;
                  top: 15px;
                  z-index: 1000;
                "
              >
                编辑
              </el-button>
              <NoticeCard :notice="notice" />
              <el-dialog
                title="编辑通知"
                v-model="notice.noticeEditDialogVisible"
                width="40%"
                @close="fetchNotices"
              >
                <NoticeDialog
                  :lab_id="Number(id)"
                  :notice="notice"
                  @close-dialog="notice.noticeEditDialogVisible = false"
                  v-if="notice.noticeEditDialogVisible"
                />
              </el-dialog>
            </el-col>
          </el-row>
        </div>
        <el-dialog
          title="添加通知"
          v-model="noticeDialogVisible"
          width="40%"
          @close="fetchNotices"
        >
          <NoticeDialog
            :lab_id="Number(id)"
            @close-dialog="noticeDialogVisible = false"
            v-if="noticeDialogVisible"
          />
        </el-dialog>

        <!-- 第二张卡片：安全器材 -->
        <div class="box">
          <div class="safety-equipment">
            <div class="equipment-header">
              <h3>安全器材</h3>
              <el-button
                v-if="isManager"
                type="primary"
                size="small"
                @click="openEquipmentDialog"
              >
                <el-icon><Plus /></el-icon>
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
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button
                    v-if="isManager"
                    type="danger"
                    size="small"
                    @click="removeEquipment($index)"
                  >
                    <el-icon><Delete /></el-icon>
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
        </div>

        <!-- 第三张卡片：安全须知 -->
        <div class="box">
          <div class="safety-notes">
            <div class="safety-header">
              <h3>安全须知</h3>
              <el-button
                v-if="isManager"
                type="primary"
                size="small"
                @click="openNoteDialog(null)"
              >
                <el-icon><Plus /></el-icon>
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
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button
                    v-if="isManager"
                    type="text"
                    class="delete-btn"
                    @click="removeNote(index)"
                  >
                    <el-icon><Delete /></el-icon>删除</el-button
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
        </div>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { defineComponent } from "vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { labAPI, noticeAPI, userAPI } from "../utils/api";
import _ from "lodash";
import type { Lab, LabForm, LabManager, UpdateLabRequest } from "../types/lab";
import loadingAnimation from "@/assets/loading.json";
import { Location } from "@element-plus/icons-vue";
import NoticeCard from "@/components/NoticeCard.vue";
import NoticeDialog from "@/components/NoticeDialog.vue";
import { disableAutoUnmount } from "@vue/test-utils";
import {
  Plus,
  Edit,
  Delete,
  UserPlus,
  UserMinus,
  Upload,
  Bell,
  Close,
  Check,
} from "@element-plus/icons-vue";

interface Equipment {
  name: string;
  description: string;
  image: string;
}
interface SafetyNote {
  tag: string;
  content: string;
}
interface ManagerSearchThis {
  searchManagerName: string;
  loadingManagers: boolean;
  availableManagers: LabManager[];
}
export default defineComponent({
  name: "LabDetail",
  components: {
    Plus,
    Edit,
    Delete,
    Location,
    Search,
    NoticeCard,
    NoticeDialog,
  },
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
        map_image: "",
        safety_equipments: "",
        safety_notes: "",
      } as LabForm,
      // editForm: {} as Partial<LabForm>,
      editingField: {} as Record<string, boolean>,
      editingIndex: null as number | null,
      loading: false,
      dialogVisible: false,
      mapDialogVisible: false,
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
      noticeDialogVisible: false,
      isManager: localStorage.getItem("role") === "manager",
      noticeLoaded: false,
      noticeList: [],
      myUserId: userAPI.getUserId(),
      boundManagerIds: new Set<string | number>(),
    };
  },
  setup() {
    return {
      loadingAnimation,
    };
  },
  mounted() {
    // 在组件挂载后设置一个定时器来关闭加载动画
    /*setTimeout(() => {
      this.isLoading = false;
    }, 1500); // 1.5秒后关闭动画*/

    this.fetchLabDetails();
    this.fetchNotices();
    this.fetchLabManagers();
  },
  watch: {
    "labForm.lab_id": {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchLabManagers();
        }
      },
    },
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

      const labId = Number(this.id);
      console.log("Fetching lab details for ID:", labId);

      const response = await labAPI.getLabs(labId);
      console.log("API response:", response);

      if (response.success && response.data.length > 0) {
        const lab = response.data[0];

        console.log("Lab data:", lab);
        console.log("Safety equipments:", lab.safety_equipments);

        this.labForm = {
          lab_id: lab.id,
          name: lab.name,
          location: lab.location,
          lab_image: lab.lab_image || "",
          map_image: lab.map_image || "",
          safety_equipments: lab.safety_equipments || "[]",
          safety_notes: lab.safety_notes || "",
        };

        // 尝试解析器材信息
        try {
          this.parsedEquipments = this.parseEquipments(lab.safety_equipments);
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
        this.loading = false;
      } else {
        ElMessage.error("获取实验室信息失败");
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

    async fetchUserList() {
      this.loadingManagers = true;
      const result = await userAPI.getUserInfo("", "manager");
      if (result.success) {
        console.log("Fetched user list:", result.data);
        for (let i = 0; i < result.data.length; i++) {
          this.availableManagers.push({
            manager_user_id: result.data[i].user_id,
            manager_name: result.data[i].real_name,
            manager_phone: result.data[i].phone_number,
            manager_email: result.data[i].email,
          } as LabManager);
        } // 直接设置到 availableManagers
      } else {
        ElMessage.error("获取安全员列表失败");
      }
    },
    // 修改打开对话框的方法
    async openManagerDialog() {
      this.managerDialogVisible = true;
      this.searchManagerName = "";
      this.loadingManagers = true;
      this.availableManagers = [];
      this.boundManagerIds = new Set();
      try {
        const response = await userAPI.getUserInfo("", "manager");
        if (response.success) {
          this.availableManagers = response.data.map((manager: any) => ({
            manager_user_id: manager.user_id,
            manager_name: manager.real_name,
            manager_phone: manager.phone_number,
            manager_email: manager.email,
          }));

          // 初始化已绑定的安全员
          const labManagersResponse = await this.fetchLabManagers();
          if (labManagersResponse && labManagersResponse.success) {
            this.boundManagerIds = new Set(
              this.labManagers.map((m) => m.manager_user_id)
            );
          }
        }
      } catch (error) {
        console.error("获取安全员列表失败:", error);
      } finally {
        this.loadingManagers = false;
      }
    },
    // 获取当前实验室的安全员列表
    async fetchLabManagers() {
      if (!this.labForm.lab_id) {
        return;
      }

      const response = await labAPI.getManagerToLab(this.labForm.lab_id);

      if (response.success) {
        this.labManagers = (
          Array.isArray(response.data) ? response.data : [response.data]
        ) as LabManager[];
        console.log("Labmanagers:!", this.labManagers);
      } else {
        ElMessage.error("获取安全员列表失败");
      }
      return response;
    },

    // 获取所有可选的安全员列表
    async fetchAvailableManagers() {
      this.loadingManagers = true;
      const response = await labAPI.getManagerToLab(
        undefined,
        this.searchManagerName
      );

      if (response.success && response.data) {
        // 确保正确处理数据类型
        const managers = Array.isArray(response.data)
          ? response.data
          : [response.data];
        // 将 string 类型的 manager_user_id 转换为需要的格式
        this.availableManagers = managers.map((manager: any) => ({
          ...manager,
          manager_user_id: manager.manager_user_id, // 如果需要转换为 number，可以用 parseInt
        }));
      } else {
        ElMessage.error("获取安全员列表失败");
      }
      this.loadingManagers = false;
    },

    // 处理安全员搜索
    // 处理安全员搜索
    handleManagerSearch: _.debounce(async function (this: ManagerSearchThis) {
      const searchName = this.searchManagerName.trim();
      this.loadingManagers = true;

      try {
        console.log("Searching for:", searchName); // 添加调试日志
        const response = await userAPI.getUserInfo(searchName, "manager");
        console.log("Search response:", response); // 添加调试日志

        if (response.success) {
          this.availableManagers = response.data.map((manager: any) => ({
            manager_user_id: manager.user_id,
            manager_name: manager.real_name,
            manager_phone: manager.phone_number,
            manager_email: manager.email,
          }));
          console.log("Available managers:", this.availableManagers); // 添加调试日志
        } else {
          this.availableManagers = [];
        }
      } catch (error) {
        console.error("搜索安全员失败:", error);
        this.availableManagers = [];
      } finally {
        this.loadingManagers = false;
      }
    }, 300),

    // 绑定安全员
    async bindManager(manager: LabManager) {
      if (this.isManagerBound(manager)) return;

      const labId = this.labForm.lab_id;
      if (!labId) {
        ElMessage.error("实验室ID不能为空");
        return;
      }

      console.log("Binding manager:", manager); //这里返回的是get user info，结构不同
      const response = await labAPI.postManagerToLab(
        manager.manager_user_id,
        labId
      );

      if (response.success) {
        await this.fetchLabManagers();
        ElMessage.success("安全员添加成功");
        this.boundManagerIds = new Set([
          ...this.boundManagerIds,
          manager.manager_user_id,
        ]);
      } else {
        ElMessage.error(response.error || "添加安全员失败");
      }
    },
    isManagerBound(manager: LabManager): boolean {
      return this.boundManagerIds.has(manager.manager_user_id);
    },
    // 解除绑定安全员
    async unbindManager(manager: LabManager) {
      const labId = this.labForm.lab_id;
      if (!labId) {
        ElMessage.error("实验室ID不能为空");
        return;
      }

      const confirmed = await ElMessageBox.confirm(
        "确认解除该安全员的绑定?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      );

      if (confirmed) {
        const response = await labAPI.deleteManagerToLab(
          manager.manager_user_id,
          labId
        );

        if (response.success) {
          await this.fetchLabManagers();
          ElMessage.success("解除绑定成功");
          await this.fetchUserList();
        } else {
          throw new Error(response.error || "解除绑定失败");
        }
      }
    },
    // 显示地图对话框
    showMap() {
      this.mapDialogVisible = true;
    },
    // 上传地图前的验证
    beforeMapUpload(file: File) {
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

    // 上传地图
    async UploadMap({ file }: { file: File }) {
      let loadingInstance = null;
      try {
        // 显示加载提示
        loadingInstance = ElLoading.service({
          lock: true,
          text: "上传中...",
          background: "rgba(0, 0, 0, 0.7)",
        });

        console.log("Uploading file:", file.name, file.type, file.size);

        const response = await labAPI.patchLabMap(this.labForm.lab_id!, file);

        if (response.success && response.data) {
          // 更新本地图片URL
          this.labForm.map_image = response.data.map_image;
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
    async fetchNotices() {
      this.noticeLoaded = false;
      const result = await noticeAPI.getNotices(undefined, Number(this.id));
      if (result.success) {
        this.noticeList = result.data;
        console.log("通知??!!:", this.noticeList);
      } else {
        ElMessage.error("获取通知失败");
      }
      this.noticeLoaded = true;
    },

    async deleteNotification(notice: any) {
      // 在这里添加删除通知的逻辑
      console.log("删除通知:", notice);
      const result = await noticeAPI.deleteNotice(notice.id);
      console.log(result);
      if (result.success) {
        console.log("删除成功");
        await this.fetchNotices();
      } else {
        console.log("删除失败");
      }
    },
  },
});
</script>

<style scoped>
.page-container {
  background: radial-gradient(
      circle at 20% 20%,
      rgba(185, 230, 249, 0.8) 0%,
      rgba(232, 240, 245, 0.4) 35%,
      transparent 70%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(187, 231, 217, 0.8) 0%,
      rgba(232, 245, 242, 0.4) 35%,
      transparent 70%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(230, 245, 245, 0.8) 0%,
      rgba(232, 245, 242, 0.4) 45%,
      transparent 80%
    ),
    radial-gradient(
      circle at 85% 15%,
      rgba(202, 223, 172, 0.7) 0%,
      rgba(230, 245, 240, 0.3) 50%,
      transparent 75%
    ),
    radial-gradient(
      circle at 15% 85%,
      rgba(230, 245, 242, 0.7) 0%,
      rgba(232, 245, 245, 0.3) 40%,
      transparent 75%
    ),
    linear-gradient(135deg, #e6f5f5 0%, #e8f0f5 50%, #e6f5f0 100%);
}
/* 统一的基础按钮样式 */
.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s;
  font-weight: 500;
}

.el-button .el-icon {
  margin-right: 4px;
  font-size: 16px;
}

/* 主要操作按钮样式 */
.el-button--primary {
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.15);
}

.el-button--primary:hover {
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.25);
  transform: translateY(-1px);
}

/* 危险操作按钮样式 */
.el-button--danger {
  box-shadow: 0 2px 4px rgba(245, 108, 108, 0.15);
}

.el-button--danger:hover {
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.25);
  transform: translateY(-1px);
}

/* 文字按钮样式优化 */
.el-button--text {
  padding: 4px 8px;
  border-radius: 4px;
}

.el-button--text:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.el-button--text.delete-btn:hover {
  background-color: rgba(245, 108, 108, 0.1);
}

/* 操作区域按钮组样式 */
.action-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 卡片操作按钮样式 */
.card-btn {
  margin-left: auto;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* 上传按钮容器样式 */
.upload-container {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

/* 地图按钮样式 */
.map-button {
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.map-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 管理操作按钮样式 */
.manager-actions {
  display: flex;
  gap: 8px;
}

/* 表格内按钮样式 */
.el-table .el-button {
  padding: 6px 12px;
}

/* 移动端按钮响应式调整 */
@media screen and (max-width: 768px) {
  .el-button {
    padding: 8px 16px;
  }

  .action-button {
    flex-wrap: wrap;
  }
}

.lab-location {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-text {
  cursor: pointer;
}

.map-container {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.map-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-map {
  color: #909399;
  font-size: 14px;
}

.map-upload {
  margin-top: 16px;
  display: flex;
  justify-content: center;
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

.search-box {
  margin-bottom: 16px;
}

.safety-officer {
  padding: 0 12px;
  margin-bottom: 20px;
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

.safety-equipment,
.safety-notes {
  margin-bottom: 20px;
}

.box {
  width: 100%;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  position: relative;
}
</style>

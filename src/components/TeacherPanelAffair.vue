<template>
  <div class="quick-look">
    <div class="header-section">
      <h3 class="title">
        <el-icon class="mr-2"><User /></el-icon>
        教师管理
      </h3>
      <div class="button-group">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          创建账号
        </el-button>
        <el-button type="info" @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新列表
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-skeleton :rows="5" animated v-if="!isLoaded"></el-skeleton>
    <el-table
      v-if="isLoaded"
      :data="tableData"
      style="width: 100%"
      border
      fit
      :row-class-name="tableRowClassName"
      highlight-current-row
    >
      <el-table-column label="学号" width="180" prop="user_id">
        <template #header>
          <div class="column-header">
            <el-icon><Postcard /></el-icon>
            <span>学号</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="姓名" width="180">
        <template #header>
          <div class="column-header">
            <el-icon><User /></el-icon>
            <span>姓名</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-if="editableRow === scope.$index"
            v-model="editableData[scope.$index].real_name"
            placeholder="请输入姓名"
            size="small"
          >
            <template #prefix>
              <el-icon><Edit /></el-icon>
            </template>
          </el-input>
          <span v-else>{{ scope.row.real_name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="院系" width="180">
        <template #header>
          <div class="column-header">
            <el-icon><School /></el-icon>
            <span>院系</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-if="editableRow === scope.$index"
            v-model="editableData[scope.$index].department"
            placeholder="请输入院系"
            size="small"
          >
            <template #prefix>
              <el-icon><School /></el-icon>
            </template>
          </el-input>
          <span v-else>{{ scope.row.department }}</span>
        </template>
      </el-table-column>

      <el-table-column label="联系方式" width="180">
        <template #header>
          <div class="column-header">
            <el-icon><Phone /></el-icon>
            <span>联系方式</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-if="editableRow === scope.$index"
            v-model="editableData[scope.$index].phone_number"
            placeholder="请输入联系方式"
            size="small"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
          <span v-else>{{ scope.row.phone_number }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #header>
          <div class="column-header">
            <el-icon><Setting /></el-icon>
            <span>操作</span>
          </div>
        </template>
        <template #default="scope">
          <div v-if="editableRow === scope.$index" class="operation-buttons">
            <el-button
              type="primary"
              size="small"
              @click="saveEdit(scope.row, scope.$index)"
            >
              <el-icon><Check /></el-icon>
              保存
            </el-button>
            <el-button size="small" @click="cancelEdit(scope.$index)">
              <el-icon><Close /></el-icon>
              取消
            </el-button>
          </div>
          <div v-else class="operation-buttons">
            <el-button
              type="primary"
              size="small"
              @click="editRow(scope.$index)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { ref } from "vue";
import { userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import {
  User,
  Plus,
  Refresh,
  Edit,
  School,
  Phone,
  Message,
  Setting,
  Check,
  Close,
  Delete,
  Warning,
} from "@element-plus/icons-vue";
export default {
  name: "StudentPanelAffair",
  components: {
    User,
    Plus,
    Refresh,
    Edit,
    School,
    Phone,
    Message,
    Setting,
    Check,
    Close,
  },
  data() {
    return {
      editForm: {
        user_id: "",
        real_name: "",
        department: "",
        phone_number: "",
      },
      tableData: [],
      isLoaded: false,
      dialogVisible: false,
      editDialogVisible: false,
      editableRow: null, // 当前正在编辑的行的索引
      editableData: [], // 编辑状态下的临时数据
      form: {
        user_id: "",
        real_name: "",
        department: "",
        password: "",
      },
      rules: {
        user_id: [
          { required: true, message: "请输入学号", trigger: "blur" },
          {
            min: 8,
            max: 20,
            message: "长度在 8 到 20 个字符",
            trigger: "blur",
          },
        ],
        real_name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    "form.user_id": function (newVal) {
      if (newVal.length >= 6) {
        // 获取学号的后六位作为密码
        this.form.password = newVal.slice(-6);
      } else {
        this.form.password = "";
      }
    },
  },
  methods: {
    async loadData() {
      this.isLoaded = false;
      await this.fetchUserList();
      this.isLoaded = true;
    },

    async fetchUserList() {
      const result = await userAPI.getUserInfo("", "teacher");
      if (result.success) {
        console.log("Fetched user list:", result.data);
        this.tableData = result.data;
      } else {
        ElMessage.error("获取教师列表失败");
      }
    },
    editRow(index) {
      // 确保初始化 editableData 并触发 Vue 的响应式
      this.editableData[index] = { ...this.tableData[index] };
      this.editableRow = index; // 设置当前编辑的行索引
    },

    cancelEdit(index) {
      this.editableData[index] = { ...this.tableData[index] }; // 重置编辑数据
      this.editableRow = null; // 退出编辑模式
    },

    async saveEdit(row, index) {
      // 将编辑数据转换为 FormData 格式
      const formData = new FormData();
      formData.append("user_id", this.editableData[index].user_id); // 必须字段
      formData.append("real_name", this.editableData[index].real_name || "");
      formData.append("department", this.editableData[index].department || "");
      formData.append(
        "phone_number",
        this.editableData[index].phone_number || ""
      );

      try {
        // 调用 patchUserInfo API 更新数据
        const result = await userAPI.patchUserInfo(formData);

        if (result.success) {
          ElMessage.success("保存成功");
          // 更新主表数据
          this.tableData[index] = { ...this.editableData[index] };
          this.editableRow = null; // 退出编辑模式
        } else {
          ElMessage.error(result.error || "保存失败");
        }
      } catch (error) {
        console.error("保存失败：", error);
        ElMessage.error("保存失败：" + (error.message || "未知错误"));
      }
    },
    handleView(row) {
      const userData = {
        user_id: row.user_id,
        real_name: row.real_name,
        department: row.department,
        phone_number: row.phone_number,
      };
      console.log("View user:", userData);
      if (this.$router) {
        this.$router.push({
          name: "ViewUser",
          params: { userId: row.user_id },
          state: { userData },
        });
      } else {
        console.error("Router instance is not available.");
      }
    },

    handleEdit(row) {
      // 将选中行的数据复制到编辑表单中
      this.editForm = {
        user_id: row.user_id,
        real_name: row.real_name,
        department: row.department,
        phone_number: row.phone_number || "",
      };
      this.editDialogVisible = true;
    },

    handleEditClose() {
      this.editDialogVisible = false;
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields();
      }
    },

    async handleEditSubmit() {
      try {
        const valid = await new Promise((resolve) => {
          this.$refs.editForm.validate((valid) => {
            resolve(valid);
          });
        });

        if (!valid) {
          ElMessage.error("请检查表单是否填写正确");
          return;
        }

        // 构造 FormData
        const formData = new FormData();
        formData.append("user_id", this.editForm.user_id);
        formData.append("real_name", this.editForm.real_name);
        formData.append("department", this.editForm.department);
        if (this.editForm.phone_number) {
          formData.append("phone_number", this.editForm.phone_number);
        }

        // 调用 patchUserInfo API
        const result = await userAPI.patchUserInfo(formData);

        if (result.success) {
          ElMessage.success("更新成功");
          this.editDialogVisible = false;
          // 刷新列表
          await this.loadData();
        } else {
          ElMessage.error(result.error || "更新失败");
        }
      } catch (error) {
        console.error("Update failed:", error);
        ElMessage.error("更新失败：" + (error.message || "未知错误"));
      }
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 1) {
        return "warning-row";
      } else if (rowIndex % 2 === 0) {
        return "success-row";
      }
      return "";
    },

    showCreateDialog() {
      // 重置表单数据
      this.form = {
        user_id: "",
        real_name: "",
        password: "",
        phone_number: "",
        department: "",
        profile_picture: null,
      };
      this.imageUrl = "";

      // 确保表单重置
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }

      // 最后再显示对话框
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },

    handleClose() {
      this.dialogVisible = false;
      this.$refs.form?.resetFields();
    },

    async handleCreate() {
      const valid = await new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          resolve(valid); // 结果返回
        });
      });

      console.log("valid", valid);
      if (!valid) {
        console.log("请检查表单是否填写正确");
        ElMessage.error("请检查表单是否填写正确");
        return;
      }

      // 验证通过后继续执行的代码
      console.log("表单验证通过，可以继续执行");

      const formDate = new FormData();
      formDate.append("user_id", this.form.user_id);
      formDate.append("password", this.form.password);
      formDate.append("real_name", this.form.real_name);
      formDate.append("department", this.form.department);

      const registerResult = await userAPI.register(formDate, "teacher");

      if (registerResult.success) {
        // 显示成功消息
        this.$message({
          type: "success",
          dangerouslyUseHTMLString: true,
          message: `
              <div style="text-align: left;">
                <p>账号创建成功！</p>
                <p>学号：${this.form.user_id}</p>
                <p>初始密码：${this.form.password}</p>
                <p style="color: #ff4949;">请妥善保存密码信息！</p>
              </div>
            `,
        });

        // 关闭弹窗并刷新列表
        this.dialogVisible = false;
        if (this.$refs.form) {
          this.$refs.form.resetFields();
        }
        await this.loadData();
      } else {
        const errorMsg = registerResult.error || "未知错误";
        console.error("Registration failed:", errorMsg); // 调试日志
        ElMessage.error("注册失败：" + errorMsg);
      }
    },
  },
  async mounted() {
    window.addEventListener("error", (event) => {
      if (event.message.includes("ResizeObserver loop")) {
        event.stopImmediatePropagation();
      }
    });
    await this.loadData();
  },
  handleDelete(row) {
    this.teacherToDelete = row;
    this.deleteDialogVisible = true;
  },

  async confirmDelete() {
    if (!this.teacherToDelete) return;

    try {
      const formData = new FormData();
      formData.append("user_id", this.teacherToDelete.user_id);

      const result = await userAPI.deleteUser(formData);

      if (result.success) {
        ElMessage.success("删除成功");
        this.deleteDialogVisible = false;
        await this.loadData();
      } else {
        ElMessage.error(result.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败：", error);
      ElMessage.error("删除失败：" + (error.message || "未知错误"));
    }

    this.teacherToDelete = null;
    this.deleteDialogVisible = false;
  },
};
</script>

<style>
.quick-look {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.button-group {
  display: flex;
  gap: 10px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 5px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  color: var(--el-color-warning);
}

.el-table {
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.el-table th {
  background-color: var(--el-color-primary-light-9) !important;
}

.el-table .warning-row {
  background-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  background-color: var(--el-color-success-light-9);
}

.el-input.el-input--small {
  width: 100%;
}

/* 添加过渡动画 */
.el-table-column--edit-mode {
  transition: all 0.3s ease;
}

/* 添加悬停效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

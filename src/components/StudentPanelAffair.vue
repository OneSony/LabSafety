<template>
  <div class="quick-look">
    <h3>学生管理</h3>
    <el-button
      type="primary"
      @click="showCreateDialog"
      style="margin-bottom: 20px"
      destroy-on-close
    >
      创建账号
    </el-button>
    <el-button type="primary" @click="loadData" style="margin-bottom: 20px">
      刷新列表
    </el-button>
    <!-- 创建账号弹窗 -->
    <el-dialog
      title="创建学生账号"
      v-model="dialogVisible"
      width="30%"
      :before-close="handleClose"
      destroy-on-close
    >
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="学号" prop="user_id">
          <el-input v-model="form.user_id" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="real_name">
          <el-input
            v-model="form.real_name"
            placeholder="请输入姓名"
          ></el-input>
        </el-form-item>
        <el-form-item label="院系">
          <el-input
            v-model="form.department"
            placeholder="请输入院系"
          ></el-input>
        </el-form-item>
        <el-form-item label="默认密码">
          <el-input v-model="form.password" disabled></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleCreate">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <el-skeleton :rows="5" animated v-if="!isLoaded"></el-skeleton>
  <el-table
    v-if="isLoaded"
    :data="tableData"
    style="width: 100%"
    :row-class-name="tableRowClassName"
  >
    <el-table-column prop="user_id" label="学号" width="180" />
    <el-table-column prop="real_name" label="姓名" width="180" />
    <el-table-column prop="department" label="院系" width="180" />
    <el-table-column prop="phone_number" label="联系方式" width="180" />
    <el-table-column fixed="right" label="操作">
      <template v-slot="slotProps">
        <el-button @click="handleEdit(slotProps.row)" type="text" size="small"
          >编辑</el-button
        >
        <el-dialog
          title="编辑学生信息"
          v-model="editDialogVisible"
          width="30%"
          :before-close="handleEditClose"
        >
          <el-form :model="editForm" ref="editForm" :rules="rules">
            <el-form-item label="学号" prop="user_id">
              <el-input v-model="editForm.user_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="real_name">
              <el-input
                v-model="editForm.real_name"
                placeholder="请输入姓名"
              ></el-input>
            </el-form-item>
            <el-form-item label="院系">
              <el-input
                v-model="editForm.department"
                placeholder="请输入院系"
              ></el-input>
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input
                v-model="editForm.phone_number"
                placeholder="请输入联系方式"
              ></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="handleEditSubmit"
                >确 定</el-button
              >
            </span>
          </template>
        </el-dialog>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";

export default {
  name: "StudentPanelAffair",
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
      form: {
        user_id: "",
        real_name: "",
        department: "",
        phone_number: "",
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
      const result = await userAPI.getUserInfo("", "student");
      if (result.success) {
        console.log("Fetched user list:", result.data);
        this.tableData = result.data;
      } else {
        ElMessage.error("获取学生列表失败");
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
        phone_number: row.phone_number || "", // 防止 phone_number 为 null
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
      // 先生成密码
      const password = this.generatePassword();

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

    generatePassword() {
      // 生成8位随机密码，包含数字和字母
      const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let password = "";
      for (let i = 0; i < 8; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
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

      const registerResult = await userAPI.register(formDate, "student");

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
};
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>

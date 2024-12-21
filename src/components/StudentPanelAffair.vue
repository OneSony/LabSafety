<template>
  <div class="quick-look">
    <h3>学生管理</h3>
    <el-button
      type="primary"
      @click="showCreateDialog"
      style="margin-bottom: 20px"
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
        <el-form-item label="随机密码">
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
    <el-table-column prop="user_id" label="学号" width="100" />
    <el-table-column prop="real_name" label="姓名" width="100" />
    <el-table-column prop="department" label="院系" width="100" />
    <el-table-column prop="phone_number" label="联系方式" width="100" />
    <el-table-column fixed="right" label="操作">
      <template v-slot="slotProps">
        <el-button @click="handleView(slotProps.row)" type="text" size="small"
          >查看</el-button
        >
        <el-button @click="handleEdit(slotProps.row)" type="text" size="small"
          >编辑</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { userAPI } from "@/utils/api";

export default {
  name: "StudentPanelAffair",
  data() {
    return {
      tableData: [],
      isLoaded: false,
      dialogVisible: false,
      form: {
        user_id: "",
        real_name: "",
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
  methods: {
    async loadData() {
      this.isLoaded = false;
      await this.fetchUserList();
      this.isLoaded = true;
    },

    async fetchUserList() {
      try {
        const result = await userAPI.getUserList("", { role: "student" });
        if (result.success) {
          console.log("Fetched user list:", result.data);
          this.tableData = result.data;
        } else {
          // 处理特定错误
          if (result.message.includes("403")) {
            this.$message.error("没有权限访问学生列表，请确认您的账号权限");
            // 可能需要登出或重新登录
            // this.$store.dispatch('logout');
            // this.$router.push('/login');
          } else {
            this.$message.error("获取学生列表失败：" + result.message);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user list:", error);
        this.$message.error("系统错误，请稍后重试");
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
      const userData = {
        user_id: row.user_id,
        real_name: row.real_name,
        department: row.department,
        phone_number: row.phone_number,
      };
      console.log("Edit user:", userData);
      if (this.$router) {
        this.$router.push({
          name: "EditUser",
          params: { userId: row.user_id },
          state: { userData },
        });
      } else {
        console.error("Router instance is not available.");
      }
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 0) {
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
        password: password,
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
      if (!this.$refs.form) return;

      try {
        // 验证表单
        await this.$refs.form.validate();

        // 第一步：注册用户
        const registerData = {
          user_id: this.form.user_id,
          password: this.form.password,
          real_name: this.form.real_name, // 在注册时就传入真实姓名
        };

        console.log("Registering with data:", registerData); // 调试日志

        const registerResult = await userAPI.register(
          registerData.user_id,
          registerData.real_name,
          registerData.password
        );

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
          this.$message.error("注册失败：" + errorMsg);
        }
      } catch (error) {
        console.error("Operation failed:", error);
        const errorMsg =
          error.response?.data?.detail || error.message || "未知错误";
        this.$message.error("操作失败：" + errorMsg);
      }
    },
  },
  async mounted() {
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

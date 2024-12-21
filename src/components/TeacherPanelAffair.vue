<template>
  <el-row class="mb-4">
    <el-col :span="12">
      <h2>学生管理</h2>
    </el-col>
    <el-col :span="12" class="text-right">
      <el-button type="primary" @click="showCreateDialog">
        创建学生账号
      </el-button>
      <el-button type="success" @click="exportPasswords" v-if="hasNewAccounts">
        导出密码
      </el-button>
    </el-col>
  </el-row>

  <div class="student-list">
    <el-table :data="students" v-loading="isLoading">
      <el-table-column prop="user_id" label="学号" width="120" />
      <el-table-column prop="real_name" label="姓名" width="120" />
      <el-table-column prop="department" label="院系" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <PaginationComponent
      :total="totalStudents"
      @page-changed="handlePageChange"
    />
  </div>

  <!-- 创建学生账号对话框 -->
  <el-dialog v-model="createDialogVisible" title="创建学生账号" width="500px">
    <el-form :model="newStudent" label-width="100px">
      <el-form-item label="学号" required>
        <el-input v-model="newStudent.user_id" />
      </el-form-item>
      <el-form-item label="姓名" required>
        <el-input v-model="newStudent.real_name" />
      </el-form-item>
      <el-form-item label="院系" required>
        <el-input v-model="newStudent.department" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="newStudent.email" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createStudent">创建</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from "element-plus";
import PaginationComponent from "./Pagination.vue";
import { userAPI } from "../utils/api";

export default {
  name: "StudentPanel",
  components: { PaginationComponent },

  data() {
    return {
      students: [],
      isLoading: true,
      totalStudents: 0,
      currentPage: 1,
      createDialogVisible: false,
      hasNewAccounts: false,
      newStudent: {
        user_id: "",
        real_name: "",
        department: "",
        email: "",
      },
    };
  },

  mounted() {
    this.fetchStudents();
  },

  methods: {
    async fetchStudents(page = 1) {
      this.isLoading = true;
      try {
        const response = await userAPI.getUserList(page);
        if (response.success) {
          // 过滤只显示学生角色的用户
          this.students = response.data.filter(
            (user) => user.role === "student"
          );
          this.totalStudents = this.students.length;
        } else {
          ElMessage.error("获取学生列表失败：" + response.error);
        }
      } catch (error) {
        ElMessage.error("获取学生列表失败");
      }
      this.isLoading = false;
    },

    showCreateDialog() {
      this.createDialogVisible = true;
      this.newStudent = {
        user_id: "",
        real_name: "",
        department: "",
        email: "",
      };
    },

    async createStudent() {
      if (
        !this.newStudent.user_id ||
        !this.newStudent.real_name ||
        !this.newStudent.department
      ) {
        ElMessage.warning("请填写必填字段");
        return;
      }

      try {
        // 生成随机密码
        const password = Math.random().toString(36).slice(-8);
        const response = await userAPI.register(
          this.newStudent.user_id,
          this.newStudent.real_name,
          password,
          "student"
        );

        if (response.success) {
          // 更新用户额外信息
          const formData = new FormData();
          formData.append("department", this.newStudent.department);
          if (this.newStudent.email) {
            formData.append("email", this.newStudent.email);
          }

          await userAPI.patchUserInfo(formData);

          ElMessage.success("创建成功");
          this.createDialogVisible = false;
          this.hasNewAccounts = true;

          // 保存账号密码信息用于导出
          if (!this.newAccountsInfo) {
            this.newAccountsInfo = [];
          }
          this.newAccountsInfo.push({
            user_id: this.newStudent.user_id,
            real_name: this.newStudent.real_name,
            password: password,
          });

          await this.fetchStudents();
        } else {
          ElMessage.error("创建失败：" + response.error);
        }
      } catch (error) {
        ElMessage.error("创建失败");
      }
    },

    async handleDelete(student) {
      try {
        const response = await userAPI.deleteUser(student.user_id);
        if (response.success) {
          ElMessage.success("删除成功");
          await this.fetchStudents();
        } else {
          ElMessage.error("删除失败：" + response.error);
        }
      } catch (error) {
        ElMessage.error("删除失败");
      }
    },

    exportPasswords() {
      if (!this.newAccountsInfo || this.newAccountsInfo.length === 0) {
        ElMessage.warning("没有可导出的账号信息");
        return;
      }

      // 生成CSV内容
      const headers = "学号,姓名,密码\n";
      const content = this.newAccountsInfo
        .map(
          (account) =>
            `${account.user_id},${account.real_name},${account.password}`
        )
        .join("\n");
      const csvContent = headers + content;

      // 创建并下载文件
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "学生账号密码.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清空新账号信息
      this.newAccountsInfo = [];
      this.hasNewAccounts = false;
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.fetchStudents(page);
    },
  },
};
</script>

<style scoped>
.text-right {
  text-align: right;
}

.mb-4 {
  margin-bottom: 1rem;
}

.student-list {
  margin-top: 1rem;
}
</style>

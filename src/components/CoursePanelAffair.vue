<template>
  <div class="quick-look">
    <div class="header-section">
      <h3 class="title">
        <el-icon class="mr-2"><Reading /></el-icon>
        课程管理
      </h3>
      <div class="button-group">
        <el-button type="primary" @click="navigateToCreateCourse">
          <el-icon><Plus /></el-icon>
          创建课程
        </el-button>
        <el-button type="info" @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新列表
        </el-button>
      </div>
    </div>

    <el-skeleton :rows="5" animated v-if="!isLoaded"></el-skeleton>
    <el-table
      v-if="isLoaded"
      :data="tableData"
      style="width: 100%"
      :row-class-name="tableRowClassName"
      border
      highlight-current-row
    >
      <el-table-column prop="name" label="课程名" min-width="150">
        <template #header>
          <div class="column-header">
            <el-icon><Notebook /></el-icon>
            <span>课程名</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="course_code" label="课程号" min-width="120">
        <template #header>
          <div class="column-header">
            <el-icon><DocumentCopy /></el-icon>
            <span>课程号</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="course_sequence" label="课序号" min-width="120">
        <template #header>
          <div class="column-header">
            <el-icon><List /></el-icon>
            <span>课序号</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="department" label="开课院系" min-width="180">
        <template #header>
          <div class="column-header">
            <el-icon><School /></el-icon>
            <span>开课院系</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="class_count" label="课堂数" min-width="120">
        <template #header>
          <div class="column-header">
            <el-icon><Collection /></el-icon>
            <span>课堂数</span>
          </div>
        </template>
        <template #default="scope">
          <el-tag size="small" type="info">{{ scope.row.class_count }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="student_count" label="学生人数" min-width="120">
        <template #header>
          <div class="column-header">
            <el-icon><User /></el-icon>
            <span>学生人数</span>
          </div>
        </template>
        <template #default="scope">
          <el-tag size="small" type="success">{{
            scope.row.student_count
          }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="150">
        <template #header>
          <div class="column-header">
            <el-icon><Setting /></el-icon>
            <span>操作</span>
          </div>
        </template>
        <template #default="scope">
          <div class="operation-buttons">
            <el-button
              type="primary"
              size="small"
              @click="handleRowClick(scope.row)"
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
import { courseAPI, classAPI } from "@/utils/api";
import {
  Reading,
  Plus,
  Refresh,
  Notebook,
  DocumentCopy,
  List,
  School,
  Collection,
  User,
  Setting,
  View,
  Edit,
} from "@element-plus/icons-vue";

export default {
  name: "TeacherFilePanel",
  components: {
    Reading,
    Plus,
    Refresh,
    Notebook,
    DocumentCopy,
    List,
    School,
    Collection,
    User,
    Setting,
    View,
    Edit,
  },
  data() {
    return {
      tableData: [],
      isLoaded: false,
    };
  },
  methods: {
    async loadData() {
      this.isLoaded = false;
      await this.fetchCourseList();
      await this.fetchEnollmentCount();
      await this.fetchClassLists();
      this.isLoaded = true;
    },

    handleRowClick(row) {
      const inputCourseData = {
        course_id: row.id,
        course_name: row.name,
        course_code: row.course_code,
        course_sequence: row.course_sequence,
        department: row.department,
      };
      console.log("Row clicked:", inputCourseData);
      if (this.$router) {
        this.$router.push({ name: "CreateCourse", state: { inputCourseData } });
      } else {
        console.error("Router instance is not available.");
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

    navigateToCreateCourse() {
      if (this.$router) {
        this.$router.push("/create-course");
      } else {
        console.error("Router instance is not available.");
      }
    },

    async fetchCourseList() {
      const result = await courseAPI.getCourseList(false);
      if (result.success) {
        console.log("Fetched course list:", result.data);
        this.tableData = result.data;
      } else {
        console.error("Failed to fetch course list:", result.message);
      }
    },

    async fetchEnollmentCount() {
      for (let i = 0; i < this.tableData.length; i++) {
        const result = await courseAPI.getEnroll(this.tableData[i].id);
        console.log("Enrollment count:", result);
        if (result.success) {
          this.tableData[i].student_count = result.data.length;
        } else {
          console.error("Failed to fetch enrollment count:", result.message);
        }
      }
    },

    async fetchClassLists() {
      for (let i = 0; i < this.tableData.length; i++) {
        const result = await classAPI.getClassList(this.tableData[i].id);
        if (result.success) {
          this.tableData[i].class_list = result.data;
          this.tableData[i].class_count = result.data.length;
        } else {
          console.error("Failed to fetch class list:", result.message);
        }
      }
    },
    handleView(row) {
      const inputCourseData = {
        course_id: row.id,
        course_name: row.name,
        course_code: row.course_code,
        course_sequence: row.course_sequence,
        department: row.department,
      };
      console.log("View course:", inputCourseData);
      if (this.$router) {
        this.$router.push({
          name: "CreateCourse",
          state: { inputCourseData },
          query: { mode: "view" },
        });
      } else {
        console.error("Router instance is not available.");
      }
    },

    handleEdit(row) {
      const inputCourseData = {
        course_id: row.id,
        course_name: row.name,
        course_code: row.course_code,
        course_sequence: row.course_sequence,
        department: row.department,
      };
      console.log("Edit course:", inputCourseData);
      if (this.$router) {
        this.$router.push({
          name: "CreateCourse",
          state: { inputCourseData },
          query: { mode: "edit" },
        });
      } else {
        console.error("Router instance is not available.");
      }
    },
  },
  async mounted() {
    await this.loadData();
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

.title .el-icon {
  margin-right: 8px;
  font-size: 28px;
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

/* 添加过渡动画 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-tag {
  width: 100%;
  text-align: center;
  transition: all 0.3s ease;
}

.el-tag:hover {
  transform: scale(1.05);
}
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>

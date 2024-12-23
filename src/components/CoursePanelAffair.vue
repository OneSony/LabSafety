<template>
  <div class="quick-look">
    <h3>课程管理</h3>
    <el-button
      type="primary"
      @click="navigateToCreateCourse"
      style="margin-bottom: 20px"
    >
      创建课程
    </el-button>
    <el-button type="primary" @click="loadData" style="margin-bottom: 20px">
      刷新列表
    </el-button>
  </div>
  <el-skeleton :rows="5" animated v-if="!isLoaded"></el-skeleton>
  <el-table
    v-if="isLoaded"
    :data="tableData"
    style="width: 100%"
    :row-class-name="tableRowClassName"
  >
    <el-table-column prop="name" label="课程名" width="100" />
    <el-table-column prop="course_code" label="课程号" width="100" />
    <el-table-column prop="course_sequence" label="课序号" width="100" />
    <el-table-column prop="department" label="开课院系" width="180" />
    <el-table-column prop="class_count" label="课堂数" width="100" />
    <el-table-column prop="student_count" label="学生人数" width="100" />
    <el-table-column fixed="right" label="操作">
      <template v-slot="slotProps">
        <el-button
          @click="handleRowClick(slotProps.row)"
          type="text"
          size="small"
          >查看</el-button
        >
        <el-button
          @click="handleRowClick(slotProps.row)"
          type="text"
          size="small"
          >编辑</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { courseAPI, classAPI } from "@/utils/api";
export default {
  name: "TeacherFilePanel",
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
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 0) {
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

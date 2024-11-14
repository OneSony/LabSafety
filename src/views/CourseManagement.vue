<template>
  <div>
    <!-- 创建课程按钮 -->
    <el-button type="primary" @click="openCreateDialog">创建课程</el-button>

    <!-- 课程表格 -->
    <el-table :data="courses" style="width: 100%">
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="start_time" label="开始时间" />
      <el-table-column prop="location" label="地点" />

      <!-- 操作列 -->
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button @click="editCourse(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteCourse(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑课程弹窗 -->
    <el-dialog v-model="isDialogVisible" title="创建课程">
      <el-form :model="form">
        <el-form-item label="课程名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.start_time" type="datetime" />
        </el-form-item>
        <el-form-item label="地点">
          <el-select v-model="form.location" placeholder="选择地点">
            <el-option
              v-for="lab in labs"
              :key="lab.id"
              :label="lab.name"
              :value="lab.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 弹窗的 footer 插槽 -->
      <template v-slot:footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CourseManagement",
  data() {
    return {
      courses: [],
      labs: [],
      isDialogVisible: false,
      form: {
        name: "",
        start_time: "",
        location: "",
      },
    };
  },
  /*
  methods: {
    async fetchCourses() {
      const response = await axios.get("/api/teacher/courses");
      this.courses = response.data;
    },
    async fetchLabs() {
      const response = await axios.get("/api/labs");
      this.labs = response.data;
    },
    openCreateDialog() {
      this.isDialogVisible = true;
      this.form = { name: "", start_time: "", location: "" };
    },
    async saveCourse() {
      await axios.post("/api/teacher/courses", this.form);
      this.isDialogVisible = false;
      await this.fetchCourses();
    },
    async deleteCourse(id) {
      await axios.delete(`/api/teacher/courses/${id}`);
      await this.fetchCourses();
    },
    editCourse(course) {
      this.form = { ...course };
      this.isDialogVisible = true;
    },
  },
  created() {
    this.fetchCourses();
    this.fetchLabs();
  },
  */
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>

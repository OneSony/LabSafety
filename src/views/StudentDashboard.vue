<template>
  <div class="dashboard">
    <SidebarMenu />
    <div class="content">
      <div class="tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部实验" name="all">
            <div v-if="allExperiments.length === 0" class="no-data">
              No data
            </div>
            <div v-else>
              <CourseCard :experiments="allExperiments" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="在学实验" name="ongoing">
            <div v-if="ongoingExperiments.length === 0" class="no-data">
              No data
            </div>
            <div v-else>
              <CourseCard :experiments="ongoingExperiments" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="已完成实验" name="completed">
            <div v-if="completedExperiments.length === 0" class="no-data">
              No data
            </div>
            <div v-else>
              <CourseCard :experiments="completedExperiments" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <PaginationComponent
        :total="totalExperiments"
        @page-changed="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import SidebarMenu from "../components/Sidebar.vue";
import CourseCard from "../components/CourseCard.vue";
import PaginationComponent from "../components/Pagination.vue";
import { courseAPI } from "../utils/api";
import { ElMessage } from "element-plus";

export default {
  name: "StudentDashboard",
  components: { SidebarMenu, CourseCard, PaginationComponent },
  data() {
    return {
      activeTab: "all",
      allExperiments: [],
      ongoingExperiments: [],
      completedExperiments: [],
      totalExperiments: 0,
    };
  },
  mounted() {
    this.fetchCourses(); // 组件挂载时调用 API 获取课程列表
  },
  methods: {
    async fetchCourses() {
      const response = await courseAPI.getCourseList(); // 调用 API 获取课程数据
      console.log("Response:", response);
      if (response.success === false) {
        ElMessage.error("获取课程失败：" + response.error);
        console.error("Error fetching courses:", response.error);
      } else {
        const courses = response.data; // 假设 API 返回的数据存储在 `data` 字段中
        this.totalExperiments = courses.length; // 设置课程数量
        this.allExperiments = courses;
        /*this.ongoingExperiments = courses.filter(
            (course) => course.status === "ongoing"
          ); // 假设有状态字段，筛选进行中的实验
          this.completedExperiments = courses.filter(
            (course) => course.status === "completed"
          ); // 筛选已完成的实验*/
      }
    },
    handlePageChange(page) {
      console.log("Page changed to:", page);
      //TODO
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
}
.content {
  padding: 20px;
  flex-grow: 1;
}
.tabs {
  margin-bottom: 20px;
}
</style>
```

<template>
  <el-row>
    <p>今天有xx门课</p>
  </el-row>
  <div class="tabs">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="今日实验" name="today">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="todayExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <div v-for="(item, index) in todayExperiments" :key="index">
            <CourseCard :input_experiment="item" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="全部实验" name="all">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="allExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <div v-for="(item, index) in allExperiments" :key="index">
            <CourseCard :input_experiment="item" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import CourseCard from "./CourseCard.vue";
import PaginationComponent from "./Pagination.vue";
import { courseAPI } from "../utils/api";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { userAPI } from "../utils/api";

export default {
  name: "CoursePanel",
  components: { CourseCard },
  setup() {
    const router = useRouter();
  },
  data() {
    return {
      activeTab: "today",
      allExperiments: [],
      todayExperiments: [],
      isLoading: true,
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
        this.experimentNum = courses.length; // 设置课程数量
        this.allExperiments = courses;
        console.log("All experiments:", this.allExperiments);
      }
      this.isLoading = false;
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
}
</style>

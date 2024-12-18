<template>
  <el-row>
    <p>今天有xx门课, 有xx门没有填充</p>
    <el-button
      type="primary"
      @click="navigateToCreateCourse"
      style="margin-bottom: 20px"
    >
      创建课程
    </el-button>
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
          <CourseCard
            :experiments="todayExperiments"
            @class-clicked="handelClassClick"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="未填充实验" name="unfinished">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="unfinishedExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <CourseCard
            :experiments="unfinishedExperiments"
            @class-clicked="handelClassClick"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="全部实验" name="all">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="allExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <CourseCard
            :experiments="allExperiments"
            @class-clicked="handelClassClick"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  <PaginationComponent
    :total="experimentNum"
    @page-changed="handlePageChange"
  />
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
  components: { CourseCard, PaginationComponent },
  setup() {
    const router = useRouter();
  },
  data() {
    return {
      activeTab: "today",
      allExperiments: [],
      todayExperiments: [],
      unfinishedExperiments: [],
      isLoading: true,
    };
  },
  mounted() {
    this.fetchCourses(); // 组件挂载时调用 API 获取课程列表
  },
  methods: {
    navigateToCreateCourse() {
      if (this.$router) {
        this.$router.push("/create-course");
      } else {
        console.error("Router instance is not available.");
      }
    },
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
      }
      this.isLoading = false;
    },
    handlePageChange(page) {
      console.log("Page changed to:", page);
      //TODO
    },

    // 处理子组件传递过来的 classItem
    handelClassClick(class_id) {
      console.log("Selected class:", class_id);
      this.$emit("show-class-panel", class_id);
      // 在这里处理你要对 classItem 进行的操作
      // 比如展示课程详情、打开弹窗等
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
}
</style>

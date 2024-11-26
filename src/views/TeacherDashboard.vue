<template>
  <div class="dashboard">
    <!-- 仪表盘标题 -->
    <el-row>
      <h2>欢迎回来, {{ teacherName }}!</h2>
    </el-row>

    <!-- 统计卡片 -->
    <el-row gutter="20" class="stats">
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <h3>正在进行的课程</h3>
            <p>{{ ongoingCourses }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <h3>已完成的课程</h3>
            <p>{{ completedCourses }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <h3>待处理通知</h3>
            <p>{{ pendingNotifications }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <h3>学生评论</h3>
            <p>{{ commentsCount }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程进度图表 -->
    <!-- <el-row class="chart-container">
      <el-card>
        <el-row>
          <h3>课程完成情况</h3>
        </el-row>
        <CourseCompletionChart
          :completed="completedCourses"
          :ongoing="ongoingCourses"
        />
      </el-card>
    </el-row> -->

    <!-- 最近的学生评论 -->
    <el-row class="recent-comments">
      <el-card>
        <h3>最近的学生评论</h3>
        <el-table :data="recentComments" style="width: 100%">
          <el-table-column prop="student_name" label="学生姓名" width="150" />
          <el-table-column prop="content" label="评论内容" />
          <el-table-column prop="sent_time" label="评论时间" width="200" />
        </el-table>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";
// import CourseCompletionChart from "../components/CourseCompletionChart.vue";

export default {
  name: "TeacherDashboard",
  components: {
    // CourseCompletionChart,
  },
  data() {
    return {
      teacherName: "张老师",
      ongoingCourses: 0,
      completedCourses: 0,
      pendingNotifications: 0,
      commentsCount: 0,
      recentComments: [],
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        // 获取课程统计
        const courseStats = await axios.get("/api/teacher/courses/stats");
        this.ongoingCourses = courseStats.data.ongoing;
        this.completedCourses = courseStats.data.completed;

        // 获取待处理通知数量
        const notifications = await axios.get(
          "/api/teacher/notifications/pending"
        );
        this.pendingNotifications = notifications.data.count;

        // 获取学生评论数量
        const comments = await axios.get("/api/teacher/comments");
        this.commentsCount = comments.data.length;
        this.recentComments = comments.data.slice(0, 5); // 仅显示最近5条评论
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
  },
  created() {
    this.fetchDashboardData();
  },
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  font-size: 24px;
}

.chart-container {
  margin-top: 20px;
}

.recent-comments {
  margin-top: 20px;
}
</style>

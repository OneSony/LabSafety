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

    <el-row>
      <el-button type="primary" @click="navigateToCreateCourse">
        创建课程
      </el-button>
    </el-row>
  </div>
</template>

<script>
// import axios from "axios";

export default {
  name: "TeacherDashboard",
  data() {
    return {
      teacherName: "张老师",
      ongoingCourses: 0,
      completedCourses: 0,
      pendingNotifications: 0,
      commentsCount: 0,
      recentComments: [],
      courses: [],
      isCourseDialogVisible: false,
      courseForm: {
        name: "",
      },
    };
  },
  methods: {
    navigateToCreateCourse() {
      if (this.$router) {
        this.$router.push("/create-course");
      } else {
        console.error("Router instance is not available.");
      }
    },
    created() {
      this.fetchDashboardData();
      this.fetchCourses();
    },
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

.course-management {
  margin-top: 20px;
}
</style>

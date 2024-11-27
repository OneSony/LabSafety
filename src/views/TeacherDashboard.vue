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

    <!-- 课程管理 -->
    <el-row class="course-management">
      <el-card>
        <h3>课程管理</h3>
        <el-button type="primary" @click="openCourseDialog">创建课程</el-button>
        <el-table :data="courses" style="width: 100%">
          <el-table-column prop="name" label="课程名称" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="enrollStudents(scope.row.id)">
                学生注册
              </el-button>
              <el-button size="small" @click="addClassToCourse(scope.row.id)">
                添加班级
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-row>
    <el-row>
      <el-button type="primary" @click="navigateToCreateCourse">
        创建课程
      </el-button>
    </el-row>
    <!-- 创建课程弹窗 -->
    <el-dialog v-model="isCourseDialogVisible" title="创建课程">
      <el-form :model="courseForm">
        <el-form-item label="课程名称">
          <el-input v-model="courseForm.name" />
        </el-form-item>
      </el-form>
      <span class="dialog-footer">
        <el-button @click="isCourseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createCourse">创建</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

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
    // 获取仪表盘数据
    async fetchDashboardData() {
      try {
        const courseStats = await axios.get("/api/teacher/courses/stats");
        this.ongoingCourses = courseStats.data.ongoing;
        this.completedCourses = courseStats.data.completed;

        const notifications = await axios.get(
          "/api/teacher/notifications/pending"
        );
        this.pendingNotifications = notifications.data.count;

        const comments = await axios.get("/api/teacher/comments");
        this.commentsCount = comments.data.length;
        this.recentComments = comments.data.slice(0, 5);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },

    // 获取课程数据
    async fetchCourses() {
      try {
        const response = await axios.get("/api/v1/courses");
        this.courses = response.data;
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    },

    // 创建课程
    async createCourse() {
      try {
        const response = await axios.post("/api/v1/courses", this.courseForm);
        this.$message.success(response.data.message);
        this.isCourseDialogVisible = false;
        this.fetchCourses();
      } catch (error) {
        console.error("Error creating course:", error);
      }
    },

    // 学生注册
    async enrollStudents(courseId) {
      try {
        const studentIds = ["2021000000", "2021000001"]; // 示例学生ID
        const response = await axios.post("/api/v1/courses/enroll", {
          course_id: courseId,
          student_ids: studentIds,
        });
        this.$message.success(response.data.message);
      } catch (error) {
        console.error("Error enrolling students:", error);
      }
    },

    // 添加班级到课程
    async addClassToCourse(courseId) {
      try {
        const classId = 1; // 示例班级ID
        const response = await axios.post("/api/v1/courses/classes", {
          course_id: courseId,
          class_id: classId,
        });
        this.$message.success(response.data.message);
      } catch (error) {
        console.error("Error adding class to course:", error);
      }
    },
  },
  navigateToCreateCourse() {
    this.$router.push("/create-course");
  },
  created() {
    this.fetchDashboardData();
    this.fetchCourses();
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

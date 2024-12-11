<template>
  <div class="dashboard">
    <SidebarMenu />
    <div class="content">
      <!-- 动态加载组件 -->
      <div class="quick-look">
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
              <el-table-column
                prop="student_name"
                label="学生姓名"
                width="150"
              />
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
      <component
        :is="currentComponent"
        :classItem="classItem"
        @go-back-to-course-panel="backToCoursePanel"
        @show-class-panel="showClassPanel"
      />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import CoursePanel from "@/components/CoursePanel.vue";
import ClassPanel from "@/components/ClassPanel.vue";
import SidebarMenu from "@/components/Sidebar.vue";

export default {
  name: "TeacherDashboard",
  components: {
    SidebarMenu,
    CoursePanel,
    ClassPanel,
  },
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
  setup() {
    const currentComponent = ref(CoursePanel); // 默认显示 CoursePanel
    const classItem = ref(null); // 存储当前选中的 classItem

    // 切换到 ClassPanel
    const showClassPanel = (item) => {
      classItem.value = item; // 存储传递过来的 classItem
      currentComponent.value = ClassPanel; // 切换到 ClassPanel
    };

    // 切换回 CoursePanel
    const backToCoursePanel = () => {
      currentComponent.value = CoursePanel; // 切换回 CoursePanel
    };

    return {
      currentComponent,
      showClassPanel,
      backToCoursePanel,
      classItem, // classItem 数据
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
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
}
.content {
  flex: 1;
}

.quick-look {
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

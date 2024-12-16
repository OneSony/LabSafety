<template>
  <div class="course-management-container">
    <h1>教务课程管理</h1>
    <div class="toolbar">
      <button @click="goToAddCourse" class="add-course-btn">添加课程</button>
    </div>
    <table class="course-table">
      <thead>
        <tr>
          <th>课程ID</th>
          <th>课程名称</th>
          <th>开课时间</th>
          <th>授课老师</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course.id">
          <td>{{ course.id }}</td>
          <td>{{ course.name }}</td>
          <td>{{ course.startTime }}</td>
          <td>{{ course.teacher }}</td>
          <td>
            <button @click="goToEditCourse(course.id)">编辑</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading-overlay">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseManagement",
  data() {
    return {
      courses: [],
      loading: false,
    };
  },
  created() {
    this.fetchCourses();
  },
  methods: {
    fetchCourses() {
      this.loading = true;
      // 模拟异步请求，也可使用axios/fetch从后端接口获取数据
      setTimeout(() => {
        // 假设返回的课程数据格式如下
        this.courses = [
          {
            id: 1,
            name: "高等数学",
            startTime: "2024-09-01",
            teacher: "张老师",
          },
          {
            id: 2,
            name: "大学物理",
            startTime: "2024-09-10",
            teacher: "李老师",
          },
          {
            id: 3,
            name: "线性代数",
            startTime: "2024-09-15",
            teacher: "王老师",
          },
        ];
        this.loading = false;
      }, 1000);
    },
    goToAddCourse() {
      // 跳转到添加课程页面(假设路由为 /add-course)
      this.$router.push("/create-course");
    },
    goToEditCourse(id) {
      // 跳转到编辑课程页面(假设路由为 /edit-course/:id)
      this.$router.push("/create-course/" + id);
    },
  },
};
</script>

<style scoped>
.course-management-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.toolbar {
  margin-bottom: 20px;
}

.add-course-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
}

.course-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.course-table th,
.course-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.course-table th {
  background-color: #f2f2f2;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}
</style>

<template>
  <div>
    <el-card
      class="experiment-card"
      v-for="(item, index) in experiments"
      :key="index"
      @click="handleCardClick(item)"
    >
      <div class="card-content">
        <el-avatar :src="item.icon" size="large"></el-avatar>
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <p>学时长：{{ item.duration }}分</p>
        </div>
        <el-progress :percentage="item.progress" type="circle"></el-progress>
      </div>

      <!-- 显示更多课程卡片，点击切换显示/隐藏 -->
      <div v-show="item.isVisible">
        <div
          v-for="(classItem, index) in item.classList"
          :key="index"
          class="sub-course-card"
        >
          <el-card class="class-card">
            <h4>{{ classItem.name }}</h4>
            <p>{{ classItem.description }}</p>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { courseAPI } from "../utils/api"; // 假设api.ts提供了相关API

export default {
  props: {
    experiments: Array,
  },
  methods: {
    // 处理课程卡片点击事件
    async handleCardClick(course) {
      // 切换课程卡片的显示状态
      course.isVisible = !course.isVisible;

      if (course.isVisible && !course.classList) {
        console.log("请求数据");
        // 如果课程卡片显示且 classList 为空，则请求数据
        const response = await courseAPI.getClassList(course.id);
        if (response.success) {
          course.classList = response.data; // 假设返回的数据是 class 列表
        } else {
          this.$message.error("获取课程列表失败");
        }
      }
    },
  },
};
</script>

<style scoped>
.experiment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  cursor: pointer;
}

.card-content {
  display: flex;
  align-items: center;
}

.info {
  margin-left: 20px;
}

.sub-course-card {
  margin-left: 30px;
  margin-top: 10px;
}

.class-card {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
}

.class-card h4 {
  font-size: 18px;
  font-weight: bold;
}

.class-card p {
  font-size: 14px;
  color: #555;
}
</style>

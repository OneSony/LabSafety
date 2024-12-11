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
          <p>{{ item.course_id }}</p>
          <p>学时长：{{ item.duration }}分</p>
        </div>
        <el-progress :percentage="item.progress" type="circle"></el-progress>
      </div>

      <!-- 显示更多课程卡片，点击切换显示/隐藏 -->
      <div v-if="item.isVisible">
        <div v-if="!item.classList || item.classList.length === 0">No data</div>
        <div v-else>
          <div
            v-for="(classItem, index) in item.classList"
            :key="index"
            class="sub-course-card"
            @click="handleClassCardClick(classItem, $event)"
          >
            <el-card class="class-card">
              <h4>{{ classItem.name }}</h4>
              <p>{{ classItem.description }}</p>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { classAPI } from "../utils/api";

export default {
  props: {
    experiments: Array,
  },
  methods: {
    // 处理课程卡片点击事件
    async handleCardClick(course) {
      // 切换课程卡片的显示状态
      course.isVisible = !course.isVisible;

      // 仅在 classList 为空时请求数据
      if (
        course.isVisible &&
        (!course.classList || course.classList.length === 0)
      ) {
        console.log("请求数据");
        // 请求课程的 class 列表
        const response = await classAPI.getClassList(course.course_id);
        if (response.success) {
          course.classList = response.data; // 假设返回的数据是 class 列表
        } else {
          this.$message.error("获取课程列表失败");
        }
      }
    },

    // 处理 class card 的点击事件
    handleClassCardClick(classItem, event) {
      console.log("Class card clicked:", classItem);
      event.stopPropagation(); // 防止触发父级课程卡片点击事件
      this.$emit("class-clicked", classItem.id); // 将选中的 class 传递给父组件
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

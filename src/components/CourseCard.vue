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
          <p>课程号 {{ item.course_id }}</p>
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
            <div class="class-index">{{ index + 1 }}</div>
            <el-card class="class-card">
              <div class="class-content">
                <div class="class-title">
                  <h4>{{ classItem.name }}</h4>
                  <p>生物医学馆</p>
                </div>
                <div class="content-box">
                  <p>通知</p>
                  <p>0</p>
                </div>
                <div class="content-box">
                  <p>实验数</p>
                  <p>0</p>
                </div>
                <div class="content-box">
                  <p>预估时间</p>
                  <p>0</p>
                </div>
                <div class="content-box">
                  <p>课程文件</p>
                  <p>0</p>
                </div>
              </div>
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
        console.log("course.course_id", course.course_id);
        if (response.success) {
          console.log("获取课程列表成功:", response.data);
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
      this.$emit("class-clicked", classItem.class_id); // 将选中的 class 传递给父组件
    },
  },
};
</script>

<style scoped>
.experiment-card {
  width: 100%; /* 使 experiment-card 宽度占满父容器 */
  margin-bottom: 20px;
  padding: 15px;
  cursor: pointer;
  box-sizing: border-box; /* 确保 padding 不影响宽度 */
}

.card-content {
  width: 100%; /* 确保 card-content 占满整个 experiment-card */
  display: flex;
  align-items: center;
  box-sizing: border-box; /* 防止 padding 影响内容宽度 */
}

.info {
  margin-left: 20px;
  flex-grow: 1; /* 使 info 部分自动扩展，占据剩余空间 */
}

.sub-course-card {
  display: flex;
  align-items: center;
  direction: row;
  margin-top: 20px;
}

.class-card {
  width: 100%;
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

.class-index {
  font-size: 40px;
  font-weight: bold;
  color: gray;
  margin-right: 40px;
  margin-left: 20px;
}

.class-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  border-left: 2px solid #ddd; /* 给每个content-box添加左边的分割线 */
}

.class-title {
  width: 30%;
}
</style>

<template>
  <el-card
    class="experiment-card"
    v-for="(item, index) in experiments"
    :key="index"
    @click="handleCardClick(item)"
  >
    <div class="card-content">
      <div class="info">
        <h3>{{ item.name }}</h3>
        <p>课程号 {{ item.course_code }} - {{ item.course_sequence }}</p>
        <p>开课院系 {{ item.department }}</p>
      </div>
      <el-progress :percentage="item.progress" type="circle"></el-progress>
    </div>

    <!-- 显示更多课程卡片，点击切换显示/隐藏 -->
    <div v-if="item.isVisible">
      <el-skeleton :rows="3" animated v-if="item.isLoaded === false" />
      <el-empty
        description="没有课程"
        :image-size="100"
        v-if="item.classList.length === 0 && item.isLoaded === true"
      />
      <div v-else>
        <div
          v-for="(classItem, index) in item.classList"
          :key="index"
          class="sub-course-card"
          @click="handleClassCardClick(item, classItem, $event)"
        >
          <DateBox :dateStr="classItem.start_time"></DateBox>
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
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { classAPI } from "../utils/api";
import DateBox from "./DateBox.vue";

export default {
  props: {
    experiments: Array,
  },
  components: {
    DateBox,
  },
  watch: {
    // 监听 experiments 的变化，当传递新的数据时重新初始化
    experiments(newExperiments) {
      newExperiments.forEach((item) => {
        item.isVisible = false; // 默认初始化为 false
        item.isLoaded = false; // 默认初始化为 false
        item.classList = []; // 默认初始化为空数组
      });
      console.log("new exp", newExperiments);
    },
  },
  methods: {
    // 处理课程卡片点击事件
    async handleCardClick(course) {
      console.log("Course card clicked:", course);
      // 切换课程卡片的显示状态
      course.isVisible = !course.isVisible;

      // 仅在 classList 为空时请求数据
      if (course.isVisible && course.isLoaded === false) {
        console.log("请求数据");
        const response = await classAPI.getClassList(course.id);
        console.log("course.id", course.id);
        if (response.success) {
          console.log("获取课程列表成功:", response.data);
          course.classList = response.data; // 假设返回的数据是 class 列表
          for (let i = 0; i < course.classList.length; i++) {
            //TODO
            //获取每个课程的通知数量，实验数量，预估时间，地点，老师
          }
          console.log("course.classList", course.classList);
        } else {
          this.$message.error("获取课程列表失败");
        }
        course.isLoaded = true; // 设置为 true，避免重复请求
      }
    },

    // 处理 class card 的点击事件
    handleClassCardClick(item, classItem, event) {
      console.log("Class card clicked:", classItem, item.id);
      event.stopPropagation(); // 防止触发父级课程卡片点击事件
      this.$emit("class-clicked", classItem.class_id, item.id); // 将选中的 class 传递给父组件
    },
  },
};
</script>

<style scoped>
.experiment-card {
  width: 100%; /* 使 experiment-card 宽度占满父容器 */
  cursor: pointer;
  box-sizing: border-box; /* 确保 padding 不影响宽度 */
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
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
  flex-direction: column;
  margin-top: 20px;
}

.class-card {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
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

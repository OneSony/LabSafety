<template>
  <el-card class="experiment-card" @click="handleCardClick">
    <div class="card-content">
      <div class="info">
        <h3>{{ experiment.name }}</h3>
        <p>
          课程号 {{ experiment.course_code }} - {{ experiment.course_sequence }}
        </p>
        <p>开课院系 {{ experiment.department }}</p>
      </div>
      <el-progress
        :percentage="calculateProgress()"
        type="circle"
      ></el-progress>
    </div>

    <!-- 显示更多课程卡片，点击切换显示/隐藏 -->
    <el-divider v-if="experiment.isVisible"></el-divider>
    <div v-if="experiment.isVisible">
      <el-skeleton :rows="3" animated v-if="experiment.isLoaded === false" />
      <el-empty
        description="没有课程"
        :image-size="100"
        v-if="experiment.classList.length === 0 && experiment.isLoaded === true"
      />
      <div v-else>
        <div
          v-for="(classItem, index) in experiment.classList"
          :key="index"
          class="sub-course-card"
        >
          <router-link
            :to="{
              name: 'class-page',
              params: { classId: classItem.class_id, courseId: experiment.id },
            }"
            style="text-decoration: none; width: 100%"
          >
            <DateBox
              :dateStr="classItem.start_time"
              style="margin-bottom: 5px; margin-left: 10px"
            ></DateBox>
            <el-card
              :class="{
                'class-card': true,
                'highlight-today': isToday(classItem.start_time),
                'highlight-unset': classItem.isSet === false,
              }"
            >
              <div class="class-content">
                <div class="class-title">
                  <h4>{{ classItem.name }}</h4>
                  <p>{{ classItem.lab_name }}</p>
                </div>
                <div class="content-box" v-if="false">
                  <p>通知</p>
                  <p>0</p>
                </div>
                <div class="content-box" v-if="false">
                  <p>实验数</p>
                  <p>0</p>
                </div>
                <div class="content-box" v-if="false">
                  <p>预估时间</p>
                  <p>0</p>
                </div>
              </div>
            </el-card>
          </router-link>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { classAPI, userAPI } from "../utils/api";
import DateBox from "./DateBox.vue";

export default {
  props: {
    input_experiment: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    console.log("experimentmound", this.experiment);
    if (userAPI.getRole() == "teacher") {
      this.markUnsetClass();
    }
  },
  data() {
    return {
      experiment: {
        ...this.input_experiment,
        isVisible: false,
      },
    };
  },
  components: {
    DateBox,
  },
  watch: {
    // 监听 experiments 的变化，当传递新的数据时重新初始化
    input_experiment(newExperiment) {
      this.experiment = newExperiment;
      this.isVisible = false; // 默认初始化为 false
      console.log("new exp", newExperiment);
      if (userAPI.getRole() == "teacher") {
        this.markUnsetClass();
      }
    },
  },
  methods: {
    // 处理课程卡片点击事件
    async handleCardClick() {
      // 切换课程卡片的显示状态
      console.log("experimentmound", this.experiment);
      this.experiment.isVisible = !this.experiment.isVisible;
      console.log("Card clicked:", this.experiment);
      // 仅在 classList 为空时请求数据
      if (this.experiment.isVisible && this.experiment.isLoaded === false) {
        console.log("请求数据");
        const response = await classAPI.getClassList(this.experiment.id);
        console.log("course.id", this.experiment.id);
        if (response.success) {
          console.log("获取课程列表成功:", response.data);
          this.experiment.classList = response.data; // 假设返回的数据是 class 列表
          for (let i = 0; i < this.experiment.classList.length; i++) {
            //TODO
            //获取每个课程的通知数量，实验数量，预估时间，地点，老师
          }
          console.log("course.classList", this.experiment.classList);
        } else {
          this.$message.error("获取课程列表失败");
        }
        this.experiment.isLoaded = true; // 设置为 true，避免重复请求
      }
    },
    async markUnsetClass() {
      for (let i = 0; i < this.experiment.classList.length; i++) {
        if (this.experiment.classList[i].lab_id == null) {
          this.experiment.classList[i].isSet = false;
        } else {
          const experimentResult = await classAPI.getExperiments(
            this.experiment.classList[i].class_id
          );
          if (experimentResult.success) {
            this.experiment.classList[i].isSet =
              experimentResult.data.length > 0;
          }
        }
      }
    },
    isToday(dateStr) {
      const today = new Date();
      const date = new Date(dateStr);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
    calculateProgress() {
      //统计已经过去的课程数量
      let count = 0;
      for (let i = 0; i < this.experiment.classList.length; i++) {
        //过去的，按天数算，不考虑时间，不算今天
        if (
          new Date(this.experiment.classList[i].start_time).setHours(
            0,
            0,
            0,
            0
          ) < new Date().setHours(0, 0, 0, 0)
        ) {
          count++;
        }
      }
      return (count / this.experiment.classList.length) * 100;
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
  align-items: flex-start;
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

.class-card:last-child {
  margin-bottom: 0;
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
.highlight-today {
  box-shadow: 0 0 5px #a5d6a7; /* 淡绿色发光效果 */
  transition: border 0.3s ease, box-shadow 0.3s ease; /* 添加动画效果 */
  animation: border-glow 1.5s infinite; /* 添加跑马灯效果 */
}

@keyframes border-glow {
  0% {
    box-shadow: 0 0 5px #a5d6a7, 0 0 10px #a5d6a7, 0 0 15px #a5d6a7;
  }
  50% {
    box-shadow: 0 0 10px #a5d6a7, 0 0 15px #a5d6a7, 0 0 20px #a5d6a7;
  }
  100% {
    box-shadow: 0 0 5px #a5d6a7, 0 0 10px #a5d6a7, 0 0 15px #a5d6a7;
  }
}
.highlight-unset {
  box-shadow: 0 0 5px #ffcc80; /* 淡橙黄色发光效果 */
  transition: border 0.3s ease, box-shadow 0.3s ease; /* 添加动画效果 */
  animation: border-glow-unset 1.5s infinite; /* 添加跑马灯效果 */
}

@keyframes border-glow-unset {
  0% {
    box-shadow: 0 0 5px #ffcc80, 0 0 10px #ffcc80, 0 0 15px #ffcc80;
  }
  50% {
    box-shadow: 0 0 10px #ffcc80, 0 0 15px #ffcc80, 0 0 20px #ffcc80;
  }
  100% {
    box-shadow: 0 0 5px #ffcc80, 0 0 10px #ffcc80, 0 0 15px #ffcc80;
  }
}
</style>

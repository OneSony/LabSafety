<template>
  <!-- <el-row>
    <p>今天有{{ todayClassNum }}门课, 有{{ unsetClassNum }}门没有设置完成</p>
  </el-row> -->
  <el-row class="mb-4">
    <el-col :span="24">
      <el-card class="statistics-card" shadow="never">
        <div class="statistics-container">
          <div class="stat-group">
            <span class="stat-label">今日课程</span>
            <span class="stat-value">{{ todayClassNum }}</span>
            <span class="stat-unit">门</span>
          </div>
          <el-divider direction="vertical" />
          <div class="stat-group">
            <span class="stat-label">待设置课程</span>
            <span class="stat-value warning-text">{{ unsetClassNum }}</span>
            <span class="stat-unit">门</span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
  <div class="tabs">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="今日实验" name="today">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="todayExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <div v-for="(item, index) in todayExperiments" :key="index">
            <CourseCard :input_experiment="item" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="未安排实验" name="unset">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="unsetExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <div v-for="(item, index) in unsetExperiments" :key="index">
            <CourseCard :input_experiment="item" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="全部实验" name="all">
        <el-skeleton :rows="5" animated v-if="isLoading"></el-skeleton>
        <el-empty
          description="没有实验"
          v-if="allExperiments.length === 0 && !isLoading"
        />
        <div v-else>
          <div v-for="(item, index) in allExperiments" :key="index">
            <CourseCard :input_experiment="item" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import CourseCard from "./CourseCard.vue";
import PaginationComponent from "./Pagination.vue";
import { courseAPI } from "../utils/api";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { userAPI, classAPI, labAPI } from "../utils/api";

export default {
  name: "CoursePanel",
  components: { CourseCard },
  data() {
    return {
      activeTab: "today",
      allExperiments: [],
      todayExperiments: [],
      unsetExperiments: [],
      isLoading: true,
      todayClassNum: 0,
      unsetClassNum: 0,
    };
  },
  async mounted() {
    await this.fetchCourses(); // 组件挂载时调用 API 获取课程列表
    this.selectTodayExperiments();
    this.selectUnsetExperiments();
  },
  methods: {
    async fetchCourses() {
      const response = await courseAPI.getCourseList(); // 调用 API 获取课程数据
      console.log("course list:", response);
      if (response.success === false) {
        ElMessage.error("获取课程失败：" + response.error);
        console.error("Error fetching courses:", response.error);
      } else {
        const courses = response.data; // 假设 API 返回的数据存储在 `data` 字段中

        for (let i = 0; i < courses.length; i++) {
          courses[i].isLoaded = false;
          courses[i].classList = [];

          // 获取课程的实验列表
          const classResponse = await classAPI.getClassList(courses[i].id);
          if (classResponse.success) {
            courses[i].classList = classResponse.data;
            for (let j = 0; j < courses[i].classList.length; j++) {
              const locationResult = await classAPI.getLocations(
                courses[i].classList[j].class_id
              );
              if (locationResult.success && locationResult.data.length > 0) {
                courses[i].classList[j].lab_id = locationResult.data[0].lab_id;
                const labNameResult = await labAPI.getLabsSimple(
                  courses[i].classList[j].lab_id
                );
                if (labNameResult.success) {
                  courses[i].classList[j].lab_name = labNameResult.data[0].name;
                }
                const experimentResult = await classAPI.getExperiments(
                  courses[i].classList[j].class_id
                );
                if (experimentResult.success) {
                  courses[i].classList[j].isUnset =
                    experimentResult.data.length === 0;
                }
              } else {
                courses[i].classList[j].isUnset = true;
                courses[i].classList[j].lab_name = "未知";
              }
            }
            courses[i].isLoaded = true;
            console.log("classList!!!!", courses[i].classList);
          } else {
            ElMessage.error("获取课程实验失败：" + classResponse.error);
            console.error("Error fetching class list:", classResponse.error);
          }
        }

        this.experimentNum = courses.length; // 设置课程数量
        this.allExperiments = courses;
        //sort by start_time
        for (let i = 0; i < this.allExperiments.length; i++) {
          this.allExperiments[i].classList.sort((a, b) => {
            return new Date(a.start_time) - new Date(b.start_time);
          });
        }
      }
      this.isLoading = false;
    },

    selectTodayExperiments() {
      const today = new Date();
      const todayExperiments = this.allExperiments.filter((course) => {
        return course.classList.some((experiment) => {
          const date = new Date(experiment.start_time);
          return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        });
      });
      this.todayExperiments = todayExperiments;

      for (let i = 0; i < this.allExperiments.length; i++) {
        for (let j = 0; j < this.allExperiments[i].classList.length; j++) {
          const date = new Date(this.allExperiments[i].classList[j].start_time);
          if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            this.todayClassNum++;
          }
        }
      }
    },
    selectUnsetExperiments() {
      const unsetExperiments = this.allExperiments.filter((course) => {
        return course.classList.some((experiment) => {
          return experiment.isUnset;
        });
      });
      this.unsetExperiments = unsetExperiments;

      for (let i = 0; i < this.allExperiments.length; i++) {
        for (let j = 0; j < this.allExperiments[i].classList.length; j++) {
          if (this.allExperiments[i].classList[j].isUnset) {
            this.unsetClassNum++;
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.statistics-card {
  margin: 16px 0;
  background: transparent;
  border: none;
  box-shadow: none !important;
}
.statistics-card :deep(.el-card__body) {
  padding: 0;
  box-shadow: none !important;
}
.statistics-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}

.stat-label {
  font-size: 18px;
  color: #4e525b;
  margin-bottom: 14px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.warning-text {
  color: #e6a23c;
}

.stat-unit {
  font-size: 18px;
  color: #4e525b;
  margin-top: 4px;
}

.el-divider {
  height: 40px;
}

.dashboard {
  display: flex;
}
</style>

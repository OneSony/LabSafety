<template>
  <div class="class-panel">
    <div class="class-buttoms">
      <el-button type="primary" class="go-back-btn" @click="goBack">
        返回
      </el-button>
      <el-button type="primary"> 复制课堂 </el-button>
      <el-button type="primary"> 查看学生 </el-button>
    </div>

    <div
      class="header"
      style="
        display: flex;
        flex-direction: row;
        align-items: center;
        align-items: stretch;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          position: relative;
          width: 60%;
        "
      >
        <el-button
          v-if="isTeacher"
          type="primary"
          class="card-btn"
          style="position: absolute; top: 20px; right: 20px"
        >
          编辑基本信息
        </el-button>
        <h2>{{ name }}</h2>
        <p><strong>课程ID:</strong> {{ class_id }}</p>
        <p><strong>教师:</strong> {{ teacherNamesStr }}</p>
        <p><strong>上课时间:</strong> {{ date }}</p>
        <p><strong>地点:</strong> {{ location }}</p>
        <p><strong>概览:</strong>很多tag</p>
      </div>
      <div
        style="
          border-left: 1px solid #ccc;
          padding-left: 20px;
          padding-right: 20px;
        "
      >
        <p>实验室地图</p>
        <img src="https://via.placeholder.com/150" alt="实验室地图" />
      </div>
    </div>

    <el-card class="card">
      <h3>通知</h3>
      <p>这里会有tag的汇总, 显示地图</p>

      <el-button
        v-if="isTeacher"
        type="primary"
        class="card-btn"
        style="position: absolute; top: 20px; right: 20px"
      >
        添加通知
      </el-button>
    </el-card>

    <el-card class="card">
      <h3>实验内容</h3>
      <el-button
        v-if="isTeacher"
        type="primary"
        class="card-btn"
        style="position: absolute; top: 20px; right: 20px"
      >
        添加内容
      </el-button>
      <el-divider></el-divider>
      <div
        v-for="(experiment, index) in experiments"
        :key="index"
        class="experiment-item"
      >
        <el-button
          v-if="isTeacher"
          type="primary"
          class="edit-btn"
          style="position: absolute; top: 20px; right: 20px; z-index: 9999"
          >编辑</el-button
        >
        <el-button
          v-if="isTeacher"
          type="danger"
          class="edit-btn"
          style="position: absolute; top: 70px; right: 20px; z-index: 9999"
          >删除</el-button
        >
        <el-row>
          <el-col :span="24">
            <h4>
              <span class="experiment-index">{{ index + 1 }}.</span>
              <!-- 显示数字序号 -->
              {{ experiment.title }}
            </h4>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <strong>预估时间：</strong>{{ experiment.estimatedTime }}
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <strong>安全标签：</strong>
            <el-tag
              v-for="(tag, i) in experiment.safetyTags"
              :key="i"
              type="danger"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <strong>实验方式：</strong>
            <el-tag
              v-for="(tag, i) in experiment.experimentTypes"
              :key="i"
              type="primary"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <strong>作业上交形式：</strong>
            <el-tag
              v-for="(tag, i) in experiment.assignmentTypes"
              :key="i"
              type="success"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <strong>其他标签：</strong>
            <el-tag
              v-for="(tag, i) in experiment.otherTags"
              :key="i"
              type="info"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <strong>实验描述：</strong>
            <p>{{ experiment.description }}</p>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="card">
      <h3>实验文件</h3>
      <el-button
        v-if="isTeacher"
        type="primary"
        class="card-btn"
        style="position: absolute; top: 20px; right: 20px"
      >
        添加文件
      </el-button>
      <p>表格</p>
    </el-card>

    <el-card class="comment-card">
      <h3>评论区</h3>

      <div class="comment-list">
        <div
          v-for="(comment, index) in commentList"
          :key="index"
          class="comment-item"
        >
          <UserCard :userId="comment.sender_id" />
          <div class="comment-details">
            {{ comment.content }}
            <span class="comment-time">{{ comment.sent_time }}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: row; align-items: center">
        <el-input
          v-model="newComment"
          placeholder="请输入评论"
          class="comment-input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          @keyup.enter="submitComment"
        ></el-input>
        <el-button type="primary" @click="submitComment" style="margin: 10px"
          >提交评论</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script>
import { classAPI, labAPI, userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import UserCard from "@/components/UserCard.vue";

export default {
  name: "ClassPage",
  props: {
    classId: {
      type: Number,
      required: true,
    },
  },
  components: {
    UserCard,
  },
  data() {
    return {
      isLocationEditing: false,
      isTeacher: localStorage.getItem("role") === "teacher",
      class_id: this.classId,
      name: "",
      date: "",
      newComment: "",
      teacherNames: [],
      teacherIds: [],
      location: "",
      userLookup: {},
      commentList: [],
      experiments: [
        {
          title: "化学实验一",
          estimatedTime: "2小时",
          safetyTags: ["明火", "腐蚀性试剂"],
          experimentTypes: ["个人"],
          assignmentTypes: ["纸质报告"],
          otherTags: ["注意通风"],
          description: "这是一个化学实验，涉及到高温和有毒气体。",
          photos: [
            "https://via.placeholder.com/150",
            "https://via.placeholder.com/150",
          ],
        },
        {
          title: "生物实验二",
          estimatedTime: "1小时",
          safetyTags: ["生物危险"],
          experimentTypes: ["小组"],
          assignmentTypes: ["上交产物"],
          otherTags: ["无特殊要求"],
          description: "这是一项生物实验，需要小组合作。",
          photos: [],
        },
      ],
    };
  },
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.go(-1);
    };

    return {
      goBack,
    };
  },
  mounted() {
    console.log("class id:", this.class_id);
    this.fetchClassDetails();
  },
  methods: {
    fetchClassDetails() {
      this.getClassInfo();
      this.getTeacher();
      this.getLocation();
      this.getComments();
    },

    getClassInfo() {
      console.log("class id:", this.class_id);
      classAPI.getClass(this.class_id).then((response) => {
        if (response.success) {
          if (response.data.length === 0) {
            ElMessage.error("课程不存在");
            this.$router.push("/");
          } else {
            console.log("课程信息:", response.data[0]);
            this.name = response.data[0].name;
            this.date = response.data[0].start_time;
          }
        } else {
          ElMessage.error("获取课程信息失败");
        }
      });
    },

    getTeacher() {
      classAPI.getTeachers(this.class_id).then((response) => {
        if (response.success) {
          if (response.data.length === 0) {
            this.teacher = "未知";
          } else {
            this.teacherIds = response.data.map((item) => item.teacher_id);
            for (let i = 0; i < this.teacherIds.length; i++) {
              userAPI.getUserInfo(this.teacherIds[i]).then((response) => {
                if (response.success) {
                  console.log("教师信息:", response.data);
                  this.teacherNames.push(response.data[0].username);
                } else {
                  ElMessage.error("获取教师信息失败");
                }
              });
            }
            console.log("教师们信息:", this.teacherNames);
            this.teacherNamesStr = this.teacherNames.join(" ");
          }
        } else {
          ElMessage.error("获取教师信息失败");
        }
      });
    },

    getLocation() {
      classAPI.getLocations(this.class_id).then((response) => {
        console.log("地点信息:", response);
        if (response.success) {
          if (response.data.length === 0) {
            this.location = "未知";
          } else {
            this.location = response.data[0].lab_id;
            labAPI.getLabs(this.location).then((response) => {
              if (response.success) {
                console.log("地点信息:", response.data);
                this.location = response.data[0].name;
              } else {
                ElMessage.error("获取地点信息失败");
              }
            });
          }
        } else {
          ElMessage.error("获取地点信息失败");
        }
      });
    },

    getComments() {
      classAPI.getComments(this.class_id).then((response) => {
        console.log("评论信息:", response);
        if (response.success) {
          if (response.data.length === 0) {
            this.commentList = [];
          } else {
            this.commentList = response.data;
            console.log("评论区信息:", this.commentList);
          }
        } else {
          ElMessage.error("获取评论失败");
        }
      });
    },

    submitComment() {
      if (this.newComment.trim() === "") return;

      classAPI.postComment(this.class_id, this.newComment).then((response) => {
        if (response.success) {
          this.commentList.push({
            sender_id: 1,
            content: this.newComment,
            sent_time: "刚刚",
          });
          this.newComment = "";
          ElMessage.success("评论成功");
        } else {
          ElMessage.error("评论失败");
        }
      });
    },
  },
};
</script>

<style scoped>
.class-panel {
  padding: 20px;
}

.class-buttoms {
  margin-bottom: 20px;
}

.header {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.card {
  margin-bottom: 20px;
  padding: 20px;
  position: relative;
}

.experiment-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  margin-top: 20px;
  position: relative;
}

.experiment-item:not(:last-child) {
  border-bottom: 1px solid #ccc; /* 给每个实验项添加分割线，除了最后一个 */
}

.comment-card {
  background-color: #f3f3f3;
  padding: 20px;
  margin-top: 20px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  display: flex;
  direction: row;
  align-items: center;
  padding-left: 3%;
  padding-right: 3%;
}

.comment-item:not(:last-child) {
  border-bottom: 1px solid #ccc; /* 给每个评论项添加分割线，除了最后一个 */
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-details {
  display: flex;
  flex-direction: column;
  margin-left: 3%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.comment-time {
  font-size: 12px;
  color: #777;
  margin-top: 10px;
}

.comment-input {
  margin-top: 10px;
  margin-bottom: 10px;
}

.tag {
  margin-right: 5px;
}

.experiment-photo {
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
}
</style>

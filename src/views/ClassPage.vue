<template>
  <div class="class-panel">
    <div class="class-buttoms">
      <el-button type="primary" class="go-back-btn" @click="goBack">
        返回
      </el-button>
    </div>

    <!-- 如果 classItem 存在，显示其详细信息 -->
    <div class="class-header">
      <h2>{{ name }}</h2>
      <p><strong>课程ID:</strong> {{ class_id }}</p>
      <p><strong>上课时间:</strong> {{ date }}</p>
      <p><strong>教师:</strong> {{ teacher }}</p>
      <p><strong>地点:</strong> {{ location }}</p>
    </div>

    <!-- 课程详情部分 -->
    <div class="class-details">
      <h3>课程详情</h3>
      <p>{{ description }}</p>
    </div>

    <!-- 评论区卡片 -->
    <el-card class="comment-card">
      <h4>评论区</h4>

      <div class="comment-list">
        <!-- 使用 comment.content 来显示评论的内容 -->
        <div
          v-for="(comment, index) in commentList"
          :key="index"
          class="comment-item"
        >
          <p>
            <strong>评论者 {{ getUserName(comment.sender_id) }}:</strong>
            {{ comment.content }}
            <br />
            <span class="comment-time">{{ comment.sent_time }}</span>
          </p>
        </div>
      </div>

      <!-- 输入评论框 -->
      <el-input
        v-model="newComment"
        placeholder="请输入评论"
        class="comment-input"
        @keyup.enter="submitComment"
      ></el-input>
      <el-button type="primary" @click="submitComment">提交评论</el-button>
    </el-card>
  </div>
</template>

<script>
import { classAPI, labAPI, userAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

export default {
  name: "ClassPage",
  props: {
    classId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      class_id: this.classId,
      name: "",
      date: "",
      newComment: "", // 存储新评论的内容
      teacher: "", // 存储教师信息
      location: "", // 存储课程地点
      userLookup: {}, // 缓存用户信息的对象
      commentList: [], // 存储评论列表
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
    this.fetchClassDetails(); // 组件加载后调用 API 获取课程信息
  },
  methods: {
    // 获取课程详情数据
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

    // 获取教师信息
    getTeacher() {
      classAPI.getTeachers(this.class_id).then((response) => {
        if (response.success) {
          if (response.data.length === 0) {
            this.teacher = "未知";
          } else {
            this.teacher = response.data[0].teacher_id;
            userAPI.getUserInfo(this.teacher).then((response) => {
              if (response.success) {
                console.log("教师信息:", response.data);
                this.teacher = response.data.name;
              } else {
                ElMessage.error("获取教师信息失败");
              }
            });
          }
        } else {
          ElMessage.error("获取教师信息失败");
        }
      });
    },

    // 获取地点信息
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
                this.location =
                  response.data[0].name + " " + response.data[0].location;
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

    // 获取评论列表
    getComments() {
      classAPI.getComments(this.class_id).then((response) => {
        if (response.success) {
          console.log("评论列表:", response.data);
          this.commentList = response.data;
          // 获取所有评论者的 user 信息，并存入 userLookup 缓存
          const senderIds = response.data.map((comment) => comment.sender_id);
          this.fetchUserNames(senderIds);
        } else {
          ElMessage.error("获取评论列表失败");
        }
      });
    },

    // 根据用户ID获取用户名，并缓存到 userLookup
    fetchUserNames(senderIds) {
      const uniqueIds = [...new Set(senderIds)]; // 去重
      uniqueIds.forEach((userId) => {
        if (!this.userLookup[userId]) {
          console.log("fetch user info for:", userId);
          userAPI.getUserInfo(userId).then((response) => {
            console.log("user info:", response);
            if (response.success) {
              this.userLookup[userId] = response.data[0].username;
            } else {
              this.userLookup[userId] = "未知";
            }
          });
        }
      });
    },

    // 获取用户姓名，如果已缓存，则直接返回
    getUserName(userId) {
      return this.userLookup[userId] || "加载中...";
    },

    // 提交评论的方法
    submitComment() {
      if (this.newComment.trim() === "") {
        this.$message.warning("评论内容不能为空");
        return;
      }

      console.log("提交评论:", this.newComment);
      console.log("my class_id:", this.class_id);

      classAPI.postComment(this.class_id, this.newComment).then((response) => {
        if (response.success) {
          ElMessage.success("提交评论成功");
        } else {
          ElMessage.error("提交评论失败");
        }
      });

      // 清空评论输入框
      this.newComment = "";

      // 重新获取评论列表
      // TODO
      this.getComments();
      console.log("reget:", this.commentList);
    },
  },
};
</script>

<style scoped>
.class-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
}

.go-back-btn {
  top: 20px;
  left: 20px;
  z-index: 10;
}

.class-header h2 {
  font-size: 24px;
  font-weight: bold;
}

.class-header p {
  font-size: 16px;
  color: #555;
}

.class-details {
  margin-top: 20px;
}

.class-details h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.class-details p {
  font-size: 16px;
}

.comment-card {
  margin-top: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.comment-card h4 {
  font-size: 20px;
  font-weight: bold;
}

.comment-list {
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.comment-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #888;
}

.comment-input {
  margin-top: 15px;
}

.el-button {
  margin-top: 10px;
}
</style>

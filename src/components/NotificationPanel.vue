<template>
  <el-row>
    <el-button
      type="primary"
      @click="navigateToCreateCourse"
      v-if="isTeacher"
      style="margin-bottom: 20px"
    >
      发布通知
    </el-button>
  </el-row>
  <el-row :gutter="20">
    <el-col
      v-for="(notification, index) in notifications"
      :key="index"
      :span="8"
    >
      <el-card :body-style="{ padding: '20px' }" class="card">
        <el-button
          type="text"
          @click="deleteNotification(index)"
          v-if="isTeacher"
          style="position: absolute; right: 15px; top: 15px"
          >删除</el-button
        >
        <el-button
          type="text"
          @click="deleteNotification(index)"
          v-if="isTeacher"
          style="position: absolute; right: 60px; top: 15px"
          >编辑</el-button
        >
        <h3>{{ notification.course }}</h3>
        <p><strong>发件人：</strong>{{ notification.sender }}</p>
        <p><strong>标题：</strong>{{ notification.title }}</p>
        <el-divider></el-divider>
        <p>{{ notification.content }}</p>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { userAPI } from "@/utils/api";
import { ElCard, ElRow, ElCol, ElDivider } from "element-plus";

export default {
  name: "NotificationPage",
  components: {
    ElCard,
    ElRow,
    ElCol,
    ElDivider,
  },
  data() {
    return {
      isTeacher: userAPI.getRole() === "teacher",
      notifications: [
        {
          sender: "张老师",
          course: "数据科学",
          title: "下周课程安排",
          content:
            "下周的课程将涵盖数据分析和机器学习基础，请提前预习相关内容。",
        },
        {
          sender: "李教授",
          course: "统计学",
          title: "期中考试通知",
          content: "期中考试将在下月举行，请做好准备。",
        },
        {
          sender: "王助教",
          course: "编程入门",
          title: "实验报告提交",
          content: "请在本周五前提交你的实验报告。",
        },
        {
          sender: "李教授",
          course: "统计学",
          title: "期中考试通知",
          content: "期中考试将在下月举行，请做好准备。",
        },
        {
          sender: "李教授",
          course: "统计学",
          title: "期中考试通知",
          content: "期中考试将在下月举行，请做好准备。",
        },
      ],
    };
  },
};
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
}

.el-card {
  transition: transform 0.3s ease;
}

.el-card:hover {
  transform: translateY(-10px);
}
</style>

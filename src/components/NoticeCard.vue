<template>
  <el-card :body-style="{ padding: '20px' }" class="card">
    <el-row>
      <UserCard :userId="notice.sender" />
    </el-row>
    <el-col v-for="(content, index) in notice.rows" :key="index" :span="8">
      <img
        v-if="content.notice_content.content_type === 'image'"
        :src="content.notice_content.image_content"
        alt="图片"
        style="width: 100%"
      />
      <p v-if="content.notice_content.content_type === 'text'">
        {{ content.notice_content.text_content }}
      </p>
      <el-button
        v-if="content.notice_content.content_type === 'file'"
        @click="downloadFile(content.notice_content.file_content)"
        type="primary"
      >
        下载
        {{
          decodeURIComponent(getBasename(content.notice_content.file_content))
        }}
      </el-button>
    </el-col>
  </el-card>
</template>

<script>
import { userAPI, noticeAPI } from "@/utils/api";
import { ElCard, ElButton, ElDivider } from "element-plus";
import UserCard from "./UserCard.vue";
export default {
  name: "NoticeCard",
  components: {
    ElCard,
    UserCard,
  },
  props: {
    notice: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isTeacher: userAPI.getRole() === "teacher",
      sender_name: "",
    };
  },
  mounted() {
    console.log("通知内容:", this.notice);
  },
  methods: {
    getBasename(url) {
      return url.split("/").pop();
    },
    downloadFile(url) {
      const link = document.createElement("a");
      link.href = url; // 使用文件的 URL
      link.download = decodeURIComponent(this.getBasename(url)); // 使用文件的名称作为下载文件名
      link.click(); // 触发下载
    },
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

<template>
  <el-card :body-style="{ padding: '20px' }" class="card" style="width: 100%">
    <el-row>
      <el-col :span="18">
        <DateBox
          :dateStr="notice.post_time"
          textColor="#666"
          font-size="12px"
        />
      </el-col>
      <el-col :span="6">
        <div v-if="needToShowClass">
          <router-link
            v-if="this.notice.notice_type == 'class'"
            :to="{
              path: `/course/${this.notice.course_id}/class/${this.notice.class_id}`,
            }"
          >
            <p
              v-if="needToShowClass"
              style="margin-top: 10px; margin-bottom: 10px"
            >
              前往课堂
            </p>
          </router-link>
          <router-link
            v-if="this.notice.notice_type == 'lab'"
            :to="{
              path: `/lab/${this.notice.class_or_lab_id}`,
            }"
          >
            <p
              v-if="needToShowClass"
              style="margin-top: 10px; margin-bottom: 10px"
            >
              前往实验室
            </p>
          </router-link>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <UserCard :userId="notice.sender" />
    </el-row>
    <el-row
      v-for="(content, index) in notice.rows"
      :key="index"
      style="width: 100%"
    >
      <ImageBox
        v-if="content.notice_content.content_type === 'image'"
        :src="content.notice_content.image_content"
      />
      <el-col :span="24">
        <p
          v-if="content.notice_content.content_type === 'text'"
          style="
            margin: 5px 0;
            word-wrap: break-word; /* 强制长单词换行 */
            word-break: break-all; /* 强制所有文本换行，包含标点 */
            white-space: normal; /* 确保文本换行 */
            display: inline-block; /* 或者 display: flex; */
            max-width: 600px;
            width: 100%; /* 确保 p 标签宽度与父容器一致 */
            box-sizing: border-box; /* 包含 padding 和 border */
          "
        >
          {{ content.notice_content.text_content }}
        </p>
      </el-col>
      <DownloadLink
        v-if="content.notice_content.content_type === 'file'"
        :url="content.notice_content.file_content"
      />
    </el-row>
  </el-card>
</template>

<script>
import { userAPI, noticeAPI } from "@/utils/api";
import { ElCard, ElButton, ElDivider } from "element-plus";
import UserCard from "./UserCard.vue";
import ImageBox from "./ImageBox.vue";
import DownloadLink from "@/components/DownloadLink.vue";
import DateBox from "./DateBox.vue";
import router from "@/router";
export default {
  name: "NoticeCard",
  components: {
    ElCard,
    UserCard,
    ImageBox,
    DownloadLink,
    DateBox,
  },
  props: {
    notice: {
      type: Object,
      required: true,
    },
    class: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      needToShowClass: this.class !== undefined,
      isTeacher: userAPI.getRole() === "teacher",
      sender_name: "",
    };
  },
  mounted() {
    console.log("通知内容:", this.notice);
    console.log("班级信息:", this.class);
  },
};
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
}
</style>

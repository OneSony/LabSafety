<template>
  <el-card :body-style="{ padding: '20px' }" class="card">
    <DateBox :dateStr="notice.updated_at" textColor="#666" font-size="12px" />
    <h3 v-if="needToShowClass" style="margin-top: 10px; margin-bottom: 10px">
      {{ this.notice.class_info.name }}
    </h3>
    <el-row>
      <UserCard :userId="notice.sender" />
    </el-row>
    <el-row v-for="(content, index) in notice.rows" :key="index">
      <ImageBox
        v-if="content.notice_content.content_type === 'image'"
        :src="content.notice_content.image_content"
      />
      <p
        v-if="content.notice_content.content_type === 'text'"
        style="
          margin-left: 0px;
          margin-right: 0px;
          margin-top: 5px;
          margin-bottom: 5px;
        "
      >
        {{ content.notice_content.text_content }}
      </p>
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
  margin-bottom: 20px;
  position: relative;
}
</style>

<template>
  <el-row>
    <el-button
      type="primary"
      @click="noticeDialogVisible = true"
      v-if="isTeacher"
      style="margin-bottom: 20px"
    >
      发布通知
    </el-button>
  </el-row>

  <el-skeleton :rows="3" animated v-if="isLoaded === false" />
  <el-empty
    description="没有课程"
    :image-size="100"
    v-if="noticeList.length === 0 && isLoaded === true"
  />
  <el-row v-if="isLoaded" gutter="20">
    <el-col
      :xs="24"
      :sm="12"
      :md="8"
      v-for="(notice, index) in noticeList"
      :key="index"
      :span="8"
      style="position: relative; display: flex; flex-direction: column"
    >
      <el-button
        type="text"
        @click="deleteNotification(notice)"
        v-if="isTeacher && notice.sender === myUserId"
        style="position: absolute; right: 25px; top: 15px; z-index: 1000"
      >
        删除
      </el-button>
      <el-button
        type="text"
        @click="editNotification(notice)"
        v-if="isTeacher && notice.sender === myUserId"
        style="position: absolute; right: 65px; top: 15px; z-index: 1000"
      >
        编辑
      </el-button>
      <NoticeCard :notice="notice" :class="notice" />
    </el-col>
  </el-row>

  <el-dialog title="添加通知" v-model="noticeDialogVisible" width="40%">
    <NoticeDialog @close-dialog="closeNoticeDialog" />
  </el-dialog>
</template>

<script>
import { userAPI, noticeAPI, classAPI } from "@/utils/api";
import { toRaw } from "vue";
import { ElCard, ElRow, ElCol, ElDivider } from "element-plus";
import { ElButton, ElDialog, ElMessage } from "element-plus";
import NoticeDialog from "./NoticeDialog.vue";
import NoticeCard from "./NoticeCard.vue";

export default {
  name: "NotificationPage",
  components: {
    ElRow,
    ElCol,
    NoticeDialog,
    ElButton,
    ElDialog,
    NoticeCard,
  },

  data() {
    return {
      noticeDialogVisible: false,
      isTeacher: userAPI.getRole() === "teacher",
      classList: [],
      noticeList: [],
      myUserId: userAPI.getUserId(),
      isLoaded: false,
    };
  },
  methods: {
    async closeNoticeDialog() {
      console.log("关闭通知对话框");
      this.noticeDialogVisible = false;
      await this.fetchNotices();
    },

    async fetchNotices() {
      this.classList = [];
      this.noticeList = [];

      const result = await classAPI.getClassList();
      console.log("classList", result);
      if (result.success) {
        this.classList = result.data;
      } else {
        ElMessage.error("获取班级列表失败");
        return;
      }

      for (let i = 0; i < this.classList.length; i++) {
        const result = await noticeAPI.getNotices(this.classList[i].class_id);
        if (result.success) {
          for (let j = 0; j < result.data.length; j++) {
            result.data[j].class_info = this.classList[i];
          }
          this.noticeList.push(...result.data);
        } else {
          ElMessage.error("获取通知失败");
        }
      }
    },
    async deleteNotification(notice) {
      // 在这里添加删除通知的逻辑
      console.log("删除通知:", notice);
      const result = await noticeAPI.deleteNotice(notice.id);
      console.log(result);
      if (result.success) {
        console.log("删除成功");
        this.fetchNotices();
      } else {
        console.log("删除失败");
      }
    },
  },
  async mounted() {
    await this.fetchNotices();
    this.isLoaded = true;
    console.log("classList", this.classList);
    console.log("noticeList", this.noticeList);
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

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
      v-for="notice in noticeList"
      :key="notice.id"
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
        @click="notice.noticeEditDialogVisible = true"
        v-if="isTeacher && notice.sender === myUserId"
        style="position: absolute; right: 65px; top: 15px; z-index: 1000"
      >
        编辑
      </el-button>
      <NoticeCard :notice="notice" :class="notice" />
      <el-dialog
        title="编辑通知"
        v-model="notice.noticeEditDialogVisible"
        width="40%"
        @close="fetchNotices"
      >
        <NoticeDialog
          :class_id="notice.class_info.class_id"
          :notice="notice"
          @close-dialog="notice.noticeEditDialogVisible = false"
          v-if="notice.noticeEditDialogVisible"
        />
      </el-dialog>
    </el-col>
  </el-row>

  <el-dialog
    title="添加通知"
    v-model="noticeDialogVisible"
    width="40%"
    @close="fetchNotices"
  >
    <NoticeDialog
      @close-dialog="noticeDialogVisible = false"
      v-if="noticeDialogVisible"
    />
  </el-dialog>
</template>

<script>
import { userAPI, noticeAPI, classAPI, courseAPI } from "@/utils/api";
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
    async fetchNotices() {
      this.isLoaded = false;
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
          this.noticeList.push(...result.data);
        } else {
          ElMessage.error("获取通知失败");
        }

        //获取实验室id
        //TODO 然后加到list
        const labResult = await classAPI.getLocations(
          this.classList[i].class_id
        );
        console.log("labResult", labResult);
        if (labResult.success) {
          if (labResult.data.length != 0) {
            this.classList[i].lab_id = labResult.data[0].lab_id;
            const labNoticeResult = await noticeAPI.getNotices(
              undefined,
              this.classList[i].lab_id
            );
            if (labNoticeResult.success) {
              console.log("labNoticeResult", labNoticeResult);
              this.noticeList.push(...labNoticeResult.data);
            } else {
              ElMessage.error("获取通知失败");
            }
          }
        } else {
          ElMessage.error("获取实验室失败");
        }

        for (let j = 0; j < this.noticeList.length; j++) {
          this.noticeList[j].class_info = this.classList[i];

          const result2 = await courseAPI.getCourseFromClass(
            this.noticeList[j].class_info.class_id
          );
          console.log("result2", result2);
          if (result2.success) {
            if (result2.data.length === 0) {
              ElMessage.error("获取课程失败");
              continue;
            }
            this.noticeList[j].class_info.course_code =
              result2.data[0].course_code;
            this.noticeList[j].class_info.course_sequence =
              result2.data[0].course_sequence;
          } else {
            ElMessage.error("获取课程失败");
          }

          const result3 = await courseAPI.getCourse(
            this.noticeList[j].class_info.course_code,
            this.noticeList[j].class_info.course_sequence
          );
          console.log("result3", result3);
          if (result3.success) {
            if (result3.data.length === 0) {
              ElMessage.error("获取课程失败");
              continue;
            }
            this.noticeList[j].class_info.course_id = result3.data[0].id;
          } else {
            ElMessage.error("获取课程失败");
          }

          console.log("result.data[j].class_info", result.data[j]);
          //TODO 优化逻辑
        }
      }
      this.isLoaded = true;
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

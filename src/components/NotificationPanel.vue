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
      :sm="16"
      :md="8"
      v-for="notice in noticeList"
      :key="notice.id"
      style="
        position: relative;
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
      "
    >
      <NoticeCard :notice="notice" :class="notice" />
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
      if (result.success) {
        this.classList = result.data;
      } else {
        ElMessage.error("获取班级列表失败");
        return;
      }

      const noticePromises = this.classList.map(async (classItem) => {
        let classNoticeList = [];
        const result = await noticeAPI.getNotices(classItem.class_id);
        if (result.success) {
          classNoticeList.push(...result.data);
        } else {
          ElMessage.error("获取通知失败");
        }

        const labResult = await classAPI.getLocations(classItem.class_id);
        if (labResult.success) {
          if (labResult.data.length != 0) {
            classItem.lab_id = labResult.data[0].lab_id;
            const labNoticeResult = await noticeAPI.getNotices(
              undefined,
              classItem.lab_id
            );
            if (labNoticeResult.success) {
              classNoticeList.push(...labNoticeResult.data);
            } else {
              ElMessage.error("获取通知失败");
            }
          }
        } else {
          ElMessage.error("获取实验室失败");
        }

        for (const notice of classNoticeList) {
          notice.class_info = classItem;
        }

        //会有一些重复的notice，因为他们在一样的实验室。但是我们这里根据课程来呈现，所以不需要去重
        let courseInfo = {};
        const result2 = await courseAPI.getCourseFromClass(classItem.class_id);
        if (result2.success) {
          if (result2.data.length === 0) {
            ElMessage.error("获取课程失败");
            return;
          }
          courseInfo = {
            course_code: result2.data[0].course_code,
            course_sequence: result2.data[0].course_sequence,
          };
        } else {
          ElMessage.error("获取课程失败");
        }

        const result3 = await courseAPI.getCourse(
          courseInfo.course_code,
          courseInfo.course_sequence
        );
        if (result3.success) {
          if (result3.data.length === 0) {
            ElMessage.error("获取课程失败");
            return;
          }
          courseInfo.course_id = result3.data[0].id;
        } else {
          ElMessage.error("获取课程失败");
        }

        for (const notice of classNoticeList) {
          notice.class_info.course_code = courseInfo.course_code;
          notice.class_info.course_sequence = courseInfo.course_sequence;
          notice.class_info.course_id = courseInfo.course_id;
        }

        this.noticeList.push(...classNoticeList);
      });

      await Promise.all(noticePromises);

      //sort by time
      this.noticeList.sort((a, b) => {
        return new Date(b.post_time) - new Date(a.post_time);
      });
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
  },
};
</script>

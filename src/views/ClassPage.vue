<template>
  <div class="class-panel">
    <div class="class-buttoms">
      <el-button type="primary" class="go-back-btn" @click="goBack">
        返回
      </el-button>
      <el-button type="primary" v-if="isTeacher" @click="openCopyDialog">
        复制课堂
      </el-button>
      <el-button type="primary" v-if="isTeacher" @click="openStudentDialog">
        查看学生
      </el-button>
    </div>

    <el-dialog title="复制课堂" v-model="copyDialogVisible" width="40%">
      <el-table :data="copyList" border style="width: 100%">
        <el-table-column fixed prop="id" label="课程ID"></el-table-column>
        <el-table-column prop="name" label="课程名"></el-table-column>
        <el-table-column prop="date" label="开课时间"></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template v-slot="slotProps">
            <el-button
              @click="handleRowClickView(slotProps.row)"
              type="text"
              size="small"
              >查看</el-button
            >
            <el-button
              @click="handleRowClickCopy(slotProps.row)"
              type="text"
              size="small"
              >复制</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="dialog-footer">
        <el-button @click="copyDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="上课学生" v-model="studentDialogVisible" width="40%">
      <el-button type="primary" @click="fetchEnrolledStudents">刷新</el-button>
      <el-table
        :data="studentList"
        border
        style="width: 100%"
        v-if="isEnrolledStudentsLoaded"
      >
        <el-table-column fixed prop="student_id" label="学号"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="department" label="院系"></el-table-column>
      </el-table>
      <el-skeleton
        :rows="3"
        animated
        v-if="!isEnrolledStudentsLoaded"
      ></el-skeleton>
      <div class="dialog-footer">
        <el-button @click="studentDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <div class="header-box">
      <div class="info-section">
        <el-button
          v-if="isTeacher"
          type="primary"
          class="edit-button"
          @click="openBasicDialog"
        >
          编辑基本信息
        </el-button>

        <div class="class-title">
          <h2>{{ this.basicInfo.class_name }}</h2>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">
              <i class="el-icon-user"></i>
              教师
            </div>
            <div class="info-content">
              {{ this.basicInfo.teachers_str }}
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="el-icon-time"></i>
              上课时间
            </div>
            <div class="info-content">
              <DateBox
                :dateStr="this.basicInfo.date"
                v-if="this.basicInfo.date"
              />
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="el-icon-location"></i>
              地点
            </div>
            <div class="info-content">
              <el-tooltip
                effect="dark"
                content="点击查看实验室详情"
                placement="top"
                v-if="basicInfo.lab_id"
              >
                <router-link
                  :to="{ path: '/lab/' + this.basicInfo.lab_id }"
                  style="cursor: pointer"
                >
                  {{ this.basicInfo.lab_name }}
                </router-link>
              </el-tooltip>
              <span v-else>{{ basicInfo.lab_name }}</span>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="el-icon-document"></i>
              概览
            </div>
            <div class="info-content">
              {{ this.basicInfo.overview || "这里是课程的概览" }}
            </div>
          </div>
        </div>
      </div>
      <div class="map-section">
        <p class="map-text" v-if="basicInfo.lab_id">实验室地图</p>
        <el-image
          v-if="basicInfo.map_image"
          :src="basicInfo.map_image"
          fit="contain"
          class="lab-map-image"
          :preview-src-list="[basicInfo.map_image]"
        ></el-image>
        <div v-else class="no-map">暂无地图</div>
      </div>
    </div>
    <!-- 编辑对话框 -->
    <el-dialog title="编辑基本信息" v-model="basicDialogVisible" width="40%">
      <el-form
        :model="basicForm"
        label-width="80px"
        :rules="basicRules"
        ref="basicForm"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="basicForm.class_name"></el-input>
        </el-form-item>
        <el-form-item label="课程ID" prop="id">
          <el-tooltip
            class="item"
            effect="dark"
            content="不可修改"
            placement="top"
          >
            <el-input v-model="basicForm.class_id" :disabled="true"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="教师" prop="teachers">
          <el-tooltip
            class="item"
            effect="dark"
            content="联系教务修改"
            placement="top"
          >
            <el-input
              v-model="basicForm.teachers_str"
              :disabled="true"
            ></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="上课时间" prop="date">
          <el-date-picker
            v-model="basicForm.date"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-select
            v-model="basicForm.lab_id"
            placeholder="选择地点"
            style="width: 100%"
          >
            <el-option
              v-for="lab in labs"
              :key="lab.id"
              :label="lab.name"
              :value="lab.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-tooltip
            class="item"
            effect="dark"
            content="根据实验内容自动生成"
            placement="top"
          >
            <el-input v-model="basicForm.tags" :disabled="true"></el-input>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <!-- 自定义底部按钮 -->
      <div class="dialog-footer">
        <el-button @click="basicDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBasicForm">保存</el-button>
      </div>
    </el-dialog>

    <div class="box">
      <h3>通知</h3>
      <el-button
        v-if="isTeacher"
        type="primary"
        class="card-btn"
        style="position: absolute; top: 20px; right: 20px"
        @click="noticeDialogVisible = true"
      >
        添加通知
      </el-button>
      <el-skeleton :rows="3" animated v-if="!noticeLoaded" />
      <p
        v-if="noticeList.length === 0 && noticeLoaded"
        style="text-align: center; color: #ccc; padding: 20px"
      >
        暂无通知
      </p>
      <el-row gutter="20">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          v-for="notice in noticeList"
          :key="notice.id"
          :span="8"
          style="
            position: relative;
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
          "
          class="notice-item"
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
          <NoticeCard :notice="notice" />
          <el-dialog
            title="编辑通知"
            v-model="notice.noticeEditDialogVisible"
            width="40%"
            @close="fetchNotices"
          >
            <NoticeDialog
              :class_id="class_id"
              :notice="notice"
              @close-dialog="closeEditNoticeDialog(notice)"
              v-if="notice.noticeEditDialogVisible"
            />
          </el-dialog>
        </el-col>
      </el-row>
    </div>
    <el-dialog title="添加通知" v-model="noticeDialogVisible" width="40%">
      <NoticeDialog
        :class_id="class_id"
        @close-dialog="closeNoticeDialog"
        v-if="noticeDialogVisible"
      />
    </el-dialog>

    <div class="box">
      <h3>实验内容</h3>

      <el-skeleton :rows="5" animated v-if="!experimentLoaded" />
      <p
        v-if="experimentList.length === 0 && experimentLoaded"
        style="text-align: center; color: #ccc; padding: 20px"
      >
        暂无实验
      </p>

      <el-button
        v-if="isTeacher"
        type="primary"
        class="card-btn"
        style="position: absolute; top: 20px; right: 20px"
        @click="openExperimentDialog(null, null)"
      >
        添加内容
      </el-button>
      <div
        v-for="(experiment, index) in experimentList"
        :key="experiment.id"
        class="experiment-item"
      >
        <el-button
          v-if="isTeacher"
          type="primary"
          class="edit-btn"
          style="position: absolute; top: 20px; right: 20px; z-index: 1000"
          @click="openExperimentDialog(index, experiment)"
          >编辑</el-button
        >
        <el-button
          v-if="isTeacher"
          type="danger"
          class="edit-btn"
          style="position: absolute; top: 70px; right: 20px; z-index: 1000"
          @click="deleteExperiment(experiment)"
          >删除</el-button
        >
        <ExperimentCard :experiment="experiment" :index="index" />
      </div>
    </div>
    <el-dialog
      title="添加实验内容"
      v-model="experimentDialogVisible"
      width="80%"
      @close="fetchExperiments"
    >
      <ExperimentDialog
        @close-dialog="experimentDialogVisible = false"
        :input_experiment="experimentForm"
        :class_id="basicInfo.class_id"
        v-if="experimentDialogVisible"
      />
    </el-dialog>

    <div class="header-box" style="display: flex; flex-direction: column">
      <h3>评论区</h3>

      <el-skeleton :rows="3" animated v-if="!commentLoaded" />
      <p
        v-if="commentList.length === 0 && commentLoaded"
        style="text-align: center; color: #ccc"
      >
        暂无讨论
      </p>

      <div class="comment-list" v-if="commentLoaded">
        <div
          v-for="(comment, index) in commentList"
          :key="index"
          class="comment-item"
        >
          <UserCard :userId="comment.sender_id" />
          <div class="comment-details">
            {{ comment.content }}
            <DateBox
              :dateStr="comment.sent_time"
              :textColor="'#666'"
              :fontSize="'12px'"
            />
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
    </div>
  </div>
</template>

<script>
import { classAPI, labAPI, userAPI, noticeAPI, courseAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import { stringifyQuery, useRouter } from "vue-router";
import UserCard from "@/components/UserCard.vue";
import NoticeCard from "@/components/NoticeCard.vue";
import NoticeDialog from "@/components/NoticeDialog.vue";
import DateBox from "@/components/DateBox.vue";
import ExperimentDialog from "@/components/ExperimentDialog.vue";
import ExperimentCard from "@/components/ExperimentCard.vue";

export default {
  name: "ClassPage",
  props: {
    classId: {
      type: Number,
      required: true,
    },
    courseId: {
      type: Number,
      required: true,
    },
  },
  components: {
    UserCard,
    NoticeCard,
    NoticeDialog,
    DateBox,
    ExperimentDialog,
    ExperimentCard,
  },
  data() {
    return {
      labs: [],
      basicInfo: {
        class_name: "",
        class_id: "",
        teacher_ids: [],
        teacher_names: [],
        teachers_str: "",
        date: "",
        lab_id: "",
        lab_name: "",
        map_image: "",
        tags: [],
      },

      basicForm: {
        class_name: "",
        class_id: Number,
        teachers_str: "",
        date: "",
        lab_name: "",
        lab_id: Number,
        tags: [],
      },

      experimentForm: {
        title: "",
        estimated_time: "",
        safety_tags: [],
        experiment_method_tags: [],
        submission_type_tags: [],
        other_tags: [],
        description: "",
        images: [],
        files: [],
      },
      experimentDialogVisible: false,
      noticeDialogVisible: false,
      basicDialogVisible: false,
      studentDialogVisible: false,
      copyDialogVisible: false,
      isLocationEditing: false,
      isEnrolledStudentsLoaded: false,
      isTeacher: localStorage.getItem("role") === "teacher",
      class_id: Number(this.classId),
      course_id: Number(this.courseId),
      name: "",
      date: "",
      newComment: "",
      teacherNames: [],
      teacherIds: [],
      location: "",
      userLookup: {},
      commentList: [],
      studentList: [],
      experimentList: [],
      copyList: [],
      noticeList: [],
      noticeLoaded: false,
      experimentLoaded: false,
      commentLoaded: false,
      myUserId: userAPI.getUserId(),
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
  async mounted() {
    console.log("classiid:", this.class_id, this.course_id);
    await this.fetchClassBasicInfo();
    await this.fetchComments();
    await this.fetchNotices();
    await this.fetchExperiments();
    console.log("basic:", this.basicInfo);
    //TODO
  },
  methods: {
    async closeExperimentDialog() {
      console.log("关闭通知对话框");
      this.experimentDialogVisible = false;
      //await this.
    },
    async deleteExperiment(experiment) {
      console.log("删除实验:", experiment);
      const result = await classAPI.deleteExperiment(experiment.id);
      if (result.success) {
        console.log("删除成功");
        await this.fetchExperiments();
      } else {
        console.log("删除失败");
      }
    },
    async closeNoticeDialog() {
      console.log("关闭通知对话框");
      this.noticeDialogVisible = false;
      await this.fetchNotices();
    },
    closeEditNoticeDialog(notice) {
      console.log("关闭通知对话框");
      notice.noticeEditDialogVisible = false;
      //this.fetchNotices();
    },
    async deleteNotification(notice) {
      // 在这里添加删除通知的逻辑
      console.log("删除通知:", notice);
      const result = await noticeAPI.deleteNotice(notice.id);
      console.log(result);
      if (result.success) {
        console.log("删除成功");
        await this.fetchNotices();
      } else {
        console.log("删除失败");
      }
    },
    handleRowClickView(row) {
      console.log("查看", row);
    },
    handleRowClickCopy(row) {
      console.log("复制", row);
    },
    openCopyDialog() {
      this.copyDialogVisible = true;
      this.copyList = [
        {
          id: "2021000000",
          name: "计算机网络",
          date: "2021-09-01",
        },
        {
          id: "2021000001",
          name: "软件工程",
          date: "2021-09-01",
        },
        {
          id: "2021000002",
          name: "信息安全",
          date: "2021-09-01",
        },
      ];
      //copyList = [];
      //TODO
    },
    openStudentDialog() {
      this.studentDialogVisible = true;
      if (this.isEnrolledStudentsLoaded === false) {
        this.fetchEnrolledStudents();
      }
    },
    openExperimentDialog(index, experiment) {
      if (index == null && experiment == null) {
        this.experimentForm = {
          title: "",
          estimated_time: "",
          safety_tags: [],
          experiment_method_tags: [],
          submission_type_tags: [],
          other_tags: [],
          description: "",
          images: [],
          files: [],
        };
      } else {
        this.experimentForm = { ...experiment };
      }
      console.log("open experiment dialog", index, experiment);
      this.experimentDialogVisible = true;
    },
    async submitBasicForm() {
      console.log("submit basic form");
      console.log(this.basicForm);
      this.basicDialogVisible = false;
      classAPI
        .patchClass(
          this.class_id,
          this.basicForm.class_name,
          this.basicForm.date
        )
        .then((response) => {
          if (response.success) {
            ElMessage.success("修改成功");
            this.fetchClassBasicInfo();
          } else {
            ElMessage.error("修改失败");
          }
        });

      if (this.basicForm.lab_id != this.basicInfo.lab_id) {
        if (this.basicInfo.lab_id != "") {
          const deleteResult = await classAPI.deleteLocation(
            this.class_id,
            this.basicInfo.lab_id
          );
          if (deleteResult.success) {
            console.log("删除地点成功");
          } else {
            ElMessage.error("删除地点失败");
            return;
          }
        }
        if (this.basicForm.lab_id != "") {
          const addResult = await classAPI.postLocation(
            this.class_id,
            this.basicForm.lab_id
          );
          if (addResult.success) {
            ElMessage.success("成功");
            console.log("添加地点成功");
          } else {
            ElMessage.error("添加地点失败");
          }
        }
      }
    },
    async fetchLabs() {
      const result = await labAPI.getLabs(); // 获取地点的 API
      if (result.success) {
        this.labs = result.data; // 假设返回的数据结构是 { success: true, data: [...] }
      } else {
        ElMessage.error("加载地点失败");
      }
    },
    async openBasicDialog() {
      await this.fetchLabs();
      this.basicForm = { ...this.basicInfo };
      this.basicDialogVisible = true;
    },

    async fetchClassBasicInfo() {
      this.basicInfo.class_id = Number(this.class_id);
      const result1 = await classAPI.getClass(this.class_id); // 获取课程信息的 API
      if (result1.success) {
        if (result1.data.length === 0) {
          ElMessage.error("课程不存在");
          this.$router.push("/");
        } else {
          this.basicInfo.class_name = result1.data[0].name;
          this.basicInfo.date = result1.data[0].start_time;
        }
      } else {
        ElMessage.error("获取课程信息失败");
      }

      this.basicInfo.teacher_ids = [];
      this.basicInfo.teacher_names = [];
      const result2 = await classAPI.getTeachers(this.class_id); // 获取教师信息的 API
      console.log("教师信息:", result2);
      if (result2.success) {
        if (result2.data.length === 0) {
          this.basicInfo.teachers_str = "未知";
        } else {
          this.basicInfo.teacher_ids = result2.data.map(
            (item) => item.teacher_id
          );
          for (let i = 0; i < this.basicInfo.teacher_ids.length; i++) {
            const result = await userAPI.getUserInfo(
              this.basicInfo.teacher_ids[i]
            );
            if (result.success) {
              console.log("教师信息:", result.data[0]);
              this.basicInfo.teacher_names.push(result.data[0].real_name);
            } else {
              ElMessage.error("获取教师信息失败");
            }
          }
          console.log("教师们信息:", this.basicInfo.teacher_names);
          this.basicInfo.teachers_str = this.basicInfo.teacher_names.join(" ");
        }
      } else {
        ElMessage.error("获取教师信息失败");
      }

      const result3 = await classAPI.getLocations(this.class_id); // 获取地点信息的 API
      if (result3.success) {
        if (result3.data.length === 0) {
          this.basicInfo.lab_name = "未知";
        } else {
          this.basicInfo.lab_id = result3.data[0].lab_id;
          const result = await labAPI.getLabs(this.basicInfo.lab_id);
          console.log("地点信息!!!:", result);
          if (result.success) {
            this.basicInfo.lab_name = result.data[0].name;
            this.basicInfo.map_image = result.data[0].map_image;
          } else {
            ElMessage.error("获取地点信息失败");
          }
        }
      } else {
        ElMessage.error("获取地点信息失败");
      }

      console.log("basic info:", this.basicInfo);
    },

    async fetchComments() {
      this.commentLoaded = false;
      this.commentList = [];
      const result = await classAPI.getComments(this.class_id);
      console.log("评论内容:", result);
      if (result.success) {
        this.commentList = result.data;
      } else {
        ElMessage.error("获取评论失败");
      }
      this.commentLoaded = true;
    },

    submitComment() {
      if (this.newComment.trim() === "") return;

      classAPI.postComment(this.class_id, this.newComment).then((response) => {
        if (response.success) {
          this.newComment = "";
          ElMessage.success("评论成功");
          this.fetchComments();
        } else {
          ElMessage.error("评论失败");
        }
      });
    },

    async fetchNotices() {
      this.noticeLoaded = false;
      this.noticeList = [];
      const result = await noticeAPI.getNotices(this.class_id);
      if (result.success) {
        this.noticeList = result.data;
        console.log("通知??!!:", this.noticeList);
      } else {
        ElMessage.error("获取通知失败");
      }

      if (this.basicInfo.lab_id) {
        const result2 = await noticeAPI.getNotices(
          undefined,
          this.basicInfo.lab_id
        );
        if (result2.success) {
          this.noticeList.push(...result2.data);
          console.log("lab 通知??!!:", this.noticeList);
        } else {
          ElMessage.error("获取通知失败");
        }
      }
      this.noticeLoaded = true;
    },

    async fetchExperiments() {
      this.experimentLoaded = false;
      this.experimentList = [];
      const result = await classAPI.getExperiments(this.class_id);
      console.log("实验内容:", result);
      if (result.success) {
        this.experimentList = result.data;
        for (let i = 0; i < this.experimentList.length; i++) {
          const safety_tags = this.experimentList[i].safety_tags.split(",");
          this.experimentList[i].safety_tags = safety_tags;
          const experiment_method_tags =
            this.experimentList[i].experiment_method_tags.split(",");
          this.experimentList[i].experiment_method_tags =
            experiment_method_tags;
          const submission_type_tags =
            this.experimentList[i].submission_type_tags.split(",");
          this.experimentList[i].submission_type_tags = submission_type_tags;
          const other_tags = this.experimentList[i].other_tags.split(",");
          this.experimentList[i].other_tags = other_tags;
        }
      } else {
        ElMessage.error("获取实验内容失败");
      }
      this.experimentLoaded = true;
    },

    async fetchEnrolledStudents() {
      this.isEnrolledStudentsLoaded = false;
      const result = await courseAPI.getEnroll(this.course_id);
      if (result.success) {
        console.log("students!!", result.data);
        this.studentList = result.data;
        for (let i = 0; i < this.studentList.length; i++) {
          const result = await userAPI.getUserInfo(
            this.studentList[i].student_id
          );
          if (result.success) {
            console.log("学生信息:", result.data[0]);
            this.studentList[i].name = result.data[0].real_name;
            this.studentList[i].department = result.data[0].department;
          } else {
            ElMessage.error("获取学生信息失败");
          }
        }
      } else {
        ElMessage.error("获取学生失败");
      }
      this.isEnrolledStudentsLoaded = true;
    },
  },
};
</script>

<style scoped>
.map-section {
  width: 300px;
  padding: 20px;
}

.map-text {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.lab-map-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.no-map {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #909399;
  border-radius: 4px;
  font-size: 14px;
}
.header-box {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  gap: 24px;
}

.info-section {
  position: relative;
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.map-section {
  width: 500px;
  padding-left: 24px;
  border-left: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.map-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}
.map-section h4 {
  align-self: flex-start;
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 16px;
}

.lab-map {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 4px;
}
.edit-button {
  position: absolute;
  top: 0;
  right: 0;
}

.class-title {
  margin-bottom: 24px;
  padding-right: 120px;
}

.class-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.info-item:hover {
  background-color: #f2f6fc;
}

.info-label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-content {
  flex: 1;
  color: #303133;
}

.lab-link {
  cursor: pointer;
  color: #409eff;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.lab-link:hover {
  color: #66b1ff;
}

@media (max-width: 768px) {
  .header-box {
    flex-direction: column;
  }

  .map-section {
    width: 100%;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #dcdfe6;
    padding-top: 24px;
  }

  .info-grid {
    gap: 12px;
  }

  .info-item {
    flex-direction: column;
  }

  .info-label {
    width: 100%;
    margin-bottom: 8px;
  }
}
.class-panel {
  padding: 20px;
}

.class-buttoms {
  margin-bottom: 20px;
}

.box {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  position: relative;
}

.header-box {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.experiment-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
}

.experiment-item:last-child {
  margin-bottom: 0;
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

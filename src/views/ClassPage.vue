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
          @click="openBasicDialog"
        >
          编辑基本信息
        </el-button>
        <h2>{{ this.basicInfo.class_name }}</h2>
        <p><strong>课程ID:</strong> {{ this.basicInfo.class_id }}</p>
        <p><strong>教师:</strong> {{ this.basicInfo.teachers_str }}</p>
        <p><strong>上课时间:</strong> {{ this.basicInfo.date }}</p>
        <p><strong>地点:</strong> {{ this.basicInfo.lab_name }}</p>
        <p><strong>概览:</strong> 这里是课程的概览</p>
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

    <el-card class="card">
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
      <el-row gutter="20">
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
    </el-card>
    <el-dialog title="添加通知" v-model="noticeDialogVisible" width="40%">
      <NoticeDialog
        :class_id="class_id"
        @close-dialog="closeNoticeDialog"
        v-if="noticeDialogVisible"
      />
    </el-dialog>

    <el-card class="card">
      <h3>实验内容</h3>
      <el-button
        v-if="isTeacher"
        type="primary"
        class="card-btn"
        style="position: absolute; top: 20px; right: 20px"
        @click="experimentDialogVisible = true"
      >
        添加内容
      </el-button>
      <el-divider></el-divider>
      <div
        v-for="(experiment, index) in experimentInfos"
        :key="index"
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
              v-for="(tag, i) in experiment.experimentTags"
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
            <strong>作业形式：</strong>
            <el-tag
              v-for="(tag, i) in experiment.assignmentTags"
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
    <el-dialog
      title="添加实验内容"
      v-model="experimentDialogVisible"
      width="40%"
      @close="resetExperimentForm"
    >
      <el-form :model="experimentForm" label-width="80px" ref="experimentForm">
        <el-form-item label="实验名称" prop="title">
          <el-input v-model="experimentForm.title"></el-input>
        </el-form-item>
        <el-form-item label="预估时间" prop="estimatedTime">
          <el-input v-model="experimentForm.estimatedTime"></el-input>
        </el-form-item>
        <el-form-item label="安全标签" prop="safetyTags">
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in experimentForm.safetyTags"
              :key="index"
              closable
              @close="removeTag('safetyTags', index)"
            >
              {{ tag }}
            </el-tag>
          </div>
          <el-checkbox-group v-model="experimentForm.safetyTags">
            <el-checkbox label="明火"></el-checkbox>
            <el-checkbox label="腐蚀性试剂"></el-checkbox>
            <el-checkbox label="高温"></el-checkbox>
            <el-checkbox label="有毒气体"></el-checkbox>
            <el-checkbox label="易燃"></el-checkbox>
          </el-checkbox-group>
          <el-input
            v-model="newSafetyTag"
            placeholder="输入新标签"
            @keyup.enter="addTag('safetyTags')"
          ></el-input>
        </el-form-item>
        <el-form-item label="实验方式" prop="experimentTags">
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in experimentForm.experimentTags"
              :key="index"
              closable
              @close="removeTag('experimentTags', index)"
            >
              {{ tag }}
            </el-tag>
          </div>
          <el-checkbox-group v-model="experimentForm.experimentTags">
            <el-checkbox label="个人"></el-checkbox>
            <el-checkbox label="小组"></el-checkbox>
            <el-checkbox label="全班"></el-checkbox>
            <el-checkbox label="其他"></el-checkbox>
          </el-checkbox-group>
          <el-input
            v-model="newExperimentTag"
            placeholder="输入新标签"
            @keyup.enter="addTag('experimentTags')"
          ></el-input>
        </el-form-item>
        <el-form-item label="作业形式" prop="assignmentTags">
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in experimentForm.assignmentTags"
              :key="index"
              closable
              @close="removeTag('assignmentTags', index)"
            >
              {{ tag }}
            </el-tag>
          </div>
          <el-checkbox-group v-model="experimentForm.assignmentTags">
            <el-checkbox label="纸质报告"></el-checkbox>
            <el-checkbox label="上交产物"></el-checkbox>
            <el-checkbox label="口头报告"></el-checkbox>
          </el-checkbox-group>
          <el-input
            v-model="newAssignmentTag"
            placeholder="输入新标签"
            @keyup.enter="addTag('assignmentTags')"
          ></el-input>
        </el-form-item>
        <el-form-item label="其他标签" prop="otherTags">
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in experimentForm.otherTags"
              :key="index"
              closable
              @close="removeTag('otherTags', index)"
            >
              {{ tag }}
            </el-tag>
          </div>
          <el-checkbox-group v-model="experimentForm.otherTags">
            <el-checkbox label="注意通风"></el-checkbox>
            <el-checkbox label="无特殊要求"></el-checkbox>
          </el-checkbox-group>
          <el-input
            v-model="newOtherTag"
            placeholder="输入新标签"
            @keyup.enter="addTag('otherTags')"
          ></el-input>
        </el-form-item>
        <el-form-item label="实验描述" prop="description">
          <el-input
            type="textarea"
            v-model="experimentForm.description"
            :autosize="{ minRows: 2, maxRows: 6 }"
          ></el-input>
        </el-form-item>
      </el-form>
      <!-- 自定义底部按钮 -->
      <div class="dialog-footer">
        <el-button @click="experimentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitExperimentForm">保存</el-button>
      </div>
    </el-dialog>

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
import { classAPI, labAPI, userAPI, noticeAPI, courseAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import UserCard from "@/components/UserCard.vue";
import NoticeCard from "@/components/NoticeCard.vue";
import NoticeDialog from "@/components/NoticeDialog.vue";

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
  },
  data() {
    return {
      newSafetyTag: "",
      newExperimentTag: "",
      newAssignmentTag: "",
      newOtherTag: "",
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
        estimatedTime: "",
        safetyTags: [],
        experimentTags: [],
        assignmentTags: [],
        otherTags: [],
        description: "",
        photos: [],
      },

      experimentInfos: [
        {
          title: "化学实验一",
          estimatedTime: "2小时",
          safetyTags: ["明火", "腐蚀性试剂"],
          experimentTags: ["个人"],
          assignmentTags: ["纸质报告"],
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
          experimentTags: ["小组"],
          assignmentTags: ["上交产物"],
          otherTags: ["无特殊要求"],
          description: "这是一项生物实验，需要小组合作。",
          photos: [],
        },
      ],
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
      copyList: [],
      noticeList: [],
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
    console.log("basic:", this.basicInfo);
    //TODO
  },
  methods: {
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
    addTag(tagType) {
      const tagKey = `new${
        tagType.charAt(0).toUpperCase() + tagType.slice(1, -1)
      }`;
      // 根据传入的标签类型判断
      if (this[tagKey].trim()) {
        this.experimentForm[tagType].push(this[tagKey].trim()); // 更新相应的标签数组
        this[tagKey] = ""; // 清空输入框
      }
    },

    // 通用的删除标签函数
    removeTag(tagType, index) {
      this.experimentForm[tagType].splice(index, 1); // 删除指定索引的标签
    },
    resetExperimentForm() {
      this.experimentForm = {
        title: "",
        estimatedTime: "",
        safetyTags: [],
        experimentTags: [],
        assignmentTags: [],
        otherTags: [],
        description: "",
        photos: [],
      };
    },
    submitExperimentForm() {
      console.log("submit experiment form");
      console.log(this.experimentForm);
      this.experimentDialogVisible = false;
      //TODO
    },
    openExperimentDialog(index, experiment) {
      console.log("open experiment dialog", index, experiment);
      this.experimentForm = { ...experiment };
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
          if (result.success) {
            this.basicInfo.lab_name = result.data[0].name;
          } else {
            ElMessage.error("获取地点信息失败");
          }
        }
      } else {
        ElMessage.error("获取地点信息失败");
      }

      console.log("basic info:", this.basicInfo);
    },

    fetchComments() {
      classAPI.getComments(this.class_id).then((response) => {
        if (response.success) {
          if (response.data.length === 0) {
            this.commentList = [];
          } else {
            this.commentList = response.data;
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
          this.newComment = "";
          ElMessage.success("评论成功");
          this.fetchComments();
        } else {
          ElMessage.error("评论失败");
        }
      });
    },

    async fetchNotices() {
      const result = await noticeAPI.getNotices(this.class_id);
      if (result.success) {
        this.noticeList = result.data;
        console.log("通知??!!:", this.noticeList);
      } else {
        ElMessage.error("获取通知失败");
      }
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

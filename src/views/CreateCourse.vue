<template>
  <div>
    <el-card class="form-block">
      <div class="form-block-title">
        <span>创建课程</span>
        <el-button
          @click="submitCourse"
          type="primary"
          size="small"
          :disabled="isCourseSubmitted"
        >
          提交
        </el-button>
      </div>

      <el-form-item label="课程名">
        <el-input
          v-model="courseData.course_name"
          placeholder="请输入课程名"
          :disabled="isCourseSubmitted"
        ></el-input>
      </el-form-item>
      <el-form-item label="课程号">
        <el-input
          v-model="courseData.course_code"
          placeholder="请输入课程号"
          :disabled="isCourseSubmitted"
        ></el-input>
      </el-form-item>
      <el-form-item label="课序号">
        <el-input
          v-model="courseData.course_sequence"
          placeholder="请输入课序号"
          :disabled="isCourseSubmitted"
        ></el-input>
      </el-form-item>
      <el-form-item label="开课院系">
        <el-input
          v-model="courseData.department"
          placeholder="请输入开课院系"
          :disabled="isCourseSubmitted"
        ></el-input>
      </el-form-item>
    </el-card>

    <el-card class="form-block">
      <div class="form-block-title">
        <span>已添加课堂</span>
        <el-button @click="openClassDialog" type="primary" size="small"
          >添加课堂</el-button
        >
      </div>
      <el-table :data="displayClassList" border style="width: 100%">
        <el-table-column fixed prop="date" label="日期"></el-table-column>
        <el-table-column prop="class_name" label="课堂名"></el-table-column>
        <el-table-column prop="lab_name" label="位置"></el-table-column>
        <el-table-column
          prop="teacher_names"
          label="授课教师"
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template v-slot="slotProps">
            <el-button
              @click="handleClassRowClick(slotProps.row)"
              type="text"
              size="small"
              :disabled="!isCourseSubmitted"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="form-block">
      <div class="form-block-title">
        <span>已添加学生</span>
        <el-button
          @click="openStudentDialog"
          type="primary"
          size="small"
          :disabled="!isCourseSubmitted"
          >添加学生</el-button
        >
      </div>
      <el-table :data="studentList" border style="width: 100%">
        <el-table-column prop="student_id" label="学号"></el-table-column>
        <el-table-column prop="student_name" label="姓名"></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template v-slot="slotProps">
            <el-button
              @click="handleStudentRowClick(slotProps.row)"
              type="text"
              size="small"
              :disabled="!isCourseSubmitted"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 提交按钮 -->
    <el-button @click="goBack" type="primary" :disabled="!isCourseSubmitted">
      完成创建
    </el-button>

    <!-- 添加课堂的对话框 -->
    <el-dialog
      title="添加课堂"
      v-model="classDialogVisible"
      width="800px"
      @close="resetClassForm"
    >
      <el-form :model="classFormData" ref="classForm">
        <el-form-item label="课堂名">
          <el-input
            v-model="classFormData.class_name"
            placeholder="请输入课堂名"
          ></el-input>
        </el-form-item>

        <el-form-item label="时间">
          <el-date-picker
            v-model="classFormData.date"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="地点">
          <el-select
            v-model="classFormData.lab_id"
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

        <el-form-item label="授课教师">
          <el-input
            v-model="teacherFormData.teacher_ids"
            placeholder="请输入学号，多个学号用逗号分隔"
          ></el-input>
        </el-form-item>
        <el-table :data="classFormData.teachers" border style="width: 100%">
          <el-table-column prop="teacher_id" label="学号"></el-table-column>
          <el-table-column prop="teacher_name" label="姓名"></el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template v-slot="slotProps">
              <el-button
                @click="handleTeacherDialogRowClick(slotProps.row)"
                type="text"
                size="small"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="fetchTeacherData">查询教师</el-button>
      </el-form>

      <template #footer>
        <el-button @click="classDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClass">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加学生的对话框 -->
    <el-dialog
      title="添加学生"
      v-model="studentDialogVisible"
      width="800px"
      @close="resetClassForm"
    >
      <!-- 输入学号文本框 -->
      <el-form :model="studentFormData" ref="studentForm">
        <el-form-item label="学号（以逗号分隔）">
          <el-input
            v-model="studentFormData.student_ids"
            placeholder="请输入学号，多个学号用逗号分隔"
          ></el-input>
        </el-form-item>

        <!-- 查询按钮 -->
        <el-button type="primary" @click="fetchStudentData">查询学生</el-button>
      </el-form>

      <!-- 显示学生信息的表格 -->
      <el-table :data="studentFormList" border style="width: 100%">
        <el-table-column prop="student_id" label="学号"></el-table-column>
        <el-table-column prop="student_name" label="姓名"></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template v-slot="slotProps">
            <el-button
              @click="handleStudentDialogRowClick(slotProps.row)"
              type="text"
              size="small"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStudents">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { courseAPI, labAPI, classAPI, userAPI } from "@/utils/api";
import { ElMessage, rowProps } from "element-plus";

export default {
  data() {
    return {
      courseData: {
        course_name: "",
        id: "",
        course_code: "",
        course_sequence: "",
        department: "",
      },
      classList: [],

      classFormData: {
        class_name: "",
        date: "",
        lab_id: "",
        teachers: [],
      },

      studentFormData: {
        student_ids: "",
      },

      studentFormList: [],

      studentList: [],

      teacherFormData: {
        teacher_ids: "",
      },

      labs: [], // 用来存储获取到的地点数据
      teachers: [], // 用来存储获取到的教师数据

      // 控制课堂对话框的显示
      studentDialogVisible: false,
      classDialogVisible: false,
    };
  },
  mounted() {
    this.fetchLabs();
  },
  methods: {
    async fetchLabs() {
      const result = await labAPI.getLabs(); // 获取地点的 API
      if (result.success) {
        console.log(result.data);
        this.labs = result.data; // 假设返回的数据结构是 { success: true, data: [...] }
      } else {
        ElMessage.error("加载地点失败");
      }
    },
    async fetchStudentData() {
      const studentIds = this.studentFormData.student_ids
        .split(",") // 按逗号分割
        .map((id) => id.trim()) // 去掉空格
        .filter((id) => id && /^\d+$/.test(id)) // 过滤掉空的值和非数字的值
        .filter((value, index, self) => self.indexOf(value) === index); // 过滤掉重复值

      // 调用后端 API 查询学号对应的姓名
      const students = [];
      for (let studentId of studentIds) {
        const result = await userAPI.getUserInfo(studentId); // 假设有一个 API 函数 `getStudentById`
        console.log("result", result);
        if (result.success && result.data.length > 0) {
          if (result.data[0].role === "student") {
            students.push({
              student_id: result.data[0].user_id,
              student_name: result.data[0].username, // 假设返回数据中有 `username` 字段
            });
          } else {
            students.push({
              student_id: studentId,
              student_name: "不是学生", // 如果没有找到学生，显示“未找到”
            });
          }
        } else {
          students.push({
            student_id: studentId,
            student_name: "未找到", // 如果没有找到学生，显示“未找到”
          });
        }
      }

      // 将查询到的学生信息添加到表格中
      this.studentFormList = [
        ...this.studentFormList,
        ...students.filter(
          (newStudent) =>
            !this.studentFormList.some(
              (existingStudent) =>
                existingStudent.student_id === newStudent.student_id
            )
        ),
      ];
      this.studentFormData.student_ids = ""; // 清空输入框
    },

    async fetchTeacherData() {
      const teacherIds = this.teacherFormData.teacher_ids
        .split(",") // 按逗号分割
        .map((id) => id.trim()) // 去掉空格
        .filter((id) => id && /^\d+$/.test(id)) // 过滤掉空的值和非数字的值
        .filter((value, index, self) => self.indexOf(value) === index); // 过滤掉重复值

      // 调用后端 API 查询学号对应的姓名
      const teachers = [];
      for (let teacherId of teacherIds) {
        const result = await userAPI.getUserInfo(teacherId); // 假设有一个 API 函数 `getStudentById`
        console.log("result", result);
        if (result.success && result.data.length > 0) {
          if (result.data[0].role === "teacher") {
            teachers.push({
              teacher_id: result.data[0].user_id,
              teacher_name: result.data[0].username, // 假设返回数据中有 `username` 字段
            });
          } else {
            teachers.push({
              teacher_id: teacherId,
              teacher_name: "不是教师", // 如果没有找到学生，显示“未找到”
            });
          }
        } else {
          teachers.push({
            teacher_id: teacherId,
            teacher_name: "未找到", // 如果没有找到学生，显示“未找到”
          });
        }
      }

      console.log("teachers??", this.classFormData.teacher_ids);

      // 将查询到的学生信息添加到表格中
      this.classFormData.teachers = [
        ...this.classFormData.teachers,
        ...teachers.filter(
          (newTeacher) =>
            !this.classFormData.teachers.some(
              (existingTeacher) =>
                existingTeacher.teacher_id === newTeacher.teacher_id
            )
        ),
      ];

      this.teacherFormData.teacher_ids = ""; // 清空输入框
    },

    async submitCourse() {
      const result = await courseAPI.postCourse(
        this.courseData.course_name,
        this.courseData.course_code,
        this.courseData.course_sequence,
        this.courseData.department
      );
      if (result.success === true) {
        ElMessage.success("提交成功");
        this.courseData.id = result.data.course.id;
        console.log("courseData", this.courseData);
      } else {
        ElMessage.error("提交失败");
      }
    },

    async submitClass() {
      console.log("课堂信息：", this.classFormData);

      const newClass = {
        class_name: this.classFormData.class_name,
        class_id: "",
        date: this.classFormData.date,
        lab_id: this.classFormData.lab_id,
        teachers: [],
      };

      //创建课堂
      const result = await classAPI.postClass(
        newClass.class_name,
        newClass.date
      );
      if (result.success) {
        ElMessage.success("提交成功");
        newClass.class_id = result.data.class.class_id;
        console.log("result", result);
      } else {
        ElMessage.error("提交失败");
        return;
      }

      //绑定课堂到课程
      const result2 = await courseAPI.postClassToCourse(
        newClass.class_id,
        this.courseData.course_code,
        this.courseData.course_sequence
      );
      if (result2.success) {
        ElMessage.success("提交成功");
      } else {
        ElMessage.error("提交失败");
        // TODO remove class
        return;
      }

      //绑定教师到课堂
      for (let i = 0; i < this.classFormData.teachers.length; i++) {
        const teacher = this.classFormData.teachers[i];

        const result3 = await classAPI.postTeacher(
          newClass.class_id,
          teacher.teacher_id
        );

        if (result3.success) {
          ElMessage.success("提交成功");
          newClass.teachers.push({
            teacher_id: teacher.teacher_id,
            teacher_name: teacher.teacher_name,
          });
        } else {
          ElMessage.error("提交失败");
          // 删除失败的教师
          this.classFormData.teachers.splice(i, 1);
          // 由于删除了当前项，i需要减去1来保证索引正确
          // TODO 需要测试
          i--;
        }
      }

      console.log("newClass", newClass);

      //绑定地点到课堂
      const result4 = await classAPI.postLocation(
        newClass.class_id,
        newClass.lab_id
      );
      if (result4.success) {
        ElMessage.success("提交成功");
      } else {
        ElMessage.error("提交失败");
        newClass.lab_id = "";
      }

      ElMessage.success("课堂已添加");
      this.classDialogVisible = false;

      this.classList.push(newClass); // 添加到课堂列表
      this.resetClassForm(); // 重置表单
      console.log("classList", this.classList);
    },
    async submitStudents() {
      const studentIds = this.studentFormList.map(
        (student) => student.student_id
      );
      const result = await courseAPI.postEnroll(
        studentIds,
        this.courseData.course_code,
        this.courseData.course_sequence
      );
      console.log("result", result);
      if (result.success) {
        ElMessage.success("提交成功");
        this.studentList = this.studentFormList;
        this.studentFormData.student_ids = "";
        this.studentDialogVisible = false;
      } else {
        ElMessage.error("提交失败");
      }
    },
    openClassDialog() {
      // 打开添加课堂的对话框
      this.classDialogVisible = true;
    },
    resetClassForm() {
      // 重置课堂表单数据
      this.classFormData = {
        class_name: "",
        date: "",
        lab_id: "",
        teachers: [],
      };
      this.teacherFormData = {
        teacher_ids: "",
      };
    },
    openStudentDialog() {
      // 打开添加学生的对话框
      this.studentDialogVisible = true;
    },
    handleClassRowClick(row) {
      console.log("查看课堂", row);

      this.classFormData = {
        class_name: row.class_name,
        date: row.date,
        lab_id: row.lab_id,
        teachers: row.teachers,
      };
      this.openClassDialog();
      //TODO 还不能修改课堂
    },
    handleStudentDialogRowClick(row) {
      console.log("删除学生", row);
      this.studentFormList = this.studentFormList.filter(
        (student) => student.student_id !== row.student_id
      );
    },
    handleTeacherDialogRowClick(row) {
      console.log("删除教师", row);
      this.classFormData.teachers = this.classFormData.teachers.filter(
        (teacher) => teacher.teacher_id !== row.teacher_id
      );
    },
    goBack() {
      this.$router.go(-1); // 返回上一页
    },
  },
  computed: {
    // 计算属性，返回带有映射的 classList
    displayClassList() {
      return this.classList.map((item) => {
        const lab = this.labs.find((lab) => lab.id === item.lab_id);
        const teacherNames = item.teachers
          .map((teacher) => teacher.teacher_name)
          .join(", ");
        return {
          ...item, // 保持原来的数据
          lab_name: lab ? lab.name : item.lab_id, // 根据 lab_id 获取 lab_name
          teacher_names: teacherNames, // 根据 teacher_id 获取 teacher_name
        };
      });
    },
    isCourseSubmitted() {
      if (this.courseData.id) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style scoped>
.form-block {
  margin-bottom: 20px;
  padding: 10px;
}

.form-block-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-button {
  margin-top: 10px;
}

.el-card {
  margin-bottom: 20px;
}
</style>

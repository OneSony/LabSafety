<template>
  <div class="course-management p-6 max-w-7xl mx-auto">
    <!-- Back Button -->
    <el-button
      @click="goBack"
      type="primary"
      class="mb-6 flex items-center"
      style="margin-bottom: 10px"
    >
      <i class="el-icon-arrow-left mr-2"></i> 返回
    </el-button>

    <!-- Course Info Card -->
    <el-card
      class="mb-8 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div class="border-b pb-4 mb-6">
        <h2 class="text-xl font-semibold text-gray-800">课程基本信息</h2>
      </div>

      <el-form
        label-position="right"
        label-width="100px"
        class="grid grid-cols-2 gap-6"
        :model="courseData"
        :rules="courseRules"
        ref="courseForm"
      >
        <el-form-item label="课程号" class="mb-4" prop="course_code">
          <el-input
            v-model="courseData.course_code"
            placeholder="请输入课程号"
            :disabled="isCourseSubmitted"
            class="w-full"
          ></el-input>
        </el-form-item>

        <el-form-item label="课序号" class="mb-4" prop="course_sequence">
          <el-input
            v-model="courseData.course_sequence"
            placeholder="请输入课序号"
            :disabled="isCourseSubmitted"
            class="w-full"
          ></el-input>
        </el-form-item>

        <el-form-item label="课程名" class="mb-4" prop="course_name">
          <el-input
            v-model="courseData.course_name"
            placeholder="请输入课程名"
            class="w-full"
          ></el-input>
        </el-form-item>

        <el-form-item label="开课院系" class="mb-4" prop="department">
          <el-input
            v-model="courseData.department"
            placeholder="请输入开课院系"
            class="w-full"
          >
          </el-input>
        </el-form-item>
      </el-form>

      <div class="flex justify-end mt-6 mr-4">
        <el-button @click="submitCourse" type="primary" class="w-32">
          提交
        </el-button>
      </div>
    </el-card>

    <!-- Class List Card -->
    <el-card
      class="mb-8 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div class="flex justify-between items-center border-b pb-4 mb-8">
        <h2 class="text-xl font-semibold text-gray-800">已添加课堂</h2>
        <el-button
          v-if="isCourseSubmitted"
          @click="classDialogVisible = true"
          type="primary"
          :disabled="!isCourseSubmitted"
          class="flex items-center"
          style="margin-bottom: 10px"
        >
          <i class="el-icon-plus justify-end mr-2 mb-6"></i> 添加课堂
        </el-button>
        <el-tooltip
          content="请先创建课程"
          placement="top"
          effect="dark"
          v-if="!isCourseSubmitted"
        >
          <el-button
            @click="classDialogVisible = true"
            type="primary"
            :disabled="!isCourseSubmitted"
            class="flex items-center"
            style="margin-bottom: 10px"
          >
            <i class="el-icon-plus justify-end mr-2 mb-6"></i> 添加课堂
          </el-button>
        </el-tooltip>
      </div>

      <el-table
        :data="classList"
        border
        class="w-full"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column fixed prop="date" label="日期" width="180">
          <template v-slot="scope">
            <DateBox
              :dateStr="scope.row.date"
              :textColor="'#666'"
              :fontSize="'12px'"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="class_name"
          label="课堂名"
          min-width="120"
        ></el-table-column>
        <el-table-column prop="lab_name" min-width="120"></el-table-column>
        <el-table-column
          prop="teachers_name"
          label="授课教师"
          min-width="150"
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template v-slot="slotProps">
            <el-button
              @click="handleClassEdit(slotProps.row)"
              type="primary"
              text
              :disabled="!isCourseSubmitted"
              class="mr-2"
            >
              查看
            </el-button>
            <el-button
              @click="handleClassDelete(slotProps.row)"
              type="danger"
              text
              :disabled="!isCourseSubmitted"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Student List Card -->
    <el-card
      class="mb-8 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div class="flex justify-between items-center border-b pb-4 mb-8">
        <h2 class="text-xl font-semibold text-gray-800">已添加学生</h2>
        <el-button
          v-if="isCourseSubmitted"
          @click="studentDialogVisible = true"
          type="primary"
          :disabled="!isCourseSubmitted"
          class="flex items-center"
          style="margin-bottom: 10px"
        >
          <i class="el-icon-plus justify-end mr-2 mb-6"></i> 添加学生
        </el-button>
        <el-tooltip
          content="请先创建课程"
          placement="top"
          effect="dark"
          v-if="!isCourseSubmitted"
        >
          <el-button
            @click="studentDialogVisible = true"
            type="primary"
            :disabled="!isCourseSubmitted"
            class="flex items-center"
            style="margin-bottom: 10px"
          >
            <i class="el-icon-plus justify-end mr-2 mb-6"></i> 添加学生
          </el-button>
        </el-tooltip>
      </div>

      <el-table
        :data="studentList"
        border
        class="w-full"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column
          prop="student_id"
          label="学号"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="student_name"
          label="姓名"
          min-width="120"
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template v-slot="slotProps">
            <el-button
              @click="handleStudentDelete(slotProps.row)"
              type="danger"
              text
              :disabled="!isCourseSubmitted"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add Class Dialog -->
    <el-dialog
      title="添加课堂"
      v-model="classDialogVisible"
      width="800px"
      @close="closeClassDialog"
      class="custom-dialog"
    >
      <el-form
        :model="classFormData"
        ref="classForm"
        label-width="100px"
        :rules="classRules"
      >
        <el-form-item label="课堂名" class="mb-6" prop="class_name">
          <el-input
            v-model="classFormData.class_name"
            placeholder="请输入课堂名"
            class="w-full"
          ></el-input>
        </el-form-item>

        <el-form-item label="时间" class="mb-6" prop="date">
          <el-date-picker
            v-model="classFormData.date"
            type="datetime"
            placeholder="选择时间"
            class="w-full"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="地点" class="mb-6" prop="lab_id">
          <el-select
            v-model="classFormData.lab_id"
            placeholder="选择地点"
            class="w-full"
          >
            <el-option
              v-for="lab in labList"
              :key="lab.lab_id"
              :label="lab.lab_name"
              :value="lab.lab_id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="授课教师" class="mb-6">
          <div class="flex gap-4">
            <el-input
              v-model="teacherFormStr"
              placeholder="请输入工号，多个工号用逗号分隔"
              class="flex-1"
            ></el-input>
            <el-button type="primary" @click="fetchTeacherData"
              >查询教师</el-button
            >
          </div>
        </el-form-item>

        <el-table
          :data="classFormData.teachers"
          border
          class="w-full mb-6"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column
            prop="teacher_id"
            label="工号"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="teacher_name"
            label="姓名"
            min-width="120"
          ></el-table-column>
          <el-table-column fixed="right" label="操作" width="120">
            <template v-slot="slotProps">
              <el-button
                @click="handleTeacherDialogRowClick(slotProps.row)"
                type="danger"
                text
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-4">
          <el-button @click="classDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitClass">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add Student Dialog -->
    <el-dialog
      title="添加学生"
      v-model="studentDialogVisible"
      width="800px"
      @close="closeStudentDialog"
      class="custom-dialog"
    >
      <el-form class="mb-6">
        <el-form-item label="学生" label-width="100px">
          <div class="flex gap-4">
            <el-input
              v-model="studentFormStr"
              placeholder="请输入学号，多个学号用逗号分隔"
              class="flex-1"
            ></el-input>
            <el-button type="primary" @click="fetchStudentData"
              >查询学生</el-button
            >
          </div>
        </el-form-item>
      </el-form>

      <el-table
        :data="studentFormList"
        border
        class="w-full"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column
          prop="student_id"
          label="学号"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="student_name"
          label="姓名"
          min-width="120"
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template v-slot="slotProps">
            <el-button
              @click="handleStudentDialogRowClick(slotProps.row)"
              type="danger"
              text
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="flex justify-end gap-4">
          <el-button @click="studentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStudents">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { courseAPI, labAPI, classAPI, userAPI } from "@/utils/api";
import { ElMessage, inputEmits, rowProps } from "element-plus";
import { defineComponent, onMounted } from "vue";
import { stringifyQuery } from "vue-router";
import { useRoute } from "vue-router";
import DateBox from "@/components/DateBox.vue";

interface Teacher {
  teacher_id: string;
  teacher_name: string;
}

interface Student {
  student_id: string;
  student_name: string;
}

interface Class {
  class_name: string;
  class_id: number | null;
  date: string;
  lab_id: number | null;
  lab_name: string;
  teachers: Teacher[];
  teachers_name: string;
}

interface Course {
  course_name: string;
  course_id: number | null;
  course_code: string;
  course_sequence: string;
  department: string;
  students: Student[];
}

interface Lab {
  lab_id: number;
  lab_name: string;
}

export default defineComponent({
  components: {
    DateBox,
  },
  data() {
    return {
      courseData: {
        course_name: "",
        course_id: null,
        course_code: "",
        course_sequence: "",
        department: "",
        students: [] as Student[],
      } as Course,

      classList: [] as Class[], // 用来存储课堂数据

      classFormData: {
        class_name: "",
        class_id: null,
        date: "",
        lab_id: null,
        lab_name: "",
        teachers: [] as Teacher[],
        teachers_name: "",
      } as Class,

      classFormDataOrigin: {
        class_name: "",
        class_id: null,
        date: "",
        lab_id: null,
        lab_name: "",
        teachers: [] as Teacher[],
        teachers_name: "",
      } as Class,

      studentFormStr: "" as string,

      studentFormList: [] as Student[], // 用来存储学生数据

      studentList: [] as Student[], // 用来存储学生数据

      teacherFormStr: "" as string,

      labList: [] as Lab[], // 用来存储地点数据

      // 控制课堂对话框的显示
      studentDialogVisible: false,
      classDialogVisible: false,

      courseRules: {
        course_code: [
          { required: true, message: "请输入课程号", trigger: "blur" },
          { pattern: /^\d+$/, message: "课程号只能填写数字", trigger: "blur" },
        ],
        course_sequence: [
          { required: true, message: "请输入课序号", trigger: "blur" },
          { pattern: /^\d+$/, message: "课序号只能填写数字", trigger: "blur" },
        ],
        course_name: [
          { required: true, message: "请输入课程名", trigger: "blur" },
        ],
        department: [
          { required: true, message: "请输入开课院系", trigger: "blur" },
        ],
      },

      classRules: {
        class_name: [
          { required: true, message: "请输入课堂名", trigger: "blur" },
        ],
        date: [{ required: true, message: "请选择时间", trigger: "change" }],
        lab_id: [{ required: true, message: "请选择地点", trigger: "change" }],
      },
    };
  },
  mounted() {
    this.fetchLabs();
    console.log("inputCourseData", history.state.inputCourseData);
    if (history.state.inputCourseData) {
      console.log("inputCourseData", history.state.inputCourseData);
      this.transformData(history.state.inputCourseData);
      this.fetchCourse();
      this.fetchEnroll();
      this.fetchClassList();
    }
  },
  methods: {
    async fetchLabs() {
      const result = await labAPI.getLabs(); // 获取地点的 API
      if (result.success) {
        console.log(result.data);
        this.labList = [];
        for (let i = 0; i < result.data.length; i++) {
          this.labList.push({
            lab_id: result.data[i].id,
            lab_name: result.data[i].name,
          });
        }
      } else {
        ElMessage.error("加载地点失败");
      }
    },

    transformData(inputCourseData: any) {
      this.courseData.course_id = inputCourseData?.course_id || null;
      this.courseData.course_name = inputCourseData?.course_name || "";
      this.courseData.course_code = inputCourseData?.course_code || "";
      this.courseData.course_sequence = inputCourseData?.course_sequence || "";
      this.courseData.department = inputCourseData?.department || "";
    },

    async fetchCourse() {
      const result = await courseAPI.getCourse(
        this.courseData.course_code,
        this.courseData.course_sequence
      );
      if (result.success) {
        this.courseData.course_id = result.data[0].id;
        this.courseData.course_name = result.data[0].name;
        this.courseData.department = result.data[0].department;
      } else {
        ElMessage.error("加载课程失败");
      }
    },

    async fetchEnroll() {
      //TODO 获取学生
      this.studentList = [] as Student[];
      const result1 = await courseAPI.getEnroll(this.courseData.course_id!);
      console.log("result1", result1);
      if (result1.success) {
        this.studentList = [] as Student[];
        for (let i = 0; i < result1.data.length; i++) {
          this.studentList.push({
            student_id: result1.data[i].student_id,
          } as Student);
        }

        //TODO 获取userinfo！！
        for (let i = 0; i < this.studentList.length; i++) {
          const resultInfo = await userAPI.getUserInfo(
            this.studentList[i].student_id
          );
          console.log("result2", resultInfo);
          if (resultInfo.success) {
            this.studentList[i].student_name = resultInfo.data[0].real_name;
          } else {
            ElMessage.error("加载学生失败");
          }
        }
      } else {
        ElMessage.error("加载学生失败");
      }
    },

    async fetchClassList() {
      //获取class
      this.classList = [] as Class[];
      const result2 = await classAPI.getClassList(this.courseData.course_id!);
      console.log("result2", result2);
      if (result2.success) {
        this.classList = [] as Class[];
        for (let i = 0; i < result2.data.length; i++) {
          this.classList.push({
            class_id: result2.data[i].class_id,
            class_name: result2.data[i].name,
            date: result2.data[i].start_time,
          } as Class);
        }
      } else {
        ElMessage.error("加载课堂失败");
      }

      for (let i = 0; i < this.classList.length; i++) {
        const result3 = await classAPI.getLocations(
          this.classList[i].class_id!
        );
        console.log("result3", result3);
        if (result3.success && result3.data.length > 0) {
          this.classList[i].lab_id = result3.data[0].lab_id;
          this.classList[i].lab_name =
            this.labList.find((lab) => lab.lab_id === result3.data[0].lab_id)
              ?.lab_name || "";
        } else {
          ElMessage.error("加载地点失败");
        }

        const result4 = await classAPI.getTeachers(this.classList[i].class_id!);
        console.log("result4", result4);
        if (result4.success) {
          this.classList[i].teachers = [] as Teacher[];
          for (let j = 0; j < result4.data.length; j++) {
            //每一份teacher
            const result5 = await userAPI.getUserInfo(
              result4.data[j].teacher_id
            );
            console.log("result5", result5);
            if (result5.success) {
              this.classList[i].teachers.push({
                teacher_id: result5.data[0].user_id,
                teacher_name: result5.data[0].real_name,
              } as Teacher);
            } else {
              ElMessage.error("加载教师失败");
            }
          }
          this.classList[i].teachers_name = this.classList[i].teachers
            .map((teacher) => teacher.teacher_name)
            .join(", ");
        } else {
          ElMessage.error("加载教师失败");
        }
        console.log("classList!!", this.classList);
      }
    },

    async fetchStudentData() {
      const studentIds = this.studentFormStr
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
              student_name: result.data[0].real_name, // 假设返回数据中有 `username` 字段
            } as Student);
          } else {
            students.push({
              student_id: studentId,
              student_name: "不是学生", // 如果没有找到学生，显示“未找到”
            } as Student);
          }
        } else {
          students.push({
            student_id: studentId,
            student_name: "未找到", // 如果没有找到学生，显示“未找到”
          } as Student);
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
      this.studentFormStr = ""; // 清空输入框
    },

    async fetchTeacherData() {
      const teacherIds = this.teacherFormStr
        .split(",") // 按逗号分割
        .map((id) => id.trim()) // 去掉空格
        .filter((id) => id && /^\d+$/.test(id)) // 过滤掉空的值和非数字的值
        .filter((value, index, self) => self.indexOf(value) === index); // 过滤掉重复值

      // 调用后端 API 查询学号对应的姓名
      const teachers = [] as Teacher[];
      for (let teacherId of teacherIds) {
        const result = await userAPI.getUserInfo(teacherId); // 假设有一个 API 函数 `getStudentById`
        console.log("result", result);
        if (result.success && result.data.length > 0) {
          if (result.data[0].role === "teacher") {
            teachers.push({
              teacher_id: result.data[0].user_id,
              teacher_name: result.data[0].real_name, // 假设返回数据中有 `username` 字段
            } as Teacher);
          } else {
            teachers.push({
              teacher_id: teacherId,
              teacher_name: "不是教师", // 如果没有找到学生，显示“未找到”
            } as Teacher);
          }
        } else {
          teachers.push({
            teacher_id: teacherId,
            teacher_name: "未找到", // 如果没有找到学生，显示“未找到”
          } as Teacher);
        }
      }

      console.log("teat:", this.classFormData);

      console.log("teachers??", this.classFormData.teachers);

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

      this.teacherFormStr = ""; // 清空输入框
    },

    async submitCourse() {
      //rule检查
      const valid = await new Promise<boolean>((resolve) => {
        (this.$refs.courseForm as any).validate((valid: boolean) => {
          resolve(valid);
        });
      });

      if (!valid) {
        ElMessage.error("请填写完整的课程信息");
        return;
      }

      console.log("here!", this.courseData);
      if (this.courseData.course_id != null) {
        const result = await courseAPI.patchCourse(
          this.courseData.course_code,
          this.courseData.course_sequence,
          this.courseData.course_name,
          this.courseData.department
        );
        if (result.success) {
          ElMessage.success("提交成功");
        } else {
          ElMessage.error("提交失败");
        }
        return;
      } else {
        const result = await courseAPI.postCourse(
          this.courseData.course_code,
          this.courseData.course_sequence,
          this.courseData.course_name,
          this.courseData.department
        );
        if (result.success === true) {
          ElMessage.success("提交成功");
          this.courseData.course_id = result.data.course.id;
          console.log("courseData", this.courseData);
        } else {
          ElMessage.error("提交失败");
        }
      }
      this.fetchCourse();
    },

    async submitClass() {
      //rule
      const valid = await new Promise<boolean>((resolve) => {
        (this.$refs.classForm as any).validate((valid: boolean) => {
          resolve(valid);
        });
      });

      if (!valid) {
        ElMessage.error("请填写完整的课堂信息");
        return;
      }

      if (
        this.courseData.course_id == null ||
        this.courseData.course_code == "" ||
        this.courseData.course_sequence == ""
      ) {
        ElMessage.error("请先提交课程");
        return;
      }

      if (this.classFormData.teachers.length === 0) {
        ElMessage.error("请添加教师");
        return;
      }
      console.log("课堂信息：", this.classFormData);
      if (this.classFormData.class_id === null) {
        //新课堂
        const newClass = {
          class_name: this.classFormData.class_name,
          date: this.classFormData.date,
          lab_id: this.classFormData.lab_id,
          teachers: [] as Teacher[],
        } as Class;

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
          newClass.class_id!,
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
            newClass.class_id!,
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
        //TODO
        if (newClass.lab_id === null) {
          ElMessage.error("提交失败");
          return;
        } else {
          const result4 = await classAPI.postLocation(
            newClass.class_id!,
            newClass.lab_id
          );
          if (result4.success) {
            ElMessage.success("提交成功");
          } else {
            ElMessage.error("提交失败");
            newClass.lab_id = null;
          }
        }

        ElMessage.success("课堂已添加");
        this.classDialogVisible = false;

        this.fetchClassList(); // 重新获取课堂列表
        console.log("classList", this.classList);
      } else {
        //TODO 修改课堂

        const result = await classAPI.patchClass(
          this.classFormData.class_id!,
          this.classFormData.class_name,
          this.classFormData.date
        );

        if (result.success) {
          ElMessage.success("提交成功");
        } else {
          ElMessage.error("提交失败");
        }

        console.log("this.classFormDataOrigin", this.classFormDataOrigin);
        console.log("this.classFormData", this.classFormData);

        //绑定教师到课堂
        const deleteTeacherList = this.classFormDataOrigin.teachers.filter(
          (teacher: Teacher) =>
            !this.classFormData.teachers.some(
              (newTeacher: Teacher) =>
                newTeacher.teacher_id === teacher.teacher_id
            )
        );

        console.log("deleteTeacherList", deleteTeacherList);

        const addTeacherList = this.classFormData.teachers.filter(
          (newTeacher: Teacher) =>
            !this.classFormDataOrigin.teachers.some(
              (teacher: Teacher) => teacher.teacher_id === newTeacher.teacher_id
            )
        );

        console.log("addTeacherList", addTeacherList);

        for (let i = 0; i < deleteTeacherList.length; i++) {
          const result = await classAPI.deleteTeacher(
            this.classFormData.class_id!,
            deleteTeacherList[i].teacher_id
          );
          if (result.success) {
            ElMessage.success("提交成功");
          } else {
            ElMessage.error("提交失败");
          }
        }

        for (let i = 0; i < addTeacherList.length; i++) {
          const result = await classAPI.postTeacher(
            this.classFormData.class_id!,
            addTeacherList[i].teacher_id
          );
          if (result.success) {
            ElMessage.success("提交成功");
          } else {
            ElMessage.error("提交失败");
          }
        }

        //地点
        if (this.classFormData.lab_id != this.classFormDataOrigin.lab_id) {
          console.log("ori_lab_id", this.classFormDataOrigin.lab_id);
          if (this.classFormDataOrigin.lab_id != null) {
            const deleteLabResult = await classAPI.deleteLocation(
              this.classFormData.class_id!,
              this.classFormDataOrigin.lab_id!
            );
            if (deleteLabResult.success) {
              ElMessage.success("删除成功");
            } else {
              ElMessage.error("删除失败");
            }
          }

          const postLabResult = await classAPI.postLocation(
            this.classFormData.class_id!,
            this.classFormData.lab_id!
          );

          if (postLabResult.success) {
            ElMessage.success("提交成功");
          } else {
            ElMessage.error("提交失败");
          }
        }
      }
      this.classDialogVisible = false;
    },

    async submitStudents() {
      if (
        this.courseData.course_id == null ||
        this.courseData.course_code == "" ||
        this.courseData.course_sequence == ""
      ) {
        ElMessage.error("请先提交课程");
        return;
      }

      if (this.studentFormList.length === 0) {
        ElMessage.error("请添加学生");
        return;
      }
      //把formlist中不在list的留下
      const studentIds = this.studentFormList
        .filter(
          (newStudent: Student) =>
            !this.studentList.some(
              (existingStudent: Student) =>
                existingStudent.student_id === newStudent.student_id
            )
        )
        .map((student: Student) => student.student_id);
      const result = await courseAPI.postEnroll(
        studentIds,
        this.courseData.course_code,
        this.courseData.course_sequence
      );
      console.log("result", result);
      if (result.success) {
        ElMessage.success("提交成功");
        //把formlist不重复的加到list
        this.studentFormStr = "";
        this.studentDialogVisible = false;
        this.fetchEnroll();
      } else {
        ElMessage.error("提交失败");
      }
      this.studentDialogVisible = false;
    },

    closeClassDialog() {
      this.classDialogVisible = false;
      this.classFormData = {
        class_name: "",
        class_id: null,
        date: "",
        lab_id: null,
        lab_name: "",
        teachers: [] as Teacher[],
        teachers_name: "",
      } as Class;

      this.classFormDataOrigin = {
        class_name: "",
        class_id: null,
        date: "",
        lab_id: null,
        lab_name: "",
        teachers: [] as Teacher[],
        teachers_name: "",
      } as Class;
      this.teacherFormStr = "";
      this.fetchClassList();
    },
    closeStudentDialog() {
      this.studentDialogVisible = false;
      this.studentFormStr = "";
      this.studentFormList = [];
      this.fetchEnroll();
    },
    handleClassEdit(row: Class) {
      console.log("查看课堂", row);
      this.classFormData = {
        class_name: row.class_name,
        class_id: row.class_id,
        date: row.date,
        lab_id: row.lab_id,
        lab_name: row.lab_name,
        teachers: row.teachers,
        teachers_name: row.teachers_name,
      } as Class;
      this.classFormDataOrigin = {
        class_name: row.class_name,
        class_id: row.class_id,
        date: row.date,
        lab_id: row.lab_id,
        lab_name: row.lab_name,
        teachers: row.teachers,
        teachers_name: row.teachers_name,
      } as Class;
      this.classDialogVisible = true;
      console.log("查看课堂", this.classFormData, this.classFormDataOrigin);
    },
    handleStudentDialogRowClick(row: Student) {
      console.log("删除学生", row);
      this.studentFormList = this.studentFormList.filter(
        (student: Student) => student.student_id !== row.student_id
      );
    },
    handleTeacherDialogRowClick(row: Teacher) {
      this.classFormData.teachers = this.classFormData.teachers.filter(
        (teacher: Teacher) => teacher.teacher_id !== row.teacher_id
      );
      console.log("删除教师", this.classFormData.teachers);
      console.log("删除教师", this.classFormDataOrigin.teachers);
    },
    async handleStudentDelete(row: Student) {
      //主菜单里删除
      console.log("删除学生", row);
      const result = await courseAPI.deleteEnroll(
        row.student_id,
        this.courseData.course_code,
        this.courseData.course_sequence
      );
      console.log("result", result);
      if (result.success) {
        ElMessage.success("删除成功");
        this.fetchEnroll();
      } else {
        ElMessage.error("删除失败");
      }
    },
    async handleClassDelete(row: Class) {
      //主菜单里删除
      console.log("删除课堂", row);
      const result = await courseAPI.deleteClassToCourse(
        row.class_id!,
        this.courseData.course_code,
        this.courseData.course_sequence
      );
      console.log("result", result);
      if (result.success) {
        ElMessage.success("删除成功");
        const result2 = await classAPI.deleteClass(row.class_id!);
        console.log("result2", result2);
        if (result2.success) {
          ElMessage.success("删除成功");
        } else {
          ElMessage.error("删除失败");
        }
        this.fetchClassList();
      } else {
        ElMessage.error("删除失败");
      }
    },
    goBack() {
      this.$router.go(-1); // 返回上一页
    },
  },
  computed: {
    // 计算属性，返回带有映射的 classList
    isCourseSubmitted() {
      if (this.courseData.course_id) {
        return true;
      } else {
        return false;
      }
    },
  },
});
</script>

<style scoped>
.course-management {
  min-height: 100vh;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.custom-dialog :deep(.el-dialog__header) {
  padding: 20px 30px;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 20px 30px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-table th) {
  font-weight: 600;
}

:deep(.el-button--text) {
  padding: 4px 8px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
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

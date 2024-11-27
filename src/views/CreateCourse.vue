<template>
  <div>
    <h1>{{ courseId ? "编辑课程" : "创建课程" }}</h1>
    <el-form :model="course" label-width="120px">
      <el-form-item label="课程名称">
        <el-input v-model="course.name"></el-input>
      </el-form-item>
      <el-form-item label="课程描述">
        <el-input type="textarea" v-model="course.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveCourse">保存课程</el-button>
      </el-form-item>
    </el-form>

    <h2>课时列表</h2>
    <el-button type="primary" @click="addClass">添加课时</el-button>
    <el-table :data="classes" style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="课时名称"></el-table-column>
      <el-table-column prop="location" label="地点"></el-table-column>
      <el-table-column prop="time" label="时间"></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="text" @click="editClass(scope.$index)"
            >编辑</el-button
          >
          <el-button type="text" @click="deleteClass(scope.$index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑课时的对话框 -->
    <el-dialog
      :title="currentClassIndex !== null ? '编辑课时' : '添加课时'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="currentClass" label-width="120px">
        <el-form-item label="课时名称">
          <el-input v-model="currentClass.name"></el-input>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="currentClass.location"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="currentClass.time"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <!-- 使用新的插槽语法 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveClass">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "CoursePage",
  setup() {
    const route = useRoute();
    const courseId = ref(route.params.courseId);

    const course = reactive({
      name: "",
      description: "",
    });

    const classes = ref([]);

    const dialogVisible = ref(false);
    const currentClass = reactive({
      name: "",
      location: "",
      time: null,
    });
    const currentClassIndex = ref(null);

    const fetchCourse = () => {
      if (courseId.value) {
        // 获取课程信息
        axios
          .get(`/api/v1/courses/${courseId.value}`)
          .then((response) => {
            Object.assign(course, response.data);
            classes.value = response.data.classes || [];
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };

    const saveCourse = () => {
      if (courseId.value) {
        // 更新课程
        axios
          .put(`/api/v1/courses/${courseId.value}`, course)
          .then(() => {
            ElMessage.success("课程更新成功");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        // 创建课程
        axios
          .post("/api/v1/courses", course)
          .then((response) => {
            courseId.value = response.data.id;
            ElMessage.success("课程创建成功");
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };

    const addClass = () => {
      currentClass.name = "";
      currentClass.location = "";
      currentClass.time = null;
      currentClassIndex.value = null;
      dialogVisible.value = true;
    };

    const editClass = (index) => {
      Object.assign(currentClass, classes.value[index]);
      currentClass.time = new Date(currentClass.time); // 确保时间格式正确
      currentClassIndex.value = index;
      dialogVisible.value = true;
    };

    const deleteClass = (index) => {
      const classId = classes.value[index].id;
      axios
        .delete(`/api/v1/classes/${classId}`)
        .then(() => {
          classes.value.splice(index, 1);
          ElMessage.success("课时删除成功");
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const saveClass = () => {
      if (currentClassIndex.value !== null) {
        // 更新课时
        const classId = classes.value[currentClassIndex.value].id;
        axios
          .put(`/api/v1/classes/${classId}`, currentClass)
          .then(() => {
            classes.value[currentClassIndex.value] = { ...currentClass };
            ElMessage.success("课时更新成功");
            dialogVisible.value = false;
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        // 创建课时
        axios
          .post("/api/v1/classes", {
            ...currentClass,
            courseId: courseId.value,
          })
          .then((response) => {
            classes.value.push(response.data);
            ElMessage.success("课时创建成功");
            dialogVisible.value = false;
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };

    onMounted(() => {
      fetchCourse();
    });

    return {
      courseId,
      course,
      classes,
      dialogVisible,
      currentClass,
      currentClassIndex,
      saveCourse,
      addClass,
      editClass,
      deleteClass,
      saveClass,
    };
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>

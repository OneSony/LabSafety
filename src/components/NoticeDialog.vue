<template>
  <el-form label-width="120px">
    <!-- 选择添加类型 -->
    <el-form-item label="选择课堂" v-if="needToChooseClass">
      <el-select
        v-model="localClassId"
        placeholder="选择地点"
        style="width: 100%"
      >
        <el-option
          v-for="classItem in classList"
          :key="classItem.class_id"
          :label="classItem.name"
          :value="classItem.class_id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="选择输入类型">
      <el-select v-model="selectedType" placeholder="请选择输入类型">
        <el-option label="文本框" value="text"></el-option>
        <el-option label="文件上传" value="file"></el-option>
        <el-option label="图片" value="image"></el-option>
      </el-select>
    </el-form-item>

    <!-- 动态表单项 -->
    <div
      v-for="(item, index) in dynamicItems"
      :key="index"
      class="dynamic-item"
    >
      <el-form-item :label="'条目 ' + (index + 1)">
        <!-- 根据条目的 type 动态渲染不同的输入框 -->
        <template v-if="item.type === 'text'">
          <el-input v-model="item.value" placeholder="请输入文本" />
        </template>

        <template v-if="item.type === 'file'">
          <p v-if="item.value">{{ item.value }}</p>
          <el-upload
            class="upload-demo"
            action=""
            :show-file-list="false"
            :auto-upload="false"
            :on-change="(fileObj) => handleFileChange(fileObj, item, index)"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </template>
        <template v-if="item.type === 'image'">
          <img
            v-if="item.value"
            :src="item.value"
            alt="图片"
            style="width: 100px"
          />
          <el-upload
            ref="upload"
            class="photo-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(fileObj) => handlePhotoChange(fileObj, item, index)"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
        </template>

        <!-- 删除按钮 -->
        <el-button
          type="text"
          @click="removeItem(index)"
          style="position: absolute; top: 5px; right: 5px"
          >x</el-button
        >
      </el-form-item>
    </div>

    <!-- 添加条目按钮 -->
    <el-form-item>
      <el-button type="primary" @click="addItem">添加条目</el-button>
    </el-form-item>

    <!-- 自定义底部按钮 -->
    <div class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitNoticeForm">保存</el-button>
    </div>
  </el-form>
</template>

<script>
import { onMounted, ref } from "vue";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSelect,
  ElOption,
  ElUpload,
  ElMessage,
} from "element-plus";
import { noticeAPI, userAPI, classAPI } from "@/utils/api";
export default {
  name: "DynamicForm",
  props: {
    class_id: {
      type: Number,
      required: false,
    },
  },
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElSelect,
    ElOption,
    ElUpload,
  },
  setup(props, { emit }) {
    const classList = ref([]);
    const localClassId = ref(props.class_id);
    const needToChooseClass = localClassId.value === undefined;
    console.log("chooseClass", needToChooseClass);

    const sender_id = userAPI.getUserId();
    const selectedType = ref("text"); // 当前选中的输入类型
    const dynamicItems = ref([]); // 用于保存动态添加的条目
    // 添加条目
    const addItem = () => {
      // 根据选中的类型添加新的条目
      dynamicItems.value.push({
        type: selectedType.value,
        value: "",
        file: null,
      });
    };

    // 删除条目
    const removeItem = (index) => {
      dynamicItems.value.splice(index, 1);
    };

    // 处理文件上传的变化
    const handleFileChange = (fileObj, item, index) => {
      console.log("fileObj", fileObj);
      console.log("item", item);
      console.log("index", index);

      const selectedFile = fileObj.raw;
      item.file = selectedFile; // 存储文件对象

      // 使用 FileReader 读取本地图片并显示
      const reader = new FileReader();
      reader.onload = () => {
        item.value = selectedFile.name; // 显示文件名
        console.log("item.value", item.value);
      };
      reader.readAsDataURL(selectedFile);
    };

    const handlePhotoChange = (fileObj, item, index) => {
      console.log("fileObj", fileObj);
      console.log("item", item);
      console.log("index", index);

      const selectedFile = fileObj.raw;
      item.file = selectedFile; // 存储文件对象

      // 使用 FileReader 读取本地图片并显示
      const reader = new FileReader();
      reader.onload = () => {
        item.value = reader.result; // 显示头像
      };
      reader.readAsDataURL(selectedFile);
    };

    const submitNoticeForm = async () => {
      const noticeResult = await noticeAPI.postNotices(
        sender_id,
        localClassId.value
      );
      console.log("notice", noticeResult);
      if (noticeResult.success) {
        ElMessage.success("发送成功");
      } else {
        ElMessage.error("发送失败");
        return;
      }
      const notice_id = noticeResult.data.notice.id;
      // 提交表单
      console.log(dynamicItems.value);
      for (let i = 0; i < dynamicItems.value.length; i++) {
        const formData = new FormData();
        if (dynamicItems.value[i].type === "text") {
          formData.append("content_type", "text");
          formData.append("text_content", dynamicItems.value[i].value);
        } else if (dynamicItems.value[i].type === "file") {
          formData.append("content_type", "file");
          formData.append("file_content", dynamicItems.value[i].file);
        } else if (dynamicItems.value[i].type === "image") {
          formData.append("content_type", "image");
          formData.append("image_content", dynamicItems.value[i].file);
        }
        console.log("formdata", formData);
        const result = await noticeAPI.postContent(formData);
        console.log("content", result);
        if (result.success) {
          ElMessage.success("提交成功");
          const notice_content_id = result.data.notice_content.id;
          //post row
          const rowResult = await noticeAPI.postContentToNotice(
            i + 1,
            notice_id,
            notice_content_id
          );
          console.log("row", rowResult);
          if (rowResult.success) {
            ElMessage.success("提交成功");
          } else {
            ElMessage.error("提交失败"); //TODO
            return;
          }
        } else {
          ElMessage.error("提交失败");
          return;
        }
      }
      console.log("提交成功");
      dynamicItems.value = [];
      closeDialog();
    };

    const closeDialog = () => {
      emit("close-dialog");
    };

    return {
      selectedType,
      dynamicItems,
      addItem,
      removeItem,
      handleFileChange,
      handlePhotoChange,
      submitNoticeForm,
      closeDialog,
      localClassId,
      classList,
      needToChooseClass,
    };
  },
  mounted() {
    if (this.needToChooseClass) {
      this.fetchClassList();
    }
  },
  methods: {
    async fetchClassList() {
      const res = await classAPI.getClassList();
      console.log("class", res);
      if (res.success) {
        this.classList = res.data;
      } else {
        console.log(res.message);
      }
    },
  },
};
</script>

<style scoped>
.dynamic-item {
  position: relative;
  margin-bottom: 20px;
}
</style>

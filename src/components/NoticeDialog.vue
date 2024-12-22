<template>
  <el-form
    ref="form"
    :model="noticeForm"
    label-width="120px"
    :rules="formRules"
  >
    <el-form-item label="选择课堂" prop="class_id">
      <el-row gutter="20" style="width: 100%">
        <el-col :span="24">
          <el-select
            v-model="noticeForm.class_id"
            placeholder="选择课堂"
            style="width: 100%"
            :disabled="isEditting || !needToChooseClass"
          >
            <el-option
              v-for="classItem in classList"
              :key="classItem.class_id"
              :label="classItem.name"
              :value="classItem.class_id"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
    </el-form-item>

    <div
      v-for="(item, index) in noticeForm.dynamicItems"
      :key="index"
      class="dynamic-item"
    >
      <el-form-item
        :label="'条目 ' + (index + 1)"
        :prop="'dynamicItems[' + index + '].value'"
      >
        <!-- 根据条目的 type 动态渲染不同的输入框 -->
        <el-row gutter="20" style="width: 100%">
          <el-col :span="24" v-if="item.type === 'text'">
            <el-input
              type="textarea"
              v-model="item.value"
              placeholder="请输入文本"
              :autosize="{ minRows: 1, maxRows: 6 }"
              @change="(value) => handleInputChange(item, value)"
            />
          </el-col>

          <el-col :span="18" v-if="item.type === 'file'">
            <p v-if="!item.value" style="margin: 0">未上传</p>
            <p
              v-if="
                item.value &&
                (!item.uploaded || (item.uploaded && item.modified))
              "
              style="margin: 0"
            >
              {{ item.value }}
            </p>
            <DownloadLink
              v-if="
                item.value &&
                !(!item.uploaded || (item.uploaded && item.modified))
              "
              :url="item.value"
            />
          </el-col>
          <el-col :span="6" v-if="item.type === 'file'">
            <el-upload
              action=""
              :show-file-list="false"
              :auto-upload="false"
              :on-change="(fileObj) => handleFileChange(fileObj, item, index)"
            >
              <el-button size="small" type="primary" v-if="!item.uploaded"
                >上传文件</el-button
              >
              <el-button size="small" type="primary" v-else>重新上传</el-button>
            </el-upload>
          </el-col>

          <el-col :span="18" v-if="item.type === 'image'">
            <p v-if="!item.value" style="margin: 0">未上传</p>
            <ImageBox v-if="item.value" :src="item.value" />
          </el-col>
          <el-col :span="6" v-if="item.type === 'image'">
            <el-upload
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(fileObj) => handlePhotoChange(fileObj, item, index)"
            >
              <el-button size="small" type="primary" v-if="!item.uploaded"
                >上传图片</el-button
              >
              <el-button size="small" type="primary" v-else>重新上传</el-button>
            </el-upload>
          </el-col>
        </el-row>
        <el-row gutter="20" style="width: 100%">
          <el-col :span="24">
            <el-button
              size="small"
              @click="moveItemUp(index)"
              :disabled="index === 0"
              >上移</el-button
            >
            <el-button
              size="small"
              @click="moveItemDown(index)"
              :disabled="index === noticeForm.dynamicItems.length - 1"
              >下移</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="removeItem(item, index)"
              >删除</el-button
            >
          </el-col>
        </el-row>
      </el-form-item>
    </div>

    <el-divider></el-divider>

    <el-form-item label="新增条目类型">
      <el-row gutter="20" style="width: 100%">
        <el-col :span="18">
          <el-select v-model="selectedType" placeholder="请选择输入类型">
            <el-option label="文本" value="text"></el-option>
            <el-option label="上传文件" value="file"></el-option>
            <el-option label="上传图片" value="image"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button size="small" type="primary" @click="addItem"
            >添加条目</el-button
          >
        </el-col>
      </el-row>
    </el-form-item>

    <!-- 自定义底部按钮 -->
    <div class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitNoticeForm">提交</el-button>
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
import ImageBox from "@/components/ImageBox.vue";
import DownloadLink from "@/components/DownloadLink.vue";
const form = ref(null);
export default {
  name: "DynamicForm",
  props: {
    class_id: {
      type: Number,
      required: false,
    },
    notice: {
      type: Object,
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
    ImageBox,
    DownloadLink,
  },
  setup(props, { emit }) {
    const isEditting = props.notice !== undefined;
    const classList = ref([]);
    const localClassId = ref(props.class_id);
    const needToChooseClass = localClassId.value === undefined;
    const removeUploadedItems = ref([]);

    const noticeForm = ref({
      class_id: localClassId.value,
      dynamicItems: [],
    });

    const formRules = ref({
      class_id: [{ required: true, message: "请选择课堂", trigger: "change" }],
    });

    console.log("chooseClass", needToChooseClass);
    console.log("is editing", isEditting);
    console.log("class_id", localClassId.value);

    const sender_id = userAPI.getUserId();
    const selectedType = ref("text"); // 当前选中的输入类型

    const handleInputChange = (item, value) => {
      if (item.uploaded == true) {
        item.modified = true;
      }
      console.log("item.modified", item.modified);
    };

    // 处理文件上传的变化
    const handleFileChange = (fileObj, item, index) => {
      if (item.uploaded == true) {
        item.modified = true;
      }
      console.log("fileObj", fileObj);
      console.log("item", item);
      console.log("index", index);

      const selectedFile = fileObj.raw;
      item.file = selectedFile; // 存储文件对象

      const isLt2M = item.file.size / 1024 / 1024 < 1; // 检查文件大小
      if (!isLt2M) {
        ElMessage.error("文件大小不能超过 1MB!");
        return;
      }

      // 使用 FileReader 读取本地图片并显示
      const reader = new FileReader();
      reader.onload = () => {
        item.value = selectedFile.name; // 显示文件名
        console.log("item.value", item.value);
      };
      reader.readAsDataURL(selectedFile);
    };

    const handlePhotoChange = (fileObj, item, index) => {
      if (item.uploaded == true) {
        item.modified = true;
      }
      console.log("fileObj", fileObj);
      console.log("item", item);
      console.log("index", index);

      const selectedFile = fileObj.raw;
      item.file = selectedFile; // 存储文件对象

      const allowedTypes = ["image/jpeg", "image/png"]; // 只允许 PNG 和 JPG
      if (!allowedTypes.includes(item.file.type)) {
        ElMessage.error("只允许上传 JPG 或 PNG 格式的图片!");
        return;
      }

      const isLt2M = item.file.size / 1024 / 1024 < 1; // 检查文件大小
      if (!isLt2M) {
        ElMessage.error("文件大小不能超过 1MB!");
        return;
      }

      // 使用 FileReader 读取本地图片并显示
      const reader = new FileReader();
      reader.onload = () => {
        item.value = reader.result; // 显示头像
      };
      reader.readAsDataURL(selectedFile);
    };

    const closeDialog = () => {
      emit("close-dialog");
    };

    return {
      sender_id,
      formRules,
      noticeForm,
      isEditting,
      selectedType,
      removeUploadedItems,
      handleInputChange,
      handleFileChange,
      handlePhotoChange,
      closeDialog,
      localClassId,
      classList,
      needToChooseClass,
    };
  },
  async mounted() {
    await this.fetchClassList();
    if (this.isEditting) {
      this.transformNotice(this.notice);
    }
  },
  methods: {
    async submitNoticeForm() {
      this.$refs.form.validate(async (valid) => {
        console.log("valid", valid);
        if (!valid) {
          ElMessage.error("请检查表单是否填写正确");
          return;
        }
      });

      console.log("here", this.isEditting);

      if (this.isEditting == false) {
        const dynamicItems = ref(this.noticeForm.dynamicItems);
        //提交新的notice
        const noticeResult = await noticeAPI.postNotices(
          this.sender_id,
          this.noticeForm.class_id
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
      } else {
        //修改老的notice
        console.log("dynamicItems", this.noticeForm.dynamicItems);
        const dynamicItems = ref(this.noticeForm.dynamicItems);

        const notice_id = ref(this.notice.id);

        //删除被去除的
        console.log("removeUploadedItems", this.removeUploadedItems);
        for (let i = 0; i < this.removeUploadedItems.length; i++) {
          const deleteRowResult = await noticeAPI.deleteContentToNotice(
            this.removeUploadedItems[i].row_id
          );
          if (deleteRowResult.success) {
            ElMessage.success("删除成功");
          } else {
            ElMessage.error("删除失败");
            return; //TODO
          }
        }

        for (let i = 0; i < dynamicItems.value.length; i++) {
          const notice_content_id = ref("");
          if (dynamicItems.value[i].uploaded == true) {
            const deleteRowResult = await noticeAPI.deleteContentToNotice(
              dynamicItems.value[i].row_id
            );
            if (deleteRowResult.success) {
              ElMessage.success("删除成功");
            } else {
              ElMessage.error("删除失败");
              return; //TODO
            }
            notice_content_id.value = dynamicItems.value[i].content_id;
          }

          if (
            dynamicItems.value[i].uploaded == false ||
            (dynamicItems.value[i].uploaded == true &&
              dynamicItems.value[i].modified == true)
          ) {
            //post notice content
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
            console.log("content?????!!!!!!!!", result);
            if (result.success) {
              ElMessage.success("提交成功");
              notice_content_id.value = result.data.notice_content.id;
            } else {
              ElMessage.error("提交失败");
              return;
            }
          }

          //post row
          const rowResult = await noticeAPI.postContentToNotice(
            i + 1, //新序号
            notice_id.value,
            notice_content_id.value
          );
          console.log("row", rowResult);
          if (rowResult.success) {
            ElMessage.success("提交成功");
          } else {
            ElMessage.error("提交失败"); //TODO
            return;
          }
        }
      }
      console.log("提交成功");
      this.noticeForm.dynamicItems = [];
      this.closeDialog();

      //TODO
    },
    generateRules() {
      const rules = {};

      rules.class_id = [
        { required: true, message: "请选择课堂", trigger: "change" },
      ];

      this.noticeForm.dynamicItems.forEach((item, index) => {
        const prop = `dynamicItems[${index}].value`; // 对应的 prop
        let rule = [];

        // 根据 item 的类型来添加不同的规则
        if (item.type === "text") {
          rule.push({
            required: true,
            message: "请填写文本",
            trigger: "blur",
          });
        }

        if (item.type === "file" || item.type === "image") {
          rule.push({
            required: true,
            message: "请上传文件",
            trigger: "change",
          });
        }

        // 将规则动态添加到 rules 中
        rules[prop] = rule;
      });

      // 更新 formRules
      this.formRules = rules;
      console.log("formRules", this.formRules);
    },
    addItem() {
      // 根据选中的类型添加新的条目
      this.noticeForm.dynamicItems.push({
        type: this.selectedType,
        value: "",
        file: null,
        uploaded: false,
        modified: false,
      });
      this.generateRules();
    },

    // 删除条目
    removeItem(item, index) {
      this.noticeForm.dynamicItems.splice(index, 1);
      if (item.uploaded == true) {
        this.removeUploadedItems.push(item);
      }
      this.generateRules();
    },
    moveItemUp(index) {
      const temp = this.noticeForm.dynamicItems[index];
      this.noticeForm.dynamicItems.splice(index, 1);
      this.noticeForm.dynamicItems.splice(index - 1, 0, temp);
    },
    moveItemDown(index) {
      const temp = this.noticeForm.dynamicItems[index];
      this.noticeForm.dynamicItems.splice(index, 1);
      this.noticeForm.dynamicItems.splice(index + 1, 0, temp);
    },
    async fetchClassList() {
      const res = await classAPI.getClassList();
      console.log("class", res);
      if (res.success) {
        this.classList = res.data;
      } else {
        console.log(res.message);
      }
    },

    transformNotice(notice) {
      console.log("notice!!!||~~", notice);
      for (let i = 0; i < notice.rows.length; i++) {
        const row_id = notice.rows[i].id;
        const content = notice.rows[i].notice_content;
        if (content.content_type === "text") {
          this.noticeForm.dynamicItems.push({
            type: "text",
            value: content.text_content,
            file: null,
            row_id: row_id,
            content_id: content.id,
            uploaded: true,
            modified: false,
          });
        } else if (content.content_type === "file") {
          this.noticeForm.dynamicItems.push({
            type: "file",
            value: content.file_content,
            file: content.file_content,
            row_id: row_id,
            content_id: content.id,
            uploaded: true,
            modified: false,
          });
        } else if (content.content_type === "image") {
          this.noticeForm.dynamicItems.push({
            type: "image",
            value: content.image_content,
            file: content.image_content,
            row_id: row_id,
            content_id: content.id,
            uploaded: true,
            modified: false,
          });
        }
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

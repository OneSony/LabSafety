<template>
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
    <el-form-item label="作业形式" prop="submissionTags">
      <div class="tags-container">
        <el-tag
          v-for="(tag, index) in experimentForm.submissionTags"
          :key="index"
          closable
          @close="removeTag('submissionTags', index)"
        >
          {{ tag }}
        </el-tag>
      </div>
      <el-checkbox-group v-model="experimentForm.submissionTags">
        <el-checkbox label="纸质报告"></el-checkbox>
        <el-checkbox label="上交产物"></el-checkbox>
        <el-checkbox label="口头报告"></el-checkbox>
      </el-checkbox-group>
      <el-input
        v-model="newSubmissionTag"
        placeholder="输入新标签"
        @keyup.enter="addTag('submissionTags')"
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

    <!-- 文件上传 -->
    <el-form-item label="上传文件" prop="files">
      <el-upload
        class="upload-demo"
        action=""
        :on-change="handleFileChange"
        :multiple="true"
        :file-list="experimentForm.files"
        :on-remove="handleRemoveFile"
        :auto-upload="false"
        accept="*/*"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
    </el-form-item>

    <!-- 图片上传 -->
    <el-form-item label="上传图片" prop="images">
      <el-upload
        class="upload-demo"
        action=""
        :on-change="handleImageChange"
        :multiple="true"
        :file-list="experimentForm.images"
        :on-remove="handleRemoveImage"
        :auto-upload="false"
        accept="image/*"
      >
        <el-button size="small" type="primary">点击上传图片</el-button>
      </el-upload>
    </el-form-item>
  </el-form>

  <!-- 自定义底部按钮 -->
  <div class="dialog-footer">
    <el-button @click="closeDialog">取消</el-button>
    <el-button type="primary" @click="submitExperimentForm">保存</el-button>
  </div>
</template>

<script>
import { classAPI } from "@/utils/api";
import { ElMessage } from "element-plus";
export default {
  props: {
    input_experiment: {
      type: Object,
      default: () => ({
        title: "",
        estimatedTime: "",
        safetyTags: [],
        experimentTags: [],
        submissionTags: [],
        otherTags: [],
        description: "",
        images: [],
        files: [],
      }),
    },
    class_id: {
      type: Number,
      Required: true,
    },
  },
  data() {
    return {
      experimentForm: {
        ...this.input_experiment, // 将父组件传入的实验数据作为默认值
        images: this.input_experiment?.images || [], // 如果没有传入，设置为默认空数组
        files: this.input_experiment?.files || [], // 如果没有传入，设置为默认空数组
      },
      newSafetyTag: "",
      newExperimentTag: "",
      newSubmissionTag: "",
      newOtherTag: "",
      experimentDialogVisible: false,
    };
  },
  methods: {
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
    removeTag(tagType, index) {
      this.experimentForm[tagType].splice(index, 1); // 删除指定索引的标签
    },
    handleFileChange(file, fileList) {
      this.experimentForm.files = fileList;
    },
    handleRemoveFile(file, fileList) {
      this.experimentForm.files = fileList;
    },
    handleImageChange(file, fileList) {
      this.experimentForm.images = fileList; // 保存图片文件
    },
    handleRemoveImage(file, fileList) {
      this.experimentForm.images = fileList; // 删除图片
    },
    async submitExperimentForm() {
      this.$refs.experimentForm.validate((valid) => {
        if (valid) {
          this.$emit("submit", this.experimentForm);
          this.experimentDialogVisible = false;
        }
      });
      console.log("exp!", this.experimentForm, this.class_id);
      // 在这里打包成 FormData
      let formData = new FormData();
      formData.append("class_id", this.class_id);
      formData.append("title", this.experimentForm.title);
      formData.append("estimated_time", this.experimentForm.estimatedTime);
      formData.append("safety_tags", this.experimentForm.safetyTags);
      formData.append(
        "experiment_method_tags",
        this.experimentForm.experimentTags
      );
      formData.append(
        "submission_type_tags",
        this.experimentForm.submissionTags
      );
      formData.append("other_tags", this.experimentForm.otherTags);
      formData.append("description", this.experimentForm.description);
      // 上传文件
      this.experimentForm.files.forEach((file) => {
        formData.append("files", file.raw);
      });
      // 上传图片
      this.experimentForm.images.forEach((image) => {
        formData.append("images", image.raw);
      });
      console.log("formData", formData);
      const result = await classAPI.postExperiment(formData);
      console.log("result", result);
      if (result.success) {
        ElMessage.success("实验创建成功");
      } else {
        ElMessage.error("实验创建失败");
      }
      this.closeDialog();
    },

    closeDialog() {
      this.$emit("close-dialog");
    },
  },
};
</script>

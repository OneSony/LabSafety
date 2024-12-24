<template>
  <el-card :body-style="{ padding: '20px' }" class="card">
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
        <strong>预估时间：</strong>{{ experiment.estimated_time }}
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <strong>安全标签：</strong>
        <el-tag
          v-for="(tag, i) in experiment.safety_tags"
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
          v-for="(tag, i) in experiment.experiment_method_tags"
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
          v-for="(tag, i) in experiment.submission_type_tags"
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
          v-for="(tag, i) in experiment.other_tags"
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

    <el-row>
      <el-col :span="24">
        <strong>实验图片：</strong>
        <el-row v-for="(image, i) in experiment.images" :key="i">
          <ImageBox :src="image.image" />
        </el-row>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <strong>实验文件：</strong>
        <el-row v-for="(file, i) in experiment.files" :key="i">
          <DownloadLink :url="file.file" />
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
import DownloadLink from "@/components/DownloadLink.vue";
import ImageBox from "./ImageBox.vue";
export default {
  name: "ExperimentCard",
  components: {
    DownloadLink,
    ImageBox,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    experiment: {
      type: Object,
      default: () => ({
        id: "",
        title: "",
        estimated_time: "",
        safety_tags: [],
        experiment_method_tags: [],
        submission_type_tags: [],
        other_tags: [],
        description: "",
        images: [],
        files: [],
      }),
    },
  },
  mounted() {
    console.log("experimentcard", this.experiment);
  },
};
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}
</style>

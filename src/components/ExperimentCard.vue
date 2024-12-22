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
          v-for="(tag, i) in experiment.submissionTags"
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
  </el-card>
</template>
<script>
export default {
  name: "ExperimentCard",
  props: {
    index: {
      type: Number,
      required: true,
    },
    experiment: {
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

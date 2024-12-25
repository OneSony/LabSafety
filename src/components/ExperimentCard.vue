<template>
  <el-card class="experiment-card">
    <div class="card-header">
      <h2 class="title">
        <span class="index">{{ index + 1 }}.</span>
        {{ experiment.title }}
      </h2>
      <div class="time">
        <el-icon><Timer /></el-icon>
        <span>预估时间: {{ experiment.estimated_time }}h</span>
      </div>
    </div>

    <div class="tags-section">
      <div class="tag-group">
        <span class="label">安全标签:</span>
        <el-tag
          v-for="tag in experiment.safety_tags"
          :key="tag"
          type="danger"
          >{{ tag }}</el-tag
        >
      </div>

      <div class="tag-group">
        <span class="label">实验方式:</span>
        <el-tag
          v-for="tag in experiment.experiment_method_tags"
          :key="tag"
          type="primary"
          >{{ tag }}</el-tag
        >
      </div>

      <div class="tag-group">
        <span class="label">作业形式:</span>
        <el-tag
          v-for="tag in experiment.submission_type_tags"
          :key="tag"
          type="success"
          >{{ tag }}</el-tag
        >
      </div>

      <div class="tag-group">
        <span class="label">其他标签:</span>
        <el-tag v-for="tag in experiment.other_tags" :key="tag" type="info">{{
          tag
        }}</el-tag>
      </div>
    </div>

    <div class="description">
      <h3>实验描述</h3>
      <p>{{ experiment.description }}</p>
    </div>

    <div
      class="media-section"
      v-if="experiment.images.length || experiment.files.length"
    >
      <div class="images" v-if="experiment.images.length">
        <h3>实验图片</h3>
        <div class="image-grid">
          <ImageBox
            v-for="image in experiment.images"
            :key="image.id"
            :src="image.image"
          />
        </div>
      </div>

      <div class="files" v-if="experiment.files.length">
        <h3>实验文件</h3>
        <div class="file-list">
          <DownloadLink
            v-for="file in experiment.files"
            :key="file.id"
            :url="file.file"
          />
        </div>
      </div>
    </div>
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
.experiment-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.experiment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.index {
  color: var(--el-color-primary);
  font-weight: 600;
}

.time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: 20px;
}

.tag-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  min-width: 80px;
  color: var(--el-text-color-secondary);
}

.description {
  margin-bottom: 24px;
}

.description h3,
.media-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
}

.description p {
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.tag {
  margin-right: 5px;
}
</style>

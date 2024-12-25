<template>
  <el-button type="text" class="download-button" @click="downloadFile">
    <el-icon><Download /></el-icon>
    <span class="download-text">{{ fileName }}</span>
  </el-button>
</template>

<script>
import { ElButton, ElIcon } from "element-plus";

export default {
  name: "DownloadLink",
  components: {
    ElButton,
    ElIcon,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      fileName: "", // 文件名
    };
  },
  mounted() {
    this.parseFileInfo();
  },
  methods: {
    // 解析文件信息（文件名和扩展名）
    parseFileInfo() {
      console.log("解析文件信息", this.url);
      const url = this.url;
      const index = url.lastIndexOf("/");
      this.fileName = decodeURIComponent(url.substring(index + 1));
      const dotIndex = this.fileName.lastIndexOf(".");
      const hyphenIndex = this.fileName.lastIndexOf("-", dotIndex);
      if (hyphenIndex !== -1) {
        this.fileName =
          this.fileName.substring(0, hyphenIndex) +
          this.fileName.substring(dotIndex);
      }
    },
    // 下载文件
    downloadFile() {
      const link = document.createElement("a");
      link.href = this.url;
      link.download = this.fileName; // 使用文件名作为下载文件名
      link.click();
    },
  },
};
</script>

<style scoped>
.download-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: auto;
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  word-wrap: break-word; /* 保证长单词会被换行 */
  white-space: normal; /* 允许文本换行 */
}

.download-button:hover {
  color: #66b1ff;
}

.download-text {
  margin-left: 8px;
  margin-right: 4px;
  display: inline-block;
  word-wrap: break-word;
  line-height: 1.2;
}
</style>

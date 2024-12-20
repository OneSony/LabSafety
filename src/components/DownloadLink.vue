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
      fileExt: "", // 扩展名
    };
  },
  mounted() {
    this.parseFileInfo();
  },
  methods: {
    // 解析文件信息（文件名和扩展名）
    parseFileInfo() {
      console.log("解析文件信息", this.url);
      const url = new URL(this.url); // 解析URL
      this.fileName = decodeURIComponent(url.pathname.split("/").pop()); // 提取文件名
      this.fileExt = this.fileName.split(".").pop().toLowerCase(); // 获取文件扩展名
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
  align-items: center;
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.download-button:hover {
  color: #66b1ff;
}

.download-text {
  margin-left: 8px;
}
</style>

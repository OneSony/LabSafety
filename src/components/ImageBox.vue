<template>
  <div style="width: 100%">
    <!-- 显示图片 -->
    <img
      :src="src"
      alt="点击查看全屏图"
      style="width: 100%; cursor: pointer"
      @click="openDialog"
    />

    <el-image-viewer
      class="image-viewer"
      v-if="showImageViewer"
      :url-list="[src]"
      @close="closeDialog"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const showImageViewer = ref(false);

const openDialog = () => {
  console.log("点击查看图片", props.src); // 调试时可以输出图片路径
  showImageViewer.value = true; // 打开对话框
  console.log("dialogVisible", showImageViewer.value); // 调试时可以输出对话框状态
  document.body.style.overflow = "hidden"; // 禁止滚动
};

const closeDialog = () => {
  showImageViewer.value = false; // 关闭对话框
  document.body.style.overflow = "auto";
};
</script>

<style scoped>
.image-viewer {
  position: fixed; /* 固定在屏幕上 */
  top: 0;
  left: 0;
  width: 100vw; /* 占据整个视口宽度 */
  height: 100vh; /* 占据整个视口高度 */
  pointer-events: auto;
  z-index: 9999; /* 确保它在最顶层 */
}
</style>

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

<script>
export default {
  name: "ImageBox",
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showImageViewer: false,
    };
  },
  methods: {
    openDialog() {
      this.showImageViewer = true;
      document.body.style.overflow = "hidden";
    },
    closeDialog() {
      this.showImageViewer = false;
      document.body.style.overflow = "auto";
    },
  },
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

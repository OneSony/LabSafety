<template>
  <div class="avatar-container">
    <img v-if="url" :src="url" alt="头像" :style="avatarStyle" />
  </div>
</template>

<script>
import { toRefs, computed, watch } from "vue";

export default {
  name: "ProfilePhoto",
  props: {
    url: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number],
      default: 50, // 默认大小 50px
    },
  },
  setup(props) {
    const { url, size } = toRefs(props);

    // 计算头像的样式
    const avatarStyle = computed(() => {
      const sizeValue =
        typeof size.value === "number" ? `${size.value}px` : size.value;
      return {
        width: sizeValue,
        height: sizeValue,
        borderRadius: "50%",
        objectFit: "cover",
      };
    });

    // watch 可以监听 url 或 size 的变化
    watch([url, size], ([newUrl, newSize]) => {
      console.log("头像 URL 更新为:", newUrl);
      console.log("头像大小更新为:", newSize);
    });

    return {
      avatarStyle,
    };
  },
};
</script>

<style scoped>
.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

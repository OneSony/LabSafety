<template>
  <div class="avatar-container">
    <img
      :src="displayUrl"
      alt="头像"
      :style="avatarStyle"
      @error="handleImageError"
    />
  </div>
</template>

<script>
import { toRefs, computed, ref } from "vue";
import defaultAvatar from "@/assets/default-avatar.png";

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
    const hasError = ref(false);

    // 计算实际显示的URL
    const displayUrl = computed(() => {
      return hasError.value || !url.value ? defaultAvatar : url.value;
    });

    // 处理图片加载错误
    const handleImageError = () => {
      hasError.value = true;
    };

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

    return {
      avatarStyle,
      displayUrl,
      handleImageError,
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

img {
  display: block;
}
</style>

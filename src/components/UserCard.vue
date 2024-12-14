<template>
  <div class="user-card">
    <!-- Tooltip 提示框 -->
    <el-tooltip class="item" effect="dark" placement="top-start">
      <div class="user-info">
        <!-- 用户头像 -->
        <el-avatar :src="user.avatarUrl" size="large" class="user-avatar" />
        <div class="user-details">
          <!-- 用户名 -->
          <span class="username">{{ user.username }}</span>
          <!-- 用户标签 -->
          <div class="user-tags">
            <el-tag
              v-if="user.tag === 'student'"
              type="success"
              class="user-tag"
              size="small"
            >
              学生
            </el-tag>
            <el-tag
              v-else-if="user.tag === 'teacher'"
              type="warning"
              class="user-tag"
              size="small"
            >
              教师
            </el-tag>
            <el-tag
              v-else-if="user.tag === 'mamager'"
              type="warning"
              class="user-tag"
              size="small"
            >
              实验室管理员
            </el-tag>
          </div>
        </div>
      </div>

      <template #content>
        <div>
          <h3>详细信息</h3>
          <p>班级:</p>
          <p>学院:</p>
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { ElAvatar, ElTooltip, ElTag } from "element-plus";
import { userAPI } from "@/utils/api";
import { ref, onMounted } from "vue";

export default defineComponent({
  name: "UserCard",
  components: {
    ElAvatar,
    ElTooltip,
    ElTag,
  },
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    // 使用 `ref` 创建响应式数据
    const user = ref({
      userId: props.userId,
      username: "",
      avatarUrl: "",
      tag: "",
    });

    // 获取用户信息函数
    const getUserInfo = async () => {
      const res = await userAPI.getUserInfo(props.userId);
      if (res.success) {
        user.value.username = res.data[0].username;
        user.value.avatarUrl = res.data[0].avatarUrl;
        user.value.tag = res.data[0].role;
      } else {
        console.log(res.message);
      }
    };

    // 在组件挂载时获取用户信息
    onMounted(() => {
      getUserInfo();
    });

    return {
      user,
    };
  },
});
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.user-avatar {
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.username {
  font-weight: bold;
}

.user-tags {
  display: flex;
}

.user-tag {
  margin-right: 5px;
}
</style>

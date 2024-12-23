<template>
  <div class="user-card">
    <!-- Tooltip 提示框 -->
    <el-tooltip class="item" effect="dark" placement="top-start">
      <div class="user-info">
        <!-- 用户头像 -->
        <ProfilePhoto :url="user.avatarUrl" size="50px" />
        <div class="user-details">
          <!-- 用户名 -->
          <span class="username">{{ user.username }}</span>
          <!-- 用户标签 -->
          <div class="user-tags">
            <el-tag
              v-if="user.role === 'student'"
              type="success"
              class="user-tag"
              size="small"
            >
              学生
            </el-tag>
            <el-tag
              v-else-if="user.role === 'teacher'"
              type="warning"
              class="user-tag"
              size="small"
            >
              教师
            </el-tag>
            <el-tag
              v-else-if="user.role === 'manager'"
              type="warning"
              class="user-tag"
              size="small"
            >
              实验室管理员
            </el-tag>
            <el-tag
              v-else-if="user.role === 'teachingAffairs'"
              type="danger"
              class="user-tag"
              size="small"
            >
              教务
            </el-tag>
          </div>
        </div>
      </div>

      <template #content>
        <div>
          <p>学院: {{ user.department }}</p>
          <p>
            {{ user.role === "student" ? "学号" : "工号" }}: {{ user.userId }}
          </p>
          <p>邮箱: {{ user.email }}</p>
          <p>电话: {{ user.phone_number }}</p>
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { ElTooltip, ElTag } from "element-plus";
import { userAPI } from "@/utils/api";
import { ref, onMounted } from "vue";
import ProfilePhoto from "@/components/ProfilePhoto.vue";

export default defineComponent({
  name: "UserCard",
  components: {
    ElTooltip,
    ElTag,
    ProfilePhoto,
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
      role: "",
      email: "",
      phone_number: "",
      department: "",
    });

    // 获取用户信息函数
    const getUserInfo = async () => {
      const res = await userAPI.getUserInfo(props.userId);
      console.log("get profile", res);
      if (res.success) {
        user.value.username = res.data[0].real_name;
        user.value.avatarUrl = res.data[0].profile_picture;
        user.value.role = res.data[0].role;
        user.value.email = res.data[0].email;
        user.value.phone_number = res.data[0].phone_number;
        user.value.department = res.data[0].department;
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
  width: 150px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px;
}

.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
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

<!-- src/views/LabDetail.vue -->
<template>
  <div class="lab-detail">
    <h2>实验室详细信息</h2>
    <el-card class="lab-card">
      <el-row :gutter="20">
        <!-- 左侧为实验室照片 -->
        <el-col :span="8">
          <div class="lab-photo-container">
            <el-image
              v-if="labDetails.photo"
              :src="labDetails.photo"
              style="width: 100%; max-height: 300px; object-fit: cover"
              fit="cover"
            ></el-image>
            <div
              v-else
              style="
                width: 100%;
                height: 300px;
                background-color: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <span>暂无照片</span>
            </div>
          </div>
        </el-col>

        <!-- 右侧为实验室基本信息 -->
        <el-col :span="16">
          <div class="lab-info">
            <p><strong>实验室名称:</strong> {{ labDetails.name }}</p>
            <p>
              <strong>实验室安全员:</strong> {{ labDetails.safety_officer }}
            </p>
            <p><strong>地点:</strong> {{ labDetails.location }}</p>
            <p><strong>联系方式:</strong> {{ labDetails.contact }}</p>
          </div>
        </el-col>
      </el-row>

      <!-- 下方列出安全器材 -->
      <div
        class="safety-equipment"
        v-if="labDetails.safety_equipment && labDetails.safety_equipment.length"
        style="margin-top: 30px"
      >
        <h3>实验室安全器材</h3>
        <el-table :data="labDetails.safety_equipment" style="width: 100%">
          <el-table-column prop="name" label="器材名称" />
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>

      <!-- 下方列出安全注意事项 -->
      <div
        class="safety-precautions"
        v-if="
          labDetails.safety_precautions && labDetails.safety_precautions.length
        "
        style="margin-top: 30px"
      >
        <h3>安全注意事项</h3>
        <ul class="precautions-list">
          <li
            v-for="(item, index) in labDetails.safety_precautions"
            :key="index"
          >
            {{ index + 1 }}. {{ item }}
          </li>
        </ul>
      </div>
    </el-card>

    <el-button type="primary" @click="goBack" style="margin-top: 20px"
      >返回</el-button
    >
  </div>
</template>

<script>
import { ElMessage } from "element-plus";

export default {
  // 不再需要 props 中的 labId
  data() {
    return {
      // 模拟一条实验室详情数据
      // 实际中，这里应该在 mounted 或 created 中通过 API 请求获取数据
      labDetails: {
        photo: "http://example.com/path/to/lab_photo.jpg",
        name: "物理实验室",
        safety_officer: "张三",
        location: "教学楼二楼",
        contact: "1234567890",
        safety_equipment: [
          { name: "灭火器", description: "用于火灾应急" },
          { name: "急救箱", description: "用于紧急医疗处理" },
        ],
        safety_precautions: [
          "佩戴防护眼镜",
          "避免吸入有害气体",
          "正确使用化学试剂",
        ],
      },
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
  mounted() {
    // 如果将来需要从 API 加载数据，可以在这里调用请求方法
    // 目前为展示布局，使用了固定数据
  },
};
</script>

<style scoped>
.lab-detail {
  padding: 20px;
}

.lab-card {
  margin-bottom: 20px;
}

.lab-photo-container {
  width: 100%;
  height: auto;
  background-color: #fafafa;
}

.lab-info p {
  margin: 5px 0;
}

.precautions-list {
  list-style-type: decimal;
  margin-left: 20px;
}
</style>

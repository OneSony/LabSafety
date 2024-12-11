<!-- src/views/LabDetail.vue -->
<template>
  <div class="lab-detail">
    <h2>实验室详细信息</h2>
    <el-card v-if="labDetails">
      <p><strong>实验室名称:</strong> {{ labDetails.name }}</p>
      <p><strong>地点:</strong> {{ labDetails.location }}</p>
      <p><strong>负责人:</strong> {{ labDetails.manager }}</p>
      <!-- 添加更多实验室信息 -->
    </el-card>
    <div v-else>
      <p>正在加载实验室详情...</p>
    </div>
    <el-button type="primary" @click="goBack" style="margin-top: 20px"
      >返回</el-button
    >
  </div>
</template>

<script>
import { labAPI } from "../utils/api"; // 正确引入 labAPI
import { ElMessage } from "element-plus";

export default {
  props: {
    labName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      labDetails: null, // 初始化为 null
    };
  },
  methods: {
    // 获取实验室详细信息
    fetchLabDetailsByName(labName) {
      console.log("Fetching details for lab:", labName);
      labAPI
        .getLabByName(labName)
        .then((response) => {
          if (response.success) {
            console.log("Lab details fetched:", response.data);
            this.labDetails = response.data;
          } else {
            ElMessage.error(response.error || "获取实验室详细信息失败");
          }
        })
        .catch((error) => {
          ElMessage.error("获取实验室详细信息失败");
          console.error(error);
        });
    },
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },
  },
  mounted() {
    if (this.labName) {
      this.fetchLabDetailsByName(this.labName);
    } else {
      ElMessage.error("实验室名称未提供");
    }
  },
};
</script>

<style scoped>
.lab-detail {
  padding: 20px;
}
</style>

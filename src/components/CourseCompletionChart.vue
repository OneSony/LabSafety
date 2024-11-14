<template>
  <el-card>
    <div>
      <el-progress
        type="circle"
        :percentage="completionRate"
        :color="['#67C23A', '#409EFF']"
      />
    </div>
  </el-card>
</template>

<script>
export default {
  props: {
    completed: {
      type: Number,
      default: 0,
    },
    ongoing: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    completionRate() {
      const total = this.completed + this.ongoing;
      return total > 0 ? Math.round((this.completed / total) * 100) : 0;
    },
  },
};
</script>

<style scoped>
.el-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>

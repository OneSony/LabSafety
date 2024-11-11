<template>
  <div>
    <el-card
      class="experiment-card"
      v-for="(item, index) in experiments"
      :key="index"
    >
      <div class="card-content">
        <el-avatar :src="item.icon" size="large"></el-avatar>
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <p>学时长：{{ item.duration }}分</p>
        </div>
        <el-progress :percentage="item.progress" type="circle"></el-progress>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  props: {
    experiments: Array,
  },
};
</script>

<style scoped>
.experiment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
}
.card-content {
  display: flex;
  align-items: center;
}
.info {
  margin-left: 20px;
}
</style>

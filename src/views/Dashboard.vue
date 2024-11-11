<template>
  <div class="dashboard">
    <SidebarMenu />
    <div class="content">
      <div class="tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="在学实验" name="ongoing">
            <ExperimentList :experiments="ongoingExperiments" />
          </el-tab-pane>
          <el-tab-pane label="已完成实验" name="completed">
            <ExperimentList :experiments="completedExperiments" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <PaginationComponent
        :total="totalExperiments"
        @page-changed="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import SidebarMenu from "../components/Sidebar.vue";
import ExperimentList from "../components/ExperimentList.vue";
import PaginationComponent from "../components/Pagination.vue";

export default {
  name: "DashboardView",
  components: { SidebarMenu, ExperimentList, PaginationComponent },
  data() {
    return {
      activeTab: "ongoing",
      ongoingExperiments: [
        {
          name: "生化实验",
          description: "基础入门",
          duration: 202,
          progress: 60,
          icon: "",
        },
        {
          name: "化学实验",
          description: "操作练习",
          duration: 150,
          progress: 30,
          icon: "",
        },
      ],
      completedExperiments: [],
      totalExperiments: 50,
    };
  },
  methods: {
    handlePageChange(page) {
      console.log("Page changed to:", page);
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
}
.content {
  padding: 20px;
  flex-grow: 1;
}
.tabs {
  margin-bottom: 20px;
}
</style>

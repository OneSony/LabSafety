<template>
  <div id="app">
    <HeaderComponent />
    <!-- <TeacherDashboard /> -->
    <LabManagerDashboard />
  </div>
</template>

<script>
import HeaderComponent from "./components/Header.vue";
// import TeacherDashboard from "./views/TeacherDashboard.vue";
import LabManagerDashboard from "./views/LabManagerDashboard.vue";
// import DashboardView from "./views/Dashboard.vue";

export default {
  name: "App",
  components: {
    HeaderComponent,
    LabManagerDashboard,
  },
};
</script>

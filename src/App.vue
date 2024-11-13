<template>
  <div id="app">
    <HeaderComponent />
    <TeacherDashboard />
  </div>
</template>

<script>
import HeaderComponent from "./components/Header.vue";
import TeacherDashboard from "./views/TeacherDashboard.vue";
// import DashboardView from "./views/Dashboard.vue";

export default {
  name: "App",
  components: {
    HeaderComponent,
    TeacherDashboard,
  },
};
</script>

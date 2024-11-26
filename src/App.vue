<template>
  <div id="app">
    <HeaderComponent />
    <!-- <Dashboard /> -->
    <!-- <TeacherDashboard /> -->
    <!-- <Login /> -->
    <!-- <LabManagerDashboard /> -->
    <Profile />
  </div>
</template>

<script>
import HeaderComponent from "./components/Header.vue";
// import Dashboard from "./views/Dashboard.vue";
// import TeacherDashboard from "./views/TeacherDashboard.vue";
// import LabManagerDashboard from "./views/LabManagerDashboard.vue";
// import DashboardView from "./views/Dashboard.vue";
// import Login from "./components/Login.vue";
import Profile from "./views/Profile.vue";

export default {
  name: "App",
  components: {
    HeaderComponent,
    // LabManagerDashboard,
    // TeacherDashboard,
    // Dashboard,
    // Login,
    Profile,
  },
};
</script>

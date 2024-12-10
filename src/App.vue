<template>
  <div id="app">
    <HeaderComponent />
    <!-- <CreateCourse /> -->
    <router-view />
    <!-- <Dashboard /> -->
    <!-- <TeacherDashboard /> -->
    <!-- <Login /> -->
    <!-- <LabManagerDashboard /> -->
  </div>
</template>

<script>
import HeaderComponent from "./components/Header.vue";
// import NotificationForm from "./components/NotificationForm.vue";
// import Dashboard from "./views/Dashboard.vue";
// import TeacherDashboard from "./views/TeacherDashboard.vue";
// import LabManagerDashboard from "./views/LabManagerDashboard.vue";
// import DashboardView from "./views/Dashboard.vue";
// import Login from "./components/Login.vue";
// import Profile from "./views/Profile.vue";
// import CreateCourse from "./views/CreateCourse.vue";
// import NotificationManagement from "./views/NotificationManagement.vue";
// import SafetyGuidelineManagement from "./views/SafetyGuidelineManagement.vue";

export default {
  name: "App",
  components: {
    HeaderComponent,
    // LabManagerDashboard,
    // TeacherDashboard,
    // Dashboard,
    // Login,
    // Profile,
  },
};
</script>

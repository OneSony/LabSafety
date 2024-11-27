<template>
  <div id="app">
    <HeaderComponent />
    <!-- <Dashboard /> -->
    <!-- <TeacherDashboard /> -->
    <!-- <Login /> -->
    <!-- <LabManagerDashboard /> -->
    <!-- <Profile /> -->
    <CreateCourse />
    <!-- <NotificationManagement /> -->
    <!-- <SafetyGuidelineManagement /> -->
    <!-- <NotificationForm /> -->
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
import CreateCourse from "./views/CreateCourse.vue";
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
    CreateCourse,
    // NotificationManagement,
    // SafetyGuidelineManagement,
    // NotificationForm,
  },
};
</script>

<template>
  <div id="app">
    <HeaderComponent />
    <DashboardView />
  </div>
</template>

<script>
import HeaderComponent from "./components/Header.vue";
import DashboardView from "./views/Dashboard.vue";

export default {
  name: "App",
  components: {
    HeaderComponent,
    DashboardView,
  },
};
</script>

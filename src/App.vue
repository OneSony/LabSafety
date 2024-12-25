<template>
  <div id="app">
    <HeaderComponent ref="header" />
    <router-view />
  </div>
</template>

<script>
import HeaderComponent from "./components/Header.vue";
export default {
  name: "App",
  components: {
    HeaderComponent,
  },
  methods: {
    updateHeader() {
      // 调用 HeaderComponent 中的方法来更新头像
      if (this.$refs.header) {
        this.$refs.header.updateUserPhoto();
      }
    },
  },
};
</script>

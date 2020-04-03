<template>
  <div id="app">
    <Main />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import Main from "./components/Main.vue";

export default defineComponent({
  name: "App",
  components: {
    Main
  }
});
</script>

<style lang="scss">
#app {
  font-family: "Roboto Regular", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>

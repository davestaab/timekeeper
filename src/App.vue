<template>
  <div id="app">
    <Timeline></Timeline>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Timeline from '@/components/Timeline.vue';

export default Vue.extend({
  name: 'App',
  components: { Timeline }
});
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #3d4852;
}
body {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='16' viewBox='0 0 12 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 .99C4 .445 4.444 0 5 0c.552 0 1 .45 1 .99v4.02C6 5.555 5.556 6 5 6c-.552 0-1-.45-1-.99V.99zm6 8c0-.546.444-.99 1-.99.552 0 1 .45 1 .99v4.02c0 .546-.444.99-1 .99-.552 0-1-.45-1-.99V8.99z' fill='%23F1F5F8' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
}
</style>

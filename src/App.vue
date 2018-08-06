<template>
  <div id="app">
    <Timeline/>
  </div>
</template>

<script>
import Timeline from './components/Timeline';

export default {
  name: 'App',
  components: {
    Timeline
  }
};
</script>

<style>
#app {
  font-family: 'Roboto Condensed', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

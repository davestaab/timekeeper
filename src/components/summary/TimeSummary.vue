<template>
  <div class="summary">
    <h1>Time Summary</h1>
    <by-category :times="times"></by-category>
  </div>
</template>

<script>
import ByCategory from './ByCategory';

export default {
  props: {
    times: {
      required: true
    }
  },
  components: {
    ByCategory
  }
}
</script>

<style scoped>
  .summary{
    flex: 1 0 auto;
  }
</style>

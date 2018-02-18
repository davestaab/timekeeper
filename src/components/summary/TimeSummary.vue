<script>
  import ByCategory from "./ByCategory";
  import Entries from "./Entries";

  export default {
    props: {
      times: {
        required: true
      },
      data: {
        required: true
      }
    },
    components: {
      ByCategory,
      Entries
    }
  };
</script>

<template>
  <div class="summary">
    <h2>Time Summary</h2>
    <by-category :times="times"></by-category>
    <entries :entries="data"></entries>
  </div>
</template>

<style scoped>
  .summary {
    flex: 1 0 auto;
  }
</style>

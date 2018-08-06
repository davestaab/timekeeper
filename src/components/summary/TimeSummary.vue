<script>
import ByCategory from './ByCategory';
import Entries from './Entries';

export default {
  components: {
    ByCategory,
    Entries
  },
  props: {
    times: {
      type: Object,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  }
};
</script>

<template>
  <div class="summary">
    <h2>Time Summary</h2>
    <by-category :times="times" />
    <entries :entries="data" />
  </div>
</template>

<style scoped>
.summary {
  flex: 1 0 auto;
}
</style>

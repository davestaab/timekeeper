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
  <div>
    <div class="text-3xl my-4">Time Summary</div>
    <by-category :times="times" />
    <entries :entries="data" />
  </div>
</template>

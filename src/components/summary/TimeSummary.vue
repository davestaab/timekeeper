<script>
import ByCategory from './ByCategory.vue';
import TkEntries from './TkEntries.vue';

export default {
  components: {
    ByCategory,
    TkEntries,
  },
  props: {
    times: {
      type: Object,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <div>
    <div class="text-3xl my-4">Time Summary</div>
    <by-category :times="times" />
    <tk-entries :entries="data" />
  </div>
</template>

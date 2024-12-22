<script>
import moment from 'moment';

export default {
  filters: {
    formatDate: function(value) {
      return value ? moment(value).format('hh:mm a') : value;
    }
  },
  props: {
    entries: {
      type: Array,
      required: true
    }
  }
};
</script>

<template>
  <div>
    <div class="text-xl my-2">Entries</div>
    <ul>
      <li v-for="e in entries" :key="e.id" class="m-1">
        {{ e.time | formatDate }} - {{ e.category }}
      </li>
    </ul>
  </div>
</template>

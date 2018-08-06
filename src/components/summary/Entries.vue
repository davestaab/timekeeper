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
    <h3>Entries</h3>
    <ul>
      <li 
        v-for="e in entries" 
        :key="e.id">{{ e.time | formatDate }} - {{ e.category }}</li>
    </ul>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  props: {
    entries: {
      type: Array,
      required: true,
    },
  },
  methods: {
    formatDate(value) {
      return value ? format(new Date(value), 'hh:mm aaa') : value;
    },
  },
};
</script>

<template>
  <div>
    <div class="text-xl my-2">Entries</div>
    <ul>
      <li v-for="e in entries" :key="e.id" class="m-1">
        {{ formatDate(e.time) }} - {{ e.category }}
      </li>
    </ul>
  </div>
</template>

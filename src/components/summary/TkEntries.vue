<script setup lang="ts">
import moment from 'moment';
import type { EntryPoint } from '@/utils';

const props = defineProps<{
  entries: EntryPoint[];
}>();

function formatDate(value: string) {
  return value ? moment(value).format('hh:mm a') : value;
}
</script>

<template>
  <div>
    <div class="text-xl my-2">Entries</div>
    <ul>
      <li v-for="e in props.entries" :key="e.id" class="m-1">
        {{ formatDate(e.time) }} - {{ e.category }}
      </li>
    </ul>
  </div>
</template>

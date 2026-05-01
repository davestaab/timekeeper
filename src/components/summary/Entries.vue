<script setup lang="ts">
import { format } from 'date-fns';

interface Entry {
  id: number;
  time: Date | string | null;
  category: string;
}

defineProps<{ entries: Entry[] }>();

function formatDate(value: Date | string | null): string | null {
  return value ? format(new Date(value), 'hh:mm aaa') : null;
}

defineExpose({ formatDate });
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

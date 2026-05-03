<script setup lang="ts">
import { format } from 'date-fns';
import type { TimelineEntry } from '@/types';

defineProps<{ entries: TimelineEntry[] }>();

function formatDate(value: Date | string | null): string | null {
  return value ? format(new Date(value), 'hh:mm aaa') : null;
}

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

<script setup lang="ts">
import ByCategory from './ByCategory.vue';
import Entries from './Entries.vue';
import type { TimelineEntry } from '@/types';

defineProps<{
  times: Record<string, number>;
  data: TimelineEntry[];
}>();
</script>

<template>
  <div>
    <div class="text-3xl my-4">Time Summary</div>
    <ByCategory :times="times" />
    <Entries :entries="data" />
  </div>
</template>

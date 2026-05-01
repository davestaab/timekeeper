<script setup lang="ts">
import ByCategory from './ByCategory.vue';
import Entries from './Entries.vue';

interface Entry {
  id: number;
  time: Date | string | null;
  category: string;
}

defineProps<{
  times: Record<string, number>;
  data: Entry[];
}>();
</script>

<template>
  <div>
    <div class="text-3xl my-4">Time Summary</div>
    <ByCategory :times="times" />
    <Entries :entries="data" />
  </div>
</template>

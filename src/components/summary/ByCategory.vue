<script setup lang="ts">
import type { Totals } from '@/timeline/utils';
import { computed } from 'vue';

const props = defineProps<{
  times: Totals;
}>();
const total = computed(() =>
  Object.keys(props.times).reduce((acc, key) => acc + props.times[key], 0),
);
function formatTime(time: number) {
  return time.toFixed(2).toString();
}
const keys = computed(() =>
  Object.keys(props.times).sort((a, b) => props.times[a] - props.times[b]),
);
</script>

<template>
  <div>
    <div class="text-xl my-2">Total By Category</div>
    <ul>
      <li v-for="key in keys" :key="key" class="m-1 flex">
        {{ formatTime(props.times[key]) }} hrs&nbsp;<span class="capitalize">{{ key }}</span>
      </li>
      <li class="m-1 font-bold">{{ formatTime(total) }} hrs Total</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DEAD_TIME, categoryLabel } from '@/timeline/utils';

const props = defineProps<{ times: Record<string, number> }>();

const trackedTimes = computed(() => {
  const rest = { ...props.times };
  delete rest[DEAD_TIME];
  return rest;
});

const total = computed(() =>
  Object.values(trackedTimes.value).reduce((sum, v) => sum + v, 0),
);

const deadTimeHours = computed(() => props.times[DEAD_TIME]);
</script>

<template>
  <div>
    <div class="text-xl my-2">Total By Category</div>
    <ul>
      <li v-for="(val, key) in trackedTimes" :key="key" class="m-1">
        {{ val }} hr(s): {{ key }}
      </li>
      <li class="m-1 font-bold">{{ total }}: Total</li>
      <li v-if="deadTimeHours !== undefined" class="m-1">
        {{ deadTimeHours }} hr(s): {{ categoryLabel(DEAD_TIME) }}
      </li>
    </ul>
  </div>
</template>

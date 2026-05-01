<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ times: Record<string, number> }>();

const total = computed(() =>
  Object.values(props.times).reduce((sum, v) => sum + v, 0)
);
</script>

<template>
  <div>
    <div class="text-xl my-2">Total By Category</div>
    <ul>
      <li v-for="(val, key) in times" :key="key" class="m-1">
        {{ val }} hr(s): {{ key }}
      </li>
      <li class="m-1 font-bold">{{ total }}: Total</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { EntryPoint } from '@/utils';
import ByCategory from './ByCategory.vue';
import TkEntries from './TkEntries.vue';

const props = defineProps<{
  times: Record<string, number>;
  data: EntryPoint[];
}>();
</script>

<template>
  <div>
    <div class="text-3xl my-4">Time Summary</div>
    <by-category :times="props.times" />
    <tk-entries :entries="props.data" />
  </div>
</template>

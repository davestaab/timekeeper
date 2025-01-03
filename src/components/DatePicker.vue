<script setup lang="ts">
import moment from 'moment';
import { computed } from 'vue';

const props = defineProps<{ currentDate: Date }>();
const formattedDate = computed(() => moment(props.currentDate).format('MMM DD, YYYY'));
const emit = defineEmits<{
  (e: 'nextDate', amount: number): void;
  (e: 'findToday'): void;
}>();
function nextDate(amount: number) {
  emit('nextDate', amount);
}
function findToday() {
  emit('findToday');
}
</script>

<template>
  <div class="flex justify-center items-center">
    <button class="cursor-pointer flex-none" @click="nextDate(-1)">&larr;</button>
    <div class="flex-none m-2" @click="findToday">{{ formattedDate }}</div>
    <button class="cursor-pointer flex-none" @click="nextDate(1)">&rarr;</button>
  </div>
</template>

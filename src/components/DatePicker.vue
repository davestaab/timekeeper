<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

const props = defineProps<{ currentDate: Date }>();

const emit = defineEmits<{
  nextDate: [amount: number];
  findToday: [];
}>();

const formattedDate = computed(() => format(props.currentDate, 'MMM dd, yyyy'));

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

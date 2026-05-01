<script setup lang="ts">
import { ref, computed } from 'vue';
import { getData, saveData } from '../utils';
import { timesByCategory } from '../timeline/utils';
import { format, parseISO } from 'date-fns';
import DatePicker from './DatePicker.vue';
import Categories from './Categories.vue';
import TimeSummary from './summary/TimeSummary.vue';
import TimeLineChart from './TimeLineChart.vue';

interface TimelineEntry {
  id: number;
  time: Date | string;
  category: string;
}

interface DayData {
  date: string;
  categories: string[];
  data: TimelineEntry[];
}

const data = ref<DayData[]>(getData());
const current = ref(data.value.length - 1);
const times = ref<Record<string, number>>({});

const currentData = computed(() => data.value[current.value]);
const currentDate = computed(() => parseISO(currentData.value.date));

function findToday() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const i = data.value.findIndex((d) => d.date === today);
  if (i < 0) {
    data.value.push({ categories: ['one', 'two', 'three', 'four'], data: [], date: today });
    current.value = data.value.length - 1;
  } else {
    current.value = i;
  }
}

function nextDate(amount: number) {
  const next = current.value + amount;
  current.value = next < 0 ? data.value.length - 1 : next >= data.value.length ? 0 : next;
  times.value = timesByCategory(data.value[current.value].data);
}

function chartUpdated(newTimes: Record<string, number>, chartData: TimelineEntry[]) {
  times.value = newTimes;
  currentData.value.data = chartData;
  saveData(data.value);
}

function deleteCategory(category: string) {
  currentData.value.categories = currentData.value.categories.filter((c) => c !== category);
}

function createCategory(category: string) {
  currentData.value.categories.push(category);
}

defineExpose({ data, current, currentData, times, findToday, nextDate, chartUpdated, deleteCategory, createCategory });
</script>

<template>
  <div class="container mx-auto px-4 pb-6">
    <div class="text-4xl text-center py-4">Time Keeper 🕰</div>
    <DatePicker :current-date="currentDate" @nextDate="nextDate" @findToday="findToday" />
    <TimeLineChart
      :categories="currentData.categories"
      :current-date="currentDate"
      :time-data="currentData.data"
      @onUpdate="chartUpdated"
    />
    <div class="flex">
      <Categories
        :categories="currentData.categories"
        class="flex-1 px-6"
        @deleteCategory="deleteCategory"
        @createCategory="createCategory"
      />
      <TimeSummary :times="times" :data="currentData.data" class="flex-1 px-6" />
    </div>
  </div>
</template>

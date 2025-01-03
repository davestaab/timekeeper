<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  getCategories,
  getData,
  saveCategories,
  saveData,
  type Entry,
  type EntryPoint,
} from '@/utils.ts';
import { timesByCategory } from '../timeline/utils.ts';
import moment from 'moment';
import DatePicker from './DatePicker.vue';
import TkCategories from './TkCategories.vue';
import TimeSummary from './summary/TimeSummary.vue';
import TimeLineChart from './TimeLineChart.vue';
const data = ref<Entry[]>(getData() ?? []);
const current = ref(data.value?.length - 1);
const currentData = computed(() => data.value[current.value]);
const currentDate = computed(() => moment(currentData.value.date).toDate());
const times = computed(() => {
  return timesByCategory(data.value[current.value].data);
});
function findToday() {
  const today = moment().format('YYYY-MM-DD');
  const i = data.value.findIndex((d) => d.date === today);
  if (i < 0) {
    // create new today entry
    data.value.push({
      categories: getCategories(),
      data: [],
      date: today,
    });
    current.value = data.value.length - 1;
  } else {
    current.value = i;
  }
}
function nextDate(amount: number) {
  const next = current.value + amount;
  current.value = next < 0 ? data.value.length - 1 : next >= data.value.length ? 0 : next;
}
function chartUpdated(chartData: EntryPoint[]) {
  data.value[current.value].data = chartData;
  saveData(data.value);
}
function deleteCategory(category: string) {
  data.value[current.value].categories = data.value[current.value].categories.filter(
    (cat) => cat !== category,
  );
}
function createCategory(category: string) {
  data.value[current.value].categories.push(category);
}
function saveDefaultCategories(categories: string[]) {
  saveCategories(categories);
}
</script>

<template>
  <div class="container mx-auto px-4 pb-6">
    <div class="text-4xl text-center py-4">
      Time Keeper
      <svg viewBox="0 0 16 16" width="48" height="48" class="inline">
        <path d="M0 12h4v-9h4v6h4v-3h4" class="stroke-indigo-900" fill="transparent" />
      </svg>
    </div>
    <div v-for="d in data" :key="d.date">
      {{ d }}
    </div>
    <date-picker :current-date="currentDate" @next-date="nextDate" @find-today="findToday" />
    <time-line-chart
      :categories="currentData.categories"
      :current-date="currentDate"
      :time-data="currentData.data"
      @on-update="chartUpdated"
    />
    <div class="flex">
      <tk-categories
        :categories="currentData.categories"
        class="flex-1 px-6"
        @delete-category="deleteCategory"
        @create-category="createCategory"
        @save-default-categories="saveDefaultCategories"
      />
      <time-summary :times="times" :data="currentData.data" class="flex-1 px-6" />
    </div>
  </div>
</template>

<style></style>

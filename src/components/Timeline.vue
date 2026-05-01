<script>
import { getData, saveData } from '../utils';
import { timesByCategory } from '../timeline/utils';
import { format, parseISO } from 'date-fns';
import DatePicker from './DatePicker.vue';
import Categories from './Categories.vue';
import TimeSummary from './summary/TimeSummary.vue';
import TimeLineChart from './TimeLineChart.vue';

export default {
  name: 'Timeline',
  components: {
    TimeLineChart,
    DatePicker,
    Categories,
    TimeSummary
  },
  data() {
    const data = getData();
    return {
      data,
      current: data.length - 1,
      times: {}
    };
  },
  computed: {
    currentData() {
      return this.data[this.current];
    },
    currentDate() {
      return parseISO(this.currentData.date);
    }
  },
  methods: {
    findToday() {
      const today = format(new Date(), 'yyyy-MM-dd');
      const i = this.data.findIndex(d => d.date === today);
      if (i < 0) {
        // create new today entry
        this.data.push({
          categories: ['one', 'two', 'three', 'four'],
          data: [],
          date: today
        });
        this.current = this.data.length - 1;
      } else {
        this.current = i;
      }
    },
    nextDate(amount) {
      const next = this.current + amount;
      this.current =
        next < 0 ? this.data.length - 1 : next >= this.data.length ? 0 : next;
      this.times = timesByCategory(this.data[this.current].data);
    },
    chartUpdated(times, chartData) {
      this.times = times;
      this.data[this.current].data = chartData;
      saveData(this.data);
    },
    deleteCategory(category) {
      this.data[this.current].categories = this.data[
        this.current
      ].categories.filter(cat => cat !== category);
    },
    createCategory(category) {
      this.data[this.current].categories.push(category);
    }
  }
};
</script>

<template>
  <div class="container mx-auto px-4 pb-6">
    <div class="text-4xl text-center py-4">Time Keeper 🕰</div>
    <date-picker
      :current-date="currentDate"
      @nextDate="nextDate"
      @findToday="findToday"
    />
    <time-line-chart
      :categories="currentData.categories"
      :current-date="currentDate"
      :time-data="currentData.data"
      @onUpdate="chartUpdated"
    />
    <div class="flex">
      <categories
        :categories="currentData.categories"
        class="flex-1 px-6"
        @deleteCategory="deleteCategory"
        @createCategory="createCategory"
      />
      <time-summary
        :times="times"
        :data="currentData.data"
        class="flex-1 px-6"
      />
    </div>
  </div>
</template>

<style></style>

<script>
import { getData, saveData } from '../utils';
import { timesByCategory } from '../timeline/utils';
import moment from 'moment';
import DatePicker from './DatePicker';
import Categories from './Categories';
import TimeSummary from './summary/TimeSummary.vue';
import TimeLineChart from './TimeLineChart';

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
      return moment(this.currentData.date).toDate();
    }
  },
  methods: {
    findToday() {
      const today = moment().format('YYYY-MM-DD');
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
  <div class="container mx-auto px-4">
    <div class="text-4xl text-center py-4">Time Keeper 🕰</div>
    <date-picker
      :current-date="currentDate"
      @nextDate="nextDate"
      @findToday="findToday" />
    <time-line-chart
      :categories="currentData.categories"
      :current-date="currentDate"
      :time-data="currentData.data"
      @onUpdate="chartUpdated" />
    <div class="flex">
      <categories
        :categories="currentData.categories"
        @deleteCategory="deleteCategory"
        @createCategory="createCategory" />
      <time-summary
        :times="times"
        :data="currentData.data" />
    </div>
  </div>
</template>

<style >
</style>

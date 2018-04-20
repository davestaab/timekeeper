<script>
  import { getData } from "../utils";
  import { timesByCategory } from "../timeline/utils";
  import moment from "moment";
  import DatePicker from "./DatePicker";
  import Categories from "./Categories";
  import TimeSummary from "./summary/TimeSummary.vue";
  import TimeLineChart from "./TimeLineChart";

  export default {
    name: "Timeline",
    data() {
      return {
        data: getData(),
        current: 0,
        times: []
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
        if(i < 0) {
          // create new today entry
          this.data.push({
            categories: [],
            data: [],
            date: today
          })
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
      },
      deleteCategory(category) {
        this.data[this.current].categories = this.data[
          this.current
        ].categories.filter(cat => cat !== category);
      },
      createCategory(category) {
        this.data[this.current].categories.push(category);
      }
    },
    components: {
      TimeLineChart,
      DatePicker,
      Categories,
      TimeSummary
    }
  };
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.h1">Time Line</h1>
    <date-picker :current-date="currentDate" @nextDate="nextDate" @findToday="findToday"></date-picker>
    <time-line-chart :categories="currentData.categories" :current-date="currentDate" :time-data="currentData.data" @onUpdate="chartUpdated"></time-line-chart>
    <div :class="$style.summary">
      <categories :categories="currentData.categories" @deleteCategory="deleteCategory" @createCategory="createCategory"></categories>
      <time-summary :times="times" :data="currentData.data"></time-summary>
    </div>
  </div>
</template>

<style module>
  .summary {
    display: flex;
  }
  .container {
    max-width: 760px;
    margin: 0 auto;
  }
  .h1 {
    text-align: center;
  }
</style>

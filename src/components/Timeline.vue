<script>
  import { getData } from "../utils";
  import moment from "moment";
  import DatePicker from "./DatePicker";
  import Categories from "./Categories";
  import TimeSummary from "./summary/TimeSummary.vue";

  const TimeLineChart = () => import("./TimeLineChart");

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
      currentData: function() {
        return this.data[this.current];
      },
      currentDate: function() {
        return moment(this.currentData.date).toDate();
      }
    },
    methods: {
      nextDate: function(amount) {
        const next = this.current + amount;
        this.current =
          next < 0 ? this.data.length - 1 : next >= this.data.length ? 0 : next;
      },
      chartUpdated: function(times, chartData) {
        // console.log('chartData', chartData);
        this.times = times;
        // this.data[this.current].data = chartData;
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
  <div class="container">
    <h1>Time Line</h1>
    <date-picker :current-date="currentDate" @nextDate="nextDate"></date-picker>
    <time-line-chart :chart-data="currentData" @onUpdate="chartUpdated"></time-line-chart>
    <div class="category-summary">
      <categories :categories="currentData.categories"></categories>
      <time-summary :times="times" :data="currentData.data"></time-summary>
    </div>
  </div>
</template>

<style scoped>
  .category-summary {
    display: flex;
  }
  .container {
    max-width: 760px;
    margin: 0 auto;
  }
  h1 {
    text-align: center;
  }
</style>

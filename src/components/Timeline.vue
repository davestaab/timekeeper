<template>
  <div>
    <h1>Time Line</h1>
    <div class="date-picker">
      <button class="arrow" @click="nextDate(-1)">&larr;</button>
      <div class="date">{{currentDate}}</div>
      <button class="arrow" @click="nextDate(1)">&rarr;</button>
    </div>
    <time-line-chart :chart-data="currentData"></time-line-chart>
  </div>
</template>

<script>
import { getData } from '../utils'
import TimeLineChart from './TimeLineChart'
import moment from 'moment'

export default {
  name: 'Timeline',
  data () {
    return {
      data: getData(),
      current: 0,
    }
  },
  computed: {
    currentData: function () {
      return this.data[this.current]
    },
    currentDate: function () {
      return moment(this.currentData.date).format('MMM D, YYYY')
    },
  },
  methods: {
    nextDate: function (amount) {
      const next = this.current + amount
      this.current = next < 0 ? 0 : next >= this.data.length ? this.data.length - 1 : next
    },
  },
  components: {
    TimeLineChart,
  },
}
</script>

<style scoped>
.date-picker {
  display: flex;
  justify-content: center;
  align-items: center;
}
.date {
  margin: 10px;
  flex: 0 0 auto;
}
.arrow {
  flex: 0 0 auto;
  cursor: pointer;
}
</style>

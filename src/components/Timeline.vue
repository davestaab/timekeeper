<template>
  <div>
    <h1>Time Line</h1>
    <date-picker :current-date="currentDate" @nextDate="nextDate"></date-picker>
    <time-line-chart :chart-data="currentData"></time-line-chart>
  </div>
</template>

<script>
import { getData } from '../utils'
import moment from 'moment'
import DatePicker from './DatePicker'

const TimeLineChart = () => import('./TimeLineChart')

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
      return moment(this.currentData.date).toDate()
    },
  },
  methods: {
    nextDate: function (amount) {
      const next = this.current + amount
      this.current = next < 0 ? this.data.length - 1 : next >= this.data.length ? 0 : next
    },
  },
  components: {
    TimeLineChart,
    DatePicker,
  },
}
</script>

<style scoped>
</style>

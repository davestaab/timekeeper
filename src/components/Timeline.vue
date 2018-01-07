<template>
  <div>
    <h1>Time Line</h1>
    <time-line-chart :chart-data="data"></time-line-chart>
  </div>
</template>

<script>
import { getData } from '../utils'
import TimeLineChart from './TimeLineChart'

export default {
  name: 'Timeline',
  data () {
    return {
      data: getData(),
    }
  },
  components: {
    TimeLineChart,
  },
}
</script>

<style scoped>

</style>

<template>

</template>


<script>
import TimeLineChart from '@/timeline/TimeLineChart'
import { select } from 'd3'

const chart = TimeLineChart()
// .categories(['personal', 'scrum', 'dev', 'planning', 'testing'])

export default {
  name: 'TimelineChart',
  props: [
    'chartData',
  ],
  mounted: function () {
    console.log('mounted!')
    console.log('this', this)
    const entry = this.chartData[0]
    console.log('chart data is: ', entry.data.map(inflate))
    chart
      .categories(entry.categories)
      .data(entry.data.map(inflate))
    select(this.$el).call(chart)
    console.log('chart debug:', chart.debug())
  },
}
/**
 * Inflate the date object from a string (as stored in local storage) to a date object
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function inflate (d) {
  d.time = new Date(d.time)
  return d
}
</script>
<template>
  <div class="chart-container"></div>
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

<style lang="css">
.chart-container {
  width: 760px;
  margin: 0 auto;
}
.line {
    stroke: blueviolet;
    fill: none;
    stroke-linejoin: round;
    stroke-width: 5px;
    stroke-linecap: round;
}
.chart {
    margin: 0 auto;
}
.timeline {
    background: lightcyan;
    border: thin solid darkcyan;
    display: block;
    margin: 0 auto;
    max-height: 200px;
}

.tick line {
    stroke: black;
}

.axis line,
.axis path {
    fill: none;
    stroke: black;
    shape-rendering: crispEdges;
}

.axis text {
    font-family: sans-serif;
    font-size: 11px;
}

.point {
    stroke: blueviolet;
    fill: rgba(33, 33, 33, .1);
}

.hover {
    stroke: blueviolet;
    fill: rgba(66, 66, 66, .3);
    opacity: 1;
    transition: opacity .65s ease-out;
}
.hover--off {
    opacity: 0
}
</style>
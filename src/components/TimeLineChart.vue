<script>
  import TimeLineChart from "@/timeline/TimeLineChart";
  import { select } from "d3";

  export default {
    name: "TimelineChart",
    props: ["categories", "timeData"],
    data: function() {
      return {
        chart: TimeLineChart()
      };
    },
    mounted: function() {
      this.chart.categories(this.categories).data(this.timeData.map(inflate));
      select(this.$el).call(this.chart);
      this.chart.notifyOnUpdate(this.onUpdate);
      this.onUpdate(this.chart);
    },
    watch: {
      categories: function(newVal, oldVal) {
        this.updateCategories();
      },
      timeData: function(newVal, oldVal) {
        this.updateData();
      }
    },
    methods: {
      updateCategories: function() {
        this.chart.categories(this.categories);
      },
      updateData: function() {
        this.chart.data(this.timeData.map(inflate));
      },
      onUpdate: function(chart) {
        this.$emit("onUpdate", chart.timesByCategory(), chart.data());
      }
    }
  };

  /**
   * Inflate the date object from a string (as stored in local storage) to a date object
   * @param  {[type]} d [description]
   * @return {[type]}   [description]
   */
  function inflate(d) {
    d.time = new Date(d.time);
    return d;
  }
</script>

<template>
  <div class="chart-container"></div>
</template>

// can't scope this. has to style the d3 chart
<style >
  .chart-container {
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
    fill: rgba(33, 33, 33, 0.1);
  }

  .hover {
    stroke: blueviolet;
    fill: rgba(66, 66, 66, 0.3);
    opacity: 1;
    transition: opacity 0.65s ease-out;
  }
  .hover--off {
    opacity: 0;
  }
</style>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import TimeLineChartFactory from '@/timeline/TimeLineChart';
import { select } from 'd3';
import type { TimelineTimelineEntry } from '@/types';

const props = withDefaults(
  defineProps<{
    categories: string[];
    timeData: TimelineEntry[];
    currentDate: Date | null;
  }>(),
  { categories: () => [], timeData: () => [], currentDate: null }
);

const emit = defineEmits<{
  onUpdate: [times: Record<string, number>, data: TimelineEntry[]];
}>();

function inflate(d: TimelineEntry): TimelineEntry {
  d.time = new Date(d.time);
  return d;
}

const chart = TimeLineChartFactory();
const cachedCurrentDate = ref<Date | null>(null);
const container = ref<HTMLElement | null>(null);

function onUpdate(c: typeof chart) {
  emit('onUpdate', c.timesByCategory(), c.data());
}

watch(
  () => props.categories,
  () => chart.categories(props.categories)
);

watch(
  () => props.timeData,
  () => {
    if (props.currentDate !== cachedCurrentDate.value) {
      cachedCurrentDate.value = props.currentDate;
      chart.reset(props.currentDate);
    }
    chart.data(props.timeData.map(inflate));
  }
);

onMounted(() => {
  chart.categories(props.categories).data(props.timeData.map(inflate));
  select(container.value!).call(chart);
  onUpdate(chart);
  chart.notifyOnUpdate(onUpdate);
});
</script>

<template>
  <div ref="container" class="justify-items-center" />
</template>

<!-- can't scope this — has to style the d3 chart -->
<style>
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
  max-height: 400px;
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

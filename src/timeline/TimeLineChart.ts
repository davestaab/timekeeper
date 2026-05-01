import {
  select,
  pointer,
  axisBottom,
  axisLeft,
  line,
  scaleTime,
  scalePoint,
  curveStepAfter,
  timeMinute,
  easeCubicOut,
  extent,
  type Selection,
} from 'd3';
import {
  cleanData,
  invertX,
  invertY,
  noop,
  identity,
  addHourAfter,
  addHourBefore,
  addPoint,
  removeUnknownCategories,
  timesByCategory,
  findStartIndex,
  formatCategory,
} from './utils';
import { getMinutes, format, parseISO, set } from 'date-fns';
import type { TimelineEntry, Margin } from '../types';

interface DateWindow {
  time: Date;
}

export interface Chart {
  (selection: Selection<HTMLElement, unknown, null, undefined>): void;
  data(): TimelineEntry[];
  data(entries: TimelineEntry[]): Chart;
  notifyOnUpdate(): (chart: Chart) => void;
  notifyOnUpdate(fn: (chart: Chart) => void): Chart;
  timesByCategory(): Record<string, number>;
  margin(): Margin;
  margin(m: Margin): Chart;
  width(): number;
  width(w: number): Chart;
  height(): number;
  height(h: number): Chart;
  categories(): string[];
  categories(cats: string[]): Chart;
  useTransitions(): boolean;
  useTransitions(val: boolean): Chart;
  reset(dateStr: string | Date): void;
  debug(): { yScale: unknown; xScale: unknown; categories: string[]; data: TimelineEntry[] };
}

function TimeLineChart(): Chart {
  let width = 760;
  let height = 200;
  let categories = ['red', 'blue', 'one', 'two'];
  let margin: Margin = { top: 50, right: 50, bottom: 50, left: 75 };
  let data: TimelineEntry[] = [];
  let _notifyOnUpdate: (chart: Chart) => void = noop;

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const duration = 500;
  const ease = easeCubicOut;
  const pointRadius = 6;
  let dataIndex = 0;
  const timeInc = 60;
  let svg: any = null;
  let yScale: any;
  let xScale: any;
  let xAxis: any;
  let yAxis: any;
  let chartLine: any;
  let invertYScale: (y: number) => string;
  let invertXScale: (x: number) => Date;
  let chartGrp: any;
  let hover: any;
  let useTransitions = true;
  let dateWindow: DateWindow[] = [];

  let updateCategories: () => void = noop;
  let updateChart: (data: TimelineEntry[], opts: { notify?: boolean }) => void = noop;

  function X(d: TimelineEntry): number {
    return xScale(d.time);
  }

  function Y(d: TimelineEntry): number {
    return yScale(d.category);
  }

  const formatDateWindow = (d: Date): DateWindow => ({ time: new Date(d) });

  function updateXScale(entries: TimelineEntry[]): void {
    if (xScale) {
      const e = extent([...entries, ...dateWindow], (d) => d.time);
      xScale.domain(e);
    }
  }

  function moveListener(hoverEl: any) {
    return function (event: MouseEvent) {
      const coords = pointer(event);
      hoverEl
        .attr('cx', xScale(invertXScale(coords[0] - margin.left)))
        .attr('cy', yScale(invertYScale(coords[1] - margin.top)));
    };
  }

  function liveUpdateCategories(): void {
    data = removeUnknownCategories(data, categories);
    yScale.domain(categories);
    svg.select('.y.axis').call(yAxis);
    updateChart(data, {});
  }

  function moveEnterLeaveListener(type: string, hoverEl: any) {
    return function () {
      hoverEl.classed('hover--off', type === 'leave');
    };
  }

  function clickListener() {
    return function (event: MouseEvent) {
      const coords = pointer(event) as [number, number];
      const updateAfter = addHourAfter(margin.left + chartWidth, timeInc)(
        xScale.domain() as [Date, Date],
        coords
      );
      if (updateAfter) {
        dateWindow = updateAfter.map(formatDateWindow);
        xScale.domain(updateAfter);
      }
      const updateBefore = addHourBefore(margin.left, timeInc)(
        xScale.domain() as [Date, Date],
        coords
      );
      if (updateBefore) {
        dateWindow = updateBefore.map(formatDateWindow);
        xScale.domain(updateBefore);
      }
      const newPoint = addPoint(margin, chartWidth, invertXScale, invertYScale)(
        coords,
        dataIndex++
      );
      if (newPoint?.category) {
        data.push(newPoint);
        data = cleanData(data);
      }
      updateChart(data, { notify: !!newPoint });
    };
  }

  function addTransitions(selection: any): any {
    if (useTransitions) {
      return selection.transition().duration(duration).ease(ease);
    }
    return selection;
  }

  function updatePoints(entries: TimelineEntry[]): void {
    const update = svg.select('.all').selectAll('.point').data(entries, identity);
    addTransitions(update).attr('cx', X).attr('cy', Y).attr('r', pointRadius);
    addTransitions(
      update.enter().append('circle').attr('class', 'point').attr('cx', X).attr('cy', Y).attr('r', 0)
    ).attr('r', pointRadius);
    addTransitions(update.exit()).attr('r', 0).remove();
  }

  function updateScales(): void {
    addTransitions(
      svg.select('.x.axis').attr('transform', 'translate(0,' + chartHeight + ')')
    ).call(xAxis);
    addTransitions(svg.select('.y.axis')).call(yAxis);
  }

  function updateLine(entries: TimelineEntry[]): void {
    addTransitions(svg.select('.line').data([entries])).attr('d', chartLine);
  }

  function chart(selection: Selection<HTMLElement, unknown, null, undefined>): void {
    selection.each(function () {
      xScale = scaleTime().range([0, chartWidth]).clamp(true);
      updateXScale(data);
      yScale = scalePoint().domain(categories).rangeRound([chartHeight, 0]);

      xAxis = axisBottom(xScale)
        .ticks(timeMinute.every(15))
        .tickFormat((d) => (getMinutes(d as Date) === 0 ? format(d as Date, 'hh') : ''));
      yAxis = axisLeft(yScale).tickFormat(formatCategory);
      chartLine = line<TimelineEntry>().x(X).y(Y).curve(curveStepAfter);
      invertYScale = invertY(yScale);
      invertXScale = invertX(xScale);

      svg = select(this)
        .append('svg')
        .attr('viewBox', [0, 0, width, height].join(' '))
        .classed('timeline', true);

      chartGrp = svg
        .append('g')
        .attr('class', 'all')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      chartGrp.append('path').attr('class', 'line');
      chartGrp.append('g').attr('class', 'x axis');
      chartGrp.append('g').attr('class', 'y axis');
      hover = chartGrp
        .append('circle')
        .attr('class', 'hover')
        .attr('r', pointRadius)
        .classed('hover--off', true);
      svg
        .append('g')
        .append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
        .on('mousemove', moveListener(hover))
        .on('click', clickListener())
        .on('mouseleave', moveEnterLeaveListener('leave', hover))
        .on('mouseenter', moveEnterLeaveListener('enter', hover));

      function liveUpdateChart(
        entries: TimelineEntry[],
        { notify = false }: { notify?: boolean }
      ): void {
        updatePoints(entries);
        updateScales();
        updateLine(entries);
        if (notify) _notifyOnUpdate(chart as Chart);
      }

      updateCategories = liveUpdateCategories;
      updateChart = liveUpdateChart;
      updateChart(data, { notify: true });
    });
  }

  (chart as any).data = function (_?: TimelineEntry[]) {
    if (!arguments.length) return data;
    data = cleanData(_!);
    dataIndex = findStartIndex(_!);
    updateXScale(data);
    updateChart(data, {});
    return chart;
  };

  (chart as any).notifyOnUpdate = function (_?: (c: Chart) => void) {
    if (!arguments.length) return _notifyOnUpdate;
    _notifyOnUpdate = _!;
    return chart;
  };

  (chart as any).timesByCategory = function () {
    return timesByCategory(data);
  };

  (chart as any).margin = function (_?: Margin) {
    if (!arguments.length) return margin;
    margin = _!;
    return chart;
  };

  (chart as any).width = function (_?: number) {
    if (!arguments.length) return width;
    width = _!;
    return chart;
  };

  (chart as any).height = function (_?: number) {
    if (!arguments.length) return height;
    height = _!;
    return chart;
  };

  (chart as any).categories = function (_?: string[]) {
    if (!arguments.length) return categories;
    categories = _!;
    updateCategories();
    return chart;
  };

  (chart as any).useTransitions = function (_?: boolean) {
    if (!arguments.length) return useTransitions;
    useTransitions = _!;
    return chart;
  };

  (chart as any).reset = function (dateStr: string | Date): void {
    const dt = parseISO(
      typeof dateStr === 'string' ? dateStr : format(dateStr, 'yyyy-MM-dd')
    );
    dateWindow = [
      { time: set(dt, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 }) },
      { time: set(dt, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 }) },
    ];
  };

  (chart as any).debug = function () {
    return { yScale, xScale, categories, data };
  };

  return chart as Chart;
}

export default TimeLineChart;

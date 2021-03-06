import {
  select,
  mouse,
  axisBottom,
  axisLeft,
  line,
  scaleTime,
  scalePoint,
  curveStepAfter,
  timeMinute,
  easeCubicOut,
  extent
} from 'd3';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { transition } from 'd3';

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
  formatCategory
} from './utils';

import moment from 'moment';

function TimeLineChart() {
  /***************************
   * Accessible varibles.
   * These variables can be set externally.
   ****************************/
  let width = 760;
  let height = 200;
  let categories = ['red', 'blue', 'one', 'two'];
  let margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 75
  };
  let data = [];
  let _notifyOnUpdate = noop;

  /***************************
   * Internal Variables
   ****************************/
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const duration = 500;
  const ease = easeCubicOut;
  const pointRadius = 6;
  let dataIndex = 0;
  const timeInc = 60;
  let svg = null;
  let yScale;
  let xScale;
  let xAxis;
  let yAxis;
  let chartLine;
  let invertYScale;
  let invertXScale;
  let chartGrp;
  let hover;
  let useTransitions = true;
  // date window is used to keep the domain wider then the current dataset.
  // e.g. to start the chart shows morning throw afternoon
  // if widened, it'll keep that window until reloaded
  let dateWindow = [];

  // update functions
  let updateCategories = noop;
  // let updateData = noop
  let updateChart = noop;

  // The x-accessor for the path generator.
  function X(d) {
    return xScale(d.time);
  }

  // The x-accessor for the path generator
  function Y(d) {
    return yScale(d.category);
  }

  const formatDateWindow = d => ({ time: moment(d).toDate() });

  function updateXScale(data) {
    if (xScale) {
      const e = extent([...data, ...dateWindow], d => d.time);
      xScale.domain(e);
    }
  }

  function moveListener(hover) {
    return function() {
      const coords = mouse(this);
      hover
        .attr('cx', xScale(invertXScale(coords[0] - margin.left)))
        .attr('cy', yScale(invertYScale(coords[1] - margin.top)));
    };
  }

  function liveUpdateCategories() {
    data = removeUnknownCategories(data, categories);
    yScale.domain(categories);
    svg.select('.y.axis').call(yAxis);
    updateChart(data, {});
  }

  function moveEnterLeaveListener(type, hover) {
    return function() {
      hover.classed('hover--off', type === 'leave');
    };
  }

  function clickListener() {
    return function() {
      const coords = mouse(this);
      // check if we need to add an hour before
      const updateAfter = addHourAfter(margin.left + chartWidth, timeInc)(
        xScale.domain(),
        coords
      );
      if (updateAfter) {
        dateWindow = updateAfter.map(formatDateWindow);
        xScale.domain(updateAfter);
      }
      // check if we need to add an hour after
      const updateBefore = addHourBefore(margin.left, timeInc)(
        xScale.domain(),
        coords
      );
      if (updateBefore) {
        dateWindow = updateBefore.map(formatDateWindow);
        xScale.domain(updateBefore);
      }

      // check if the click point should be added to the timeline
      const newPoint = addPoint(
        margin,
        chartWidth,
        invertXScale,
        invertYScale
      )(coords, dataIndex++);
      if (newPoint && newPoint.category) {
        data.push(newPoint);
        data = cleanData(data);
      }

      // double negate newPoint to convert it to a boolean
      updateChart(data, { notify: !!newPoint });
    };
  }

  function addTransitions(selection) {
    if (useTransitions) {
      return selection
        .transition()
        .duration(duration)
        .ease(ease);
    }
    return selection;
  }

  function updatePoints(data) {
    // update
    const update = svg
      .select('.all')
      .selectAll('.point')
      .data(data, identity);
    addTransitions(update)
      .attr('cx', X)
      .attr('cy', Y)
      .attr('r', pointRadius);

    // enter
    addTransitions(
      update
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', X)
        .attr('cy', Y)
        .attr('r', 0)
    ).attr('r', pointRadius);

    // exit
    addTransitions(update.exit())
      .attr('r', 0)
      .remove();
  }

  function updateScales() {
    // update x axis
    addTransitions(
      svg
        .select('.x.axis')
        .attr('transform', 'translate(0,' + chartHeight + ')')
    ).call(xAxis);

    // update y axis
    addTransitions(svg.select('.y.axis')).call(yAxis);
  }

  function updateLine(data) {
    addTransitions(svg.select('.line').data([data])).attr('d', chartLine);
  }

  // constructor
  function chart(selection) {
    selection.each(function() {
      xScale = scaleTime()
        .range([0, chartWidth])
        .clamp(true);
      updateXScale(data);
      yScale = scalePoint()
        .domain(categories)
        .rangeRound([chartHeight, 0]);

      xAxis = axisBottom(xScale)
        .ticks(timeMinute.every(15))
        .tickFormat(function(d) {
          return moment(d).minute() === 0 ? moment(d).format('hh') : '';
        });
      yAxis = axisLeft(yScale).tickFormat(formatCategory);
      chartLine = line()
        .x(X)
        .y(Y)
        .curve(curveStepAfter);
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
      // overlay
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

      function liveUpdateChart(data, { notify = false }) {
        updatePoints(data);
        updateScales(data);
        updateLine(data);
        if (notify) {
          _notifyOnUpdate(chart);
        }
      }

      updateCategories = liveUpdateCategories;
      updateChart = liveUpdateChart;
      updateChart(data, { notify: true });
    });
  }

  chart.data = function(_) {
    if (!arguments.length) return data;

    data = cleanData(_);
    dataIndex = findStartIndex(_);
    updateXScale(data);
    updateChart(data, {});
    return chart;
  };

  /**
   * Provide a function that gets called when data is updated.
   * @param {function} _ the provided function is called and given the chart object.
   */
  chart.notifyOnUpdate = function(_) {
    if (!arguments.length) return _notifyOnUpdate;
    _notifyOnUpdate = _;
    return chart;
  };

  chart.timesByCategory = function() {
    return timesByCategory(data);
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.categories = function(_) {
    if (!arguments.length) return categories;
    categories = _;
    updateCategories();
    return chart;
  };

  chart.useTransitions = function(_) {
    if (!arguments.length) return useTransitions;
    useTransitions = _;
    return chart;
  };

  chart.reset = function(dateStr) {
    const dt = moment(dateStr, 'YYYY-MM-DD');
    dateWindow = [
      {
        // min time for the xScale domain: 7am
        time: moment(dt)
          .hour(7)
          .minute(0)
          .toDate()
      },
      {
        // max time for the xScale domain: 6pm
        time: moment(dt)
          .hour(18)
          .minute(0)
          .toDate()
      }
    ];
  };

  chart.debug = function() {
    return {
      yScale,
      xScale,
      categories,
      data
    };
  };

  return chart;
}

export default TimeLineChart;

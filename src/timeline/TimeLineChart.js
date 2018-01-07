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
  transition, // eslint-disable-line no-unused-vars
  easeCubicOut,
} from 'd3'

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
} from './utils'

import moment from 'moment'

function TimeLineChart () {
  /***************************
  * Accessible varibles.
  * These variables can be set externally.
  ****************************/
  let width = 760
  let height = 200
  let categories = ['red', 'blue', 'one', 'two']
  // let xValue = d => d.time
  // // default accessor
  // let yValue = d => d.category
  let margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 75,
  }
  let data = []
  let _notifyOnUpdate = noop

  /***************************
  * Internal Variables
  ****************************/
  let chartWidth = width - margin.left - margin.right
  let chartHeight = height - margin.top - margin.bottom
  let duration = 1500
  let ease = easeCubicOut
  let pointRadius = 6
  let dataIndex = 0
  let timeInc = 60
  let svg = null
  let yScale
  let xScale
  let xAxis
  let yAxis
  let chartLine
  let invertYScale
  let invertXScale
  let chartGrp
  let hover
  let useTransitions = true

  // update functions
  let updateCategories = noop
  // let updateData = noop
  let updateChart = noop

  // constructor
  function chart (selection) {
    selection.each(function () {
      xScale = scaleTime()
        .domain([moment().hours(6).minutes(0).second(0).toDate(), moment().hours(17).minutes(0).second(0).toDate()])
        .range([0, chartWidth])
        .clamp(true)
      yScale = scalePoint()
        .domain(categories)
        .rangeRound([chartHeight, 0])

      xAxis = axisBottom(xScale)
        .ticks(timeMinute.every(15))
        .tickFormat(function (d, i) {
          return moment(d).minute() === 0 ? moment(d).format('hh') : ''
        })
      yAxis = axisLeft(yScale)
        .tickFormat(formatCategory)
      chartLine = line().x(X).y(Y).curve(curveStepAfter)
      invertYScale = invertY(yScale)
      invertXScale = invertX(xScale)

      svg = select(this).append('svg')
        .attr('viewBox', [0, 0, width, height].join(' '))
        .classed('timeline', true)
        // .attr('preserveAspectRatio', 'xMidYMid meet')

      chartGrp = svg.append('g').attr('class', 'all')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      chartGrp.append('path').attr('class', 'line')
      chartGrp.append('g').attr('class', 'x axis')
      chartGrp.append('g').attr('class', 'y axis')
      hover = chartGrp.append('circle').attr('class', 'hover').attr('r', pointRadius).classed('hover--off', true)
      // overlay
      svg.append('g').append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
        .on('mousemove', moveListener(hover))
        .on('click', clickListener())
        .on('mouseleave', moveEnterLeaveListener('leave', hover))
        .on('mouseenter', moveEnterLeaveListener('enter', hover))

      updateCategories = liveUpdateCategories
      updateChart = liveUpdateChart
      updateChart(data)
    })
  }

  function liveUpdateChart (data) {
    updatePoints(data)
    updateScales(data)
    updateLine(data)
    _notifyOnUpdate(chart)
  }

  function updatePoints (data) {
    // update
    let update = svg.select('.all').selectAll('.point').data(data, identity)
    update
      .call(addTransitions)
      .attr('cx', X)
      .attr('cy', Y)
      .attr('r', pointRadius)

    // enter
    update
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', X)
      .attr('cy', Y)
      .attr('r', 0)
      .call(addTransitions)
      .attr('r', pointRadius)

    // exit
    update.exit()
      .call(addTransitions)
      .attr('r', 0).remove()
  }

  function updateScales (data) {
    // update x axis
    svg.select('.x.axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(addTransitions)
      .call(xAxis)

    // update y axis
    svg.select('.y.axis')
      .call(addTransitions)
      .call(yAxis)
  }

  function updateLine (data) {
    svg.select('.line')
      .data([data])
      .call(addTransitions)
      .attr('d', chartLine)
  }

  function liveUpdateCategories () {
    data = removeUnknownCategories(data, categories)
    yScale.domain(categories)
    svg.select('.y.axis').call(yAxis)
    updateChart(data)
  }
  // The x-accessor for the path generator.
  function X (d) {
    // debugger;
    return xScale(d.time)
  }

  // The x-accessor for the path generator
  function Y (d) {
    return yScale(d.category)
  }

  /**
  *
  */
  function moveListener (hover) {
    return function (d, i) {
      // debugger;
      let coords = mouse(this)
      hover.attr('cx', xScale(invertXScale(coords[0] - margin.left)))
        .attr('cy', yScale(invertYScale(coords[1] - margin.top)))
    }
  }

  function moveEnterLeaveListener (type, hover) {
    return function () {
      hover.classed('hover--off', type === 'leave')
    }
  }

  function clickListener () {
    return function () {
      let coords = mouse(this)
      // console.log('click', chartWidth, chartHeight, margin, coords);
      let updateAfter = addHourAfter(margin.left + chartWidth, timeInc)(xScale.domain(), coords)
      if (updateAfter) xScale.domain(updateAfter)
      let updateBefore = addHourBefore(margin.left, timeInc)(xScale.domain(), coords)
      if (updateBefore) xScale.domain(updateBefore)
      let newPoint = addPoint(margin, chartWidth, invertXScale, invertYScale)(coords, dataIndex++)
      if (newPoint && newPoint.category) {
        data.push(newPoint)
        data = cleanData(data)
      }
      updateChart(data)
    }
  }

  chart.data = function (_) {
    if (!arguments.length) return data

    data = cleanData(_)
    dataIndex = findStartIndex(_)
    updateChart(data)
    return chart
  }

  /**
   * Provide a function that gets called when data is updated.
   * @param {function} _ the provided function is called and given the chart object.
   */
  chart.notifyOnUpdate = function (_) {
    if (!arguments.length) return _notifyOnUpdate
    _notifyOnUpdate = _
    return chart
  }

  chart.timesByCategory = function () {
    return timesByCategory(data)
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin
    margin = _
    return chart
  }

  chart.width = function (_) {
    if (!arguments.length) return width
    width = _
    return chart
  }

  chart.height = function (_) {
    if (!arguments.length) return height
    height = _
    return chart
  }

  chart.categories = function (_) {
    if (!arguments.length) return categories
    categories = _
    updateCategories()
    return chart
  }

  chart.useTransitions = function (_) {
    if (!arguments.length) return useTransitions
    useTransitions = _
    return chart
  }

  chart.debug = function () {
    return {
      yScale,
      xScale,
      categories,
      data,
    }
  }

  function addTransitions (selection) {
    if (useTransitions) {
      return selection
        .transition()
        .duration(duration)
        .ease(ease)
    }
    return selection
  }

  return chart
}

export default TimeLineChart

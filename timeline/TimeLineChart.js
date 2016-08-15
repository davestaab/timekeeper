import {
        select,
        selectAll,
        mouse,
        axisBottom,
        axisLeft,
        line,
        scaleTime,
        scalePoint,
        curveStepAfter,
        timeMinute,
        easeCubicOut
    } from 'd3';
import {
        cleanData,
        invertX,
        invertY,
        dataFormat,
        noop,
        identity,
        addHourAfter,
        addHourBefore,
        addPoint,
        removeUnknownCategories
    } from './utils';
import moment from 'moment';

function TimeLineChart() {
    /***************************
    * Accessible varibles.
    * These variables can be set externally.
    ****************************/
    let width = 760,
    height = 200,
    categories = ['red', 'blue', 'one', 'two'],
    xValue = function(d) {
        return d[0];
    },
    // default accessor
    yValue = function(d) {
        return d[1];
    },
    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 75
    },
    data = [],
    _notifyOnUpdate = noop;

    /***************************
    * Internal Variables
    ****************************/
    let chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom,
    duration = 500,
    ease = easeCubicOut,
    pointRadius = 6,
    dataIndex = 0,
    timeInc = 60,
    svg = null, yScale, xScale, xAxis, yAxis, chartLine, invertYScale, invertXScale, chartGrp, hover;

    // update functions
    let updateCategories = noop,
        updateData = noop,
        updateChart = noop;
    // constructor
    function chart(selection) {

        selection.each(function() {
            xScale = scaleTime()
                .domain([moment().hours(6).minutes(0).second(0).toDate(), moment().hours(17).minutes(0).second(0).toDate()])
                .range([0, chartWidth])
                .clamp(true);
            yScale = scalePoint()
                .domain(categories)
                .rangeRound([chartHeight, 0]);
            xAxis = axisBottom(xScale)
                .ticks(timeMinute.every(15))
                .tickFormat(function (d, i) {
                    return moment(d).minute() === 0 ? moment(d).format('hh') : '';
                    // return i % 4 === 0 ? moment(d).format('hh') : '';
                });
            yAxis = axisLeft(yScale);
            chartLine = line().x(X).y(Y).curve(curveStepAfter);
            invertYScale = invertY(yScale);
            invertXScale = invertX(xScale);

            svg = select(this).append('svg')
                .attr('viewBox', [0, 0, width, height].join(' '))
                .classed('timeline', true)
                // .attr('preserveAspectRatio', 'xMidYMid meet')
            ;
            chartGrp = svg.append('g').attr('class', 'all')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            chartGrp.append('path').attr('class', "line");
            chartGrp.append("g").attr("class", "x axis");
            chartGrp.append("g").attr("class", "y axis");
            hover = chartGrp.append('circle').attr('class', 'hover').attr('r', pointRadius).classed('hover--off', true);
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
                ;
            updateCategories = liveUpdateCategories;
            updateChart = liveUpdateChart;
            updateChart(data);
        });
    }

    function liveUpdateChart(data) {
        updatePoints(data);
        updateScales(data);
        updateLine(data);
        _notifyOnUpdate(chart);
    }

    function updatePoints(data) {
        // update
        let update = svg.select('.all').selectAll('.point').data(data, identity);
        update
            .transition()
            .duration(duration)
            .ease(ease)
            .attr('cx', X)
            .attr('cy', Y);

        // enter
        let enter = update
            .enter()
            .append("circle")
            .attr('class', 'point')
            .attr('cx', X)
            .attr('cy', Y)
            .attr('r', 0)
            .transition()
            .duration(duration)
            .ease(ease)
            .attr('r', pointRadius);

        // exit
        update.exit()
            .transition()
            .duration(duration)
            .ease(ease)
            .attr('r', 0).remove();
    }

    function updateScales(data) {
        // update x axis
        svg.select(".x.axis")
            .attr("transform", "translate(0," + chartHeight + ")")
            .transition()
            .duration(duration)
            .ease(ease)
            .call(xAxis);

        // update y axis
        svg.select(".y.axis")
            .transition()
            .duration(duration)
            .ease(ease)
            .call(yAxis);
    }

    function updateLine(data) {
        // debugger;
        svg.select(".line")
            .data([data])
            .transition()
            .duration(duration)
            .ease(ease)
            .attr("d", chartLine);
    }

    function liveUpdateCategories( ) {
        data = removeUnknownCategories(data, categories);
        yScale.domain(categories);
        svg.select('.y.axis').call(yAxis);
        updateChart(data);
    }
    // The x-accessor for the path generator.
    function X(d) {
        // debugger;
        return xScale(d.time);
    }

    // The x-accessor for the path generator
    function Y(d) {
        return yScale(d.category);
    }

    /**
    *
    */
    function moveListener(hover) {
        return function(d, i) {
            // debugger;
            let coords = mouse(this);
            hover.attr('cx', xScale(invertXScale(coords[0] - margin.left)))
                .attr('cy', yScale(invertYScale(coords[1] - margin.top)));
        };
    }

    function moveEnterLeaveListener(type, hover) {
        return function () {
            hover.classed('hover--off', type === 'leave');
        }
    }

    function clickListener(chart) {
        return function () {
            let coords = mouse(this);
            // console.log('click', chartWidth, chartHeight, margin, coords);
            let updateAfter = addHourAfter(margin.left + chartWidth, timeInc)(xScale.domain(), coords);
            if(updateAfter) xScale.domain(updateAfter);
            let updateBefore = addHourBefore(margin.left, timeInc)(xScale.domain(), coords);
            if(updateBefore) xScale.domain(updateBefore);
            let newPoint = addPoint(margin, chartWidth, invertXScale, invertYScale)(coords, dataIndex++);
            if(newPoint) {
                data.push(newPoint);
                data = cleanData(data);
            }
            updateChart(data);
        }
    }

    chart.data = function (_) {
        if (!arguments.length) return data;
        // Convert data to standard representation greedily;
        data = _.map(function(d, i) {
            return dataFormat(xValue.call(data, d, i), yValue.call(data, d, i), dataIndex++);
        });
        data = cleanData(data);
        updateChart(data);
        return chart;
    }

    /**
     * Provide a function that gets called when data is updated.
     * @param {function} _ the provided function is called and given the chart object.
     */
    chart.notifyOnUpdate = function (_) {
        if(!arguments.length) return _notifyOnUpdate;
        _notifyOnUpdate = _;
        return chart;
    }

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

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    chart.categories = function(_) {
        if (!arguments.length) return categories;
        categories = _;
        updateCategories();
        return chart;
    };

    chart.debug = function() {
        return {
            yScale: yScale,
            xScale: xScale,
            categories: categories,
            data: data
        };
    };

    return chart;
}

export default TimeLineChart;

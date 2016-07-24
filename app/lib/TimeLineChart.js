import {
        select,
        selectAll,
        event as currentEvent,
        mouse,
        axisBottom,
        axisLeft,
        line,
        scaleTime,
        scalePoint,
        curveStepAfter,
        timeMinute
    } from 'd3';
import { cleanData, invertX, invertY } from './utils';
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
    };

    /***************************
    * Internal Variables
    ****************************/
    let chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom,
    duration = 500,
    ease = 'cubic-out',
    svg = null,
    _data = null
    ;

    /***************************
    * Chart components
    ****************************/
    // console.log(axisBottom);

    let xScale = scaleTime(),
    yScale = scalePoint();

    let xAxis = axisBottom(xScale)
        .ticks(timeMinute.every(15))
        .tickFormat(function (d, i) {
            return moment(d).minute() === 0 ? moment(d).format('hh') : '';
            // return i % 4 === 0 ? moment(d).format('hh') : '';
        })
        ,
    yAxis = axisLeft(yScale),
    chartLine = line().x(X).y(Y).curve(curveStepAfter),
    invertYScale = invertY(yScale),
    invertXScale = invertX(xScale)
    ;

    // constructor
    function chart(selection) {

        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            _data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            // Update the x-scale.
            xScale
            .domain([moment().hours(6).minutes(0).second(0).toDate(), moment().hours(17).minutes(0).second(0).toDate()])
            .range([0, chartWidth]);
            // console.log(xScale.domain());

            // Update the y-scale.
            yScale
            .domain(categories)
            .rangeRound([chartHeight, 0]);

            // setup
            svg = select(this).append('svg')
                .attr("width", width)
                .attr("height", height)
                // .attr('viewbox', [0, 0, width, height].join(' '))
                // .attr('preserveAspectRatio', 'xMidYMid meet')
            ;


            let chartGrp = svg.append('g').attr('class', 'all')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            chartGrp.append('path').attr('class', "line");

            chartGrp.append("g").attr("class", "x axis");
            chartGrp.append("g").attr("class", "y axis");

            let hover = chartGrp.append('circle').attr('class', 'hover').attr('r', '6');
            // overlay
            svg.append('g').append('rect')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height)
                .attr('opacity', 0)
                .on('mousemove', moveListener(hover))
                .on('click', clickListener())
                ;

            updateChart(data);
        });
    }

    function updateChart(data) {
        updatePoints(data);
        updateScales(data);
        updateLine(data);
    }

    function updatePoints(data) {
        let circles = svg.select('.all').selectAll('.point').data(data);

        circles.data(function(d) {
            return d;
        })
        .enter()
        .append("circle")
        .attr('class', 'point')
        .attr('cx', function(d) {
            return xScale(d[0]);
        })
        .attr('cy', function(d) {
            return yScale(d[1]);
        })
        .attr('r', 6);
    }

    function updateScales(data) {
        // update x axis
        svg.select(".x.axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        // .transition()
        // .duration(duration)
        // .ease(ease)
        .call(xAxis);

        // update y axis
        svg.select(".y.axis")
        // .transition()
        // .duration(duration)
        // .ease(ease)
        .call(yAxis);
    }

    function updateLine(data) {
        svg.select('.all')
            .select(".line")
            .data([data])
            .attr("d", chartLine);
    }
    // The x-accessor for the path generator; xScale ∘ xValue.
    function X(d) {
        return xScale(d[0]);
    }

    // The x-accessor for the path generator; yScale ∘ yValue.
    function Y(d) {
        return yScale(d[1]);
    }

    /**
    *
    */
    function moveListener(hover) {
        return function(d, i) {
            // debugger;
            // console.log('mouse move', d, currentEvent, event);
            hover.attr('cx', xScale(invertXScale(event.offsetX - margin.left)))
                .attr('cy', yScale(invertYScale(event.offsetY - margin.top)));
        };
    }

    function clickListener(chart) {
        return function (data,i) {
            // console.log('click', data, mouse(this), event);
            let coords = mouse(this);
            data.push([invertXScale(coords[0] - margin.left), invertYScale(coords[1] - margin.top)]);
            updateChart(cleanData(data));
        }
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
        return chart;
    };

    chart.debug = function() {
        return {
            yScale: yScale,
            xScale: xScale,
            data: _data
        };
    };

    return chart;
}

export default TimeLineChart;

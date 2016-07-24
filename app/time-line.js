import {
        select,
        selectAll,
        event,
        mouse,
        axis,
        line,
        scaleTime,
        scale
    } from 'd3';

function TimeLineChart() {
    /***************************
    * Accessible varibles.
    * These variables can be set externally.
    ****************************/
    var width = 760,
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
    var chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom,
    duration = 500,
    ease = 'cubic-out',
    svg = null,
    _data = null
    ;

    /***************************
    * Chart components
    ****************************/
    var xScale = scaleTime.scale(),
    yScale = scale.ordinal();

    xAxis = svg.axis().scale(xScale).orient("bottom").ticks(scaleTime.minutes, 15),
    yAxis = svg.axis().scale(yScale).orient("left"),
    line = svg.line().x(X).y(Y).interpolate('step-after');

    // constructor
    function chart(selection) {

        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });
            _data = data;

            // Update the x-scale.
            xScale
            .domain([moment().hours(6).minutes(0).second(0), moment().hours(10).minutes(0).second(0)])
            .range([0, chartWidth]);

            // Update the y-scale.
            yScale
            .domain(categories)
            .rangePoints([chartHeight, 0]);

            // setup
            svg = select(this).append('svg')
                .attr("width", width)
                .attr("height", height);

            var chartGrp = svg.append('g').attr('class', 'all')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            chartGrp.append('path').attr('class', "line");

            chartGrp.append("g").attr("class", "x axis");
            chartGrp.append("g").attr("class", "y axis");

            var hover = chartGrp.append('circle').attr('class', 'hover').attr('r', '6');
            // overlay
            svg.append('g').append('rect')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height)
                .attr('opacity', 0)
                .on('mousemove', moveListener(hover))
                .on('click', clickListener());

            updateChart(data);
        });
    }

    function updateChart(data) {
        updatePoints(data);
        updateScales(data);
        updateLine(data);
    }

    function updatePoints(data) {
        var circles = svg.select('.all').selectAll('.point').data(data);

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
        svg.select('.all')
            .select(".line")
            .data([data])
            .attr("d", line);
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
            // console.log('mouse move', d, event);
            hover.attr('cx', xScale(invertX(event.offsetX - margin.left)))
                .attr('cy', yScale(invertY(event.offsetY - margin.top)));
        };
    }

    function clickListener(chart) {
        return function (data,i) {
            console.log('click', data, mouse(this), event);
            var coords = mouse(this);
            data.push([invertX(coords[0] - margin.left), invertY(coords[1] - margin.top)]);
            updateChart(data);
        }
    }

    /**
     * given pixels inverts it to the nearest 15 minutes as a Date
     * @param  {ind}  x pixels on the chart to convert
     * @return {Date}   Date representing the nearest date to clicked on the x axis.
     */
    function invertX(x) {
        var m = moment(xScale.invert(x));
        m.minutes(Math.round(m.minutes() / 15) * 15).second(0);
        return m.toDate();
    }

    /**
     * given pixels inverts it to the nearest category
     * @param  {int}    y pixels on the chart to convert
     * @return {string}   the nearest category
     */
    function invertY(y) {
        var min = Infinity, minData;
        yScale.domain().forEach(function (d) {
            var minDistance = Math.abs(yScale(d) - y);
            if( minDistance < min) {
                min = minDistance;
                minData = d;
            }
        });
        return minData;
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

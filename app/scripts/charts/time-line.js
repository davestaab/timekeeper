function timeSeriesChart() {
  var margin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 75
    },
    width = 760,
    height = 200,
    chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom,
    duration = 500,
    ease = 'cubic-out',
    xValue = function(d) {
      return d[0];
    }, // default accessor
    yValue = function(d) {
      return d[1];
    }, // default accessor
    categories = ['red', 'blue', 'one', 'two'],
    xScale = d3.time.scale(),
    yScale = d3.scale.ordinal(),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(d3.time.minutes, 15),
    yAxis = d3.svg.axis().scale(yScale).orient("left"),
    line = d3.svg.line().x(X).y(Y).interpolate('step-after');
  // constructor
  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
        .domain(d3.extent(data, function(d) {
          return d[0];
        }))
        .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
        .domain(categories)
        .rangePoints([height - margin.top - margin.bottom, 0], 1);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");



      gEnter.append("path").attr("class", "line");

      gEnter.selectAll('.point')
        .data(function(d) {
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

      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      var hover = gEnter.append('circle').attr('class', 'hover').attr('r', '6');

      var overlay = svg.append('g').append('rect')
        .attr('class', 'overlay').attr('width', width).attr('height', height).attr('opacity', 0);
      overlay.on('mousemove', moveListener(hover));
      // Update the outer dimensions.
      svg.attr("width", width)
        .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the line path.
      g.select(".line")
        .attr("d", line);

      // Update the x-axis.
      svg
        .select(".x.axis")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
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
    });
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
      console.log('mouse move', d, d3.event);
      hover.attr('cx', roundX(d3.event.offsetX - margin.left))
        .attr('cy', d3.event.offsetY - margin.top);
    };
  }

  function roundX(x) {
    var m = moment(xScale.invert(x));
    m.minutes(Math.round(m.minutes() / 15) * 15).second(0);
    return xScale(m.toDate());
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
      yScale: yScale
    };
  };

  return chart;
}

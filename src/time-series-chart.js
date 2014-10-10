function timeSeriesChart() {
  var margin = {top: 50, right: 50, bottom: 50, left: 75},
      width = 760,
      height = 200,
      duration = 500, 
      ease = 'cubic-out',
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      // yScale = d3.scale.linear(),
      categories = ['red','blue','one','two'],
      yScale = d3.scale.ordinal(),
      // catScale = d3.scale.ordinal(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(8),
      yAxis = d3.svg.axis().scale(yScale).orient("left"),
      // area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y).interpolate('step-after');

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain(categories)
          .rangePoints([height - margin.top - margin.bottom, 0], 1);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      // gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      // Update the outer dimensions.
      svg.attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      // g.select(".area")
      //     .attr("d", area.y0(yScale.range()[0]));

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
    categories= _;
    return chart;
  };

  chart.debug = function() {
    return {
      yScale: yScale
    };
  };

  return chart;
}
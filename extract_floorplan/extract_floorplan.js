      //The data for our line
      var polygon = [ [1,5], [20,20], [40,10], [60,40], [80,5], [100,60] ];

      //This is the accessor function we talked about above
      var lineFunction = d3.svg.line()
                               .x(function(d) { return d[0]; })
                               .y(function(d) { return d[1]; })
                               .interpolate("linear");

      //The SVG Container
      var svgContainer = d3.select("body").append("svg")
                                          .attr("width", 200)
                                          .attr("height", 200);

      //The line SVG Path we draw
      var lineGraph = svgContainer.append("path")
                                  .attr("d", lineFunction(polygon))
                                  .attr("stroke", "blue")
                                  .attr("stroke-width", 2)
                                  .attr("fill", "none");

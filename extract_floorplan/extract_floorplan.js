
  // create floor plan: process wall jsons
  //var wall_polygons = [];
  
  //walljson.Walls.for_each(function (wall) {
    
  //});
      
      var polygons = 
      [
        [ 
          [0,0],
          [50,10],
          [60,50],
          [10,40]
        ],
        [ 
          [10,50],
          [60,60],
          [70,100],
          [20,80]
        ]
      ];

      //This is the accessor function we talked about above
      var lineFunction = d3.svg.line()
                               .x(function(d) { return d[0]; })
                               .y(function(d) { return d[1]; })
                               .interpolate("linear");

      //The SVG Container
      var svgContainer = d3.select("body").append("svg")
                                          .attr("width", 200)
                                          .attr("height", 200);
                                          
                                          
      var plg = svgContainer.selectAll("polygon")
                      .data(polygons)
                      .enter().append("polygon")
                      .attr("points",function(d) { return d.map(function(d) { return d.join(",");}).join(" ") })
                      .attr("stroke", "black").attr("stroke-width",2).attr("fill", "lightgray");
                      
      console.log(plg);
            
////The line SVG Path we draw
      //var lineGraph = svgContainer.append("path")
      //                            .attr("d", lineFunction(polygon))
      //                            .attr("stroke", "blue")
      //                            .attr("stroke-width", 2)
      //                            .attr("fill", "none");

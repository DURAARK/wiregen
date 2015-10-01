
  // create floor plan: process wall jsons
  var ROOMS = [];
  var room2wall = {};
  
  for (i in walljson.Walls)
  {
    var wall = walljson.Walls[i];
    // build room->walls index
    if (!room2wall[wall.attributes.roomid]) 
      room2wall[wall.attributes.roomid]=[];
      
    room2wall[wall.attributes.roomid].push(wall);
  }
  
  for (roomid in room2wall)
  {
      room = {
        "label" : roomid,
        points : []
      }
      ROOMS.push(room);
  }
      
      // manual example
      //var ROOMS = 
      //[
      //  { 
      //    label : "room_1",
      //    points : [ 
      //      [0,0],
      //      [50,10],
      //      [60,50],
      //      [10,40]
      //    ]
      //  }
      //  ,
      //  {
      //    label : "room_2",
      //    points : [ 
      //      [10,50],
      //      [60,60],
      //      [70,100],
      //      [20,80]
      //    ]
      //  }
      //];

      //This is the accessor function we talked about above
      var lineFunction = d3.svg.line()
                               .x(function(d) { return d[0]; })
                               .y(function(d) { return d[1]; })
                               .interpolate("linear");

      //The SVG Container
      var svgContainer = d3.select("body").append("svg")
                                          .attr("width", 200)
                                          .attr("height", 200);
                                          
                                          
      var rooms = svgContainer.selectAll("polygon")
                      .data(ROOMS)
                      .enter().append("polygon")
                      .attr("points",function(d) { return d.points.map(function(d) { return d.join(",");}).join(" ") })
                      .attr("stroke", "black").attr("stroke-width",2).attr("fill", "lightgray")
                      .attr("onmouseover", "evt.target.setAttribute('opacity', '0.5');")
                      .attr("onmouseout", "evt.target.setAttribute('opacity', '1');")

      var roomnames = svgContainer.selectAll("text")
                      .data(ROOMS)
                      .enter().append("text")
                      .attr("x",function(d) { return d3.mean(d.points, function(p) { return p[0]; })} )
                      .attr("y",function(d) { return d3.mean(d.points, function(p) { return p[1]; })} )
                      .attr("style", "font-family:Arial;font-size:10px")
                      .text(function(d) { return d.label; });

      console.log(roomnames);
            
////The line SVG Path we draw
      //var lineGraph = svgContainer.append("path")
      //                            .attr("d", lineFunction(polygon))
      //                            .attr("stroke", "blue")
      //                            .attr("stroke-width", 2)
      //                            .attr("fill", "none");

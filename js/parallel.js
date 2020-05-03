//add color bar as decoration 
var colorLinearScale = d3.scaleLinear()
	.domain([0, 10])
	.range([0, 600]);

var colorQuantizeScale = d3.scaleQuantize()
	.domain([0, 6])
  .range(['#142b5c', '#9879a0', '#c8ed03', '#5fb676', '#992d22', '#f5f4f4']);
var myData = d3.range(0, 6, 1);
d3.select('#colorbar')
	.selectAll('rect')
	.data(myData)
	.enter()
	.append('rect')
	.attr('x', function(d) {
		return colorLinearScale(d);
	})
	.attr('width', 50)
	.attr('height', 20)
	.style('fill', function(d) {
		return colorQuantizeScale(d);
	});

// set the dimensions and margins of the parallel graph
var margin = {top: 30, right: 50, bottom: 10, left: 50},
  width = 650 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_us = d3.select(".parallel-us")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style('background-color','black')
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
var svg_ca = d3.select(".parallel-ca")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style('background-color','black')
.append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");
//-----------------------------------------USA data----------------------------------------//
d3.csv("data/data-para-usa.csv", function(data) {
  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain(['blue','purple','yellow','green','red','white'])
    .range(['#142b5c', '#9879a0', '#c8ed03', '#5fb676', '#992d22', '#f5f4f4'])
  // For each dimension, Build a linear scale(store all in a y object)
  var y = {}
  y["dbscan"]=d3.scaleLinear() //sequential input
                .domain([0,111])
                .range([height, 0]);
                // .nice()
  y["month"]=d3.scalePoint() //discrete input
              .domain(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])
              .range([height, 0]);
  y["geography"]=d3.scalePoint() //discrete input
                // .domain(['Alaska', 'Manitoba', 'Wyoming', 'Michigan', 'Northwest', 'Montana', 'Maine', 'Wisconsin', 'Ontario', 'Nunavut', 'British Col', 'Minnesota', 'Alberta', 'Yukon', 'Saskatchewan', 'Quebec', 'Washington', 'New York', 'South Dakota', 'Idaho', 'Illinois', 'Oregon', 'Iowa', 'Kansas'])
                .domain(['Alaska','Wyoming', 'Michigan','Montana', 'Maine', 'Wisconsin','Minnesota','Washington', 'New York', 'South Dakota', 'Idaho', 'Illinois', 'Oregon', 'Iowa', 'Kansas'])
                // .domain( [d3.extent("data/data-para.csv", function(d) { return +d['geography']; })] )
                .range([height, 0]);
  
  // Set the list of dimension manually to control the order of axis:
  dimensions = ["dbscan", "month", "geography"]
  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);
  // Highlight the specie that is hovered
  var highlight = function(d){
    selected_group = d.group
    // first every group turns transparents
    d3.selectAll(".line")
      .transition().duration(0)
      // .style("stroke", "white")
      .style("opacity", "0.1")
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_group)
      .transition().duration(0)
      .style("stroke", color(selected_group))
      .style("opacity", "1")
  }

  // reset
  var resetHighlight = function(d){
    d3.selectAll(".line")
      .transition().duration(10).delay(0)
      .style("stroke", function(d){ return( color(d.group))} )
      .style("opacity", 1)
  }

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) {
         return [x(p), y[p](d[p])]
        }));
  }

  // Draw the lines
  svg_us
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
      .attr("class", function (d) { return "line " + d.group +" "+d.subgroup } ) // 2 class for each line: 'line' and the group name
      .attr("d", path)
      .style("fill", "none" )
      .style("stroke", function(d){ return( color(d.group))} )
      .style("opacity", 1)
      .style("stroke-width","2")
      .on("mouseover", highlight)
      // .on("mouseleave", doNotHighlight )

  // Draw the axis:
  svg_us.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", function (d) { return "axis " + d })
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) {d3.select(this).call(d3.axisLeft().ticks(10).scale(y[d])).attr('font-size',12);})
    // Add axis title
    .append("text")
      .style("text-anchor","middle")
      .style("font-family","AlternateGothic2 BT")
      .style("font-size",22)
      .attr("y",-10)
      .text(function(d) { return d; })
      .style("fill","white")
  d3.select(".myButton").on('click',resetHighlight);
})
//-----------------------------------------CANADA data-------------------------------------//
d3.csv("data/data-para-ca.csv", function(data) {
  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain(['','purple','yellow','green','red','white'])
    .range(['#142b5c', '#9879a0', '#c8ed03', '#5fb676', '#992d22', '#f5f4f4'])
  // For each dimension, Build a linear scale(store all in a y object)
  var y = {}
  y["dbscan"]=d3.scaleLinear() //sequential input
                .domain([0,111])
                .range([height, 0]);
                // .nice()
  y["month"]=d3.scalePoint() //discrete input
              .domain(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])
              .range([height, 0]);
  y["geography"]=d3.scalePoint() //discrete input
                // .domain(['Alaska', 'Manitoba', 'Wyoming', 'Michigan', 'Northwest', 'Montana', 'Maine', 'Wisconsin', 'Ontario', 'Nunavut', 'British Col', 'Minnesota', 'Alberta', 'Yukon', 'Saskatchewan', 'Quebec', 'Washington', 'New York', 'South Dakota', 'Idaho', 'Illinois', 'Oregon', 'Iowa', 'Kansas'])
                .domain(['Manitoba','Northwest', 'Ontario','Nunavut', 'British Col', 'Alberta', 'Yukon','Saskatchewan','Quebec'])
                // .domain( [d3.extent("data/data-para.csv", function(d) { return +d['geography']; })] )
                .range([height, 0]);
  
  // Set the list of dimension manually to control the order of axis:
  dimensions = ["dbscan", "month", "geography"]
  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);
  // Highlight the group that is hovered
  var highlight = function(d){
    selected_group = d.group
    // first every group turns transparents
    d3.selectAll(".line")
      .transition().duration(0)
      .style("stroke", "grey")
      .style("opacity", "0.1")
    // Second the hovered group takes its color
    d3.selectAll("." + selected_group)
      .transition().duration(0)
      .style("stroke", color(selected_group))
      .style("opacity", "1")
  }

  // reset
  var resetHighlight = function(d){
    d3.selectAll(".line")
      .transition().duration(10).delay(0)
      .style("stroke", function(d){ return( color(d.group))} )
      .style("opacity", 1)
  }

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) {
         return [x(p), y[p](d[p])]
        }));
  }

  // Draw the lines
  svg_ca
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
      .attr("class", function (d) { return "line " + d.group +" "+d.subgroup } ) // 2 class for each line: 'line' and the group name
      .attr("d", path)
      .style("fill", "none" )
      .style("stroke", function(d){ return( color(d.group))} )
      .style("opacity", 1)
      .style("stroke-width","2")
      .on("mouseover", highlight)
      // .on("mouseleave", doNotHighlight )
  
  // Draw the axis:
  svg_ca.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", function (d) { return "axis " + d })
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) {d3.select(this).call(d3.axisLeft().ticks(10).scale(y[d])).attr('font-size',12);})
    // Add axis title
    .append("text")
      .style("text-anchor","middle")
      .style("font-family","AlternateGothic2 BT")
      .style("font-size",22)
      .attr("y",-10)
      .text(function(d) { return d; })
      .style("fill","white")
  d3.select(".myButton").on('click',resetHighlight);
})


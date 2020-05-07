//base map
var userLat = 55;
var userLng = -100;
var mymap = L.map('mapid').setView([userLat,userLng], 4);//[lat,lng]

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'yuningliu/ck9w1pb0w00vy1ilh4dtg0zxu', //https://docs.mapbox.com/api/maps/#mapbox-styles
    tileSize: 512,
    zoomOffset: -1,
    // subdomains: 'abcd',
    accessToken: 'pk.eyJ1IjoieXVuaW5nbGl1IiwiYSI6ImNrNm9tNDFhcDBpejgzZG1sdnJuaTZ4MzYifQ.qYhM3_wrbL6lyTTccNKx_g' //'your.mapbox.access.token'
}).addTo(mymap);

//pop up for each  Feature
function onEachFeature(feature, layer) {
  var popupContent = "<p>Check out the image! ";

  //pop up image
  if (feature.properties && feature.properties.url) {
    image = '<img src='+feature.properties.url+' height="150px" width="150px"/>'
    popupContent += "<br/>"+image
  }
  //pop up DBSCAN clustering result
  if (feature.properties && feature.properties.dbscan) {
    popupContent += "<br/>Clustering group No."+feature.properties.dbscan_new
  }

  layer.bindPopup(popupContent); //popup content
}
//style for point data layer
function stylePoint(f){
  var styleObject = {
  radius:4,
  fillColor: f.properties.hex,//"#59d4ff",
  weight: 0,
  opacity: 1,
  fillOpacity: 1
};
return styleObject
}
// add circle marker for geojson layer
start = L.geoJSON(northern, {
  onEachFeature: onEachFeature,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng,stylePoint(feature));
  }
}).addTo(mymap);




//Search function
var options = {
  position:'topleft',
  key: 'a04ccf4bfff6454da18a566cdb8dc511',
  limit: 5, //Maximum search suggestions
  // proximity: '51.52255, -0.10249' // favour results near here
};
var control = L.Control.openCageSearch(options).addTo(mymap);

//concave hull data
// Concave hull polygon (111 in total)
//put points with the same clustering in the same array
arr={}
for (i=0;i<112;i++){
    arr[i]=[];
}
for (var i = 0; i<northern.features.length; i++){
    for (var dbscanCluster = 0; dbscanCluster<112; dbscanCluster++){
        if (northern.features[i].properties.dbscan_new === dbscanCluster){
            arr[dbscanCluster].push(northern.features[i])
        }
        else{
            continue
        }
    }
}
//turf for each clustering array
arrPoints={}
for (i=0;i<112;i++){
  arrPoints[i]=[];
}
northernPolygon =[]
for (i=0;i<112;i++){
  var points = turf.featureCollection(arr[i])
  let options = {units: 'miles', maxEdge: 100000};
  var hull = turf.concave(points, options);
  if (!hull){
    buffered = turf.buffer(arr[i][0], 10, {units: 'miles'});
    northernPolygon.push(buffered);
} else{
  northernPolygon.push(hull);
}
}
//polygon centroild layer
northernPolygonCentroid = []
for (i=0;i<northernPolygon.length;i++){
    var centroid = turf.centroid(northernPolygon[i]);
    northernPolygonCentroid.push(centroid)
}
// retrive input lat&lng, out put show 10 features in fitbounds
control.markGeocode = function(result) {
  console.log(result.center)
  // distance btw 2 points
console.log(northernPolygonCentroid)
disArray=[]
for (i=0;i<northernPolygonCentroid.length;i++){
    var from = turf.point([result.center.lng,result.center.lat]);
    var to =northernPolygonCentroid[i]
    var options = {units: 'miles'};
    var distance = turf.distance(from, to, options);
    disArray.push(distance)
}
disArray = disArray.sort((a,b)=>a-b) //from smallest

//find the nearest 10 polygon
let nearestPolygon=[]
let nearestCentroid=[]
for (j=0;j<10;j++){
    for (i=0;i<northernPolygonCentroid.length;i++){
        var from = turf.point([result.center.lng,result.center.lat]);
        var to =northernPolygonCentroid[i]
        var options = {units: 'miles'};
        var distance = turf.distance(from, to, options);
        if (distance===disArray[j]){
            nearestPolygon.push(northernPolygon[i]);
            nearestCentroid.push(northernPolygonCentroid[i]);
        }
    }
}
//fitbounds using 10 nearest polygons
lonArray=[]
latArray=[]
for (i=0;i<nearestPolygon.length;i++){
    for (j=0;j<nearestPolygon[i].geometry.coordinates[0].length;j++){
        lonArray.push(nearestPolygon[i].geometry.coordinates[0][j][0]);
        latArray.push(nearestPolygon[i].geometry.coordinates[0][j][1]);
    }
}
lonArray = lonArray.sort((a,b)=>b-a) //from largest
latArray = latArray.sort((a,b)=>b-a) //from largest

if (result.center) {
  console.log('result.center')
  this._map.fitBounds([[latArray[0],lonArray[0]],[latArray[latArray.length - 1],lonArray[lonArray.length - 1]]]);
} else {
  this._map.panTo(result.center);
}

if (this._geocodeMarker) {
  console.log('removeLayer')

  this._map.removeLayer(this._geocodeMarker);
}

this._geocodeMarker = new L.geoJSON(nearestPolygon,{color:'#9b3070',weight:1})
  .bindPopup(result.name)
  .addTo(this._map)
  .openPopup();
return this;
    };


// parallel coordinates----------------------------------------------------------------------------//
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
  height = 400 - margin.top - margin.bottom;

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




//----------Filter: Bar Chart----------
//create dataset for month count
var monthcount = [{"month": "Jan", "count": 0},
                  {"month": "Feb", "count": 0},
                  {"month": "Mar", "count": 0},
                  {"month": "Apr", "count": 0},
                  {"month": "May", "count": 0},
                  {"month": "Jun", "count": 0},
                  {"month": "Jul", "count": 0},
                  {"month": "Aug", "count": 0},
                  {"month": "Sep", "count": 0},
                  {"month": "Oct", "count": 0},
                  {"month": "Nov", "count": 0},
                  {"month": "Dec", "count": 0}];
for (i=0; i<northern["features"].length; i++){
  month = northern["features"][i]["properties"]["month"]
  for (j=0; j<monthcount.length; j++){
    if (month==monthcount[j]["month"]){
      monthcount[j]["count"] = monthcount[j]["count"]+1;
    }
  }
}

//create bar chart for month count
var chartWidth = 400;
var chartHeight = 300;
var chart = d3.select("body")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");
var bars = chart.selectAll(".bars")
    .data(monthcount)
    .enter()
    .append("rect")
    .attr("class", function(d){
        return "bars " + d.month;
    })
    .on("mouseover", highlight)
    .on("mouseout", dehighlight)
    .on("click", turnoff);
var desc = bars.append("desc")
    .text('{"stroke": "none", "stroke-width": "0px"}');
var numbers = chart.selectAll(".numbers")
    .data(monthcount)
    .enter()
    .append("text")
    .attr("class", "numbers");
var labels = chart.selectAll(".labels")
    .data(monthcount)
    .enter()
    .append("text")
    .attr("class", "labels");

//draw bars based on month count data
var n = monthcount.length;
var yScale = d3.scaleLinear()
    .range([0, chartHeight])
    .domain([0, 500]);
bars.attr("width", chartWidth/n - 10)
    .attr("x", function(d, i){
        return i * (chartWidth/n);
    })
    .attr("height", function(d){
        return yScale(d.count);
    })
    .attr("y", function(d){
        return chartHeight - yScale(d.count);
    })
    .style("fill", "yellow");
numbers.attr("text-anchor", "middle")
    .attr("x", function(d, i){
        var fraction = chartWidth/n;
        return i * fraction + (fraction-10)/2;
    })
    .attr("y", function(d){
        return chartHeight - yScale(d.count) + 15;
    })
    .text(function(d){
        return d.count;
    });
labels.attr("text-anchor", "middle")
    .attr("x", function(d, i){
        var fraction = chartWidth/n;
        return i * fraction + (fraction-10)/2;
    })
    .attr("y", function(d){
        return chartHeight - yScale(d.count) - 5;
    })
    .text(function(d){
        return d.month;
    });

//create hover events
function highlight(props){
    var selected = d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", "2");
};
function dehighlight(props){
    var selected = d3.select(this)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });
    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();
        var styleObject = JSON.parse(styleText);
        return styleObject[styleName];
    };
};

//create click events
var pointon;
function turnoff(props){
    if (!d3.select(this).classed("selected")){
        d3.select(this)
            .style('fill', 'grey')
            .classed("selected", true)
    } else {
        d3.select(this)
            .style('fill', 'yellow')
            .classed("selected", false);
    }

    //create filter
    notenable = {}
    offmonth = document.getElementsByClassName("selected")
    for (i=0; i<offmonth.length; i++){
        notenable[offmonth[i].classList[1]] = false;
    }
    console.log(notenable);
    mymap.removeLayer(start);
    if (pointon){
        mymap.removeLayer(pointon);
    }
    pointon = L.geoJson(northern, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.month);
        },
        filter: function(feature, layer){
            return !(feature.properties.month in notenable);
        },
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng, stylePoint(feature));
        },
        onEachFeature: onEachFeature
    }).addTo(mymap);
};

//----------Filter: Pie Chart----------
//create dataset for color count
var colorcount = [{"color": "yellow", "count": 0},
                  {"color": "green", "count": 0},
                  {"color": "blue", "count": 0},
                  {"color": "purple", "count": 0},
                  {"color": "red", "count": 0},
                  {"color": "white", "count": 0}];
for (i=0; i<northern["features"].length; i++){
  color = northern["features"][i]["properties"]["color_new"]
  for (j=0; j<colorcount.length; j++){
    if (color==colorcount[j]["color"]){
      colorcount[j]["count"] = colorcount[j]["count"]+1;
    }
  }
}
var data = {}
data[colorcount[0].color] = colorcount[0].count
data[colorcount[1].color] = colorcount[1].count
data[colorcount[2].color] = colorcount[2].count
data[colorcount[3].color] = colorcount[3].count
data[colorcount[4].color] = colorcount[4].count
data[colorcount[5].color] = colorcount[5].count

//create pie chart for color count
var pieWidth = 200;
var pieHeight = 200;
var radius = Math.min(pieWidth, pieHeight)/2;
var colorScale = d3.scaleOrdinal()
    .domain(data)
    .range(['#c8ed03','#5fb676','#142b5c','#9879a0','#992d22','#f5f4f4'])
var pie = d3.select("body")
    .append("svg")
    .attr("width", pieWidth)
    .attr("height", pieHeight)
    .attr("class", "pie")
    .append("g")
    .attr("transform", "translate(" + pieWidth/2 + "," + pieHeight/2 + ")");
var piepie = d3.pie()
    .value(function(d) {return d.value; })
var data_ready = piepie(d3.entries(data))
var rings = pie.selectAll('.rings')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(50)
        .outerRadius(radius)
    )
    .attr('fill', function(d) {return(colorScale(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .attr("class", function(d){
        return "rings " + d.data.key;
    })
    .on("mouseover", highlight)
    .on("mouseout", dehighlight)
    .on("click", turnoff2);
var desc = rings.append("desc")
    .text('{"stroke": "black", "stroke-width": "2px"}');

//create click events
var pointon;
function turnoff2(props){
    if (!d3.select(this).classed("selected")){
        d3.select(this)
            .style('fill', 'grey')
            .classed("selected", true)
    } else {
        d3.select(this)
            .style('fill', function(){
                return getStyle(this, "fill")
            })
            .classed("selected", false);
        function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text();
            var styleObject = JSON.parse(styleText);
            return styleObject[styleName];
        };
    }

    //create filter
    notenable = {}
    offcolor = document.getElementsByClassName("selected")
    for (i=0; i<offcolor.length; i++){
        notenable[offcolor[i].classList[1]] = false;
    }
    console.log(notenable);
    mymap.removeLayer(start);
    if (pointon){
        mymap.removeLayer(pointon);
    }
    pointon = L.geoJson(northern, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.month);
        },
        filter: function(feature, layer){
            return !(feature.properties.color_new in notenable);
        },
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng, stylePoint(feature));
        },
        onEachFeature: onEachFeature
    }).addTo(mymap);
};

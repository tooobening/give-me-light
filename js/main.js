//base map
var mymap = L.map('mapid').setView([50.423721,-96.617031], 10);//[lat,lng]
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10', //https://docs.mapbox.com/api/maps/#mapbox-styles
    tileSize: 512,
    zoomOffset: -1,
    subdomains: 'abcd',
    accessToken: 'pk.eyJ1IjoieXVuaW5nbGl1IiwiYSI6ImNrNm9tNDFhcDBpejgzZG1sdnJuaTZ4MzYifQ.qYhM3_wrbL6lyTTccNKx_g' //'your.mapbox.access.token'
}).addTo(mymap);

//Search function
var options = {
  key: 'a04ccf4bfff6454da18a566cdb8dc511',
  limit: 5, //Maximum search suggestions  
  proximity: '51.52255, -0.10249' // favour results near here
};
var control = L.Control.openCageSearch(options).addTo(mymap);
// L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//     subdomains: 'abcd',
//     maxZoom: 19
// }).addTo(mymap);


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
    popupContent += "<br/>Clustering group No."+feature.properties.dbscan
  }

  layer.bindPopup(popupContent); //popup content
}

//add circle marker for geojson layer
L.geoJSON(northern, {

  // style: function (feature) {
  //   return feature.properties && feature.properties.style;
  // },

  onEachFeature: onEachFeature,

  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius:4,
      fillColor: "#59d4ff",
      color: "#d0f5fc",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.5
    });
  }
}).addTo(mymap);

// Concave hull polygon (135 in total)
//put points with the same clustering in the same array
arr={}
for (i=0;i<135;i++){
    arr[i]=[];
}
// console.log(arr[134])
for (var i = 0; i<northern.features.length; i++){
    for (var dbscanCluster = 0; dbscanCluster<135; dbscanCluster++){
        if (northern.features[i].properties.dbscan === dbscanCluster){
            arr[dbscanCluster].push(northern.features[i])
        }
        else{
            continue
        }
    }
    
}
//turf for each clustering array
arrPoints={}
for (i=0;i<135;i++){
  arrPoints[i]=[];
}

for (i=0;i<135;i++){
  var points = turf.featureCollection(arr[i])
  let options = {units: 'kilometers', maxEdge: 100000};
  var hull = turf.concave(points, options);
  L.geoJSON(hull,{color:'#9b3070',weight:1}).addTo(mymap); //draw each hull in loop
}


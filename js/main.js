// var points = turf.featureCollection([
//     turf.point([-63.601226, 44.642643]),
//     turf.point([-63.591442, 44.651436]),
//     turf.point([-63.580799, 44.648749]),
//     turf.point([-63.573589, 44.641788]),
//     turf.point([-63.587665, 44.64533]),
//     turf.point([-63.595218, 44.64765])
//   ]);
// var options = {units: 'miles', maxEdge: 1};
  
// var hull = turf.concave(points, options);
var mymap;

//function to instantiate the Leaflet map
function createMap(){

    //add OSM base tilelayer
    mymap = L.map('mapid').setView([40,-100],4)

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11', //https://docs.mapbox.com/api/maps/#mapbox-styles
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoieXVuaW5nbGl1IiwiYSI6ImNrNm9tNDFhcDBpejgzZG1sdnJuaTZ4MzYifQ.qYhM3_wrbL6lyTTccNKx_g' //'your.mapbox.access.token'
    }).addTo(mymap);

    //call getData function
    // getData();
};

//Execute
console.log('34')
$(document).ready(createMap);
// L.geoJson(hull).addTo(mymap);
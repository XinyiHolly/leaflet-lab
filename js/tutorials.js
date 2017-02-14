// create a map object, append it to 'mapid' div and set the center and initial zoom
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

// load a tile layer from mapbox and add it to the map, with a max zoom of 18
L.tileLayer('https://api.mapbox.com/styles/v1/xliuholly/ciyvumejm001c2rmu39mzmzw0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieGxpdWhvbGx5IiwiYSI6ImNpeXZ1N3p4bTAwNmszMnBucjBudXVmNW0ifQ.Sj7qiQcBfSs9pzvK7Jftkg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(mymap);

// put a marker on the set position
var marker = L.marker([51.5, -0.09]).addTo(mymap);

// draw a circle on the map, with a set of attribution
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

// draw a polygon on the map, with the position attribution
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

// bind a popup with the marker
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// bind a popup with the circle
circle.bindPopup("I am a circle.");
// bind a popup with the polygon
polygon.bindPopup("I am a polygon.");

// initialize a popup
var popup = L.popup()

// set attribution for the popup
function onMapClick(e) {
  popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(mymap);
}

// call the funtion to activate the popup every time click the mymap
mymap.on('click', onMapClick);

// var geojsonFeature = {
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "amenity": "Baseball Stadium",
//         "popupContent": "This is where the Rockies play!"
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// };

// L.geoJSON(geojsonFeature).addTo(mymap);

// initialize two polylines
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// set a style
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// add several lines represented by myLines to the map, with the set style
L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

// var myLayer = L.geoJSON().addTo(mymap);
// myLayer.addData(geojsonFeature);

// initialize two polygons
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// add those polygons to the map, with respective feature style coinciding with the party attribution
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);

// set a geojson marker
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var someGeojsonFeature;

// transfer point feature from marker to vector, and add the newly-created marker to it
L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);

// bind a popup to the features on the map which satisfy the requirements
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// add the popup funtion to the map
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(mymap);

var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

// add the features with a true "show_on_map" property to the map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);

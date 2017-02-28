//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://api.mapbox.com/styles/v1/xliuholly/ciyvumejm001c2rmu39mzmzw0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieGxpdWhvbGx5IiwiYSI6ImNpeXZ1N3p4bTAwNmszMnBucjBudXVmNW0ifQ.Sj7qiQcBfSs9pzvK7Jftkg', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.03;
    var input = $('#sf').val();
    if (input) {
      scaleFactor = input;
    }
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Step 3: Add circle markers for point features to the map
    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute);

    //create marker options
    var options = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        // this option only works for raster image markers
        // title: feature.properties.CountryName
    };

    //Step 5: For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //6. Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle markers
    var layer = L.circleMarker(latlng, options);

    //build panel content string
    //var panelContent = "<p><b>Country:</b> " + feature.properties.CountryName + "</p>";
    var popupContent = "<p><b>Country:</b> " + feature.properties.CountryName + "</p>";

    //add formatted attribute to popup content string
    var year = attribute;
    popupContent += "<p><b>Disbursements on external debt in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    // //popup content is now just the Country name
    // var popupContent = feature.properties.CountryName;
    //
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });
    //
    // //event listeners to open popup on hover
    // layer.on({
    //     mouseover: function(){
    //         this.openPopup();
    //     },
    //     mouseout: function(){
    //         this.closePopup();
    //     },
    //     click: function(){
    //         $("#panel").html(panelContent);
    //     }
    // });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function ChangeSymbolScale(map, attributes){
    $('#panel').append('scale factor <input name="scaleFactor" type="text" maxlength="512" id="sf" class="scaleField">');
    $('#panel').append('    ');
    $('#panel').append('<button class="btn" >resymbolize</button>')

    $('.btn').click(function(){
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index]);
    });
};

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    });

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //Step 6: get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>Country:</b> " + props.CountryName + "</p>";

            //add formatted attribute to panel content string
            var year = attribute;
            popupContent += "<p><b>Disbursements on external debt in " + year + ":</b> " + props[attribute] + " million</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};

//2. Import GeoJSON data--done (in getData())
function getData(map){
    //load the data
    $.ajax("data/mydata.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            ChangeSymbolScale(map, attributes);
            createSequenceControls(map, attributes);
        }
    });
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

$(document).ready(createMap);

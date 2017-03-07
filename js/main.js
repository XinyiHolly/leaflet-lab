//Create the Leaflet map--done (in createMap())
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [5, 65],
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

    if (radius<2 && radius!=0) {
        radius = 2;
    }
    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Add circle markers for point features to the map
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute);

    //create marker options
    var options = {
        radius: 8,
        fillColor: "#f34106",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle markers
    var layer = L.circleMarker(latlng, options);

    // createPopup(feature.properties, attribute, layer, options.radius);
    //create new popup
    var popup = new Popup(feature.properties, attribute, layer, options.radius);

    //add popup to circle marker
    popup.bindToLayer();

    console.log(popup.content) //original popup content
    return layer;
}

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function ChangeSymbolScale(map, attributes){
    $('#panel').append('<font size="4" color=white>scale factor: &nbsp</font><SELECT name="scaleFactor" type="text" maxlength="400" id="sf" class="scaleField">'+
                       '<OPTION Value="0.03">0.03</OPTION>'+
                       '<OPTION Value="0.05">0.05</OPTION>'+
                       '<OPTION Value="0.07">0.07</OPTION>'+
                       '<OPTION Value="0.1">0.1</OPTION>'+
                       '<OPTION Value="0.2">0.2</OPTION>+'+
                       '<OPTION Value="0.3">0.3</OPTION></SELECT>');
    // $('#panel').append('scale factor <input name="scaleFactor" type="text" maxlength="400" id="sf" class="scaleField">');
    $('#panel').append(' ');
    $('#panel').append('&nbsp<button class="btn" >resymbolize</button>');
    $('#panel').append('<font size="2" color=black id="dataSource">Data Source: The World Bank, http://data.worldbank.org/</font>');
    $('.btn').click(function(){
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index]);
    });
};

//Create new sequence controls
function createSequenceControls(map, attributes){

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            $(container).on('mouseover', function(e){
                map.dragging.disable();
            });
            $(container).on('mouseout', function(e){
                map.dragging.enable();
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());

    // //create range input element (slider)
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    });

    //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

        //update slider
        $('.range-slider').val(index);

        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
        //get the old index value
        var index = $('.range-slider').val();

        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

        //update slider
        $('.range-slider').val(index);

        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            //create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">');

            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="240px" height="120px">';

            //array of circle names to base loop on
            var circles = {
                max: 80,
                mean: 100,
                min: 120
            };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle +
                '" fill="#f34106" fill-opacity="0.7" stroke="#000000" cx="60"/>';

                //text string
                svg += '<text id="' + circle + '-text" x=120 y="' + circles[circle] + '"></text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
                if (min == 0) {
                  console.log("min=0");
                }
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute;
    var content = "<h3><p>Disbursements on<br/><br/><br/><br/>External Debt in " + year + "</p></h3>";

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    var maxv = circleValues.max;
    var maxr = calcPropRadius(maxv);
    $('#max-text').attr({
        y: 80-2*maxr+48
    });
    $('#mean-text').attr({
        y: 80-maxr+44
    });

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        if (radius<2) {
            radius = 2;
        }

        //assign the cy and r attributes
        $('#'+key).attr({
            cy: 119 - radius,
            r: radius
        });

        //add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " million");
    };
};
//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // createPopup(props, attribute, layer, radius);
            //create new popup
            var popup = new Popup(props, attribute, layer, radius);

            //add popup to circle marker
            popup.bindToLayer();
        };
    });
    updateLegend(map, attribute);
};

//2. Import GeoJSON data--done (in getData())
function getData(map){
    //load the data
    $.ajax("data/ExternalDebt.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            ChangeSymbolScale(map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
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

function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.year = attribute;
    this.amount = this.properties[attribute];
    this.content = "<p><b>Country:</b> " + this.properties.CountryName + "</p><p><b>Disbursements on external debt in " + this.year + ":</b> " + this.amount + " million</p>";

    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0,-radius)
        });
    };
};

$(document).ready(createMap);

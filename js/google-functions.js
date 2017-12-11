// jQuery(function ($) {
//     $('input[name*="postcode"]').css('width', function () {
//         return $(this).width()-70;
//     }).parent().css('width', function () {
//         return $('input[name*="city"]').outerWidth();
//     }).append('<a id="find-address" class="corebtn inline find-address" style="cursor:pointer;float:right;padding: 6px 24px" href="#">Find</a>');
//
// });
var map;
var markers = [];
var default_latlng = {lat: 52.517157, lng: 56.129091}
var default_zoom = 3;
function initMap() {
    var geocoder = new google.maps.Geocoder();
    if (document.getElementById('map_address')){
        map = new google.maps.Map(document.getElementById('map_address'), {
            center: default_latlng,
            zoom: default_zoom
        });
        var infoWindow = new google.maps.InfoWindow();
        google.maps.event.addListener(map, 'click', function(event) {
            geocodeLatLng(geocoder,map,infoWindow,event.latLng);
        });
        var address = readAddress();
        if (address){
            geocodeAddress(geocoder,map,infoWindow,address,false);
        }else {
            currentPossition(map,infoWindow);
        }

    }
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input, {types: ['(regions)']});
    var autocompleteLsr = autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        setAddress(place.address_components);
        placeMarker(place.geometry.location, map);
    });

}

function currentPossition(map, infoWindow) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            map.setCenter(pos);
            map.setZoom(17);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            createMarker(results[i]);
        }
    }
}
function placeMarker(latLng, map) {
    deleteMarkers();
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: 'Hello World!'
    });
    map.setZoom(17);
    if (!map.getBounds().contains(marker.getPosition())){
        map.setCenter(latLng);
    }
    markers.push(marker);
    return marker;
}
function showInfoWindow(infowindow,content,map,marker) {
    infowindow.setContent(content);
    infowindow.open(map, marker);
}
function geocodeAddress(geocoder, resultsMap, infowindow,address, set) {
    if (address){
        geocoder.geocode({'address': address}, function (results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                if (resultsMap && infowindow){
                    var marker = placeMarker(results[0].geometry.location,resultsMap);
                    showInfoWindow(infowindow,results[0].formatted_address,resultsMap,marker);
                }
                if (set){
                    setAddress(results[0].address_components);
                }

            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
                resultsMap.setCenter(default_latlng);
                resultsMap.setZoom(default_zoom);
            }
        });
    }
}

function geocodeLatLng(geocoder, map, infowindow, latlng) {
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                if (map && infowindow){
                    var marker = placeMarker(latlng,map);
                    showInfoWindow(infowindow,results[0].formatted_address,map,marker);
                }
                setAddress(results[0].address_components);
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
function clearMarkers() {
    setMapOnAll(null);
}
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function addressFields() {
    var type = '';
    var field_name = 'address_1';
    var type_selector = jQuery('input[name*="'+field_name+'"]');
    type_selector.each(function (i,e) {
        if (jQuery(e).length && jQuery(e).is(':visible') && jQuery(e).attr('name') !== field_name){
            type_prefix = jQuery(e).attr('name');
            type = type_prefix.split(field_name).shift();
        }
    });
    return {
        address: jQuery('input[name*="'+type+'address_1"]'),
        city: jQuery('input[name*="'+type+'city"]'),
        country: jQuery('select[name*="'+type+'country"]'),
        postcode: jQuery('input[name*="'+type+'postcode"]'),
        state: jQuery('*[name*="'+type+'state"]'),
    };
}
function getAddressFieldsExist() {
    var fields = addressFields();
    var result = {};
    jQuery(Object.values(fields)).each(function (i,e) {
        if (e.length){
            result[i]=e;
        }
    });
    return result;
}

function readAddress() {
    var fields = getAddressFieldsExist();
    result = '';
    jQuery(Object.values(fields)).each(function (i,e) {
        if (e.val()){
            if (e.is('select[name*="country"]')){
                result += e.find(':selected').text()+' ';
            }
            if (e.is('input')){
                result += e.val()+' ';
            }

        }
    });
    if (result !== ''){
        return result;
    }
    return false;
}

function setAddress(address_components) {
    var components = getAddresComponents(address_components);
    var fields = addressFields();
   // if (){
        fields.address.val(components.street_number+' '+components.route);
        fields.city.val(components.locality);
        fields.country.val(components.country).change();
        fields.postcode.val(components.postal_code);
        fields.state.val(components.administrative_area_level_1).change();
    //}
}
function getAddresComponents(address_components) {
    var components={};
    jQuery.each(address_components, function(k,v1) {
        jQuery.each(v1.types, function(k2, v2){
            if (v2 === 'country' || v2 === 'administrative_area_level_1'){
                components[v2]=v1.short_name
            }else{
                components[v2]=v1.long_name
            }
        });
    });
    return components;
}

function inputAutocomplete(input, source) {
    jQuery(input).autocomplete({
        source: source,
        // open: function(event, ui) {
        //     var width = window.innerWidth
        //         || document.documentElement.clientWidth
        //         || document.body.clientWidth
        //         || $( window ).width();
        //     var autocomplete = $(".ui-autocomplete");
        //     var newLeft = width - autocomplete.width() - 10;
        //
        //     autocomplete.css("left", newLeft);
        // },
        autoFill: true,
        // select: function (event, ui) {
        //     var label = ui.item.label;
        //     var value = ui.item.value;
        //     $(this).val(value);
        //     $("form#headersearch").submit();
        // }
    });
}
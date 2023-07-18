/** This is the startingLocation.js file
 * Main functionality: contains all the classes that will be used for the website
 * Linked with startingLocation.html
 * startingLocation.js and startingLocation.html written by: David Tran (32532865)
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
//displaying map
mapboxgl.accessToken = MAPBOX_KEY;
let startLocationMap = new mapboxgl.Map({
    container: "map",
    center: [0, 0],
    zoom: 1,
    doubleClickZoom: false,
    style: "mapbox://styles/mapbox/streets-v11"
})

//placeholder marker (since there can only be one)
let startMarker = new mapboxgl.Marker({
    color: "#CD0000",
    draggable: true
})
//placeholder popup (since there can only be one)
let startPopup = new mapboxgl.Popup()
startMarker.setPopup(startPopup)

//Getting Address using Reverse Geocode
let reverseGeocodeAddress = ""
function retrieveAddress(lat, lng) {
    sendWebServiceRequestForReverseGeocoding(lat, lng, "processReverseGeocode")
}
function processReverseGeocode(data) {
    reverseGeocodeAddress = data.results[0].formatted
}

//EXTRACT COORDINATES FROM SEARCH
function getCoordinates() {
    let address = document.getElementById("startLocSearch").value
    sendWebServiceRequestForForwardGeocoding(address, 'processFwdGeocoding')
}
function processFwdGeocoding(data) {
    let address = data.results[0].formatted;
    let coordinates = [data.results[0].geometry.lng, data.results[0].geometry.lat]

    //updating marker and popup on map
    if (startMarker.getLngLat() == null) {
        startMarker.setLngLat(coordinates)
        startMarker.addTo(startLocationMap)
        startPopup.setText(`Address: ${address}`)
        startPopup.addTo(startLocationMap)
    }
    else if (startMarker.getLngLat() !== null) {
        startMarker.setLngLat(coordinates)
        startPopup.setText(`Address: ${address}`)
    }
    startLocationMap.setCenter(coordinates)
    startLocationMap.zoomTo(13)
}

//DOUBLE CLICK MAP TO ADD MARKER
startLocationMap.on("dblclick", (e) => {
    let coordinates = [e.lngLat.lng, e.lngLat.lat]
    dblClickAddStartLocation(coordinates)
})
//updating marker coordinates
function dblClickAddStartLocation(coordinates) {
    retrieveAddress(coordinates[1], coordinates[0])
    setTimeout(function () {
        if (startMarker.getLngLat() == null) {
            startMarker.setLngLat(coordinates)
            startMarker.addTo(startLocationMap)
            startPopup.setText(`Address: ${reverseGeocodeAddress}`)
            startPopup.addTo(startLocationMap)
        }
        else if (startMarker.getLngLat() !== null) {
            startMarker.setLngLat(coordinates)
            startPopup.setText(`Address: ${reverseGeocodeAddress}`)
        }
    }, 1500)
    startLocationMap.setCenter(coordinates)
    startLocationMap.zoomTo(13)
}

//SETTING CURRENT LOCATION AS STARTING POINT
function getCurrentLocation() {
    getUserCurrentLocationUsingGeolocation(processCurrentLocation)
}
//updating marker coordinate
function processCurrentLocation(lat, lon) {
    let coordinates = [lon, lat]
    retrieveAddress(lat, lon)
    setTimeout(function () {
        if (startMarker.getLngLat() == null) {
            startMarker.setLngLat(coordinates)
            startMarker.addTo(startLocationMap)
            startPopup.setText(`Address: ${reverseGeocodeAddress}`)
            startPopup.addTo(startLocationMap)
        }
        else if (startMarker.getLngLat() !== null) {
            startMarker.setLngLat(coordinates)
            startPopup.setText(`Address: ${reverseGeocodeAddress}`)
        }
    }, 1500)
    startLocationMap.setCenter(coordinates)
    startLocationMap.zoomTo(13)
}

//SNACKBAR NOTIFCATIONS
function noSelectedStartLoc() {
    let notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
        {
            message: 'Please set a starting location before continuing',
            timeout: 4000
        }
    );
}

//choosingVehicleRedirect function: saves the required data before moving to the next page
function choosingVehicleRedirect() {
    if (confirm("Are you sure you want to continue? The starting location cannot be changed after this step")) {
        try {
            let coordinates = startMarker.getLngLat()
            retrieveAddress(coordinates.lat, coordinates.lng)
            setTimeout(function () {
                let startPOI = new PointOfInterest([coordinates.lng, coordinates.lat], reverseGeocodeAddress)
                route.poiRoute[0] = startPOI;
                vacation.route = route
                updateLSData(APP_DATA, vacation)
                window.location = "choosingVehicle.html"
            }, 1500)
        }
        catch {
            noSelectedStartLoc()
        }
    }
}

//startLocation cancel function
function cancelStartLocation() {
    if (confirm("Are you sure you want to stop this vacation plan and return to the homepage?")) {
        localStorage.removeItem(APP_DATA)
        window.location = "homepage.html"
    }
}
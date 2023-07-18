/** This is the POI.js file
 * Main functionality of this JS file are: display markers, popups and routes, search functions, mapbox api interactions (webservice and map), opencage api web services etc.
 * Linked with POI.html file
 * POI.js and POI.html written by: David Tran (32532865)
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
mapboxgl.accessToken = MAPBOX_KEY;

//1. LOADING AND STORING DESTINATIONS ()
let locations = [];
loadPoiRouteCoords()

//2. SETTING UP THE MAP
let poiMap = new mapboxgl.Map({
    container: "map",
    center: locations[0].coordinates,
    zoom: 12,
    doubleClickZoom: false,
    style: "mapbox://styles/mapbox/streets-v11"
})


//3. ROUTE STOP LOCATIONS, will be used to update markers and popups --> used to shorten the character length to access coordinates to display markers and popups
function loadPoiRouteCoords() {
    locations = []
    vacation.route.poiRoute.forEach(e => locations.push(e))
}

//4. DISPLAYING ROUTE MARKERS
dispMarkers()
let routeMarkerList = [];
function dispMarkers() {
    setTimeout(function () {
        removeMarkers()
        for (let i = 0; i < locations.length; i++) {
            let marker = new mapboxgl.Marker({ color: "#CD0000" });
            marker.setLngLat(locations[i].coordinates)
            let popup = new mapboxgl.Popup({ offset: 45 });
            popup.setHTML(`<p>Address: ${locations[i].address}</p>`)
            marker.setPopup(popup)
            marker.addTo(poiMap)
            popup.addTo(poiMap)
            routeMarkerList.push(marker)
        }
    }
        , 100
    )
}

//4.1 REMOVING ROUTE MARKERS --> only removes the destination markers (red ones)
function removeMarkers() {
    routeMarkerList.forEach(element => element.remove(poiMap))
    routeMarkerList = []
}

// 5. POI SEARCH --> either uses last added destination or searched area to find POIs
let poiSearchCoordinates = []
let filterSelection = ""
function searchPOI() {
    let selectedFilter = document.getElementsByName("filterOptions")
    for (let i = 0; i < selectedFilter.length; i++) {
        if (selectedFilter[i].checked) {
            filterSelection = selectedFilter[i].value
            break
        }
    }
    let searchBoxElement = document.getElementById("searchBox")
    let searchBoxText = searchBoxElement.value
    if (searchBoxText == "") {
        poiSearchCoordinates = vacation.route.poiRoute[vacation.route.poiRoute.length - 1].coordinates;
        sendXMLRequestForPlaces(filterSelection, poiSearchCoordinates[0], poiSearchCoordinates[1], processPOIData)
    }
    else if (searchBoxText != "") {
        sendWebServiceRequestForForwardGeocoding(searchBoxText, "getSearchBoxCoords")
    }
    searchBoxElement.value = ''
}
//5.1 FETCHING COORDINATES OF TEXT SEARCH LOCATION --> only runs when the user has searched an area typed into the textfield
function getSearchBoxCoords(data) {
    let coordinates = [data.results[0].geometry.lng, data.results[0].geometry.lat]
    sendXMLRequestForPlaces(filterSelection, coordinates[0], coordinates[1], processPOIData)
}

//5.2 PROCESSING POI SEARCH CALLBACK --> processes callback function data from XMLRequestForPlaces
let markerList = []
let currentInterestData = {};
function processPOIData(data) {
    currentInterestData = data;
    //Setting bounds to ensure zoom level fits all the searched POIs
    let poiBounds = new mapboxgl.LngLatBounds(
        data.features[0].center,
        data.features[0].center
    );
    for (let element of data.features) {
        poiBounds.extend(element.center)
    }
    poiMap.fitBounds(poiBounds, {
        padding: 50
    })
    //adding new POIs and removing old ones off map
    setTimeout(function () {
        markerList.forEach(e => e.remove(poiMap))
        markerList = []
        for (let i = 0; i < data.features.length; i++) {
            //checks if there are any POIs that overlap with already added route destinations
            if (locations.filter(e => e.coordinates[0] === data.features[i].center[0] && e.coordinates[1] === data.features[i].center[1]).length == 0) {
                let poiMarker = new mapboxgl.Marker()
                poiMarker.setLngLat(data.features[i].center)
                let poiPopup = new mapboxgl.Popup({ offset: 45 })
                poiPopup.setHTML(`<p>${i + 1}.${data.features[i].text}</p>`)
                poiMarker.setPopup(poiPopup)
                poiMarker.addTo(poiMap)
                poiPopup.addTo(poiMap)
                markerList.push(poiMarker)
            }
        }
    },
        200
    )
    //CREATING LIST OF POIs --> allows users to add a POI as a destination to their route
    let poiListDisp = document.getElementById("poiList")
    let output = `<ul class="demo-list-control mdl-list" style="overflow-y:scroll; height: 34vh; width:15vw; border-style:groove">`
    for (let i = 0; i < data.features.length; i++) {
        output += `<li class="mdl-list__item">
        <span class="mdl-list__item-primary-content">
          <i class="material-icons">place</i>
          ${i + 1}. ${data.features[i].text}
        </span>
        <span class="mdl-list__item-secondary-action">
          <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored" onclick = "addInterest(${i})"><i class="material-icons">add</i></button>
        </span>
      </li>`
    }
    output += '</ul>'
    poiListDisp.innerHTML = output;
}

//6. ADDING INTEREST POINTS TO ROUTE --> runs when the add button is pressed and adds POI to destination list
function addInterest(index) {
    let coordinates = currentInterestData.features[index].center;
    let address = currentInterestData.features[index].place_name;
    let type = currentInterestData.query[0];
    let newInterest = new PointOfInterest(coordinates, address, type)
    vacation.route.addPOI(newInterest)
    markerList.forEach(e => e.remove(poiMap))
    loadPoiRouteCoords()
    dispMarkers()
    dispVacationDirections()
    searchPOI()
    drawRouteOnMap()//double executed to fix errors such as random lines between non-sequential destinations
    addSuccess()
}
//GeoJSON Object for drawing the route lines
let lineObject = {
    type: "geojson",
    data: {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: []
        }
    }
}
let legDistancePlaceholder = []
//6.1 FINDING DIRECTIONS BETWEEN EACH POI --> executes web request to retrieve directions and distance between each destination
function dispVacationDirections() {
    legDistancePlaceholder = ["Start"]
    lineObject.data.geometry.coordinates = []
    for (let i = 0; i < vacation.route.poiRoute.length - 1; i++) {
        sendXMLRequestForRoute(vacation.route.poiRoute[i].coordinates[1], vacation.route.poiRoute[i].coordinates[0], vacation.route.poiRoute[i + 1].coordinates[1], vacation.route.poiRoute[i + 1].coordinates[0], processDirectionCallback)
    }
    vacation.route.legDistance = legDistancePlaceholder
    vehicleRangeCheck1()

}
//6.2 PROCESSING XMLROUTE CALLBACK --> pushes all coordinates of whole journey into lineObject.data.geometry.coordinates to be used to draw the route lines
function processDirectionCallback(data) {
    let distanceValue = data.routes[0].distance / 1000
    legDistancePlaceholder.push(distanceValue.toFixed(2))
    for (let i = 0; i < data.routes[0].geometry.coordinates.length; i++) {
        lineObject.data.geometry.coordinates.push(data.routes[0].geometry.coordinates[i])
    }
    vehicleRangeCheck2()
    drawRouteOnMap()
    displayRouteList()
    vacation.route.lineCoords = lineObject.data.geometry.coordinates
}
//6.3 DISPLAY ROUTE LINES --> draws the route lines on the map
function drawRouteOnMap() {
    if (!poiMap.getLayer('dispRoute')) {
        poiMap.addLayer({
            id: "dispRoute",
            type: "line",
            source: lineObject,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#10D2F9", "line-width": 5 }
        })
    }
    else {
        poiMap.getSource('dispRoute').setData(lineObject.data)
    }
}

//6.4 DISPLAY ROUTE LIST --> displays the table that has all the route destinations other relevant information
setTimeout(function () {
    displayRouteList(),
        50
})
function displayRouteList() {
    //calculating total distance
    let totalDistance = 0;
    for (let i = 0; i < vacation.route.legDistance.length - 1; i++) {
        totalDistance += Number(vacation.route.legDistance[i + 1])
    }
    vacation.route.totalDistance = totalDistance
    //calculating remaining vehicle range
    let remainingVehicleRange = vehicleMaxRange
    if (gasLegDistance.length > 0) {
        remainingVehicleRange = vehicleMaxRange - gasLegDistance[gasLegDistance.length - 1]
    }
    //displaying the route list
    let routeDisp = document.getElementById("routeList")
    let output = ``
    //Number, address, location type and leg distance
    for (let i = 0; i < vacation.route.poiRoute.length; i++) {
        if (vacation.route.poiRoute[i].type == "") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">home</i></td>
            <td>${vacation.route.legDistance[i]}</td>`
        }
        else if (vacation.route.poiRoute[i].type == "gas") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">local_gas_station</i></td>
            <td>${vacation.route.legDistance[i]}</td>`
        }
        else if (vacation.route.poiRoute[i].type == "lodging") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">local_hotel</i></td>
            <td>${vacation.route.legDistance[i]}</td>`
        }
        else if (vacation.route.poiRoute[i].type == "attraction") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">attractions</i></td>
            <td>${vacation.route.legDistance[i]}</td>`
        }
        else if (vacation.route.poiRoute[i].type == "food") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">restaurant</i></td>
            <td>${vacation.route.legDistance[i]}</td>`
        }
        //displaying correct action icons
        if (i == 1 && vacation.route.poiRoute.length > 2) {
            output += `<td class="mdl-data-table__cell--non-numeric"><button onclick = "routeListRemove(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">delete_forever</i></button>
            <button onclick = "routeListIndexUp(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" disabled>
            <i class="material-icons">arrow_upward</i></button>
            <button onclick = "routeListIndexDown(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">arrow_downward</i></button></td>`
        }
        else if (i == 1 && vacation.route.poiRoute.length == 2) {
            output += `<td class="mdl-data-table__cell--non-numeric"><button onclick = "routeListRemove(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">delete_forever</i></button>
            <button onclick = "routeListIndexUp(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" disabled>
            <i class="material-icons">arrow_upward</i></button>
            <button onclick = "routeListIndexDown(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" disabled>
            <i class="material-icons">arrow_downward</i></button></td>`
        }
        else if (i == vacation.route.poiRoute.length - 1 && i != 0) {
            output += `<td class="mdl-data-table__cell--non-numeric"><button onclick = "routeListRemove(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">delete_forever</i></button>
            <button onclick = "routeListIndexUp(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">arrow_upward</i></button>
            <button onclick = "routeListIndexDown(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" disabled>
            <i class="material-icons">arrow_downward</i></button></td>`
        }
        else if (i != 0) {
            output += `<td class="mdl-data-table__cell--non-numeric"><button onclick = "routeListRemove(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">delete_forever</i></button>
            <button onclick = "routeListIndexUp(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">arrow_upward</i></button>
            <button onclick = "routeListIndexDown(${i})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
            <i class="material-icons">arrow_downward</i></button></td>`
        }
        else if (i == 0) {
            output += `<td class="mdl-data-table__cell--non-numeric"></td>`
        }
        //displaying warning symbol if vehicle range is exceeded
        if (outOfGasIndex.includes(i)) {
            output += `<td class="mdl-data-table__cell--non-numeric"><i class="material-icons" style="color: rgb(255, 208, 0)">warning</i></td></tr>`
        }
        else {
            output += `<td class="mdl-data-table__cell--non-numeric"></td></tr>`
        }
    }
    output += `<tr><td colspan="6" style="text-align:center">Total Distance: ${totalDistance.toFixed(2)}km</td></tr>
    <tr><td colspan="6" style="text-align:center">Remaining vehicle range: ${remainingVehicleRange.toFixed(2)}km</td></tr>`

    //detailed warning message that appears only if a destination is outside the vehicle's range
    if (outOfGasIndex.length > 0) {
        output += `<tr><td colspan="6" style="text-align:center"><i class="material-icons" style="font-size:18px;color: rgb(255, 208, 0)">warning</i> This destination is outside this vehicle's range. Visit a gas station beforehand to increase the vehicle's range.</td></tr>`
    }
    routeDisp.innerHTML = output;
}

//7. VEHICLE RANGE CHECK --> Checks whether the current route complies with the possible distances covered by the selected vehicle
let vehicleMaxRange = vacation.vehicleRange
//part 1 of the function
let gasCheckIndex = []
function vehicleRangeCheck1() {
    //finding index of starting location, gas stations and end destination (if it isnt already a gas station) --> WORKING
    gasCheckIndex = []
    for (let i = 0; i < vacation.route.poiRoute.length; i++) {
        if (vacation.route.poiRoute[i].type == "gas") {
            gasCheckIndex.push(i)
        }
        else if (i == 0) {
            gasCheckIndex.push(i)
        }
        else if (i == vacation.route.poiRoute.length - 1) {
            gasCheckIndex.push(i)
        }
    }
}
//part 2 of the function - executes later in order to avoid empty array issues
let outOfGasIndex = [] //used to display a error message of where the vehicle will run out of fuel
let gasLegDistance = [] //used to help calculate the remaining gas mileage left
function vehicleRangeCheck2() {
    outOfGasIndex = []
    gasLegDistance = []
    let gasDistanceExceeded = []
    //finding the leg distance between each start/refuel points/end locations
    for (let i = 0; i < gasCheckIndex.length - 1; i++) {
        let sum = 0
        for (let j = gasCheckIndex[i]; j < gasCheckIndex[i + 1]; j++) {
            sum += Number(vacation.route.legDistance[j + 1])
        }
        gasLegDistance.push(sum)
    }
    //finding which leg between gas stations exceed the limit of the vehicle's range
    for (let i = 0; i < gasLegDistance.length; i++) {
        if (gasLegDistance[i] > vehicleMaxRange) {
            gasDistanceExceeded.push(gasCheckIndex[i])
        }
    }
    //finding the index of the destination in which the vehicle will run out of fuel
    if (gasDistanceExceeded.length > 0) {
        for (let j = 0; j < gasDistanceExceeded.length; j++) {
            let sum = 0
            let iterationNum = 0
            while (sum < vehicleMaxRange) {
                //runs when the gasDistanceLocation isn't the starting location
                if (gasDistanceExceeded[j] != 0) {
                    sum += Number(vacation.route.legDistance[gasDistanceExceeded[j] + iterationNum])
                    iterationNum++
                }
                //runs when the gasDistanceLocation IS the starting location, since the first legDistance value is "start" which isn't a number
                else {
                    sum += Number(vacation.route.legDistance[1 + iterationNum])
                    iterationNum++
                }
            }
            if (gasDistanceExceeded[j] != 0) {
                outOfGasIndex.push(Number(gasDistanceExceeded[j] + iterationNum - 1))
            }
            else {
                outOfGasIndex.push(Number(gasDistanceExceeded[j] + iterationNum))
            }
        }
    }
}


//8. ROUTE LIST FUNCTIONS
//runs when the remove button is clicked
function routeListRemove(index) {
    vacation.route.removePOI(index)
    loadPoiRouteCoords()
    dispMarkers()
    dispVacationDirections()
    displayRouteList()
    drawRouteOnMap() //double executed to fix issues such as route table entries not disappearing
    removeSuccess()
}
//runs when the up button is pressed
function routeListIndexUp(index) {
    let temp = vacation.route.poiRoute[index];
    vacation.route.poiRoute[index] = vacation.route.poiRoute[index - 1];
    vacation.route.poiRoute[index - 1] = temp;
    loadPoiRouteCoords()
    dispVacationDirections()
    dispMarkers()
}
//runs when the down button is pressed
function routeListIndexDown(index) {
    let temp = vacation.route.poiRoute[index];
    vacation.route.poiRoute[index] = vacation.route.poiRoute[index + 1];
    vacation.route.poiRoute[index + 1] = temp;
    loadPoiRouteCoords()
    dispVacationDirections()
    dispMarkers()
}

//9. Snackbar popup
//POI add
function addSuccess() {
    let notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
        {
            message: 'Point of interest successfully added to route',
            timeout: 2000
        }
    );
}
//POI remove
function removeSuccess() {
    let notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
        {
            message: 'Point of interest successfully removed route',
            timeout: 2000
        }
    );
}
//Invalid conditions to continue to next page
function invalidVacation() {
    let notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
        {
            message: 'Please ensure your route has no invalid destinations before continuing',
            timeout: 4000
        }
    );
}

//CANCEL FUNCTION --> cancels planning process and returns user to homepage
function cancelPOI() {
    if (confirm("Are you sure you want to stop this vacation plan and return to the homepage?")) {
        localStorage.removeItem(APP_DATA)
        window.location = "homepage.html"
    }
}
//SAVE FUNCTION --> saves current plan and continues to next phase
function finalisingRedirect() {
    if (outOfGasIndex.length > 0) {
        invalidVacation()
    }
    else {
        if (confirm(`Are you sure you want to continue? No further edits can be made to this route once you proceed`)) {
            updateLSData(APP_DATA, vacation)
            window.location = "finalising.html"
        }
    }
}
 //ISSUE - vacation.route information carries over even when we clear it from LS
 // ONLY the vacation name, date, vehicle and vehicleRange clears properly
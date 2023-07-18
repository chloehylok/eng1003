/**This is the detailedPlanned.js file
 * Main functionality - Allows user to view recently planned vacation in detail
 * Linked to detailedPlanned.html
 * detailedPlanned.js anddetailedPlanned.html written by Chloe Lok
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
let vacationIndex = retrieveLSData(VACATION_INDEX)
let viewVacation = vacationList.listVacation[vacationIndex];

//DISPLAYING MAP
mapboxgl.accessToken = MAPBOX_KEY;
let detailedMap = new mapboxgl.Map({
    container: "map",
    center: viewVacation.route.poiRoute[0].coordinates, 
    zoom: 16,
    style: "mapbox://styles/mapbox/streets-v11"
})

//CREATING POLYLINE OBJECT
let lineObject = {
    type: 'geojson',
    data: {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: viewVacation.route._lineCoords
        }
    }
}

//DRAWING LINE ON MAP FUNCTION
drawRouteLine()
function drawRouteLine() {
    detailedMap.on('load', function () {
        detailedMap.addLayer({
            id: "dispRoute",
            type: "line",
            source: lineObject,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#10D2F9", "line-width": 5 }
        })
    })
}

//DISPLAYING MARKERS ON MAP FUNCTIONN
dispMarkers()
function dispMarkers() {
    for (let i = 0; i < viewVacation.route.poiRoute.length; i++) {
        let marker = new mapboxgl.Marker({ color: "#CD0000" });
        marker.setLngLat(viewVacation.route.poiRoute[i].coordinates)
        let popup = new mapboxgl.Popup({ offset: 45 });
        popup.setHTML(`<p>Address: ${viewVacation.route.poiRoute[i].address}</p>`)
        marker.setPopup(popup)
        marker.addTo(detailedMap)
        popup.addTo(detailedMap)
    }
    //zooming the map out to fit the whole route onto the maps
    let detailedMapBounds = new mapboxgl.LngLatBounds(
        viewVacation.route.poiRoute[0].coordinates,
        viewVacation.route.poiRoute[0].coordinates
    )
    for (let element of viewVacation.route.poiRoute) {
        detailedMapBounds.extend(element.coordinates)
    }
    detailedMap.fitBounds(detailedMapBounds, {
        padding: 50
    })
}

//DISPLAYING VACATION NAME AND DATE
displayVacationName()
function displayVacationName() {
    let vacationName = document.getElementById("previousVacationName");
    vacationName.innerHTML = viewVacation.vacationName;
}

displayVacationDate()
function displayVacationDate() {
    let vacationDate = document.getElementById("previousStartDate");
    let date = new Date(viewVacation.vacationDate)
    vacationDate.innerHTML = date.toLocaleDateString("en-GB");
}

//LISTING POI'S IN TABLE FUNCTION
displayRouteTable()
function displayRouteTable() {

    //displaying the route list
    let routeDisp = document.getElementById("routeList")
    let output = ``
    //Number, address, location type and leg distance
    for (let i = 0; i < viewVacation.route.poiRoute.length; i++) {
        if (viewVacation.route.poiRoute[i].type == "") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${viewVacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">home</i></td>
            <td>${viewVacation.route.legDistance[i]}</td>`
        }
        else if (viewVacation.route.poiRoute[i].type == "gas") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${viewVacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">local_gas_station</i></td>
            <td>${viewVacation.route.legDistance[i]}</td>`
        }
        else if (viewVacation.route.poiRoute[i].type == "lodging") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${viewVacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">local_hotel</i></td>
            <td>${viewVacation.route.legDistance[i]}</td>`
        }
        else if (viewVacation.route.poiRoute[i].type == "attraction") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${viewVacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">attractions</i></td>
            <td>${viewVacation.route.legDistance[i]}</td>`
        }
        else if (viewVacation.route.poiRoute[i].type == "food") {
            output += `<tr><td>${i + 1}</td>
            <td class="mdl-data-table__cell--non-numeric">${viewVacation.route.poiRoute[i].address}</td>
            <td class="mdl-data-table__cell--non-numeric"><i class="material-icons">restaurant</i></td>
            <td>${viewVacation.route.legDistance[i]}</td>`
        }
    }

    routeDisp.innerHTML = output;
}

//DISPLAYS OTHER INFORMATION (num of stops, starting location, vehicle type and range etc.)
displayOtherInformation()
function displayOtherInformation() {
    let otherInformation = document.getElementById("otherInformation");
    let output = ``;
    output += `
    <td class="mdl-data-table__cell--non-numeric">${viewVacation.vehicle}</td>
    <td class="mdl-data-table__cell--non-numeric">${viewVacation.vehicleRange}</td>
    <td>${viewVacation.route._totalDistance.toFixed(2)} km</td>
    <td>${viewVacation.route.poiRoute.length - 1}</td>
    `
    otherInformation.innerHTML = output;
}

function backToPreviouslyPlanned() {
    if (confirm("Are you sure you want to go back to the previously planned page?")) {
        window.location = "previouslyPlanned.html"
    }
}
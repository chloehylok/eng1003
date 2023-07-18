/**This is the finalising.js file
 * Main functionality - Allows user to finalise their vacation plan and save
 * Linked to finalising.html
 * finalising.js and finalising.html written by Kevin Helmerson
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
//SETTING COORDINATES FOR USE ON MAP
let locations = [];
loadPoiRouteCoords()

function loadPoiRouteCoords() {
    vacation.route.poiRoute.forEach(e => locations.push(e))
}

//SETTING UP MAP
mapboxgl.accessToken = MAPBOX_KEY
let finalisingMap = new mapboxgl.Map({
    container: 'map',
    center: locations[0].coordinates, //centre on coords from starting point
    zoom: 16,
    style: 'mapbox://styles/mapbox/streets-v11'
});

//CREATING POLYLINE OBJECT
let lineObject = {
    type: 'geojson',
    data: {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: vacation.route._lineCoords
        }
    }
}

//DRAWING LINE ON MAP FUNCTION
drawRouteLine()
function drawRouteLine() {
    finalisingMap.on('load', function () {
        finalisingMap.addLayer({
            id: "dispRoute",
            type: "line",
            source: lineObject,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#10D2F9", "line-width": 5 }
        });
    })
}

//DISPLAYING MARKERS ON MAP FUNCTIONN
dispMarkers()
function dispMarkers() {
    for (let i = 0; i < locations.length; i++) {
        let marker = new mapboxgl.Marker({ color: "#CD0000" });
        marker.setLngLat(locations[i].coordinates)
        let popup = new mapboxgl.Popup({ offset: 45 });
        popup.setHTML(`<p>Address: ${locations[i].address}</p>`)
        marker.setPopup(popup)
        marker.addTo(finalisingMap)
        popup.addTo(finalisingMap)
    }
    //setting map bounds to display map
    let finaliseBounds = new mapboxgl.LngLatBounds(
        vacation.route.poiRoute[0].coordinates,
        vacation.route.poiRoute[0].coordinates
    );
    for (let element of vacation.route.poiRoute) {
        finaliseBounds.extend(element.coordinates)
    }
    finalisingMap.fitBounds(finaliseBounds, {
        padding: 50
    })
}


//LISTING POI'S IN TABLE FUNCTION
displayRouteTable()
function displayRouteTable() {

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
    }
    output += `<tr><td colspan="6" style="text-align:center">Total Distance: ${vacation.route._totalDistance.toFixed(2)}km</td></tr>`

    routeDisp.innerHTML = output;
}

//CANCEL BUTTTON FUNCTION
function cancelFinalising() {
    if (confirm("Are you sure you want to stop this vacation plan and return to the homepage?")) {
        localStorage.removeItem(APP_DATA)
        window.location = "homepage.html"
    }
}

//ERROR MESSAGE IF NO NAME OR DATE HAS BEEN INPUTTED
function noSelectedNameOrDate() {
    let notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
        {
            message: 'Please enter a name and starting date for your vacation before continuing',
            timeout: 4000
        }
    );
}

//NEXT BUTTON FUNCTION / previouslyPlanned.html REDIRECT
function previouslyPlannedRedirect() {
    let vacationName = document.getElementById('vacationName').value
    console.log(vacationName)
    let startDate = document.getElementById('startDate').value
    console.log(startDate)
    if (vacationName != "" && startDate != "") {
        if (confirm(`Are you sure you want to save this vacation?`)) {
            vacation.vacationName = vacationName
            vacation.vacationDate = startDate
            vacationList.listVacation.push(vacation)
            updateLSData(SAVEDVACATION_DATA, vacationList)
            window.location = "previouslyPlanned.html"
        }
    }
    else {
        noSelectedNameOrDate()
    }
}
/**This is the choosingVehicle.js file
 * Main functionality - Allow user to selected their intended vehicle for the journey
 * Linked to choosingVehicle.html
 * choosingVehicle.js and choosingVehicle.html written by Michael Magila
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
// Object containing specific vehicle data
let vehicleData = [
    {
        vehicleName: "Sedan",
        vehicleRange: 1000
    },
    {
        vehicleName: "SUV",
        vehicleRange: 850
    },
    {
        vehicleName: "Van",
        vehicleRange: 600
    },
    {
        vehicleName: "Minibus",
        vehicleRange: 450
    }
];

// Function ouputs a table of the vehicleData listed above
function vehicleDisplay() {
    let output = "";
    output +=
        `<table class="mdl-data-table mdl-js-data-table">
        <thead>
        <tr>
            <th class="mdl-data-table__cell--non-numeric">Vehicle Type</th>
            <th class="mdl-data-table__cell--non-numeric">Vehicle Range</th>
            <th>Image</th>
            <th>Select</th>
        </tr>
        </thead>
        <tbody>`;

    // For loop goes through each vehicle to display its data in a given row
    for (let i = 0; i < vehicleData.length; i++) {
        output += `<tr>
        <td class="mdl-data-table__cell--non-numeric">
        <label>${vehicleData[i].vehicleName}</label>
        </td>
        <td class="mdl-data-table__cell--non-numeric">
        <label>${vehicleData[i].vehicleRange}km</label>
        </td>`
        //getting the correct image for the vehicle
        if (vehicleData[i].vehicleName == "Sedan") {
            output += `<td><img src = "../img/sedan.png" style="width:51px;height:51px"></td>`
        }
        else if (vehicleData[i].vehicleName == "SUV") {
            output += `<td><img src = "../img/suv.png" style="width:51px;height:51px"></td>`
        }
        else if (vehicleData[i].vehicleName == "Van") {
            output += `<td><img src = "../img/van.png" style="width:51px;height:51px"></td>`
        }
        else if (vehicleData[i].vehicleName == "Minibus") {
            output += `<td><img src = "../img/minivan.png" style="width:51px;height:51px"></td>`
        }

        output += `<td><input type="radio" name="vehicleSelectRadio"></td>
        </tr>`;
    }
    output += `</tbody>
    </table>`;
    document.getElementById("vehicleContainer").innerHTML = output;
}

// Display vehicle table when page loads
vehicleDisplay(vehicleData);

// When next button is clicked, redirect to POI page
function pointOfInterestRedirect() {
    // Obtain vehicle corresponding vehicle data and stores in LS
    let vehicleNameRef = document.getElementsByName("vehicleSelectRadio");
    let vehicleName = "";
    let vehicleRange = 0;
    for (let i = 0; i < vehicleNameRef.length; i++) {
        if (vehicleNameRef[i].checked) {
            vehicleName = vehicleData[i].vehicleName
            vehicleRange = vehicleData[i].vehicleRange
            break;
        }
    }
    //finding the index of selected radio and saving relevant vehicle data
    if (vehicleName != "") {
        // Store in LS
        vacation.vehicle = vehicleName;
        vacation.vehicleRange = vehicleRange;
        updateLSData(APP_DATA, vacation)
        // Redirect to POI page
        window.location = "POI.html"
    }
    else {
        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar(
            {
                message: 'Please select a vehicle to continue'
            }
        );
    }
}

function cancelChoosingVehicle() {
    if (confirm("Are you sure you want to stop this vacation plan and return to the homepage?")) {
        localStorage.removeItem(APP_DATA)
        window.location = "homepage.html"
    }
}
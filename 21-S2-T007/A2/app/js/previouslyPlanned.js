/** This is the previouslyPlanned.js file
 * Main functionality: allows users to see a list of previously planned vacations
 * Linked with previouslyPlanned.html file
 * previouslyPlanned.js and previouslyPlanned.html written by: Michael Magila
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
/**
 * preview function
 * Runs when the Preview button of a vacation is clicked.
 * Sends the user to the detailedPlanned page after storing the information necessary
 * @param {number} vacation vacation index in vacationList
 */
function preview(vacationIndex) {
    // Obtain specific vacation data and transition to detailedPlanned.js
    localStorage.setItem(VACATION_INDEX, vacationIndex);
    window.location = "detailedPlanned.html"
}
// Function that takes the vacationList and displays the seperate vacation information
function displayPreviouslyPlannedVacations() {
    let output = "";
    // For loop goes through each preciously planned vacation to display its data in a given row --> iterations values run in reverse order to make sure most recently planned is put at the top of the table
    for (let i = vacationList.listVacation.length - 1; i > -1; i--) {
        let date = new Date(vacationList.listVacation[i].vacationDate)
        output += `<tr>
        <td class="mdl-data-table__cell--non-numeric">${vacationList.listVacation[i].vacationName}</td>
        <td class="mdl-data-table__cell--non-numeric" style = "overflow: hidden;text-overflow: ellipsis; max-width: 35vw">${vacationList.listVacation[i].route.poiRoute[0].address}</td>
        <td class="mdl-data-table__cell--non-numeric">${vacationList.listVacation[i].vehicle}</td>
        <td>${vacationList.listVacation[i].route._totalDistance.toFixed(2)} km</td>
        <td>${vacationList.listVacation[i].route.poiRoute.length - 1}</td>
        <td class="mdl-data-table__cell--non-numeric">${date.toLocaleDateString('en-GB')}</td>
        <td>
        <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="preview('${i}')">View</button>
        </td>
        </tr>`;
    }
    document.getElementById("vacationContainer").innerHTML = output;
}

// Displays previously planned vacations when page loads
displayPreviouslyPlannedVacations()

// Returns user to homepage when button is clicked
function homepageRedirect() {
    window.location = "homepage.html"
}
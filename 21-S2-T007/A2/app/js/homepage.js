/**This is the homepage.js file
 * Main functionality - Serves as the main page of the website
 * Linked to homepage.html
 * homepage.js and homepage.html written by David Tran (32532865)
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
function startingLocationRedirect() {
    localStorage.removeItem(APP_DATA)
    vacation = new NewVacation();
    route = new Route();
    window.location = "startingLocation.html";
}
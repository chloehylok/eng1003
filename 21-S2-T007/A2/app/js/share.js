/** This is the share.js file
 * Main functionality: contains all the classes that will be used for the website
 * share.js written by: David Tran (32532865)
 * ENG1003 Team 007
 * Monash University
 * October 2021
 */
"use strict"
class PointOfInterest {
    constructor(coordinates = [], address = "", type = "") {
        /**Coordinates will be stored like this in the Route class: [longitude,latitude] 
        To make it easier to use with the MapBox API*/
        /**"coordinates argument must be an array in the format [longitude,latitude]" */
        this._coordinates = coordinates
        this._address = address
        this._type = type
    }
    get coordinates() {
        return this._coordinates
    }
    get address() {
        return this._address
    }
    get type() {
        return this._type
    }
    fromData(dataObject) {
        this._coordinates = dataObject._coordinates
        this._address = dataObject._address
        this._type = dataObject._type
    }
}
/**Stores data related to a vacation's route (such as the coordinates of the destination, totaldistance, legdistance)
 * Stores the contents of the PointOfInterest Class into an array
 */
class Route {
    constructor() {
        this._poiRoute = []
        this._legDistance = ["Start"] //distance between each destination in the route(first distance is always "start")
        this._totalDistance = 0
        this._lineCoords = [] //stores the coordinates that draw the route line 
    }
    get poiRoute() {
        return this._poiRoute
    }
    get legDistance() {
        return this._legDistance
    }
    get totalDistance() {
        this._totalDistance
    }
    get lineCoords() {
        this._lineCoords
    }
    set lineCoords(lineCoordsArray) {
        this._lineCoords = lineCoordsArray
    }
    set legDistance(legDistanceArray) {
        this._legDistance = legDistanceArray
    }
    set totalDistance(totalDistanceValue) {
        this._totalDistance = totalDistanceValue
    }
    addPOI(pointOfInterest) {
        this._poiRoute.push(pointOfInterest)
    }
    removePOI(poiIndex) {
        this._poiRoute.splice(poiIndex, 1)
    }
    calculateTotalDistance() {
        let output = 0
        for (let i = 0; i < this._legDistance.length - 1; i++) {
            output += this._legDistance[i + 1]
        }
        this._totalDistance = output
    }
    fromData(dataObject) {
        let data = dataObject._poiRoute
        this._poiRoute = [];
        for (let i = 0; i < data.length; i++) {
            let POIRetrieve = new PointOfInterest()
            POIRetrieve.fromData(data[i])
            this._poiRoute.push(POIRetrieve)
        }
        this._totalDistance = dataObject._totalDistance;
        this._legDistance = dataObject._legDistance;
        this._lineCoords = dataObject._lineCoords;
    }
}
// Stores data related to a specific vacation (such as name, date, vehicle and route)
// Stores route data from the Route class into an array
class NewVacation {
    constructor() {
        this._vacationName = ""
        this._vacationDate = ""
        this._vehicle = ""
        this._vehicleRange = 0
        this._route = []
    }
    get vacationName() {
        return this._vacationName
    }
    get vacationDate() {
        return this._vacationDate
    }
    get vehicle() {
        return this._vehicle
    }
    get vehicleRange() {
        return this._vehicleRange
    }
    get route() {
        return this._route
    }
    set route(routeData) {
        this._route = routeData
    }
    set vehicle(vehicle) {
        this._vehicle = vehicle
    }
    set vehicleRange(vehicleRange) {
        this._vehicleRange = vehicleRange
    }
    set vacationName(vacationName) {
        this._vacationName = vacationName
    }
    set vacationDate(vacationDate) {
        this._vacationDate = vacationDate
    }
    fromData(dataObject) {
        let route = new Route()
        route.fromData(dataObject._route)
        this._route = route
        this._vacationName = dataObject._vacationName
        this._vacationDate = dataObject._vacationDate
        this._vehicle = dataObject._vehicle
        this._vehicleRange = dataObject._vehicleRange
    }
}
/**stores a list of all saved vacations
 * stores the contents of the NewVacation class into an array*/
class VacationList {
    constructor() {
        this._listVacation = []
    }
    get listVacation() {
        return this._listVacation
    }
    addVacation(NewVacation) {
        this._listVacation.push(NewVacation)
    }
    fromData(dataObject) {
        let data = dataObject._listVacation
        this._listVacation = [];
        for (let i = 0; i < data.length; i++) {
            let vacationRetrieve = new NewVacation()
            vacationRetrieve.fromData(data[i])
            this._listVacation.push(vacationRetrieve)
        }
    }
}

/**load class variables on page load
 * use these class variables to store data
*/
let route = new Route()
let vacation = new NewVacation()
let vacationList = new VacationList()

//load local storage on page load
if (checkLSData(APP_DATA)) {
    // If data exists, retrieve it
    let data = retrieveLSData(APP_DATA);
    // Restore data into inventory
    vacation.fromData(data);
}
if (checkLSData(SAVEDVACATION_DATA)) {
    // If data exists, retrieve it
    let data = retrieveLSData(SAVEDVACATION_DATA);
    // Restore data into inventory
    vacationList.fromData(data);
}


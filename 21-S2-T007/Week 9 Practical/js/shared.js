/** 
 * shared.js 
 * This file contains the classes and setup code for index.html
 */

"use strict";
// TODO: Write code to implement the Locker class
class Locker
{
    constructor()
    {
        this._id = "";
        this._label = "";
        this._color = "";
    }
    get id() {return this._id;}
    get label() {return this._label;}
    get color() {return this._color;}
    set id(newID) {this._id = newID}
    set label(newLabel) {this._label = newLabel;}
    set color(newColor) {this._color = newColor;}
    toString()
    {
        return `<p>Locker ${this.id} has label ${this.label} (color: ${this.color})</p>`;
    }
}
 
// TODO: Write code to implement the LockerList class
class LockerList
{
    constructor()
    {
        this._lockers = [];
    }
    get lockers() {return this._lockers;}
    //add a new locker to the list in this class
    addLocker(id,label,color)
    {
        let newLocker = new Locker();
        newLocker.id = id;
        newLocker.label = label;
        newLocker.color = color;
        this._lockers.push(newLocker);

    }
    toString()
    {
        return `<p>This list has ${this.lockers.length} lockers</p>`;
    }
}

// Code for testing
let listOfLockers = new LockerList();




/** 
 * main.js 
 * This file contains code that runs on load for index.html
 */
"use strict";
// function to add a locker
function addNewLocker()
{
    if (confirm("Add a new locker?"))
    {
        let id = listOfLockers.lockers.length + 1;
        let label = prompt("Give this locker a label");
        const HEX_RANGE = "0123456789ABCDEF";
        let color = "";
        for (let i = 0; i < 6; i++)
        {
            let rand = Math.floor(Math.random()*HEX_RANGE.length);
            color += HEX_RANGE.charAt(rand);
        }
        listOfLockers.addLocker(id, label, color);
        displayLockers();
    }
}

// TODO: Write the function displayLockers
// prints out HTML required to display contents in table
function displayLockers(){
    let output = ""
    
    for (let i = 0; i < listOfLockers.lockers.length; i++){
        output += `<tr bgcolor = ${listOfLockers.lockers[i].color}>
        <td>${listOfLockers.lockers[i].id}</td> 
        <td>${listOfLockers.lockers[i].label}</td>
        </tr>`
    }
   
    let printLocker = document.getElementById("lockerTable")
    printLocker.innerHTML = output;
}


displayLockers();

/**
 * <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
    <thead>
    <tr>
    <th class="mdl-data-table__cell--non-numeric">Locker ID</th>
    <th class="mdl-data-table__cell--non-numeric">Locker Label</th>
    </tr>
    </thead>
    <tbody>
 */

     /**output += `</tbody>
    </table>;*/
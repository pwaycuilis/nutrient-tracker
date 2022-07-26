const fetch = require('node-fetch')

async function getData (url) {
    try {
        const response = await fetch(url);
        return response.json();
    } catch(err) {
        return ({message: err.message});
    }
}

function getSortOrder (sortOrder, sortBy, direction) {

    switch (sortOrder) {
        case "":
            direction = "asc";
            sortOrder = sortBy + '_' + direction;
            break;

        case "number_asc":
            if(sortBy === "number"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "number_desc":
            if(sortBy === "number"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;

        case "name_asc":
            if(sortBy === "name"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "name_desc":
            if(sortBy === "name"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;

        case "amount_asc":
            if(sortBy === "amount"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "amount_desc":
            if(sortBy === "amount"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;

        case "unitName_asc":
            if(sortBy === "unitName"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "unitName_desc":
            if(sortBy === "unitName"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;

        case "mealAmount_asc":
            if(sortBy === "mealAmount"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "mealAmount_desc":
            if(sortBy === "mealAmount"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;

        case "dailyAmount_asc":
            if(sortBy === "dailyAmount"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "dailyAmount_desc":
            if(sortBy === "dailyAmount"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;

        case "percentOfDV_asc":
            if(sortBy === "percentOfDV"){
                direction = "desc"
            } else {
                direction = "asc"
            }
            sortOrder = sortBy + '_' + direction; 
            break;
        
        case "percentOfDV_desc":
            if(sortBy === "percentOfDV"){
                direction = "asc"
            } else {
                direction = "desc"
            }
            sortOrder = sortBy + '_' + direction;
            break;
    }

    return { sortOrder, direction }

}

async function searchMultipleFoods (fdcIds) {
    
}

module.exports = {
    getData,
    getSortOrder
}
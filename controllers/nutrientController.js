const Meal = require('../models/meal')
const Food = require('../models/food')
const Nutrient = require('../models/nutrient')

const { getData } = require('../middleware/helpers')


const api_key = 'mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9';

const defaultNutrientNums = '208,255,204,205,203,291,269,301,303,304,305,306,307,309,401,504,601,606,645,646'

async function nutrientSort (nutrients, sortBy, dir) {
    const sorter = sortBy ? sortBy : "number";
    const direction = dir ? dir : "asc";

    console.log('sorter: ' + sorter)
    

    if (direction == "desc") {
        console.log('desc sort')
        // nutrients.sort((a, b) => (b[sorter] > a[sorter]) ? 1 : -1)
        nutrients.sort((a, b) => (a[sorter] > b[sorter]) ? -1 : 1)
    } else if (direction == "asc") {
        console.log('asc sort')
        nutrients.sort((a, b) => (a[sorter] > b[sorter]) ? 1 : -1)
    } else {
        console.log(`${direction} is not a valid direction`);
    }

    return nutrients;


}

async function addNutrients (req, res, next) {

    // let fdcId = req.body.fdcId
    let meal = res.meal;
    let nutrientNums = req.body.nutrientNums;

    // console.log('meal: ' + meal)
    console.log('nutrientNums: ' + nutrientNums)

    const fdcIds = meal.foods.map(food => food.fdcId).join();

    console.log('fdcIds: ' + fdcIds);

    const url = `https://api.nal.usda.gov/fdc/v1/foods/?fdcIds=${fdcIds}&api_key=${api_key}&nutrients=${nutrientNums}&format=abridged`
    let data = await getData(url);

    if (typeof(nutrientNums) == "string"){
        nutrientsToAdd = nutrientNums.split(',')
    } else {
        nutrientsToAdd = nutrientNums;
    }
    
    console.log('nutrientsToAdd: ' + nutrientsToAdd)

    data.forEach(food => {
        let foodToChange = meal.foods.find(mealFood => mealFood.fdcId === food.fdcId)
        let amtMultiplier = foodToChange.amountInGrams / 100;
        food.foodNutrients.forEach(nutrient => {
            if (!foodToChange.foodNutrients.some(nutrientToAdd => nutrientToAdd.number === nutrient.number)){
                foodToChange.foodNutrients.push(new Nutrient({
                    number: nutrient.number,
                    name: nutrient.name,
                    amount: (nutrient.amount * amtMultiplier).toFixed(2),
                    unitName: nutrient.unitName
                }))
            }

            if (meal.nutrientTotals.some(nutrientTotal => nutrientTotal.number === nutrient.number)) {
                let totalToChange = meal.nutrientTotals.find(nutrientTotal => nutrientTotal.number === nutrient.number)
                totalToChange.amount += (nutrient.amount * amtMultiplier);
                totalToChange.amount = +totalToChange.amount.toFixed(2);
            } else {
                meal.nutrientTotals.push(new Nutrient({
                    number: nutrient.number,
                    name: nutrient.name,
                    // amount: nutrient.amount,
                    amount: (nutrient.amount * amtMultiplier).toFixed(2),
                    unitName: nutrient.unitName
                }))
            }
            

        })
    })

    await meal.save();
    res.meal = meal;

    let direction = "";

    return res.render('meals/show', { meal: meal, direction: direction })



}

async function removeNutrients (req, res, next) {

    let meal = res.meal;
    let nutrientsToRemove = req.body.nutrientNums.split(',');

    nutrientsToRemove.forEach(nutrientToRemove => {
        meal.foods.forEach(food => {
            let index = food.foodNutrients.findIndex(foodNutrient => foodNutrient.number === nutrientToRemove)
            if (index >= 0) {
                food.foodNutrients.splice(index, 1);
            }
        })

        let i = meal.nutrientTotals.findIndex(nutrientTotal => nutrientTotal.number === nutrientToRemove)
        if (i >= 0) {
            meal.nutrientTotals.splice(i, 1);
        }

    })

    await meal.save();
    res.meal = meal;

    let direction = ""
    return res.render('meals/show', { meal: meal, direction: direction })

}

//unabridged format data
function getFullNutrientList (data) {
 
    const nutrientMap = new Map();
    let nutrientList = [];

    data.foods.forEach(food => {
        food.foodNutrients.forEach(nutrient => {
            if (!nutrientMap.has(nutrient.nutrientNumber)){
                let nutrientObj = new Object({
                    nutrientName: nutrient.nutrientName,
                    nutrientNumber: nutrient.nutrientNumber,
                    value: nutrient.value,
                    unitName: nutrient.unitName
                })
                nutrientMap.set(nutrient.nutrientNumber, nutrientObj);
                nutrientList.push(nutrientObj);
            }
        })
    })

    return nutrientList;
}

module.exports = {
    nutrientSort,
    addNutrients,
    removeNutrients,
    getFullNutrientList
}
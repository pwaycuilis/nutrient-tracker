const Meal = require('../models/meal')
const Food = require('../models/food')
const Nutrient = require('../models/nutrient')


const { nutrientSort } = require('../controllers/nutrientController')
const { getData } = require('../middleware/helpers');
// const { findById } = require('../models/nutrient');

const api_key = 'mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9';

async function getMeal (req, res, next) {


    let meal
    try {
        if (req.params.mealId) {
            meal = await Meal.findById(req.params.mealId)
        }
        else if (req.body.mealId) {
            meal = await Meal.findById(req.body.mealId)
        }
    } catch (err) {
        console.log(err.message);
        return ({"error": err.message})
    }

    res.meal = meal;

    next();
}


async function addNutrientTotalsToMeal(req, res, next) {

    let meal = res.meal
    let food = res.food
    let mealID = res.mealID;

    // console.log(meal)
    // console.log(food)

    food.foodNutrients.forEach(nutrient => {
        let target = meal.nutrientTotals.find(total => total.number === nutrient.number)
        // console.log('addNutrs, target: ' + target);
        if (target) {
            // console.log('in addNutrs, target = true');
            target.amount += nutrient.amount
            target.amount = +target.amount.toFixed(2);
        } else {
            // console.log('in addNutrs, target = false')
            meal.nutrientTotals.push(nutrient)
        }
        // if (meal.nutrientTotals.some(total => total.number === nutrient.number)) {

        // }
    })

    meal.foods.push(food);

    await meal.save();

    res.meal = meal;
    res.food = food;
    res.mealID = mealID;

    let direction = "";

    return res.render('meals/show', { meal: meal, direction: direction })
    next();


}

async function removeFoodFromMeal (req, res, next) {
    const foodId = req.params.foodId
    const mealId = req.params.mealId

    console.log('in removeFoodFromMeal func')

    let meal = await Meal.findById(mealId)

    let foodToRemove = meal.foods.find(food => food.id === foodId)

    foodToRemove.foodNutrients.forEach(nutrient => {
        let targetNutrient = meal.nutrientTotals.find(nutrientTotal => nutrientTotal.number === nutrient.number)
        if (targetNutrient) {
            targetNutrient.amount -= nutrient.amount
            targetNutrient.amount = +targetNutrient.amount.toFixed(2)
        }
    })

    try {
        await meal.save();
        await Meal.updateOne({ _id: mealId },
            {
                "$pull": {
                    "foods": {
                        "_id": req.params.foodId
                    }
                }
            });
    }catch (err){
        return({message: err.message});
    }

    meal = await Meal.findById({"_id": mealId});

    let direction = ""
    return res.render('meals/show', { meal: meal, direction: direction} )

    next();

    
}

module.exports = {
    getMeal,
    addNutrientTotalsToMeal,
    removeFoodFromMeal
}
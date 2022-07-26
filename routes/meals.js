const express = require('express')
const Meal = require('./../models/meal')
const router = express.Router()

const { foodSearchQuery, foodSearchFdcId, getFoodPortions, addFoodToMeal } = require('../controllers/foodController')
const { getMeal, addNutrientTotalsToMeal, removeFoodFromMeal } = require('../controllers/mealController')
const { nutrientSort, addNutrients, removeNutrients } = require('../controllers/nutrientController')
const { getData } = require('../middleware/helpers')

const dailyNutrientValues = require('../models/dailyNutrientValues')


router.get('/new', (req, res) => {
    res.render('meals/new', { meal: new Meal() })
})

router.get('/edit/:id', async (req, res) => {
    const meal = await Meal.findById(req.params.id)
    res.render('meals/edit', { meal: meal })
})

router.get('/:id', async (req, res) => {
// router.get('/:slug', async (req, res) => {

    const meal = await Meal.findById(req.params.id)
    // const meal = await Meal.findOne({ slug: req.params.slug })

    let direction = "";
    if (meal == null) res.redirect('/')
    res.render('meals/show', { meal: meal, direction: direction })

})

//use this route instead of foods/addFoodToMeal
router.post('/:id', addFoodToMeal, addNutrientTotalsToMeal, async (req, res) => {

})

//create new meal
router.post('/', async (req, res, next) => {

    req.meal = new Meal()
    next()
    
}, saveMealAndRedirect('new'))

//edit meal (name or description)
router.put('/:id', async (req, res, next) => {

    req.meal = await Meal.findById(req.params.id)
    next()
    
}, saveMealAndRedirect('edit'))

//delete meal
router.delete('/:id', async (req, res) => {

    await Meal.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

//should be post but can only use get for href link
//can use post if i change input type to form action
router.get('/:mealId/removeFood/:foodId', removeFoodFromMeal, async (req, res) => {

})

router.get('/:mealId/foods/:foodId', async (req, res) => {
    let meal = await Meal.findById(req.params.mealId)
    let food = meal.foods.find(foodObj => foodObj.id === req.params.foodId)

    res.render('meals/showFood', { food: food, meal: meal})
})

//add nutrients to meal
router.post('/:mealId/addNutrients', getMeal, addNutrients, async(req, res) => {
    // console.log(req.body.nutrientNums);
})

router.post('/:mealId/removeNutrients', getMeal, removeNutrients, async (req, res) => {

})

router.get('/compareToGuideline/:mealId', getMeal, async (req, res) => {

    // const mealId = req.params.mealId
    // let meal = await Meal.findById(mealId)
    let meal = res.meal;

    dailyNutrientValues.forEach(value => {
        let targetNutrient = meal.nutrientTotals.find(nutrient => nutrient.number === value.number)

        if (targetNutrient){
            value.mealAmount = targetNutrient.amount;
            value.percentOfDV = (value.mealAmount / value.dailyAmount).toFixed(2);

        }
        
    })

    res.render('meals/compare', {meal: meal, dailyNutrientValues: dailyNutrientValues, direction : ""})
})

function saveMealAndRedirect(path) {
    return async (req, res) => {
        let meal = req.meal
        meal.name = req.body.name,
        meal.description = req.body.description

        console.log('in /meals POST')
        console.log({meal})
        try {
            meal = await meal.save()
            res.redirect(`/meals/${meal.id}`)
            // res.redirect(`meals/%{meal.slug}`)
    
        } catch (err) {
            console.log(err);
            res.render(`meals/${path}`, { meal: meal })
            // console.log()
        }
    }
}
module.exports = router
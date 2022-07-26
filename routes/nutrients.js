const express = require('express')
const Food = require('./../models/food')
const Meal = require('./../models/meal')
const fetch = require('node-fetch')
const router = express.Router()

const { foodSearchQuery, foodBrandSearchQuery, foodSearchFdcId, getFoodPortions, addFoodToMeal } = require('../controllers/foodController')
const { getMeal, addNutrientTotalsToMeal } = require('../controllers/mealController')
const { nutrientSort, addNutrients, getFullNutrientList } = require('../controllers/nutrientController')
const { getData, getSortOrder } = require('../middleware/helpers')
const { render } = require('ejs')

const DailyNutrientValues = require('../models/dailyNutrientValues')

const api_key = 'mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9';

router.get('/list', async (req, res) => {
    let url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=&dataType=Foundation,Survey%20%28FNDDS%29,SR%20Legacy&api_key=${api_key}&pageNumber=3`;

    const data = await getData(url);


    let nutrientList = getFullNutrientList(data);

    nutrientList.sort((a, b) => (a["nutrientNumber"] > b["nutrientNumber"]) ? 1 : -1)

    let meals = await Meal.find();

    res.render('nutrients/showList', { nutrientList: nutrientList, meals: meals })

})

router.post('/sort', getMeal, async (req, res) => {

    const sortBy = req.body.sortBy;
    let sortOrder = req.body.direction;
    // const srcPath = req.body.srcPath;
    let meal = res.meal;
    let direction
    ({ sortOrder, direction } = getSortOrder(sortOrder, sortBy, direction))


    meal.nutrientTotals = await nutrientSort(meal.nutrientTotals, sortBy, direction)

    direction = sortOrder;
    res.render('meals/show', { meal: meal, direction: direction })



    // res.render('customFoods/new', { food : new Food()})
})

router.post('/sortCompare', getMeal, async (req, res) => {

    let sortBy = req.body.sortBy;
    let sortOrder = req.body.direction;
 
    let meal = res.meal;

    DailyNutrientValues.forEach(value => {
        let targetNutrient = meal.nutrientTotals.find(nutrient => nutrient.number === value.number)

        if (targetNutrient){
            value.mealAmount = targetNutrient.amount;
            value.percentOfDV = (value.mealAmount / value.dailyAmount).toFixed(2);

        }
        
    })

    let direction

    ({ sortOrder, direction } = getSortOrder(sortOrder, sortBy, direction))


    let nutrientList = []
    nutrientList = await nutrientSort(DailyNutrientValues, sortBy, direction)

    direction = sortOrder;
    res.render('meals/compare', { meal: meal, direction: direction, dailyNutrientValues: nutrientList })



    // res.render('customFoods/new', { food : new Food()})
})

router.post('/addNutrientsToMeal', getMeal, addNutrients, async(req, res) => {

    // let nutrientNums = req.body.nutrientNum;

    // console.log("nutrientNums: " + nutrientNums)
})



module.exports = router;
const express = require('express')
const Food = require('./../models/food')
const Meal = require('./../models/meal')
const fetch = require('node-fetch')
const router = express.Router()

const { foodSearchQuery, foodBrandSearchQuery, foodSearchFdcId, getFoodPortions, addFoodToMeal } = require('../controllers/foodController')
const { addNutrientTotalsToMeal } = require('../controllers/mealController')
const { getFullNutrientList } = require('../controllers/nutrientController')
const { getData } = require('../middleware/helpers')

const api_key = 'mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9';

router.get('/custom/new', async (req, res) => {
    let url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=&dataType=Foundation,Survey%20%28FNDDS%29,SR%20Legacy&api_key=mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9`;

    const data = await getData(url);

    let nutrientList = getFullNutrientList(data);

    nutrientList.sort((a, b) => (a["nutrientNumber"] > b["nutrientNumber"]) ? 1 : -1)




    res.render('customFoods/new', { food : new Food(), nutrientList : nutrientList })
})

router.post('/custom', async (req, res) => {

    let description = req.body.description;
    let amountInGrams = req.body.amountInGrams;

    let nutrientNums = req.body.nutrientNums;
    let amounts = req.body.amount;
    console.log('amounts: ' + amounts);

    let nuts = req.body.nuts;

    console.log(nuts);

    amounts = amounts.filter(ele => ele.length > 0);


    let testMap = []
    testMap = nutrientNums.map(nut => JSON.parse(nut))

    console.log('testmap: ' + testMap[1].name)

    let nutrients = []
    nutrients = testMap.map(ele => new Object({
        number: ele.number,
        name: ele.name,
        amount: amounts.shift(),
        unitName: ele.unitName

    }))

    //WORKING

    nutrients.forEach(nutrient => {
        console.log(nutrient);
    })


    let food = new Food({
        description: description,
        amountInGrams: amountInGrams,
        foodNutrients: nutrients
    })

    try {
        food = await food.save();
    } catch(err){
        console.log(err.message);
    }

    let meals = await Meal.find()
    let foods = await Food.find()


    res.render('index', {meals: meals, foods: foods })

})

router.get('/custom/edit/:id', async (req, res) => {
    const food = await Food.findById(req.params.id)
    ///duplicate code
    // let url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=&dataType=Foundation,Survey%20%28FNDDS%29,SR%20Legacy&api_key=mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9`;
    // const data = await getData(url);
    // let nutrientList = getFullNutrientList(data);
    // nutrientList.sort((a, b) => (a["nutrientNumber"] > b["nutrientNumber"]) ? 1 : -1)
    //duplicate code from /custom/new 

    res.render('customFoods/edit', { food: food })
})

router.put('/custom/:id', async (req, res) => {
    let food = await Food.findById(req.params.id)

    food.description = req.body.description
    food.amountInGrams = req.body.amountInGrams
    let nutrientNums = req.body.nutrientNums;
    let amounts = req.body.amount;

    amounts = amounts.filter(ele => ele.length > 0);

    // console.log('description: ' + food.description);
    // console.log('amountInGrams: ' + food.amountInGrams);
    // console.log('amounts: ' + amounts);
    // console.log('food: ' + food);

    food.foodNutrients.forEach(nutrient => {
        nutrient.amount = amounts.shift()
    })

    try {
        food = await food.save()
    } catch(err){
        console.log(err.message);
    }

    let meals = await Meal.find()
    let foods = await Food.find()


    res.render('index', {meals: meals, foods: foods })

})

router.delete('/:id', async (req, res) => {

    await Food.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

router.post('/custom/nutrientAmounts', async (req, res) => {

    let description = req.body.description;
    let amountInGrams = req.body.amountInGrams;

    let nutrientNums = req.body.nutrientNums;

    console.log('in custom/nutrientAmounts');
    console.log('description: ' + description);
    console.log('amountInGrams: ' + amountInGrams);
    console.log('nutrientNums: ' + nutrientNums);

})
// router.get('/search', (req, res) => {
//     res.render('foods/search')
// })



router.post('/search', foodSearchQuery, async (req, res) => {
    

})

router.post('/brandSearch', foodBrandSearchQuery, async (req, res) => {

})

router.get('/:fdcId', getFoodPortions, foodSearchFdcId, async (req, res) => {
// router.get('/:fdcId', foodSearchFdcId, async (req, res) => {
    

})

router.post('/addFoodToMeal', addFoodToMeal, addNutrientTotalsToMeal, async (req, res) => {
    

})

function saveCustomFoodAndRedirect(path) {
    return async (req, res) => {
        let food = req.food
        food.description = req.body.description

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
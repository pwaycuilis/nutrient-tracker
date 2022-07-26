const Meal = require('../models/meal')
const Food = require('../models/food')
const Nutrient = require('../models/nutrient')

const { getData } = require('../middleware/helpers')
const { addNutrientTotalsToMeal } = require('./mealController')
const { nutrientSort } = require('../controllers/nutrientController')

const api_key = 'mDxmvhitceBL7z0dotECKMGuvpUJHfXuysOWCBL9';

const defaultNutrientNums = '208,255,204,205,203,291,269,301,303,304,305,306,307,309,320,401,504,601,606,645,646'

async function foodSearchQuery (req, res, next) {

    let brandSearch = req.body.searchType ? req.body.searchType : 0;
    let pageNumber = req.body.pageNumber ? req.body.pageNumber : 1;
    let searchTerm = req.body.searchTerm
    let dataTypes = 'Foundation,Survey%20%28FNDDS%29,SR%20Legacy';

    if (brandSearch) {
        dataTypes += (',' + brandSearch);
    }

    let url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchTerm}&dataType=${dataTypes}&api_key=${api_key}&pageNumber=${pageNumber}`

    let data = await getData(url);


    let pageInfo = new Object({
        totalHits: data.totalHits,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        pageList: data.pageList,

        pageSize: data.foodSearchCriteria.pageSize,
        numberOfResultsPerPage: data.foodSearchCriteria.numberOfResultsPerPage,
        dataType: data.foodSearchCriteria.dataType,
        query: data.foodSearchCriteria.query,
        generalSearchInput: data.foodSearchCriteria.generalSearchInput
    })

    

    let foods = data.foods.map(food => new Object({
        fdcId: food.fdcId,
        description: food.description,
        commonNames: food.commonNames,
        additionalDescriptions: food.additionalDescriptions,
        brandOwner: food.brandOwner,
        brandName: food.brandName,
        ingredients: food.ingredients,
        marketCountry: food.marketCountry,
        foodCategory: food.foodCategory,
        servingSize: food.servingSize,
        servingSizeUnit: food.servingSizeUnit,
        foodCategory: food.foodCategory,

        foodNutrients: food.foodNutrients,

        foodMeasures: food.foodMeasures
    }))


    return res.render('foods/search', { foods: foods, pageInfo: pageInfo })
}

async function foodBrandSearchQuery(req, res, next) {

    const searchTerm = req.body.searchTerm

    let url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchTerm}&dataType=Foundation,Survey%20%28FNDDS%29,SR%20Legacy,Branded&api_key=${api_key}`;

    let data = await getData(url)

    let foods = data.foods.map(food => new Object({
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner,
        brandName: food.brandName,
        ingredients: food.ingredients,
        marketCountry: food.marketCountry,
        foodCategory: food.foodCategory,
        servingSize: food.servingSize,
        servingSizeUnit: food.servingSizeUnit

    }))

    return res.render('foods/brandSearch', { foods: foods })
}

async function foodSearchFdcId (req, res, next) {
    let fdcId = req.params.fdcId
    console.log('fdcId: ' + fdcId)
    // let defaultNutrientNums = '208,255,204,205,203,291,269,301,303,304,305,306,307,309,401,601,606,645,646';
    const nutrientNums = req.query.nutrientNums ? req.query.nutrientNums : defaultNutrientNums;

    let url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${api_key}&nutrients=${nutrientNums}&format=abridged`;

    // let url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${api_key}&nutrients=${nutrientNums}`;

    let data = await getData(url);


    // console.log('data.foodNutrients', data.foodNutrients)

    let nutrients = data.foodNutrients.map(ele => new Object({
        // id: ele.id,
        number: ele.number,
        name: ele.name,
        amount: ele.amount,
        unitName: ele.unitName

    }))

    let food = new Object ({
        fdcId: data.fdcId,
        description: data.description,
        foodNutrients: nutrients,
        //////
        //foodPortions: data.foodPortions

    });

    // let portions = data.foodPortions.map(ele => new Object({
    //     portionDescription: ele.portionDescription,
    //     gramWeight: ele.gramWeight
    // })) 


    let meals = await Meal.find();

    let portions = res.portions


    return res.render('foods/show', {food: food, meals: meals, portions: portions})

    next()

}

// async function getFood (req, res, next) {
//     const fdcId = req.params.fdcId;

//     let defaultNutrientNums = '208,255,204,205,203,291,269,301,303,304,305,306,307,309,401,601,606,645,646';
//     const nutrientNums = req.query.nutrientNums ? req.query.nutrientNums : defaultNutrientNums;

//     let url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${api_key}&nutrients=${nutrientNums}`;

//     let data = getData(url);

// }


async function getFoodPortions (req, res, next) {
    const fdcId = req.params.fdcId;
    let url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${api_key}`;

    console.log('in getFoodPortions')

    let data = await getData(url);

    let portionSizes
    if (data.foodPortions) {
        portionSizes = data.foodPortions.map(ele => new Object({
            portionDescription: ele.portionDescription,
            gramWeight: ele.gramWeight
        })) 
    } else {
        portionSizes = "No portion sizes available"
    }

    console.log("portionSizes: " + portionSizes);
  
    res.portions = portionSizes
    next();
}

///ONLY ADDS 25 Nutrients as of now
async function addFoodToMeal (req, res, next) {

    let mealID = req.body.mealID
    let fdcId = req.body.fdcId
    let amountInGrams = req.body.amountInGrams ? req.body.amountInGrams : 100;


    let meal = await Meal.findById(mealID)
    // const nutrientNums = req.query.nutrientNums ? req.query.nutrientNums : defaultNutrientNums;

    let nutrients = []
    nutrients[0] = meal.nutrientTotals.map(nutrient => nutrient.number);

    console.log('nutrients[0] before slice/splice: ' + nutrients[0]);
    console.log('nutrients.length[0]: ' + nutrients[0].length);

    let index;

    let numLoops = Math.floor(nutrients[0].length / 25);
    console.log("numLoops: ", numLoops);

    if (nutrients[0].length > 25) {
        for (let i = 0; i < numLoops; i++ ){
            let sliceIndex = 25 - nutrients[i].length;
            let deleteCount = nutrients[0].length - 25;
            console.log('sliceIndex: ' + sliceIndex);
            console.log('deleteCount: ' + deleteCount);
            nutrients[i+1] = nutrients[i].slice(sliceIndex);
            nutrients[i].splice(25, deleteCount);
        }
    }
    


    // if (nutrients[0].length > 25) {
    //     let sliceIndex = 25 - nutrients[0].length;
    //     let deleteCount = nutrients[0].length - 25;
    //     console.log('sliceIndex: ' + sliceIndex);
    //     console.log('deleteCount: ' + deleteCount);
    //     nutrients[1] = nutrients[0].slice(sliceIndex);
    //     nutrients[0].splice(25, deleteCount);
    // }
    console.log('nutrients[0]: ' + nutrients[0]);
    console.log('nutrients.length[0]: ' + nutrients[0].length);

    console.log('nutrients[0]: ' + nutrients[0]);
    console.log('nutrients[1]: ' + nutrients[1]);
    console.log('nutrients[0].length: ' + nutrients[0].length);
    console.log('nutrients[1].length: ' + nutrients[1].length);



    //need to implement to add rest of nutrients

    // let url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${api_key}&nutrients=${nutrientNums}&format=abridged`;
    let url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${api_key}&nutrients=${nutrients[0]}&format=abridged`;

 

    let data = await getData(url)


    let food = new Food({
        fdcId: data.fdcId,
        description: data.description,
        amountInGrams: amountInGrams,
        foodNutrients: data.foodNutrients.map(nutrient => new Nutrient({
            number: nutrient.number,
            name: nutrient.name,
            amount: (nutrient.amount * (amountInGrams / 100)).toFixed(2),
            unitName: nutrient.unitName

        }))

    })

    



    res.food = food;
    res.meal = meal;
    res.mealID = mealID


    next();
}



module.exports = {
    foodSearchQuery,
    foodBrandSearchQuery,
    foodSearchFdcId,
    getFoodPortions,
    addFoodToMeal
}
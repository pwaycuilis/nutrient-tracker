const express = require('express')
const mongoose = require('mongoose')
const Meal = require('./models/meal')
const Food = require('./models/food')
const foodRouter = require('./routes/foods')
const mealRouter = require('./routes/meals')
const nutrientRouter = require('./routes/nutrients')
const methodOverride = require('method-override')
const app = express()


mongoose.connect('mongodb://localhost/nutrient-tracker', {useNewUrlParser: true})
// mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.use(methodOverride('_method'))


app.use('/foods', foodRouter)
app.use('/meals', mealRouter)
app.use('/nutrients', nutrientRouter)

app.get('/', async (req, res) => {
    const foods = await Food.find()


    const meals = await Meal.find().sort({ date: 'desc' })
    res.render('index', { foods: foods, meals: meals })
})

app.get('/about', async (req, res) => {
    res.render('about');
})
app.listen(7000)
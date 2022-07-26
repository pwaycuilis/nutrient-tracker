const mongoose = require('mongoose');
const foodSchema = require('./food').schema;
const nutrientSchema = require('./nutrient').schema;
const slugify = require('slugify')

const mealSchema = new mongoose.Schema({

    name: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    foods: [foodSchema],

    nutrientTotals: [nutrientSchema],
    
    slug: {
        type: String,
        required: true,
        unique: true
    }
    
})

mealSchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true })
    }

    next()
})


module.exports = mongoose.model('Meal', mealSchema)
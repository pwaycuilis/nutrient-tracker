const mongoose = require('mongoose');
const nutrientSchema = require('./nutrient').schema;

const nutrientListSchema = new mongoose.Schema ({

    name: String,
    nutrients: [nutrientSchema]
})


module.exports = mongoose.model('NutrientList', nutrientListSchema)
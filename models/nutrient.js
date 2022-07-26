const mongoose = require('mongoose');

const nutrientSchema = new mongoose.Schema({
   
    number: String,
    name: String,
    amount: Number,
    unitName: String,
    derivationCode: String,
    derivationDescription: String
}, {_id: false });



module.exports = mongoose.model('Nutrient', nutrientSchema)
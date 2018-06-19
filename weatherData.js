var mongoose = require('mongoose')

var weatherSchema = mongoose.Schema({
    temp: Number,
    time: Date,
    city: String,
    country: String
})

var Weather = mongoose.model('Weather', weatherSchema)
module.exports = Weather
const mongoose = require('mongoose')

const pictureSchema = new mongoose.Schema({
    Description : String,
    ImageUri : String,
    Latitude : Number,
    Longitude : Number,
})

const Picture = mongoose.model('pictures', pictureSchema )

module.exports = Picture
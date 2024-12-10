const mongoose = require("mongoose")

const raceSchema = new mongoose.Schema({
  name: String,
})

const Race = mongoose.model("races", raceSchema)

module.exports = Race

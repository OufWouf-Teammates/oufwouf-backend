const mongoose = require("mongoose")

const vaccinGeneralSchema = new mongoose.Schema({
  name: String,
  rappel: Boolean,
})

const VaccinGeneral = mongoose.model("usevaccinGeneraux", vaccinGeneralSchema)

module.exports = VaccinGeneral

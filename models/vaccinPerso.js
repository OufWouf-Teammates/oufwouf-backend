const mongoose = require("mongoose")

const vaccinPersoSchema = new mongoose.Schema({
  name: String,
  rappel: Boolean,
  date: { type: String, require: false },
})

const VaccinPerso = mongoose.model("vaccinsPersos", vaccinPersoSchema)

module.exports = VaccinPerso

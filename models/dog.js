const mongoose = require("mongoose")

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uri: { type: String, required: false },
  ID: { type: String, required: true },
  race: { type: String, required: true },
  sex: { type: String, required: true },
  birthday: { type: String, required: false },
  infos: { type: String, required: false },
  personality: { type: String, required: false },
  vaccins: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vaccin" }],
})

const Dog = mongoose.model("dogs", dogSchema)

module.exports = Dog

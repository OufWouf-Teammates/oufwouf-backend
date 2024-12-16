const mongoose = require("mongoose")

const favoriteSchema = new mongoose.Schema({
  name: String,
  uri: String,
  city: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
})

const Favorite = mongoose.model("Favorite", favoriteSchema)

module.exports = Favorite

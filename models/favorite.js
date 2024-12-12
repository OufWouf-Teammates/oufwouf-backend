const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  name: String,
  uri: String,
});

const Favorite = mongoose.model("favorites", favoriteSchema);

module.exports = Favorite;

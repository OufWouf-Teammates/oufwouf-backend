const mongoose = require("mongoose");

const pictureSchema = new mongoose.Schema({
  description: String,
  uri: String,
  latitude: Number,
  longitude: Number,
});

const Picture = mongoose.model("Picture", pictureSchema);

module.exports = Picture;

const mongoose = require("mongoose");

const pictureSchema = new mongoose.Schema({
  description: String,
  uri: String,
  latitude: Number,
  longitude: Number,
});

const Picture = mongoose.model("pictures", pictureSchema);

module.exports = Picture;

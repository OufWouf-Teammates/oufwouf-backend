const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  bookmarks: Array,
  token: String,
  idApple: String,
  tokenCreationDate: Date,
  dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
  personalPicture: [{ type: mongoose.Schema.Types.ObjectId, ref: "Picture" }]
});

const User = mongoose.model("users", userSchema);

module.exports = User;

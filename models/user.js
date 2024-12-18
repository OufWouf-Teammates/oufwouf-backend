const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  bookmarks: Array,
  token: String,
  idApple: String,
  tokenCreationDate: Date,
  friendList: Array,
  dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
  pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Picture" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;

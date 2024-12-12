  const mongoose = require("mongoose");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    bookmarks: Array,
    token: String,
    idApple: String,
    tokenCreationDate: Date,
    dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
    pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Picture" }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }]
  });

  const User = mongoose.model("users", userSchema);

  module.exports = User;

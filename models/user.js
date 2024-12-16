const mongoose = require("mongoose")

<<<<<<< HEAD
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  bookmarks: Array,
  token: String,
  idApple: String,
  tokenCreationDate: Date,
  dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
  pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Picture" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }],
})
=======
  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    bookmarks: Array,
    token: String,
    idApple: String,
    tokenCreationDate: Date,
    dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
    pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Picture" }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "favorites" }]
  });
>>>>>>> 4ecd780017da98ac22f2f372bac39f95e34b0eea

const User = mongoose.model("users", userSchema)

module.exports = User

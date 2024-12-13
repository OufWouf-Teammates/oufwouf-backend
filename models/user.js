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
>>>>>>> 7551d26be2c261a67f19c691850297449c692b9d

const User = mongoose.model("users", userSchema)

module.exports = User

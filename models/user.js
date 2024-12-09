const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  bookmarks: Array,
  token: String,
  tokenCreationDate: Date,
});

// Le modèle 'User' correspondra automatiquement à la collection 'users' (nom au pluriel)
const User = mongoose.model('User', userSchema);

module.exports = User;
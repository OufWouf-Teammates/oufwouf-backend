const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
 email: String,
 password: String,
 bookmarks: Array,
 token: String,
 tokenCreationDate: Date,
});

const User = mongoose.model('users', userSchema);

module.exports = User
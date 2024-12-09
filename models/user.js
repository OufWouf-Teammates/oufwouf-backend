const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
 username: String,
 email: String,
 password: String,
 bookmarks: Array,
 token: String
});

const User = mongoose.model('users', userSchema);

module.exports = User
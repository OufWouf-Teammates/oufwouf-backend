const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  bookmarks: Array,
  token: String,
  idApple: String,
  tokenCreationDate: Date,
  dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
<<<<<<< HEAD
  personalPicture: [{ type: mongoose.Schema.Types.ObjectId, ref: "Picture" }],
})
=======
  pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: "pictures" }]
});
>>>>>>> 32884c0ee0a7acc59673ec2c0608e63f166efe85

const User = mongoose.model("users", userSchema)

module.exports = User

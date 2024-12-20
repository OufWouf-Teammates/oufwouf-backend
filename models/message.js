const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  text: String,
  username: String,
  createdAt: Date,
  type: String,
  roomName: String,
})

const Message = mongoose.model("Message", messageSchema)

module.exports = Message

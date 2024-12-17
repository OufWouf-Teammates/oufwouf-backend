const mongoose = require("mongoose")

const doogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
})

const Room = mongoose.model("Message", messageSchema)

module.exports = Room

const mongoose = require("mongoose")

const doogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "messages" }],
})

const Room = mongoose.model("messages", messageSchema)

module.exports = Room

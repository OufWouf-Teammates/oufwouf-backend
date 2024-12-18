const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  receiver: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
})

const Message = mongoose.model("Message", messageSchema)

module.exports = Message

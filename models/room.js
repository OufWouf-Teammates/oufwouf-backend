const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
  name: { type: String, required: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
})

const Room = mongoose.model("Room", roomSchema)

module.exports = Room

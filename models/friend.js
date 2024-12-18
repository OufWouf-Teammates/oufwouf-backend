const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  from: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  to: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Friend = mongoose.model("friends", friendSchema);

module.exports = Friend;

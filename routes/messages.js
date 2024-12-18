var express = require("express")
var router = express.Router()
const Room = require("../models/room")
const User = require("../models/user")
const Message = require("../models/message")
const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
const { findReceiver } = require("../modules/findReceiver")

router.post("/", middlewareCheckToken, findReceiver, async (req, res) => {
  const { token, receiver } = req

  try {
    const sender = await User.findOne({ token: token })
    const newMessage = new Message({
      content: req.body.message,
      sender: sender._id,
      receiver: receiver._id,
    })

    const message = await newMessage.save()

    const postMessage = await Room.updateOne(
      { name: req.body.name },
      { $addToSet: { messages: message._id } }
    )

    res.json({ result: true, message: postMessage })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

module.exports = router

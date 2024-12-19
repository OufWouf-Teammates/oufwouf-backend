var express = require("express")
var router = express.Router()
const Room = require("../models/room")
const User = require("../models/user")
const Message = require("../models/message")
const { middlewareCheckToken } = require("../modules/middlewareCheckToken")

router.post("/", middlewareCheckToken, async (req, res) => {
  const { token } = req

  try {
    const roomId = req.query.room
    if (!roomId) {
      return res.status(400).json({
        result: false,
        message: "L'ID de la salle est requis.",
      })
    }
    const sender = await User.findOne({ token: token })

    const room = await Room.findOne({ _id: roomId })

    if (!room) {
      return res.status(404).json({
        result: false,
        message: "Salle introuvable.",
      })
    }

    const users = room.users

    const receiver = users.filter((e) => e.toString() !== sender._id.toString())

    const newMessage = new Message({
      content: req.body.message,
      sender: sender._id,
      receiver: receiver[0],
    })

    const message = await newMessage.save()

    const postMessage = await Room.updateOne(
      { _id: req.query.room },
      { $addToSet: { messages: message._id } }
    )

    res.json({ result: true, message: postMessage })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

module.exports = router

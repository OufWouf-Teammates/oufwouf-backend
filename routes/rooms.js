var express = require("express")
var router = express.Router()
const Room = require("../models/room")
const User = require("../models/user")
const Message = require("../models/message")
const middlewareCheckToken = require("../modules/middlewareCheckToken")

/* GET home page. */
router.post("/", middlewareCheckToken, async (req, res, next) => {
  const { token } = req
  try {
    const sender = await User.findOne({ token: token })
    const receiver = await User.findOne({ email: req.body.email })

    const newRoom = await new Room({
      name: { type: String, required: true },
      users: [sender._id, receiver._id],
      messages: [],
    })

    const room = newRoom.save()

    res.json({ result: true, room: room })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

router.get("/", middlewareCheckToken, async (req, res, next) => {
  const { token } = req

  try {
    const user = await User.findOne({ token: token })
    const secondUser = await User.findOne({ email: req.body.email })
    const room = await Room.findOne({ users: [user, secondUser] }).populate(
      "messages"
    )
    const messages = await room.messages

    res.json({ result: true, messages: messages })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

module.exports = router

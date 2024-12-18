var express = require("express")
var router = express.Router()
const Room = require("../models/room")
const User = require("../models/user")
const middlewareCheckToken = require("../modules/middlewareCheckToken")
const findReceiver = require("../modules/findReceiver")

/* GET home page. */
router.post("/", middlewareCheckToken, findReceiver, async (req, res) => {
  const { token, receiver } = req

  if (!token || !receiver) {
    return res.status(500).json({ result: false })
  }

  try {
    const sender = await User.findOne({ token: token })

    const newRoom = new Room({
      name: req.body.name,
      users: [sender._id, receiver._id],
      messages: [],
    })

    const room = await newRoom.save()

    res.json({ result: true, roome: "room" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

router.get("/", middlewareCheckToken, findReceiver, async (req, res) => {
  const { token, receiver } = req

  try {
    const user = await User.findOne({ token: token })
    const room = await Room.findOne({
      users: { $all: [user, receiver] },
    }).populate("messages")

    res.json({ result: true, messages: room.messages })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

module.exports = router

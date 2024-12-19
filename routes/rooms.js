var express = require("express")
var router = express.Router()
const Room = require("../models/room")
const User = require("../models/user")
const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
const { findReceiver } = require("../modules/findReceiver")

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

    res.json({ result: true, room: room })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

router.get("/", middlewareCheckToken, async (req, res) => {
  const { token } = req

  try {
    const roomId = req.query.room
    if (!roomId) {
      return res.status(400).json({
        result: false,
        message: "L'ID de la salle est requis.",
      })
    }
    const room = await Room.findOne({ _id: roomId }).populate("messages")

    res.json({ result: true, messages: room.messages })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

router.get("/all", middlewareCheckToken, async (req, res) => {
  const { token } = req

  try {
    const user = await User.findOne({ token: token })
    const rooms = await Room.find({ users: { $all: [user._id] } })

    res.json({ result: true, rooms: rooms })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, message: "erreur serveur" })
  }
})

module.exports = router

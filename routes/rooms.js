var express = require("express")
var router = express.Router()
const Room = require("../models/room")
const User = require("../models/user")
const Message = require("../models/message")
const middlewareCheckToken = require("../modules/middlewareCheckToken")
const findReceiver = require("../modules/findReceiver")

/* GET home page. */
router.post("/", middlewareCheckToken, findReceiver, async (req, res, next) => {
  const { token, receiver } = req
  try {
    const sender = await User.findOne({ token: token })

    const newRoom = await new Room({
      name: req.body.name,
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

router.get("/", middlewareCheckToken, findReceiver, async (req, res, next) => {
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

// router.put("/", middlewareCheckToken, async (req, res, next) => {
//   const { token } = req
//   try {
//     const sender = await User.findOne({ token: token })
//     const receiver = await User.findOne({ email: req.body.email })

//     const message = "oui"

//     const post = await Room.updateOne(
//       { name: name },
//       { $push: { messages: message } }
//     )

//     res.json({ result: true, message: post })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ result: false, message: "erreur serveur" })
//   }
// })

module.exports = router

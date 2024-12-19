var express = require("express")
var router = express.Router()
const User = require("../models/user")

const Pusher = require("pusher")
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
})

const cloudinary = require("cloudinary").v2
const uniqid = require("uniqid")
const fs = require("fs")
const { dogSlice } = require("../../oufwouf-frontend/reducers/dog")

// Join chat
router.put("/users/:username", (req, res) => {
  pusher.trigger("chat", "join", { username: req.params.username })

  res.json({ result: true })
})

// Leave chat
router.delete("/users/:username", (req, res) => {
  pusher.trigger("chat", "leave", { username: req.params.username })

  res.json({ result: true })
})

// Send message
router.post("/message", async (req, res) => {
  const message = req.body

  if (message.type === "audio") {
    const audioPath = `./tmp/${uniqid()}.m4a`
    const resultMove = await req.files.audio.mv(audioPath)

    if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(audioPath, {
        resource_type: "video",
      })
      message.url = resultCloudinary.secure_url
      fs.unlinkSync(audioPath)
    } else {
      res.json({ result: false, error: resultMove })
      return
    }
  }

  pusher.trigger("chat", "message", message)

  res.json({ result: true })
})

router.get("/dogName/:token", async (req, res) => {
  const { token } = req.params
  try {
    const dogName = await User.findOne({ token: token }).populate({
      path: "dogs",
      select: "name",
    })
    if (!dogName) {
      res.json({ result: false, message: "error user non trouvé" })
    }

    res.json({ result: true, dogName: dogName })
  } catch (error) {
    res.status(500).json({ result: false, message: "error server" })
  }
})

module.exports = router

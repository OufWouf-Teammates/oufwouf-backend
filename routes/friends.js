var express = require("express")
var router = express.Router()
var Dog = require("../models/dog")
var User = require("../models/user")
const Room = require("../models/room")

const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
const Friend = require("../models/friend")

router.post("/request/:token", async (req, res, next) => {
  const { token } = req.params

  try {
    if (!token) {
      return res.status(401).json({ result: false, error: " token pas trouvé" })
    }

    const sender = await User.findOne({ token })
    const receiver = req.body.receiverId

    const verify = await Friend.findOne({
      from: sender._id,
      to: receiver,
      status: "pending",
    })

    if (verify) {
      return res
        .status(400)
        .json({ result: false, error: "demande déjà envoyé" })
    }

    const newFriend = new Friend({
      from: sender._id,
      to: receiver,
    })

    await newFriend.save()

    res.status(201).json({ message: "Demande envoyée!" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "Erreur serveur" })
  }
})

router.post("/addFriend/:id", async (req, res, next) => {
  const { id } = req.params
  const { decision } = req.body

  const request = await Friend.findById(id)
  console.log(decision)
  try {
    if (!request || request.status !== "pending") {
      return res
        .status(400)
        .json({ result: false, error: "demande pas trouvée ou déjà traitée" })
    }

    if (decision === "accepted") {
      request.status = "accepted"
      await request.save()

      await User.findByIdAndUpdate(request.from, {
        $addToSet: { friendList: request.to },
      })
      await User.findByIdAndUpdate(request.to, {
        $addToSet: { friendList: request.from },
      })

      //Create room

      const user1 = await User.findOne({ _id: request.from }).populate({
        path: "friendList",
        populate: { path: "dogs", select: "name" },
      })

      const user2 = await User.findOne({ _id: request.to }).populate({
        path: "friendList",
        populate: { path: "dogs", select: "name" },
      })

      console.log("je suis la", user1, user2)

      const newRoom = new Room({
        name: [user1.dogs[0]?.name, user2.dogs[0]?.name],
        users: [user1._id, user2._id],
        messages: [],
      })

      const room = await newRoom.save()

      res.status(200).json({ message: "Demande acceptée.", room: room })
    } else if (decision === "rejected") {
      request.status = "rejected"
      await request.save()
      res.status(200).json({ message: "Demande refusée." })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "Erreur serveur" })
  }
})

router.get("/", middlewareCheckToken, async (req, res, next) => {
  const { token } = req
  try {
    const user = await User.findOne({ token }).populate({
      path: "friendList",
      populate: { path: "dogs", select: "name" },
    })
    if (!user) {
      return res.status(400).json({ result: false, error: "pas d'user trouvé" })
    }
    return res.status(201).json({ friends: user.friendList })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "Erreur serveur" })
  }
})

// router.get("/requestList/:token", async (req, res, next) => {
//   const { token } = req.params;
//   const receiver = await User.findOne({ token });
//   console.log("0");
//   try {
//     const request = await Friend.find({
//       to: receiver._id,
//       status: "pending",
//     }).populate("from");
//     console.log("1");

//     if (request.length === 0) {
//       console.log("2");

//       return res
//         .status(200)
//         .json({ result: false, error: "Aucune demande trouvée" });
//     }
//     console.log("3");

//     res.status(201).json({ requestList: request });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ result: false, error: "Erreur serveur" });
//   }
// });

router.get("/requestList/:token", async (req, res, next) => {
  const { token } = req.params
  const sender = await User.findOne({ token })

  try {
    const request = await Friend.find({
      to: sender._id,
      status: "pending",
    }).populate({
      path: "from",
      populate: { path: "dogs", select: "name uri" },
    })

    if (request.length === 0) {
      return res
        .status(200)
        .json({ result: false, error: "Aucune demande trouvée" })
    }
    res.status(201).json({ requestList: request })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "Erreur serveur" })
  }
})

module.exports = router

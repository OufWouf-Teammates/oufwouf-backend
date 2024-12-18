var express = require("express");
var router = express.Router();
var User = require("../models/user");

const { middlewareCheckToken } = require("../modules/middlewareCheckToken");
const Friend = require("../models/friend");

router.post("/request", middlewareCheckToken, async (req, res, next) => {
  const { token } = req;

  try {
    if (!token) {
      return res
        .status(401)
        .json({ result: false, error: " token pas trouvé" });
    }

    const sender = await User.findOne({ token });
    const receiver = req.body.receiverId;

    const verify = await Friend.findOne({
      from: sender._id,
      to: receiver,
      status: "pending",
    });

    if (verify) {
      return res
        .status(400)
        .json({ result: false, error: "demande déjà envoyé" });
    }

    const newFriend = new Friend({
      from: sender._id,
      to: receiver,
    });

    await newFriend.save();

    res.status(201).json({ message: "Demande envoyée!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

router.post("/addFriend/:id", async (req, res, next) => {
  const { id } = req.params;
  const { decision } = req.body;

  const request = await Friend.findById(id);

  try {
    if (!request || !request.status === "pending") {
      return res
        .status(400)
        .json({ result: false, error: "demande pas trouvée ou déjà traitée" });
    }

    if (decision === "accepted") {
      request.status = "accepted";
      await request.save();

      await User.findByIdAndUpdate(request.from, {
        $addToSet: { friendList: request.to },
      });
      await User.findByIdAndUpdate(request.to, {
        $addToSet: { friendList: request.from },
      });

      res.status(200).json({ message: "Demande acceptée." });
    } else if (decision === "rejected") {
      request.status = "rejected";
      await request.save();
      res.status(200).json({ message: "Demande refusée." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/", middlewareCheckToken, async (req, res, next) => {
  const { token } = req;
  try {
    const user = await User.findOne({ token }).populate({
      path: "friendList",
      populate: { path: "dogs", select: "name" },
    });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: "pas d'user trouvé" });
    }
    res.status(201).json({ friends: user.friendList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/requestList", middlewareCheckToken, async (req, res, next) => {
    const { token } = req;
    const sender = await User.findOne({ token });
    try {
      const request = await Friend.find({ to: sender._id, status : 'pending'}).populate({
        path: "from",
        populate: { path: "dogs", select: "name" },
      });
      if (!request) {
        return res
          .status(400)
          .json({ result: false, error: "aucune demande trouvée" });
      }
      res.status(201).json({ requestList: request });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ result: false, error: "Erreur serveur" });
    }
  });

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Room = require("../models/room");
const Pusher = require("pusher");
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

// Configuration de Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Utilitaire pour générer le nom de canal
const getChannelName = (roomName) =>
  `room-${roomName.replace(/\s+/g, "-").toLowerCase()}`;

// Joindre un chat
router.put("/users/:username", async (req, res) => {
  try {
    const { roomName } = req.body;
    const { username } = req.params;

    if (!roomName || !username) {
      return res.status(400).json({
        result: false,
        error: "Nom de salle ou nom d'utilisateur manquant.",
      });
    }

    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res
        .status(404)
        .json({ result: false, error: "Salle introuvable." });
    }
    const channelName = getChannelName(room.name);
    console.log("pusher", pusher);

    pusher.trigger(channelName, "join", { username });
    console.log("after Pusher");
    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Quitter un chat
router.delete("/users/:username", async (req, res) => {
  try {
    const { roomName } = req.body;
    const { username } = req.params;

    if (!roomName || !username) {
      return res.status(400).json({
        result: false,
        error: "Nom de salle ou nom d'utilisateur manquant.",
      });
    }

    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res
        .status(404)
        .json({ result: false, error: "Salle introuvable." });
    }

    const channelName = getChannelName(room.name);
    pusher.trigger(channelName, "leave", { username });

    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Envoyer un message
router.post("/message", async (req, res) => {
  try {
    const { roomName, type, text } = req.body;
    let message = { ...req.body };

    if (!roomName || !type || (!text && type !== "audio")) {
      return res.status(400).json({
        result: false,
        error: "Données manquantes (nom de salle, type ou contenu).",
      });
    }

    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res
        .status(404)
        .json({ result: false, error: "Salle introuvable." });
    }

    const channelName = getChannelName(room.name);

    // Gestion des messages audio
    if (type === "audio") {
      if (!req.files || !req.files.audio) {
        return res
          .status(400)
          .json({ result: false, error: "Fichier audio manquant." });
      }

      const audioPath = `./tmp/${uniqid()}.m4a`;
      const resultMove = await req.files.audio.mv(audioPath);

      if (!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(audioPath, {
          resource_type: "video",
        });
        message.url = resultCloudinary.secure_url;
        fs.unlinkSync(audioPath);
      } else {
        return res.status(500).json({
          result: false,
          error: "Erreur lors du déplacement du fichier.",
        });
      }
    }

    pusher.trigger(channelName, "message", message);
    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Récupérer le nom du chien à partir du token
router.get("/dogName/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ token }).populate({
      path: "dogs",
      select: "name",
    });

    if (!user || !user.dogs || user.dogs.length === 0) {
      return res
        .status(404)
        .json({ result: false, error: "Utilisateur ou chien introuvable." });
    }

    const dogName = user.dogs[0].name; // Suppose qu'il y a un seul chien
    res.json({ result: true, dogName });
  } catch (error) {
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
var Dog = require("../models/dog");
var User = require("../models/user");
var Picture = require("../models/personalPicture");

/* Route pour afficher les photos */

const { middlewareCheckToken } = require("../modules/middlewareCheckToken");
var { upload } = require("../modules/cloudinary");

router.get("/", middlewareCheckToken, async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const user = await User.findOne({ token: token }).populate("pictures");
    res.json({ result: true, dog: user.pictures });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

/* Route pour ajouter une photo */

router.post("/", middlewareCheckToken, upload, async (req, res, next) => {
  try {
    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" });
    }
    if (!req.body.data || !req.files) {
      return res
        .status(400)
        .json({ result: false, error: "Données invalides" });
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

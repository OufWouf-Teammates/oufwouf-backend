var express = require("express");
var router = express.Router();
var Dog = require("../models/dog");
var User = require("../models/user");
var Picture = require("../models/picture");

/* Route pour afficher les photos */

const { middlewareCheckToken } = require("../modules/middlewareCheckToken");
var { upload } = require("../modules/cloudinary");

router.get("/", middlewareCheckToken, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const user = await User.findOne({ token: token }).populate("pictures");
    res.json({ result: true, personalPicture: user.pictures });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

/* Route pour ajouter une photo */

router.post("/", middlewareCheckToken, upload, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" });
    }
    if (!req.body.data || !req.files) {
      return res
        .status(400)
        .json({ result: false, error: "Données invalides" });
    }

    console.log("je rentre dans la route");

    const data = JSON.parse(req.body.data);
    const uri = req.files?.cloudinary_url;

    const newPic = new Picture({
      description: data.description,
      uri: uri,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    const save = await newPic.save();

    console.log(newPic);

    const update = await User.updateOne(
      { token: token },
      { $addToSet: { pictures: save._id } }
    );

    return res.json({ result: true, picture: save, ajoutPhoto: update });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

router.post("/", middlewareCheckToken, async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
      if (!token) {
        return res.status(401).json({ result: false, error: "Token manquant" });
      }
  
      console.log("je rentre dans la route");
      const { uri, description } = req.body;
      if (!uri || !description) {
        return res.status(400).json({ result: false, error: "URI et description sont requis" });
      }

      const picture = await Picture.findOne({ uri })
      if (!picture) {
        return res.status(404).json({ result: false, error: "Photo non trouvée" });
      }
  

      picture.description = req.body.description;
      await picture.save();

       return res.json({ result: true, description: picture.description });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ result: false, error: "erreur serveur" });
    }
  });

module.exports = router;

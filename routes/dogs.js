var express = require("express");
var router = express.Router();
var Dog = require("../models/dog");
var User = require("../models/user");

const { middlewareCheckToken } = require("../modules/middlewareCheckToken");
const { findToken } = require("../modules/findToken");
var { upload } = require("../modules/cloudinary");

/* Route GET pour recuperer les infos du chiens */
router.get("/", middlewareCheckToken, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await User.findOne({ token: token }).populate("dogs");

    res.json({ result: true, dog: user.dogs, user: user })
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

// Route Post pour créer un nouveua chien à l'utilisateur
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

    const data = JSON.parse(req.body.data);
    const uri = req.files?.cloudinary_url;

    //Creation du Chien
    const newDog = new Dog({
      name: data.name,
      uri: uri,
      ID: data.ID,
      race: data.race, //sous forme de String dirrectement pris de la bdd
      sex: data.sex,
      birthday: data.birthday,
      infos: data.infos,
      personality: data.personality,
    });

    const save = await newDog.save(); //On sauvegarde le Chien dans la bdd

    // Ajout du chien à son maitre
    const update = await User.updateOne(
      { token: token },
      { $addToSet: { dogs: save._id } }
    );

    // Réponse réussie
    return res.json({ result: true, dog: save, ajoutUser: update });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

module.exports = router;

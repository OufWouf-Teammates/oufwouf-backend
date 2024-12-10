var express = require("express");
var router = express.Router();
var Dog = require("../models/dog");
var User = require("../models/user");

/* Route GET pour recuperer les infos du chiens */
router.get("/", async (req, res, next) => {
  const token = req.query.token;
  try {
    const user = await User.findOne({ token: token }).populate("dogs");

    res.json({ result: true, dog: user.dogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

// Route Post pour créer un nouveua chien à l'utilisateur
router.post("/", async (req, res, next) => {
  const token = req.body.token;
  try {
    const newDog = new Dog({
      name: req.body.name,
      ID: req.body.ID,
      race: req.body.race, //sous forme de String dirrectement pris de la bdd
      sex: req.body.sex,
      birthday: req.body.birthday,
      infos: req.body.infos,
      personality: req.body.personality,
      vaccins: req.body.vaccinId, //il faut envoyer un tableau des ids de vaccins
    });

    const save = await newDog.save();

    const update = await User.updateOne(
      { token: token },
      { $addToSet: { dogs: save._id } }
    );

    res.json({ result: true, dog: save });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "erreur serveur" });
  }
});

module.exports = router;

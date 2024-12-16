var express = require("express")
var router = express.Router()
const VaccinPerso = require("../models/vaccinPerso")
const User = require("../models/user")
const Dog = require("../models/dog")

/* GET home page. */
router.post("/", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    // Créez le vaccin personnalisé
    const newVaccin = new VaccinPerso({
      name: req.body.name,
      rappel: req.body.rappel,
      date: req.body.date,
    });

    const savedVaccin = await newVaccin.save();

    // Trouvez l'utilisateur associé au token
    const user = await User.findOne({ token: token }).populate("dogs").populate('vaccins');

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Vérifiez si l'utilisateur a des chiens
    const dogId = user.dogs[0]?._id;
    if (!dogId) {
      return res.status(404).json({ error: "Aucun chien trouvé pour cet utilisateur" });
    }

    // Ajoutez l'ID du vaccin au tableau `vaccins` du chien
    const dog = await Dog.findById(dogId);
    if (dog) {
      dog.vaccins.push(savedVaccin._id);
      await dog.save();
    } else {
      throw new Error("Chien introuvable");
    }

    res.json({result: true, data: savedVaccin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router

var express = require("express")
var router = express.Router()
var Dog = require("../models/dog")
var User = require("../models/user")

const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
const { findToken } = require("../modules/findToken")
var { upload } = require("../modules/cloudinary")

/* Route GET pour recuperer les infos du chiens */
router.get("/", middlewareCheckToken, async (req, res, next) => {
  const token = req.headers.authorization
  try {
    const user = await User.findOne({ token: token }).populate("dogs")

    res.json({ result: true, dog: user.dogs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

// Route Post pour créer un nouveua chien à l'utilisateur
router.post("/", middlewareCheckToken, upload, async (req, res, next) => {
  const token = req.headers.authorization
  try {
    const data = JSON.parse(req.body.data)
    const uri = req.file.cloudinary_url
    const newDog = new Dog({
      name: data.name,
      uri: uri,
      ID: data.ID,
      race: data.race, //sous forme de String dirrectement pris de la bdd
      sex: data.sex,
      birthday: data.birthday,
      infos: data.infos,
      personality: data.personality,
      vaccins: data.vaccinId, //il faut envoyer un tableau des ids de vaccins
    })

    const save = await newDog.save()

    const update = await User.updateOne(
      { token: token },
      { $addToSet: { dogs: save._id } }
    )

    res.json({ result: true, dog: save })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

module.exports = router

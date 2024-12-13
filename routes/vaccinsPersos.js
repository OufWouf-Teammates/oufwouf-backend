var express = require("express")
var router = express.Router()
const VaccinPerso = require("../models/vaccinPerso")
const User = require("../models/user")

/* GET home page. */
router.post("/", async (req, res, next) => {
  const newVaccin = new VaccinPerso({
    name: req.body.name,
    rappel: req.body.rappel,
    date: req.body.date,
  })

  const save = await newVaccin.save()

  const token = req.headers.authorization.slice(" ")[1]

  const user = await findOne({ token: token }).populate("dogs")

  const dogId = user.dogs[0]._id
  await User.updateOne(
    { "dogs._id": dogId },
    { $push: { "dogs.$.vaccins": save._id } }
  )

  res.json({ data: save })
})

module.exports = router

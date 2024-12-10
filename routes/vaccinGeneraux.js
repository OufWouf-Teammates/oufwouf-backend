var express = require("express")
var router = express.Router()
const VaccinGeneral = require("../models/vaccinGeneral")

/* GET home page. */
router.get("/", async (req, res, next) => {
  const pattern = new RegExp(req.query.search, "ig")
  const vaccinsData = await VaccinGeneral.find({ name: pattern }).limit(5)

  const vaccins = vaccinsData.sort()

  res.json({ data: vaccins })
})

module.exports = router

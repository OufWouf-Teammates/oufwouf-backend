var express = require("express")
var router = express.Router()
const Race = require("../models/race")

/* GET home page. */
router.get("/", async (req, res, next) => {
  const pattern = new RegExp(req.query.search, "ig")
  const racesData = await Race.find({ name: pattern }).limit(5)

  const races = racesData.sort()

  res.json({ data: races })
})

module.exports = router
const User = require("../models/user")
const Dog = require("../models/dog")

async function findReceiver(req, res, next) {
  const dogName = req.query.name
  const dog = await Dog.findOne({ name: dogName })
  const user = await User.findOne({ dogs: dog?._id })

  if (user) {
    req.receiver = user
    return next()
  } else {
    return res
      .status(500)
      .json({ result: false, message: "pas de receiver trouvé" })
  }
}

module.exports = { findReceiver }

const TOKEN_VALIDITY_DAYS = 90
const User = require("../models/user")
//ROUTE MIDDLEWARE VERIF VALIDITE TOKEN / DATE TOKEN
async function middlewareCheckToken(req, res, next) {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const token = req.headers.authorization?.split(" ")[1] // Format "Bearer <token>"

    if (!token) {
      return res.status(500).json({ result: false, error: "Token error." })
    }

    // Rechercher l'utilisateur associé au token
    const user = await User.findOne({ token })
    if (!user) {
      return res.status(500).json({ result: false, error: "Token error." })
    }

    // Vérifier si le token est toujours valide (moins de 90 jours)
    const tokenCreationDate = new Date(user.tokenCreationDate)
    const currentDate = new Date()
    const daysSinceCreation = Math.floor(
      (currentDate - tokenCreationDate) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceCreation > TOKEN_VALIDITY_DAYS) {
      return res.status(500).json({ result: false, error: "Token error." })
    }

    // Si tout est valide, retourner une réponse ou passer au prochain middleware
    req.token = token
    console.log("le token est bon")

    return next()
  } catch (error) {
    return res.status(500).json({ result: false, error: "Token error." })
  }
}

module.exports = { middlewareCheckToken }

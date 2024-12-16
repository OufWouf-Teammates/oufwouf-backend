var express = require("express")
const appleSignin = require("apple-signin-auth")
var router = express.Router()

const User = require("../models/user")
const { checkBody } = require("../modules/checkBody")
const uid2 = require("uid2")
const bcrypt = require("bcrypt")

const fs = require("fs")
const path = require("path")

const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
const { findToken } = require("../modules/findToken")

const { validateAppleToken } = require("../modules/validateAppleToken")

function connectToUser(req, res, next) {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        user.token = uid2(32)
        user.save().then((data) => {
          res.json({ result: true, data })
        })
      } else {
        res
          .status(500)
          .json({ result: false, error: "Internal server error 9" })
      }
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: "Internal server error 9" })
    })
}

//Route POST SIGNUP pour l'inscription
router.post(
  "/signup",
  (req, res, next) => {
    if (!checkBody(req.body, ["email", "password"])) {
      return res.json({ result: false, error: "Missing or empty fields" })
    }

    // Vérification si l'utilisateur a déjà un compte
    User.findOne({ email: req.body.email })
      .then((data) => {
        if (!data) {
          const hash = bcrypt.hashSync(req.body.password, 10)

          const newUser = new User({
            email: req.body.email,
            password: hash,
            bookmarks: [],
            token: uid2(32),
            tokenCreationDate: new Date(),
            dogs: [],
          })

          newUser.save().then(() => next())
        } else {
          res.json({ result: false, error: "User already exists" })
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l’inscription:", error.message)
        res
          .status(500)
          .json({ result: false, error: "Erreur interne du serveur." })
      })
  },
  connectToUser
)

router.post(
  "/signin",
  (req, res, next) => {
    if (!checkBody(req.body, ["email", "password"])) {
      res.json({ result: false, error: "Missing or empty fields" })
      return
    }

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
          req.body.email = user.email // Injecter l'email pour `connectToUser`
          next()
        } else {
          res.json({ result: false, error: "User not found or wrong password" })
        }
      })
      .catch((error) => {
        res
          .status(500)
          .json({ result: false, error: "Internal server error 1" })
      })
  },
  connectToUser
)

//Route de suppression d'un compte
router.delete("/:token", async (req, res) => {
  const token = req.params.token

  try {
    // Suppression de l'utilisateur avec le token
    const result = await User.deleteOne({ token })

    if (result.deletedCount === 0) {
      // Aucun document supprimé
      res.status(404).json({ message: "User not found" })
    }

    // Document supprimé avec succès
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    // Gestion des erreurs
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Internal server error 2" })
  }
})

router.post("/changePassword", async (req, res) => {
  const { token, newPassword } = req.body

  // Vérification des champs requis
  if (!checkBody(req.body, ["token", "newPassword"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" })
  }

  try {
    // Recherche de l'utilisateur avec le token
    const user = await User.findOne({ token })

    if (!user) {
      return res
        .status(404)
        .json({ result: false, error: "Invalid token or user not found" })
    }

    // Hachage du nouveau mot de passe
    const hash = bcrypt.hashSync(newPassword, 10)

    // Mise à jour du mot de passe et génération d'un nouveau token
    user.password = hash
    user.token = uid2(32)
    user.tokenCreationDate = new Date()

    // Sauvegarde des modifications
    await user.save()

    res
      .status(200)
      .json({ result: true, message: "Password changed successfully" })
  } catch (error) {
    console.error("Error changing password:", error.message)
    res.status(500).json({ result: false, error: "Internal server error" })
  }
})

router.post(
  "/api/auth/apple",
  async (req, res, next) => {
    try {
      const { identityToken } = req.body

      if (!identityToken) {
        console.error("Erreur : identityToken manquant.")
        return res
          .status(400)
          .json({ result: false, error: "identityToken est requis." })
      }

      // Étape 1 : Validation du token
      let verifiedData
      try {
        verifiedData = await validateAppleToken(identityToken)
      } catch (err) {
        console.error(
          "Erreur lors de la validation du token Apple:",
          err.message
        )
        return res
          .status(500)
          .json({ result: false, error: "Échec de la validation Apple." })
      }

      const idApple = verifiedData.sub
      const emailApple = verifiedData.email || null

      console.log("Données vérifiées :", verifiedData)

      // Étape 2 : Recherche de l'utilisateur dans la base
      let user
      try {
        user = await User.findOne({ $or: [{ email: emailApple }, { idApple }] })
      } catch (err) {
        console.error("Erreur lors de la recherche utilisateur :", err.message)
        return res
          .status(500)
          .json({ result: false, error: "Erreur de base de données." })
      }

      // Étape 3 : L'utilisateur existe
      if (user) {
        if (!emailApple || user.email === emailApple) {
          console.log("Utilisateur trouvé, connexion...")
          req.body.email = user.email
          return next()
        } else {
          console.error("Erreur : incohérence des emails.")
          return res
            .status(400)
            .json({ result: false, error: "Incohérence des emails." })
        }
      }

      // Étape 4 : L'utilisateur n'existe pas, inscription
      if (!emailApple) {
        console.error("Erreur : email non fourni par Apple.")
        return res.status(400).json({
          result: false,
          error: "Email non fourni par Apple, impossible de créer un compte.",
        })
      }

      const password = uid2(16) // Générer un mot de passe aléatoire
      let signupResponse
      try {
        signupResponse = await fetch(`${process.env.BACKEND_URL}users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailApple, password }),
        })
      } catch (err) {
        console.error("Erreur lors de la requête vers /signup:", err.message)
        return res.status(500).json({
          result: false,
          error: "Erreur interne lors de la redirection vers /signup.",
        })
      }

      let signupData
      try {
        signupData = await signupResponse.json()
      } catch (err) {
        console.error(
          "Erreur lors du parsing de la réponse de /signup:",
          err.message
        )
        return res
          .status(500)
          .json({ result: false, error: "Erreur de réponse de /signup." })
      }

      if (signupData.result) {
        console.log("Inscription réussie, connexion...")
        req.body.email = emailApple
        return next()
      } else {
        console.error(
          "Erreur lors de l’inscription:",
          signupData.error || "Inconnu"
        )
        return res.status(500).json({
          result: false,
          error: signupData.error || "Erreur inconnue lors de l’inscription.",
        })
      }
    } catch (error) {
      console.error("Erreur inattendue :", error.message)
      res
        .status(500)
        .json({ result: false, error: "Erreur interne du serveur." })
    }
  },
  connectToUser
)

router.get("/isConnectedOrNot", middlewareCheckToken, (req, res, next) => {
  res.json({ result: true })
})

// Route put pour modifier les donnes de l'utilisateur
router.put("/", middlewareCheckToken, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] // Récupérer le token

  try {
    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" })
    }

    // Récupérer l'utilisateur
    const user = await User.findOne({ token: token })
    if (!user) {
      return res
        .status(404)
        .json({ result: false, error: "Utilisateur non trouvé" })
    }

    // Récupérer les données et l'URL de l'image
    const email = req.body.email

    // Mise à jour de l'email avec le nouveau email
    const updatedFields = {}
    if (email) updatedFields.email = email

    // Mise à jour du chien dans la base de données
    const updatedUser = await User.findOneAndUpdate(
      { token: token },
      updatedFields,
      { new: true }
    )
    if (!updatedUser) {
      return res
        .status(404)
        .json({
          result: false,
          error: "Utilisateur non trouvé pour la mise à jour",
        })
    }

    // Retourner la réponse avec l'user mis à jour
    return res.json({ result: true, email: email })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "Erreur serveur" })
  }
})

module.exports = router

var express = require("express")
var router = express.Router()

const apiKey = process.env.API_KEY
const Favorite = require("../models/favorite")
const User = require("../models/user")
//MIDDLEWARE
const { middlewareCheckToken } = require("../modules/middlewareCheckToken")

// Route Post pour rechercher des boutiques
router.post("/boutiques/:localisation", async (req, res) => {
  const [lat, lon] = req.params.localisation.split(",") // Récupération de la position

  try {
    // Requête à l'API Google Maps Places
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=pet_store&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Échec de la récupération des données depuis Google Maps")
    }

    const data = await response.json()
    const resultsWithPhotos = data.results.map((place) => {
      const photos = (place.photos || []).map((photo) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`;
      })
      return {
        ...place,
        photos, 
      };
    });

    if (resultsWithPhotos.length > 0) {
      res.status(200).json({ result: true, data: resultsWithPhotos, })
    } else {
      res
        .status(404)
        .json({ result: false, message: "Aucune boutique trouvée à proximité" })
    }
  } catch (error) {
    console.error("Erreur lors de la recherche :", error)
    res.status(500).json({
      result: false,
      error: "Une erreur est survenue lors de la recherche",
    })
  }
})

//Route Post pour rechercher des veterinaires
router.post("/veterinaires/:localisation", async (req, res, next) => {
  const [lat, lon] = req.params.localisation.split(",") // Récupération de la position

  try {
    // Requête à l'API Google Maps Places
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=veterinary_care&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Échec de la récupération des données depuis Google Maps")
    }

    const data = await response.json()
    const resultsWithPhotos = data.results.map((place) => {
      const photos = (place.photos || []).map((photo) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`;
      })
      return {
        ...place,
        photos, 
      };
    });

    if (resultsWithPhotos.length > 0) {
      res.status(200).json({ result: true, data: resultsWithPhotos, })
    } else {
      res
        .status(404)
        .json({ result: false, message: "Aucune boutique trouvée à proximité" })
    }
  } catch (error) {
    console.error("Erreur lors de la recherche :", error)
    res.status(500).json({
      result: false,
      error: "Une erreur est survenue lors de la recherche",
    })
  }
})

//Route post pour recherche les parks
router.post("/parcs-chiens/:localisation", async (req, res, next) => {
  const [lat, lon] = req.params.localisation.split(",") // Récupération de la position

  try {
    // Requête à l'API Google Maps Places avec le mot-clé "dog park"
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=park&keyword=dog+park&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Échec de la récupération des données depuis Google Maps")
    }

    const data = await response.json()
    const resultsWithPhotos = data.results.map((place) => {
      const photos = (place.photos || []).map((photo) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`;
      })
      return {
        ...place,
        photos, 
      };
    });

    if (resultsWithPhotos.length > 0) {
      res.status(200).json({ result: true, data: resultsWithPhotos, })
    } else {
      res
        .status(404)
        .json({ result: false, message: "Aucun parc canin trouvé à proximité" })
    }
  } catch (error) {
    console.error("Erreur lors de la recherche :", error)
    res.status(500).json({
      result: false,
      error: "Une erreur est survenue lors de la recherche",
    })
  }
})

//Route post pour recherche les parks
router.post(
  "/bookmarks/:localisation",
  middlewareCheckToken,
  async (req, res, next) => {
    const { token } = req
    const [lat, lon] = req.params.localisation.split(",") // Récupération de la position

    try {
      const user = await User.findOne({ token: token })
      const bookmarks = await Favorite.find({ users: user._id })

      const data = bookmarks.map((e) => ({
        name: e.name,
        uri: e.uri,
        city: e.city,
        latitude: e.latitude,
        longitude: e.longitude,
        place_id: e.id,
        geometry: { location: { lat: e.latitude, lng: e.longitude } },
      }))

      res.json({ result: true, data: data })

      // Requête à l'API Google Maps Places avec le mot-clé "dog park"
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=10000&type=park&keyword=dog+park&key=${apiKey}`
      // )

      // if (!response.ok) {
      //   throw new Error(
      //     "Échec de la récupération des données depuis Google Maps"
      //   )
      // }

      // const data = await response.json()

      // // Vérification si des résultats sont trouvés
      // if (data.results && data.results.length > 0) {
      //   res.status(200).json({ result: true, data: data.results })
      // } else {
      //   res.status(404).json({ result: false, message: "Pas de bookmarks" })
      // }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error)
      res.status(500).json({
        result: false,
        error: "Une erreur est survenue lors de la recherche",
      })
    }
  }
)

//Route pour afficher les infotmations d'un lieu avec google places
router.get("/lieu/:placeId", async (req, res) => {
  const placeId = req.params.placeId

  if (!apiKey) {
    return res.status(500).json({ result: false, error: "API key missing" })
  }

  if (!placeId) {
    return res
      .status(400)
      .json({ result: false, error: "Place ID is required" })
  }

  try {
    // Requête à l'API Place Details
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=fr`
    const response = await fetch(placeDetailsUrl)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from Google Maps API. Status: ${response.status}`
      )
    }

    const data = await response.json()

    if (data.status === "OK") {
      // Générer les URLs des photos si disponibles
      const photos = (data.result.photos || []).map((photo) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
      })

      return res.status(200).json({
        result: true,
        data: {
          ...data.result,
          photos, // Inclure les URLs des photos
        },
      })
    } else {
      throw new Error(`Google Maps API error: ${data.status}`)
    }
  } catch (error) {
    console.error("Search error:", error)
    res
      .status(400)
      .json({ result: false, error: error.message || "Search failed" })
  }
})

/* Route pour afficher les photos */

router.get("/", middlewareCheckToken, async (req, res, next) => {
  try {
    const { token } = req
    const user = await User.findOne({ token: token })

    const bookmark = await Favorite.find({ users: user._id })

    res.json({ result: true, favorite: bookmark })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

// Post ajout de bookmark a la bdd si elle y est pas, et ajoute au bookmark un user s'il veut bookmark
router.post("/addBookmark", middlewareCheckToken, async (req, res, next) => {
  try {
    const { token } = req
    const { name, uri, city, latitude, longitude, id } = req.body

    //On cherche si le bookMark est dans la base de donnée
    const user = await User.findOne({ token: token })
    const isBdd = await Favorite.findOne({ name: name })

    //verifie si le bookmarks est dans la bdd sinon le créé avec l'id du user connecté
    if (!isBdd) {
      const newPlace = new Favorite({
        name: name,
        uri: uri,
        city: city,
        latitude: latitude,
        longitude: longitude,
        id: id,
        users: [user._id],
      })

      const save = await newPlace.save()

      return res.json({ result: true, message: save })
    } else {
      //ajoute au bookmarks l'id du user connecté
      const bookMarked = await Favorite.updateOne(
        { name: name },
        { $addToSet: { users: user._id } }
      )

      return res.json({ result: true, message: bookMarked })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

// Get favorite
router.get("/isBookmarked", middlewareCheckToken, async (req, res, next) => {
  const { token } = req

  const name = req.query.name
  try {
    const user = await User.findOne({ token: token })
    const favorite = await Favorite.findOne({ name: name })

    if (!favorite) {
      return res.json({ result: true, isBookmarked: false })
    } else {
      // Vérifier si l'utilisateur est dans la liste des utilisateurs du favori
      const isBookmarked = favorite.users.some(
        (e) => e.toString() === user?._id.toString()
      )

      // Retourner le statut
      return res.json({ result: true, isBookmarked })
    }
  } catch (error) {

    console.error(error)
    res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

// router.delete("/delete/:id", async (req, res) => {
//   const { id } = req.params
//   try {
//     console.log("je rentre dans la route")
//     const favorite = await Favorite.findByIdAndDelete(id)
//     if (!favorite) {
//       return res.json({ result: false, message: "Aucun effet" })
//     }
//     res.json({ result: true, message: "ton bookmark est dans la poubelle!" })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({ result: false, error: "erreur serveur" })
//   }
// })

router.delete("/deletePoint/:name", middlewareCheckToken, async (req, res) => {
  const { name } = req.params
  const { token } = req
  try {
    const user = await User.findOne({ token: token })
    const favorite = await Favorite.updateOne(
      { name: name },
      { $pull: { users: user._id } }
    )

    if (!favorite) {
      return res.json({ result: false, message: "Aucun effet" })
    }
    res.json({ result: true, message: "ton bookmark est dans la poubelle!" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

module.exports = router

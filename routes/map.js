var express = require("express");
var router = express.Router();

const apiKey = process.env.API_KEY;
const Favorite = require('../models/favorite');
const User = require('../models/user');

// Route Post pour rechercher des boutiques 
router.post("/boutiques/:localisation", async (req, res) => {
    const [lat, lon] = req.params.localisation.split(","); // Récupération de la position

    try {
        // Requête à l'API Google Maps Places
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=pet_store&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Échec de la récupération des données depuis Google Maps");
        }

        const data = await response.json();

        // Vérification si des résultats sont trouvés
        if (data.results && data.results.length > 0) {
            res.status(200).json({ result: true, data: data.results });
        } else {
            res.status(404).json({ result: false, message: "Aucune boutique trouvée à proximité" });
        }
    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
        res.status(500).json({ result: false, error: "Une erreur est survenue lors de la recherche" });
    }
});

//Route Post pour rechercher des veterinaires
router.post("/veterinaires/:localisation", async (req, res, next) => {
    const [lat, lon] = req.params.localisation.split(","); // Récupération de la position

    try {
        // Requête à l'API Google Maps Places
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=veterinary_care&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Échec de la récupération des données depuis Google Maps");
        }

        const data = await response.json();

        // Vérification si des résultats sont trouvés
        if (data.results && data.results.length > 0) {
            res.status(200).json({ result: true, data: data.results });
        } else {
            res.status(404).json({ result: false, message: "Aucune boutique trouvée à proximité" });
        }
    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
        res.status(500).json({ result: false, error: "Une erreur est survenue lors de la recherche" });
    }
});

//Route post pour recherche les parks 
router.post("/parcs-chiens/:localisation", async (req, res, next) => {
    const [lat, lon] = req.params.localisation.split(","); // Récupération de la position


    try {
        // Requête à l'API Google Maps Places avec le mot-clé "dog park"
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=park&keyword=dog+park&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Échec de la récupération des données depuis Google Maps");
        }

        const data = await response.json();

        // Vérification si des résultats sont trouvés
        if (data.results && data.results.length > 0) {
            res.status(200).json({ result: true, data: data.results });
        } else {
            res.status(404).json({ result: false, message: "Aucun parc canin trouvé à proximité" });
        }
    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
        res.status(500).json({ result: false, error: "Une erreur est survenue lors de la recherche" });
    }
});


//Route pour afficher les infotmations d'un lieu avec google places
router.get("/lieu/:placeId", async (req, res) => {
    const placeId = req.params.placeId;

    if (!apiKey) {
        return res.status(500).json({ result: false, error: 'API key missing' });
    }

    if (!placeId) {
        return res.status(400).json({ result: false, error: 'Place ID is required' });
    }

    try {
        // Requête à l'API Place Details
        const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=fr`;
        const response = await fetch(placeDetailsUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from Google Maps API. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'OK') {
            // Générer les URLs des photos si disponibles
            const photos = (data.result.photos || []).map(photo => {
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`;
            });

            return res.status(200).json({
                result: true,
                data: {
                    ...data.result,
                    photos, // Inclure les URLs des photos
                },
            });
        } else {
            throw new Error(`Google Maps API error: ${data.status}`);
        }
    } catch (error) {
        console.error("Search error:", error);
        res.status(400).json({ result: false, error: error.message || 'Search failed' });
    }
});


router.post('/canBookmark/:name', async (req, res) => {
    // Récupération du token utilisateur depuis le middleware
    const name = req.params.name;

  
    try {
      // Trouver l'utilisateur par son token
      const favorite = await Favorite.findOne({ name: name });
  
      if (!favorite) {
        return res.status(404).json({ result: false, error: 'Utilisateur non trouvé' });
      }
      await User.populate('Favorite')
      // Créer les favoris pour l'utilisateur
        const newFavorite = new Favorite({
          name: favorite.name,
          markerData: favorite.markerData,
          user: user._id  // Associer chaque favori à l'utilisateur
        });
        return newFavorite.save();
      ;
  
      // Exécuter toutes les promesses pour sauvegarder les favoris
      const savedFavorites = await Promise.all(favoritePromises);
  
      // Ajouter les favoris à l'utilisateur
      user.favorites.push(...savedFavorites.map(fav => fav._id));
      await user.save();
  
      res.json({
        result: true,
        message: 'Favoris ajoutés avec succès',
        favorites: savedFavorites, // Renvoyer les favoris nouvellement ajoutés
      });
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      res.status(500).json({ result: false, error: 'Erreur interne du serveur' });
    }
  });
  
  
  

module.exports = router;
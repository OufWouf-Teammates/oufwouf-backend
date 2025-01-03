var express = require("express")
var router = express.Router()
var Dog = require("../models/dog")
var User = require("../models/user")

const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
const { findToken } = require("../modules/findToken")
var { upload } = require("../modules/cloudinary")

/* Route GET pour recuperer les infos du chien */
router.get("/", middlewareCheckToken, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  try {
    const user = await User.findOne({ token: token }).populate("dogs");

    // Peupler les vaccins pour tous les chiens
    const dogsWithVaccins = await Dog.find({ _id: { $in: user.dogs } }).populate("vaccins");

    // Remplace les chiens de l'utilisateur par ceux avec les vaccins peuplés
    user.dogs = dogsWithVaccins;
    res.json({ result: true, dog: user.dogs, user: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

// Route Post pour créer un nouveua chien à l'utilisateur
router.post("/", middlewareCheckToken, upload, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  try {
    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" })
    }
    if (!req.body.data || !req.files) {
      return res.status(400).json({ result: false, error: "Données invalides" })
    }

    const data = JSON.parse(req.body.data)
    const uri = req.cloudinary_url

    //Creation du Chien
    const newDog = new Dog({
      name: data.name,
      uri: uri,
      ID: data.ID,
      race: data.race, //sous forme de String dirrectement pris de la bdd
      sex: data.sex,
      birthday: data.birthday,
      infos: data.infos,
      personality: data.personality,
    })

    const save = await newDog.save() //On sauvegarde le Chien dans la bdd

    // Ajout du chien à son maitre
    const update = await User.updateOne(
      { token: token },
      { $addToSet: { dogs: save._id } }
    )

    // Réponse réussie
    return res.json({ result: true, dog: save, ajoutUser: update })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "erreur serveur" })
  }
})

// Route put pour modifier les donnes du chien du chien
router.put("/", middlewareCheckToken, upload, async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] // Récupérer le token

  try {
    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" })
    }

    // Récupérer l'utilisateur avec son chien, en peuplant les chiens associés
    const user = await User.findOne({ token: token }).populate("dogs")
    if (!user) {
      return res
        .status(404)
        .json({ result: false, error: "Utilisateur non trouvé" })
    }

    // Vérification de l'existence d'un chien pour cet utilisateur
    const dogId = req.body.dog // On prend le premier chien de l'utilisateur
    if (!dogId) {
      return res
        .status(404)
        .json({ result: false, error: "Chien non trouvé pour cet utilisateur" })
    }

    // Vérification des données reçues
    // if (!req.body.data || !req.files) {
    //   return res.status(400).json({ result: false, error: "Données invalides" });
    // }

    // Récupérer les données et l'URL de l'image
    const { infos, personality } = req.body;
    const uri = req.cloudinary_url;

    // Mise à jour des informations du chien avec les nouvelles données
    const updatedFields = {};
    if (uri) updatedFields.uri = uri;
    if (infos) updatedFields.infos = infos;
    if (personality) updatedFields.personality = personality;

    // Mise à jour du chien dans la base de données
    const updatedDog = await Dog.findByIdAndUpdate(dogId, updatedFields, {
      new: true,
    })

    if (!updatedDog) {
      return res
        .status(404)
        .json({ result: false, error: "Chien non trouvé pour la mise à jour" })
    }

    // Retourner la réponse avec le chien mis à jour
    return res.json({ result: true, dog: updatedDog })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ result: false, error: "Erreur serveur" })
  }
})

// Route pour modifier la photo de profil du chien
router.put(`/modifier/:dogId`, middlewareCheckToken, upload, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token
  const { dogId } = req.params; // Utiliser dogId comme dans l'URL

  
  try {
    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" });
    }

    // Vérification de l'utilisateur
    const user = await User.findOne({ token: token }).populate("dogs");


    if (!user) {
      return res.status(404).json({ result: false, error: "Utilisateur non trouvé" });
    }

    // Vérification de l'existence du chien
    const foundDog = user.dogs.find(dog => dog._id.toString() === dogId);  // Recherchez le chien avec le dogId


    if (!foundDog) {
      return res.status(404).json({ result: false, error: "Chien non trouvé pour cet utilisateur" });
    }

    // Vérification de la présence du fichier image
    const uri = req.cloudinary_url; 

    if (!uri) {
      return res.status(400).json({ result: false, error: "Aucune image fournie" });
    }

    // Mise à jour du chien avec la nouvelle image
    const updatedDog = await Dog.findByIdAndUpdate(
      foundDog._id, // ID du chien à mettre à jour
      { uri: uri }, // Mettre à jour le champ `uri` avec l'URL de l'image
    );


    if (!updatedDog) {
      return res.status(404).json({ result: false, error: "Chien non trouvé pour la mise à jour" });
    }

    return res.json({ result: true, dog: updatedDog });
  } catch (error) {
    console.error("Erreur serveur :", error); // Afficher l'erreur côté serveur
    return res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/allDogs", middlewareCheckToken, async (req, res) => {
  try {
    const dogs = await Dog.find();
    res.status(200).json(dogs);
  } catch (error) {
    console.error("Erreur lors de la récupération des chiens :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des chiens" });
  }
});

module.exports = router;

var express = require('express');
const appleSignin = require('apple-signin-auth');
var router = express.Router();

const User = require('../models/user');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const TOKEN_VALIDITY_DAYS = 90;

const fs = require('fs');
const path = require('path');




//ROUTE MIDDLEWARE VERIF VALIDITE TOKEN / DATE TOKEN
async function middlewareCheckToken(req, res, next) {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const token = req.headers.authorization?.split(' ')[1]; // Format "Bearer <token>"
    if (!token) {
      res.json({ result: false, error: 'Token error.' });
      return;
        }

    // Rechercher l'utilisateur associé au token
    const user = await User.findOne({ token });
    if (!user) {
      res.json({ result: false, error: 'Token error.' });
      return;
      }

    // Vérifier si le token est toujours valide (moins de 90 jours)
    const tokenCreationDate = new Date(user.tokenCreationDate);
    const currentDate = new Date();
    const daysSinceCreation = Math.floor((currentDate - tokenCreationDate) / (1000 * 60 * 60 * 24));

    if (daysSinceCreation > TOKEN_VALIDITY_DAYS) {
      res.json({ result: false, error: 'Token error.' });
      return;
    }

    // Si tout est valide, retourner une réponse ou passer au prochain middleware
    next();
  } catch (error) {
    res.json({ result: false, error: 'Token error.' });
  }
};



//Route POST SIGNUP pour l'inscription
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérification si l'utilisateur a déjà un compte
  User.findOne({ email: req.body.email }).then(data => {
    if (!data) {
      //Decoupage 10 fois du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        password: hash,
        bookmarks: [],
        token: uid2(32),
        tokenCreationDate : new Date()
      });

      
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

//Route POST de la connection
router.post('/signin', async (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
   res.json({ result: false, error: 'Missing or empty fields' });
  }

  try {
    // Rechercher l'utilisateur
    const user = await User.findOne({ email: req.body.email });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      // Générer un nouveau token
      user.token = uid2(32);

      // Sauvegarder l'utilisateur avec le nouveau token
      await user.save();

       res.json({ result: true, user });
    } else {
     res.json({ result: false, error: 'User not found or wrong password' });
    }
  } catch (error) {
    console.error('Error during signin:', error);
   res.status(500).json({ result: false, error: 'Internal server error' });
  }
});



//Route de suppression d'un compte
router.delete('/:token', async (req, res) => {
  const token = req.params.token;

  try {
    // Suppression de l'utilisateur avec le token
    const result = await User.deleteOne({ token });

    if (result.deletedCount === 0) {
      // Aucun document supprimé
      res.status(404).json({ message: 'User not found' });
    }

    // Document supprimé avec succès
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    // Gestion des erreurs
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// EXEMPLE DE ROUTE MIDDLEWARE
// router.get('/userInfo/:id', middlewareCheckToken, async (req, res, next) => {
//   const {objectid} = req.params.id;

//   try {
//     // Suppression de l'utilisateur avec le token
//     const result = await User.findOne({ _ObjectId: objectid });

//     if (result) {
//       // Aucun document supprimé
//      res.status(200).json({ result: true, data: result });
//     } else{
//      res.status(404).json({ result: false });
//     }

//   } catch (error) {
//     // Gestion des erreurs
//     console.error('Error user', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// ROUTE APPLE CONNECTION 
// Charger la clé privée depuis le fichier .p8
const pathToKey = path.join(__dirname, '..', 'config', 'AuthKey_GV7A3M6663.p8');
const privateKey = fs.readFileSync(pathToKey, 'utf8');

router.post('/api/auth/apple', async (req, res) => {
  const { token } = req.body;

  try {
    // Vérification du token d'Apple
    const response = await appleSignin.verifyIdToken(token, {
      audience: 'com.your.app',  // Remplacez par ton client ID
      ignoreExpiration: true,      // Si tu gères l'expiration manuellement
      privateKey: privateKey,      // Fournir la clé privée pour vérifier le token
    });

    // Récupérer les informations de l'utilisateur
    console.log('User verified:', response);
    res.json({ result: true, user: response });

  } catch (error) {
    console.error('Apple sign-in verification error:', error);
    res.status(400).json({ result: false, error: 'Token verification failed' });
  }
});

module.exports = router;

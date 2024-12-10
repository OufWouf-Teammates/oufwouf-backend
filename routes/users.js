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

const { middlewareCheckToken } = require('../modules/middlewareCheckToken');
const { findToken } = require('../modules/findToken');


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
        tokenCreationDate : new Date(),
        dogs: []
      });

      newUser.save().then(data => {
        res.json({ result: true, data });
      });

      
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});




router.post('/signin', (req, res) => {


  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        user.token = uid2(32);
         user.save().then(data => {
          res.json({ result: true, data });
        });
         return;
      } else {
        res.json({ result: false, error: 'User not found or wrong password' });
      }
    })
    .catch(error => {
        res.status(500).json({ result: false, error: 'Internal server error 1' });
    });
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
    res.status(500).json({ message: 'Internal server error 2' });
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
//   }s
// });

// ROUTE APPLE CONNECTION 
// Charger la clé privée depuis le fichier .p8
router.post('/api/auth/apple', async (req, res) => {
const pathToKey = path.join(__dirname, '..', 'config', 'AuthKey_GV7A3M6663.p8');
const privateKey = fs.readFileSync(pathToKey, 'utf8');

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

router.get('/isConnectedOrNot', middlewareCheckToken, (req, res, next) => {
  res.json({ result: true });

})

module.exports = router;

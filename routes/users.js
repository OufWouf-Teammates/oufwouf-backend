var express = require('express');
const appleSignin = require('apple-signin-auth');
var router = express.Router();

const User = require('../models/user');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const fs = require('fs');
const path = require('path');

const { middlewareCheckToken } = require('../modules/middlewareCheckToken');
const { findToken } = require('../modules/findToken');

const { validateAppleToken } = require('../modules/validateAppleToken');

function connectToUser(req,res,next) {
  User.findOne({ email: req.body.email })
  .then(user => {
    if(user) {
      user.token = uid2(32);
      user.save().then(data => {
       res.json({ result: true, data });
     });
    } else {
      res.status(500).json({ result: false, error: 'Internal server error 9' });
    }
})
  .catch(error => {
      res.status(500).json({ result: false, error: 'Internal server error 9' });
  });
}


//Route POST SIGNUP pour l'inscription
router.post('/signup', (req, res, next) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  // Vérification si l'utilisateur a déjà un compte
  User.findOne({ email: req.body.email }).then(data => {
    if (!data) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        password: hash,
        bookmarks: [],
        token: uid2(32),
        tokenCreationDate: new Date(),
        dogs: [],
      });

      newUser.save().then(() => next());
    } else {
      res.json({ result: false, error: 'User already exists' });
    }
  }).catch(error => {
    console.error('Erreur lors de l’inscription:', error.message);
    res.status(500).json({ result: false, error: 'Erreur interne du serveur.' });
  });
}, connectToUser);




router.post('/signin', (req,res,next) => {


  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        req.body.email = user.email; // Injecter l'email pour `connectToUser`
        next();
      } else {
        res.json({ result: false, error: 'User not found or wrong password' });
      }
    })
    .catch(error => {
        res.status(500).json({ result: false, error: 'Internal server error 1' });
    });
},connectToUser);



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


router.post('/api/auth/apple', async (req, res, next) => {
  try {
    const { identityToken } = req.body;

    if (!identityToken) {
      return res.status(400).json({ result: false, error: 'identityToken est requis.' });
    }

    const verifiedData = await validateAppleToken(identityToken);
    const idApple = verifiedData.sub;
    const emailApple = verifiedData.email || null;

    console.log('Données vérifiées :', verifiedData);

    // Vérifier si l'utilisateur existe avec l'email ou idApple
    let user = await User.findOne({ $or: [{ email: emailApple }, { idApple }] });

    if (user) {
      req.body.email = user.email; // Injecter l'email pour `connectToUser`
      if(verifiedData.email === req.body.email) {
      next();
  } else {
    res.status(500).json({ result: false, error: 'Email erreur Apple.' });
  }
  }
   else {

    let user = await User.findOne({ idApple });
    if (user) {
      req.body.email = user.email;
      next();
    } else {
      // Rediriger vers /signup
      const password = uid2(16); // Générer un mot de passe aléatoire
      return fetch(`${BACKEND_URL}users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email: emailApple,password}),
      })
        .then(response => {
          res.json(response);
        })
        .catch(err => {
          console.error('Erreur lors de la redirection vers /signup:', err.message);
          res.status(500).json({ result: false, error: 'Erreur lors de la redirection vers /signup' });
        });
    }

    }
  } catch (error) {
    console.error('Erreur lors de la validation Apple :', error.message);
    res.status(500).json({ result: false, error: 'Erreur interne du serveur.' });
  }
}, connectToUser);

router.get('/isConnectedOrNot', middlewareCheckToken, (req, res, next) => {
  res.json({ result: true });

})

module.exports = router;

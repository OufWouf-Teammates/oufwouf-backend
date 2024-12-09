var express = require('express');
var router = express.Router();

const User = require('../models/user');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


//Route POST SIGNUP pour l'inscription
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérification si l'utilisateur a déjà un compte
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      //Decoupage 10 fois du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        bookmarks: [],
        token: uid2(32),
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, user: newDoc});
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

//Route POST de la connection
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
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
      return res.status(404).json({ message: 'User not found' });
    }

    // Document supprimé avec succès
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    // Gestion des erreurs
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

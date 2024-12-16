const request = require('supertest');
const app = require('../app');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const User = require('../models/user');

it(" PUT/ modifier l'email d'un utilisateur dans la base de données avec un token valide", async () => {
  // Création d'un utilisateur temporaire
  const token = uid2(32);
  const hashedPassword = await bcrypt.hash('password', 10);

  const user = await User.create({
    email: 'exemple@exemple.com',
    password: hashedPassword,
    token: token,
  });

  try {
    // Envoi de la requête PUT pour modifier l'email
    const response = await request(app)
      .put('/users') // Route PUT pour modifier l'email
      .set('Authorization', `Bearer ${token}`) // Token envoyé dans les headers
      .send({ email: 'newemail@exemple.com' }) // Nouvel email
      .expect(200);

    // Vérification de la réponse
    expect(response.body).toEqual(
        { result: true, email: 'newemail@exemple.com' }
    );

    // Vérification dans la base de données
    const updatedUser = await User.findById(user.id); 
    expect(updatedUser.email).toBe('newemail@exemple.com');
  } finally {
    // Pour supprimer un utilisateur par son ID avec Mongoose
    await User.findByIdAndDelete(user.id);
  }
});
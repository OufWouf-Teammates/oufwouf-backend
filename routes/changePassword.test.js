const request = require('supertest');
const app = require('../app'); // Remplacez par votre fichier d'application Express
const User = require('../models/user'); // Modèle User
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

jest.mock('../models/User'); // Mock du modèle User

describe('POST /changePassword', () => {
  it('devrait changer le mot de passe et générer un nouveau token si les informations sont correctes', async () => {
    // Mock de l'utilisateur
    const mockUser = {
      token: 'validToken123',
      password: bcrypt.hashSync('oldPassword', 10),
      save: jest.fn(),
    };

    // Simulation de la recherche d'utilisateur
    User.findOne.mockResolvedValueOnce(mockUser);

    const response = await request(app)
      .post('/users/changePassword')
      .send({ token: 'validToken123', newPassword: 'newPassword123' });

    expect(User.findOne).toHaveBeenCalledWith({ token: 'validToken123' });
    expect(mockUser.password).not.toBe('oldPassword'); // Le mot de passe a changé
    expect(mockUser.token).not.toBe('validToken123'); // Le token a changé
    expect(mockUser.save).toHaveBeenCalled(); // Sauvegarde des modifications
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: true, message: 'Password changed successfully' });
  });

  it('devrait retourner une erreur si le token est invalide', async () => {
    // Simulation de la recherche d'utilisateur avec un token invalide
    User.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/users/changePassword')
      .send({ token: 'invalidToken123', newPassword: 'newPassword123' });

    expect(User.findOne).toHaveBeenCalledWith({ token: 'invalidToken123' });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ result: false, error: 'Invalid token or user not found' });
  });

  it('devrait retourner une erreur si des champs sont manquants', async () => {
    const response = await request(app)
      .post('/users/changePassword')
      .send({ token: 'validToken123' }); // Champ `newPassword` manquant

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ result: false, error: 'Missing or empty fields' });
  });

  it('devrait retourner une erreur en cas de problème serveur', async () => {
    // Simulation d'une erreur serveur
    User.findOne.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app)
      .post('/users/changePassword')
      .send({ token: 'validToken123', newPassword: 'newPassword123' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ result: false, error: 'Internal server error' });
  });
});


const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
});
const { importJWK, jwtVerify } = require('jose'); // Installez le package 'jose'
const jwt = require('jsonwebtoken');

const APPLE_PUBLIC_KEYS_URL = 'https://appleid.apple.com/auth/keys';

async function validateAppleToken(identityToken) {
    try {
      console.log('Début de la validation Apple Token...');
  
      // Étape 1 : Récupérer les clés publiques d'Apple
      const response = await fetch(APPLE_PUBLIC_KEYS_URL);
      if (!response.ok) {
        throw new Error(`Impossible de récupérer les clés publiques : ${response.statusText}`);
      }
      const { keys } = await response.json();
      console.log('Clés publiques récupérées :', keys);
  
      // Étape 2 : Décoder le token pour trouver la clé correspondante
      const decodedToken = jwt.decode(identityToken, { complete: true });
      if (!decodedToken) {
        throw new Error('Impossible de décoder le token.');
      }
      console.log('Token décodé avec succès :', decodedToken);
  
      // Étape 3 : Trouver la clé correspondante
      const key = keys.find(k => k.kid === decodedToken.header.kid);
      if (!key) {
        throw new Error('Clé publique Apple introuvable pour le token.');
      }
      console.log('Clé publique trouvée :', key);
  
      // Étape 4 : Importer la clé publique avec jose
      const publicKey = await importJWK(
        {
          kty: key.kty,
          n: key.n,
          e: key.e,
        },
        'RSA'
      );
      console.log('Clé publique importée :', publicKey);
  
      // Étape 5 : Vérifier le token
      const { payload } = await jwtVerify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
      });
  
      console.log('Token validé avec succès :', payload);
      return payload;
    } catch (error) {
      console.error('Erreur lors de la validation Apple :', error.message);
      throw error;
    }
  }
  
  module.exports = { validateAppleToken };
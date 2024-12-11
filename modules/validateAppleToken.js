const { JWK } = require('jose'); // Installez le package 'jose'
const jwt = require('jsonwebtoken');

const APPLE_PUBLIC_KEYS_URL = 'https://appleid.apple.com/auth/keys';

async function validateAppleToken(identityToken) {
  try {
    // Étape 1 : Récupérer les clés publiques d'Apple
    const response = await fetch(APPLE_PUBLIC_KEYS_URL);
    if (!response.ok) {
      throw new Error(`Impossible de récupérer les clés publiques : ${response.statusText}`);
    }
    const { keys } = await response.json();

    // Étape 2 : Décoder le token pour trouver la clé correspondante
    const decodedToken = jwt.decode(identityToken, { complete: true });
    if (!decodedToken) {
      throw new Error('Impossible de décoder le token.');
    }

    const key = keys.find(k => k.kid === decodedToken.header.kid);
    if (!key) {
      throw new Error('Clé publique Apple introuvable pour le token.');
    }

    console.log('Clé publique reçue :', key);
    // Étape 3 : Construire une clé publique utilisable à partir de 'jose'
    const publicKey = JWK.importKey(
        {
          kty: key.kty,
          n: key.n,
          e: key.e,
        },
        'json'
      );

    // Étape 4 : Vérifier le token
    const verifiedToken = jwt.verify(identityToken, publicKey.toPEM(), {
      algorithms: ['RS256'],
    });

    console.log('Token validé avec succès :', verifiedToken);
    return verifiedToken;
  } catch (error) {
    console.error('Erreur lors de la validation Apple :', error.message);
    throw error;
  }
}

module.exports = { validateAppleToken };
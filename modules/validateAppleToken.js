const APPLE_PUBLIC_KEYS_URL = 'https://appleid.apple.com/auth/keys';

async function validateAppleToken(identityToken) {
  // Récupérez les clés publiques d'Apple
  const response = await fetch(APPLE_PUBLIC_KEYS_URL);
  const { keys } = await response.json();

  // Décoder le token pour trouver la clé correspondante
  const decodedToken = jwt.decode(identityToken, { complete: true });
  if (!decodedToken) {
    throw new Error('Impossible de décoder le token.');
  }

  const key = keys.find(k => k.kid === decodedToken.header.kid);
  if (!key) {
    throw new Error('Clé publique Apple introuvable.');
  }

  // Convertir la clé publique en format PEM
  const publicKey = `
    -----BEGIN PUBLIC KEY-----
    ${Buffer.from(
      `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE${key.n}IDAQAB`
    ).toString('base64')}
    -----END PUBLIC KEY-----
  `;

  // Vérifiez le token
  const verifiedToken = jwt.verify(identityToken, publicKey, {
    algorithms: ['RS256'],
  });

  console.log('Token validé avec succès :', verifiedToken);

  return verifiedToken;
}

module.exports = { validateAppleToken };
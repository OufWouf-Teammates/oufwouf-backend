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
      return;
    }
  };
  

  module.exports = { middlewareCheckToken };

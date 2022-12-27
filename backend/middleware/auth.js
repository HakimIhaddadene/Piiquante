const jwt = require('jsonwebtoken');
 
// Middleware d'authentification
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'ICI_JE_VOUS_CONSEILLE_DE_METTRE_UNE_LONGUE_CHAINE_OU_GARDER_CELLE_LA_SI_VOUS_VOULEZ');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};
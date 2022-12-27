const HotSauce = require('../models/hotSauce');
const fs = require('fs');

// Création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new HotSauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
    .catch(error => { res.status(400).json( { error })})
 };

 // Renvoi une sauce selon son id
 exports.getOneSauce = (req, res, next) => {
    HotSauce.findOne({
      _id: req.params.id
    }).then(
      (hotSauce) => {
        res.status(200).json(hotSauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };

  // Modifier une sauce
  exports.modifySauce = (req, res, next) => {
    // On vérifie s'il y a un champ file
    const sauce = req.file ? {
        // On récupère l'objet en parsant la chaîne de caractères
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}`
    } 
    // S'il n'y a pas d'objet transmis, on récupère l'objet dans le corps de la requête
    : { ...req.body };
  
    delete sauce._userId;
    // On récupère l'objet dans la BDD
    HotSauce.findOne({_id: req.params.id})
        .then((hotSauce) => {
            // Si l'userId est différent de celui qui vient de notre token
            if (hotSauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé à modifier la sauce'});
            } else {
              HotSauce.updateOne({ _id: req.params.id}, { ...sauce, _id: req.params.id})
                .then(() => res.status(200).json({message : 'La sauce a été modifiée !'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

  // Supprimer une sauce
  exports.deleteSauce = (req, res, next) => {
    HotSauce.findOne({ _id: req.params.id})
        .then(hotSauce => {
            if (hotSauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé'});
            } else {
                const filename = hotSauce.imageUrl.split('/pictures/')[1];
                // Suppression du fichier
                fs.unlink(`pictures/${filename}`, () => {
                  HotSauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };
  
  // Renvoi toutes les sauces de la BDD
  exports.getAllSauce = (req, res, next) => {
    HotSauce.find().then(
      (hotSauces) => {
        res.status(200).json(hotSauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  // Gestion des likes et dislikes
  exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const likeValue = req.body.like;
    const url = req.path;
    const idSauce = url.split('/')[1];
    console.log({userId, likeValue, idSauce});

    switch (likeValue) {
        case 1:
            HotSauce.updateOne({ _id: idSauce }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
            .then(() => res.status(201).json({ message: "Sauce likée" }))
            .catch((error) => res.status(400).json({ error }));      
        break;
        case -1:
            HotSauce.updateOne({ _id: idSauce }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
            .then(() => res.status(201).json({ message: "Sauce dislikée" }))
            .catch((error) => res.status(400).json({ error }));          
        break;
        case 0:
          HotSauce.findOne({ _id: idSauce })
          .then(sauceLikedOrDisliked => {
                if (sauceLikedOrDisliked.usersLiked.includes(userId)) {
                    // Annulation du Like et suppression de la BDD
                    HotSauce.updateOne({ _id: idSauce }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                    .then(() => res.status(201).json({ message: "Like annulé" }))
                    .catch((error) => res.status(400).json({ error }));
                }   
                else if (sauceLikedOrDisliked.usersDisliked.includes(userId)) {
                    // Annulation du Dislike et suppression de la BDD
                    HotSauce.updateOne({ _id: idSauce }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                    .then(() => res.status(201).json({ message: "Dislike annulé" }))
                    .catch((error) => res.status(400).json({ error }));
                }    
              })  
          .catch(error => res.status(400).json({ error }));  
        break;
    }
  }
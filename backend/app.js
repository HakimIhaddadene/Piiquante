// Importer express
const express = require('express');
// Importer Mongoose
const mongoose = require('mongoose');

const saucesRoads = require('./roads/sauces');
const userRoads = require('./roads/user');

// Accéder au path du serveur
const path = require('path');


mongoose.connect('mongodb+srv://Hakim:elpou2592@cluster0.kg9fhze.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Accès à req.body (bodyParser.json())
app.use(express.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use('/api/sauces', saucesRoads);
app.use('/api/auth', userRoads);
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

// Exporter l'application
module.exports = app;
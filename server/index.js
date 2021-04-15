//! Executer npm init et mettre en place le package.json initial, installer nodemon via npm i --save-dev nodemon et changer le script de start en nodemon index.js
//! Récupérer les dépendances : npm i express mongoose multer dotenv jsonwebtoken

//? Dépendances de l'application : Express pour le serveur et Mongoose pour la connection avec MongoDB, Cors pour donner les droits d'accès au serveur
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');


//? Ajout des liens des fichiers de routes
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');

//? DB Connection avec mongoose : utilisation de l'URL mongodb
//TODO : Ajouter la connection dans un fichier séparé qui servira de module de connexion.
const URI = process.env.MONGODB_URL

mongoose.connect(URI,{
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err)=>{
    if(err) throw err;
    console.log('Connected to MongoDB');
});

//? Instanciation de mon serveur & middlewares
//TODO : Créer un fichier .env qui contient les variables d'environnement comme l'URL de connexion à la BDD, le port d'écoute par exemple.
const app = express();
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin: ['http://localhost:8000', 'http://localhost:3000', 'http://localhost:4200']
}))
app.use(express.json());

//? Routes
app.use('/user', userRoutes);
app.use('/api/post', postRoutes)



const PORT = process.env.PORT || 5000
//! Ajouter le app.listen permet au serveur d'être servi sur une route localhost avec le port choisi
app.listen(PORT,()=>{
    console.log(`Server is running on https://localhost:${PORT}`);
});

//! Ajout d'une route 404 au cas où la requête va sur une route inutile. Les gestionnaires d'erreurs sont à la fin
app.use((err,req, res, next) => {
    next(err);
});

app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});
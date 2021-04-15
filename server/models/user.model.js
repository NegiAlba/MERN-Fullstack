//? Dépendance mongoose pour réaliser le schéma.
const mongoose = require('mongoose');

//? Créer le schéma/la structure de nos données qui existeront dans la BDD
//* Ajout d'un panier pour un projet e-commerce, un role pour qu'il y ait des admins et des timestamps pour les dates d'inscription
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type:String,
        unique: true,
        required: true,
    },
    password:{
        type:String,
        required:true,
    },
    role: {
        type: Number,
        default: 0
    },
    cart: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})


//? Exportation de notre schéma pour l'utiliser ensuite sur notre serveur.
module.exports = mongoose.model('User', userSchema)

//! Création des routes spécifiques liées au model user dans routes/user.routes.js
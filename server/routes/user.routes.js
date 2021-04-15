//? Récupération de router de express afin d'assurer que les routes soit servies sur des url qu'on définit dans le index.js
const router = require('express').Router();
//? La dépendance bcryptjs permet de crypter un password en bcrypt
const bcrypt = require('bcryptjs');

//? La dépendance jsonwebtoken qui permet de... créer des json web tokens, mais aussi de les utiliser.
const jwt = require('jsonwebtoken');

//? Le model a réutiliser sur les pages des routes. Généralement le CRUD de ces modèles.
const User = require('../models/user.model');

//? Le type ObjectID de Mongoose va nous permettre de vérifier que la donnée passée est bien un ID d'objet
const ObjectID = require("mongoose").Types.ObjectId;




//? Route d'une méthode POST à l'url /register qui sert de moyen d'inscription
router.post('/register', async (req,res)=>{

    //? On génère du sel pour hasher le mot de passe
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //? Création d'un nouvel utilisateur suivant le model défini dans le fichier user.model.js et le hashedPassword
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    })

    //? Ajout des données dans la BDD
    const result = await user.save();

    const {password, ...data} = await result.toJSON();
    //? Response du serveur à l'ajout dans la BDD avec les infos users (sauf le password)
    res.send(data);

})

//? Route /login qui sert à se connecter en vérifiant les identifiants depuis la BDD
router.post('/login', async (req,res)=>{

    const cookie = req.cookies['jwt']

    if(cookie){
        //! Verification de si je suis déja connecté
        //? Je vais faire vérifier le cookie via la méthode verify de jwt -> Je vais retourner l'id utilisé pour le cookie et un id de cryptage
        const claims = await jwt.verify(cookie, 'secret');
    
        //? Si mon cookie n'est pas valide, je renvoie un code d'erreur 401 avec un message de non autorisation
        if (!claims) {
            res.status(401).send({
                message: 'Authentication error'
            })
            res.redirect('./')
        }
    }


    try {
        //? Etape 1.Vérifier qu'un utilisateur possède cette adresse
        const user = await User.findOne({email:req.body.email});

        if (!user) {
            return res.status(404).send({
                message:'User not found'
            })
        }

        //? Etape 2. Vérifier que le mot de passe est valide

        if (!await bcrypt.compare(req.body.password, user.password)) {
            return res.status(404).send({
                message:'Invalid credentials'
            })
        }


        //? Etape 3.Créer un token de session
        const token = jwt.sign({_id: user._id}, "secret");

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
        })

        res.send({
            message:'Authentification success'
        });

    }catch(err){
        return res.status(500).json({ message: err });
    }
})
//? La route /logout va servir de déconnexion
router.post('/logout', (req,res)=>{
    try {
        res.cookie('jwt', '', {maxAge:0});
    
        res.send({
            message:'Successfully logged out'
        })
    } catch (error) {
        return res.json(error)
    }
})

//!----------------------------------------------FIN DES ROUTES D'AUTHENTIFICATION----------------------------
//*----------------------------------------------DEBUT DES ROUTES D'ACCES AUX INFOS USER----------------------
//? La route / va servir de route qui récupère les infos de l'utilisateur authentifié.
router.get('/', async (req,res) => {

    try {
        //? Récupère mon cookie qui est présent sur la machine
        const cookie = req.cookies['jwt']


        //? Je vais faire vérifier le cookie via la méthode verify de jwt -> Je vais retourner l'id utilisé pour le cookie et un id de cryptage
        const claims = await jwt.verify(cookie, 'secret');

        //? Si mon cookie n'est pas valide, je renvoie un code d'erreur 401 avec un message de non autorisation
        if (!claims) {
            return res.status(401).send({
                message: 'Not authenticated'
            })
        }

        //? Si toutefois mon cookie est valide, je récupère l'utilisateur qui est associé à l'id du cookie

        const user = await User.findOne({_id:claims._id});

        //* user {(JSON) _id,username,email,password}

        //* const password = {(JSON)password} && const data = {(JSON)_id,username,email}

        const {password, ...data} = await user.toJSON()

        //* const data = {(JSON)_id,username,email}

        //? Je renvoie les infos liées à l'utilisateur authentifié
        res.send(data);

    } catch (error) {
        return res.status(401).send({
            message: 'Not authenticated'
        })
    }
})


//? La route /all va servir de route qui récupère les infos des utilisateurs.
router.get("/all", async (req,res)=>{
    const users = await User.find().select("-password");
    res.status(200).json(users);
});

//? La route /:id va servir de route qui récupère les infos d'un utilisateur selon son id.
router.get("/:id", (req,res)=>{
    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  User.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("ID unknown : " + err);
  }).select("-password");
});

//? La route /:id va servir de route qui delete un utilisateur selon son id.
router.delete("/:id", async (req,res)=> {
    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await User.remove({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Successfully deleted. " });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});



//! Export du module router a réutiliser dans le index.js pour associer les routes avec un router.
module.exports = router;
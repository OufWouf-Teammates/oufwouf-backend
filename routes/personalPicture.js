var express = require("express")
var router = express.Router()
var Dog = require("../models/dog")
var User = require("../models/user")
var Picture = require("../models/personalPicture")

/* Route pour afficher les photos */

const { middlewareCheckToken } = require("../modules/middlewareCheckToken")
var { upload } = require("../modules/cloudinary")

router.get('/', middlewareCheckToken, async (req, res, next) => {
    const token = req.headers.authorization

    try {
        const user = await User.findOne({ token: token }).populate("pictures")
        res.json({ result: true, dog: user.pictures })
    } catch (error){
        console.error(error)
        res.status(500).json({ result: false, error: "erreur serveur" })
    }
})

/* Route pour ajouter une photo */

router.post('/', middlewareCheckToken, upload, async (req, res, next) =>{
    
})
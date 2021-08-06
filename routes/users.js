const express = require('express');
// const ExpressError = require('../expressError');
const router = new express.Router();
// const db = require('../db');
const User = require('../models/user');
const {ensureLoggedIn, ensureCorrectUserOrAdmin, ensureAdmin} = require('../middleware/auth');
const jsonschema = require("jsonschema")
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema=require("../schemas/userUpdate.json");
const postNewSchema=require("../schemas/postNew.json");
const postUpdateSchema=require("../schemas/postUpdate");
const { BadRequestError, ExpressError } = require("../expressError");
const { createToken } = require("../helpers/tokens");

const {cloudinary} = require('../utils/cloudinary');




router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        let users = await User.findAll();
        return res.json({users: users});
    } catch (e) {
        return next(e)
    }
   
    
});

router.get('/:username', ensureLoggedIn,  async (req, res, next) => {
    try {
        let user = await User.get(req.params.username);
        return res.json({user: user});
    } catch (e) {
        return next(e)
    }  
});

router.post('/', ensureAdmin, async (req, res, next)=>{
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }

        const { username, password, firstName, lastName, email } = req.body
        if(req.body.isAdmin){
            const {isAdmin} = req.body;
            const user = await User.register(username, password, firstName, lastName, email, isAdmin);
            const token = createToken(user);
            return res.status(201).json({ user: user, token });
        } else {

            const user = await User.register(username, password, firstName, lastName, email);
            const token = createToken(user);
            return res.status(201).json({ user: user, token });

        }
    
       
      } catch (e) {
          
        return next(e);
      }
    
})

router.patch('/:username', ensureCorrectUserOrAdmin, async (req, res, next) => {
    
    
    let data = req.body;
      
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        if(req.body.profileImg){
            let profileImg = req.body.profileImg;
            const uploadedResponse = await cloudinary.uploader.upload(profileImg, {
                upload_preset: 'uhpdzxlc',
                folder: 'yoga_app_profiles'
            })
    
            const imgSource = uploadedResponse.public_id;
    
            if(data.profileImg){
                data.profileImg = imgSource;
    
            }
        }
        
    
        const user = await User.update(req.params.username, data);
        return res.json({ user });
      } catch (err) {
        return next(err);
      }
    
})

router.delete('/:username', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        await User.remove(req.params.username)
        return res.json({msg: `${req.params.username} deleted.`})
    } catch (e) {
        return next(e)
    }
})

router.post('/:username/create-post', ensureCorrectUserOrAdmin, async function (req,res,next){
        
      try {
        let media = req.body.media;
  
        const validator = jsonschema.validate(req.body, postNewSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          console.log(errs)
          throw new BadRequestError(errs);
          
        }

        
        if(req.body.pin !== "random pin"){
            const uploadedResponse = await cloudinary.uploader.upload_large(media, {
                upload_preset: 'uhpdzxlc',
                folder: 'yoga_app'
            })
            const imgSource = uploadedResponse.public_id;
            const {caption, pin, pin_id} = req.body;
            
            const post = await User.createPost(req.params.username, {caption, imgSource, pin, pin_id});
    
          
    
            return res.status(201).json({ post });
        } else {
            const {caption, pin, pin_id} = req.body;
            const imgSource = media
            
            const post = await User.createPost(req.params.username, {caption, imgSource, pin, pin_id});
    
            return res.status(201).json({ post });
        }
        


      } catch (e) {
          
          throw new BadRequestError(e)
      }
         
        
    
    
})

// router.patch('/:username/update-post/:id', ensureCorrectUserOrAdmin, async function (req,res,next){
//     try{
//         const validator = jsonschema.validate(req.body, postUpdateSchema);
//         if (!validator.valid) {
//           const errs = validator.errors.map(e => e.stack);
//           throw new BadRequestError(errs);
//         }

//         const postId= +req.params.id;
//         const updatedPost = await User.updatePost(postId, req.body);
//         return res.json({post: updatedPost})

//     } catch (e) {
//         return next(e)
//     }
// })

// router.delete('/:username/delete-post/:id', ensureCorrectUserOrAdmin, async function (req,res,next){
//     try {
//         const postId=+req.params.id;
//         await User.deletePost(postId);
//         return res.json({Deleted: `Post id = ${postId}`})
//     } catch (e){
//         return next(e)
//     }
// })

module.exports = router;
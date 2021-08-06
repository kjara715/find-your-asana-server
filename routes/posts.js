const express = require('express');
const router = new express.Router();
const {ExpressError, BadRequestError} = require('../expressError');
const Post = require('../models/post');
const {ensureLoggedIn, ensureCorrectUserOrAdmin, ensureAdmin} = require('../middleware/auth');
const jsonschema = require("jsonschema")
const postNewSchema=require("../schemas/postNew.json");
const postUpdateSchema=require("../schemas/postUpdate");



const {cloudinary} = require('../utils/cloudinary');

router.get('/', async (req, res, next) => {

    try {
        const posts = await Post.findAll(req.query);
        return res.json({posts: posts})
    } catch (e) {
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const postId=+req.params.id
        const post = await Post.get(postId);
        return res.json({post: post})
    } catch (e) {
        return next(e)
    }
    
})


router.post('/:username',ensureCorrectUserOrAdmin, async function(req,res,next) {
    try {
        let media = req.body.media;
  
        const validator = jsonschema.validate(req.body, postNewSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
          
        }

        if(req.body.pin !== "random pin"){
            const uploadedResponse = await cloudinary.uploader.upload_large(media, {
                upload_preset: 'uhpdzxlc',
                folder: 'yoga_app'
            })
            const imgSource = uploadedResponse.public_id;
            const {caption, pin, pin_id, username} = req.body;
           
            
            const post = await Post.create({caption, media: imgSource, username, pin, pin_id});
    
          
    
            return res.status(201).json({ post });
        } else {
            const {caption, pin, pin_id, username} = req.body;
            const imgSource = media
            
            const post = await Post.create({caption, media: imgSource, username, pin, pin_id})
    
            return res.status(201).json({ post });
        }
        


      } catch (e) {
          
          throw new BadRequestError(e)
      }
})

router.delete('/:username/:id', ensureCorrectUserOrAdmin, async function(req,res,next){
    try {
        const postId=+req.params.id;
        const username = req.params.username;
        const post = await Post.get(postId);
       
        if(post.media.startsWith("yoga_app/")){
            await cloudinary.api.delete_resources([post.media],
                function(error, result) {console.log(result, error) });
        }
       


        await Post.deletePost(postId, username);
        return res.json({Deleted: `Post id = ${postId}`})
    } catch (e){
        return next(e)
    }
})

router.patch('/:username/:id', ensureCorrectUserOrAdmin, async function(req,res,next){
    try {
        const validator = jsonschema.validate(req.body, postUpdateSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const postId=+req.params.id;
        const username = req.params.username
    
        const post = await Post.updatePost(postId, username, req.body);
        return res.json({ post });
      } catch (err) {
        return next(err);
      }
})




module.exports = router;
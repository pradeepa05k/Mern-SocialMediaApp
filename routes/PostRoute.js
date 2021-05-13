const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');



router.post('/addPost',[ auth, [
    check('text', 'Text is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array});
    }
    try{
        const user = await User.findById(req.user.id).select('-password');
    
        const newPost = new Post({
            text : req.body.text,
            name : user.name,
            avatar : user.avatar,
            user : req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error');
    }
});

router.get('/getPost', auth, async(req, res) => {
    try{
        const posts = await Post.find().sort({ date : -1});
        res.json(posts);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error');
    }
});

router.get('/feed', auth, async(req, res) => {
    try{
        console.log(req.user.following);
        const posts = await Post.find({user : {$in : req.user.following}}).populate('user').sort('-date');
        res.json(posts);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error');
    }
});

router.get('/getPost/:postId', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.postId).sort({ date : -1});

        if(!post){
            return res.status(404).json({ msg : 'Post not found'});
        }
        res.json(post);
    }
    catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg : 'Post not found'});
        }
        res.status(500).send('Error');
    }
});

router.delete('/deletePost/:postId', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.postId);

        if(!post){
            return res.status(404).json({ msg : 'Post not found'});
        }

        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg : 'User not Authorized'});
        }

        await post.remove();
        res.json({ msg : 'Posed Deleted'});
    }
    catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg : 'Post not found'});
        }
        res.status(500).send('Error');
    }
});

router.put('/post/like/:id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        
        if(post.likes.filter(like => like.user.toString() === req.user.id).length>0){
            return res.status(400).json({ msg : 'Post already liked'});
        }
        post.likes.unshift({ user : req.user.id});
        await post.save();

        res.json(post.likes);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/post/unLike/:id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        
        if(post.likes.filter(like => like.user.toString() === req.user.id).length===0){
            return res.status(400).json({ msg : 'Post has not yet been liked'});
        }
        const removeIndex = post.likes.map(like => like.user.toString().indexOf(req.user.id));
        post.likes.splice(removeIndex, 1);
        await post.save();

        res.json(post.likes);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/post/comment/:postId',[ auth, [
    check('text', 'Text is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array});
    }
    try{
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.postId);

        const newComment = new Post({
            text : req.body.text,
            name : user.name,
            avatar : user.avatar,
            user : req.user.id
        });

        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error');
    }
});

router.delete('/deleteComment/:postId/:commentId', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.postId);

        const comment = post.comments.find(comment => comment.id === req.params.commentId);

        if(!comment){
            return res.status(400).json({ msg : 'Comment dows not exist' });
        }

        if(comment.user.toString() !== req.user.id){
            return res.status(400).json({ msg : 'User not authorized' });
        }

        const removeIndex = post.comments.map(comment => comment.user.toString())
        .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error');
    }
})

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const Profile = require('../models/Profile');
const User = require('../models/User');
const {check, validationResult} = require('express-validator');
require('../models/Profile');

const multer = require('multer');

const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, './uploads/');
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const upload = multer({
    storage : storage, 
    limits : {
        fileSize : 1024 * 1024 * 5
    },
    fileFilter : fileFilter
});

//Get Profile by UserId in Body
router.get('/getProfile', auth, async(req,res)=>{
    try{
        const profile = await Profile.findOne({user : req.user.id}).populate('user',
        ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg : 'There is no profile for this user'});
        }

        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send("Error");
    }
})

//Add Profile 
router.post('/addProfile', upload.single('profileImage'), [auth, [
    check('userName', 'User Name is required').not().isEmpty(),
    check('mobileNumber', 'Mobile Number is required').not().isEmpty(),
]], async(req,res) => {
    const errors = validationResult(req);
    console.log("Post");
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array});  
    }
    console.log(req.file);
    const {name, userName, bio, mobileNumber, gender} = req.body;
    let userDetail = {};
    userDetail.user = req.user.id,
    userDetail.name = name,        
    userDetail.userName = userName,        
    userDetail.bio = bio,
    userDetail.mobileNumber = mobileNumber,       
    userDetail.gender = gender,
    userDetail.profileImage = req.file.path
    console.log(userDetail);
    
    try{
        let profile = await Profile.findOne({user : req.user.id});

        if(profile){
            profile = await Profile.findOneAndUpdate(
                {user : req.user.id},
                {$set : userDetail},
                {new : true}
            );
            return res.json(profile);
        }
        profile = new Profile(userDetail);
        await profile.save();
        res.json(profile);
    }
    catch(err){
        console.error( err.message);
        res.status(400).send("Error");  
    }
});

//Get All Profiles
router.get('/getAllProfile', async(req,res) => {
    try{
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Errror');
    }
});

//Get Profile by UserId in Params
router.get('/getProfile/:userId', async(req,res) => {
    try{
        const profile = await Profile.findOne({ user : req.params.userId}).populate('user', ['name', 'avatar']);
        if(!profile)
            return res.status(400).json({msg : "Profile not found"});
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        if(err.kind == "ObjectId")
            return res.status(400).json({msg : "Profile not found"});
        res.status(500).send('Errror');
    }
});

//Delete Profiles,User,Post
router.delete('/deleteProfile',auth, async(req,res) => {
    try{
        //Remove Profile
        await Profile.findOneAndRemove({ user : req.user.id});
        //Remove User
        await User.findOneAndRemove({ _id : req.user.id});

        res.json({msg : "Deleted Successfully"});
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Errror');
    }
});

router.get('/search', auth, async(req, res)=>{
    try{
        const profile = await Profile.findOne({userName : req.body.userName}).populate('user',
        ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg : 'No User Found'});
        }

        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send("Error");
    }
});

router.put('/follow', auth, async(req,res) => {
    try{
        const follow = await User.findByIdAndUpdate(
            {_id : req.body.followId}, 
            {$push : {following : req.user.id}}, 
            {new : true},(err,data)=>{
                if(err) throw err;
                else{
                    User.findByIdAndUpdate(
                        {_id : req.user.id},
                        {$push : {following : req.body.followId}},
                        {new : true})
                        .then(response => {
                            res.json(response);
                        })
                        .catch(err => {
                            return res.status(422).json({error : err});
                        })
                }
            }
        );
    }
    catch(err){
        res.json({message : err});
    }
});

router.put('/unfollow', auth, async(req,res) => {
    console.log(req.user.id);
    console.log(req.body.followId);
    try{
        const follow = await User.findByIdAndUpdate(
            {_id : req.body.followId}, 
            {$pull : {following : req.user.id}}, 
            {new : true},(err,data)=>{
                if(err) throw err;
                else{
                    User.findByIdAndUpdate(
                        {_id : req.user.id},
                        {$pull : {following : req.body.followId}},
                        {new : true})
                        .then(response => {
                            res.json(response);
                        })
                        .catch(err => {
                            return res.status(422).json({error : err});
                        })
                }
            }
        );
    }
    catch(err){
        res.json({message : err});
    }
});

module.exports = router;
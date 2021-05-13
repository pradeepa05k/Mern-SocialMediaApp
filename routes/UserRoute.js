const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator');


router.post('/user/newUser', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Enter a valid email').isEmail(),
    check('password', 'Enter a password with 6 0r more characters').isLength({min : 6}),
    ],async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    
        const {name, email, password } = req.body;
        let user = await User.findOne({email});
        
        try {
            if(user){
                res.status(400).json({errors : [{msg : 'User already exists'}]})
            }
        
            const avatar = gravatar.url(email, {
                s:'200',
                r:'pq',
                d:'mm'
            })
            
            user = new User({
                name,
                email,
                avatar,
                password
            });
            const saltPassword = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, saltPassword);
            await user.save();

            const payload = {
                user : {
                    id : user.id
                }
            }
            
        jwt.sign(payload, process.env.jwtSecret,
        {expiresIn : 360000},
        (err, token) => {
            if(err) throw err;
            res.status(400).json(token, user);
        });
        }
        catch(err){
            res.json({message : err});
        }      
});

//View all users*
router.get('/user/getUser', async (req,res)=>{
    try{
        const Alluser = await User.find();
        res.json(Alluser);
    }
    catch(err){
        res.json({message : err});
    }
});

router.get('/user/:id', async (req,res)=>{
    try{
        console.log(req.params.id);
        const Alluser = await User.findById({_id : req.params.id});
        res.json(Alluser);
    }
    catch(err){
        res.json({message : err});
    }
});
module.exports = router;
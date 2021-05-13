const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {check, validationResult} = require('express-validator');


router.get('/getAuth', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch(err){
        res.status(500).send('Server Error');
    }
});

router.post('/postAuth', [
    
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').isLength({min : 6}),
],async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    
        const {email, password } = req.body;
        let user = await User.findOne({email});
        console.log(user);
        try {
            if(!user){
                res.status(400).json({errors : [{msg : 'Invalid Credentials'}]})
            }
        
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                res.status(400).json({errors : [{msg : 'Invalid Credentials'}]})
            }

            const payload = {
                user : {
                    id : user.id ,
                    following : user.following,
                    followers : user.followers                   
                }
            }
            
        jwt.sign(payload, process.env.jwtSecret,
        {expiresIn : 360000},
        (err, token) => {
            if(err) throw err;
            res.json({token});
        });
        }
        catch(err){
            res.json({message : err});
        }      
});

module.exports = router;
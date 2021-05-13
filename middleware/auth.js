const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

module.exports = function(req, res, next){
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).json({msq : 'No token, authorization denied'});
    }
    try{
        const decoded = jwt.verify(token, process.env.jwtSecret);
        req.user = decoded.user;
        next();
    }
    catch(err){
        res.status(401).json({msq : 'Token is not valid'});
    }
}
const mongoose = require('mongoose');
const profileSchema = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    name : {
        type : String,
        required : true
    },
    userName : {
        type : String,
        required : true
    },
    bio : {
        type : String,
        required : true
    },
    mobileNumber : {
        type : String,
        required : true
    },
    gender : {
        type : String,
        required : true
    },
    profileImage : {
        type : String,
        required : true
    }
});
module.exports = mongoose.model('profile', profileSchema);
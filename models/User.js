const mongoose = require('mongoose');
// const ObjectId = mongoose.Schema.Types;
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar : {
        type : String
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    createdOn: {
        type:Date,
        default: Date.now
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }   
    ],
});
module.exports = mongoose.model('user', userSchema);
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user
let userSchema = new Schema({
    access_token: {
        type: String,
        comments: "access_token"
    },
    expires_in: {
        type: Number,
        comments: "到期时间"
    },
    updated: {
        type: Date,
        default: new Date
    },
    accessName:{
        type:String
    }
});




mongoose.model('accesstoken', userSchema)


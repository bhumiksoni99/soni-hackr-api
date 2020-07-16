const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const LinkSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true,
        max:256
    },
    url:{
        type:String,
        trim:true,
        required:true,
        max:256
    },
    slug:{
        type:String,
        lowercase:true,
        unique:true,
        index:true
    },
    postedBy:{  
        type:ObjectId,
        ref:'User'
    },
    category:[{  
        type:ObjectId,
        ref:'Category',
        required:true
    }],
    type:{
        type:String,
        default:'Free'
    },
    medium:{
        type:String,
        default:'Video'
    },
    clicks:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

const link = mongoose.model('Link', LinkSchema)

module.exports = link
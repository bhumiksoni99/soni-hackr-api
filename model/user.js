const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const {ObjectId} = mongoose.Schema

const userSchema = new mongoose.Schema({ 
    username :{
        type:String,
        required :true,
        trim : true,
        index:true,
        lowercase:true,
        max:12
    },
    name:{
        type:String,
        required :true,
        trim : true
    },
    password :{
        type:String,
        required: true,
        trim:true,        
    },
    email: {
        type:String,
        required:true,
        trim:true,
    }
    ,role:{
        type:String,
        default:'subscriber'
    },
    resetPasswordLink:{
        data:String,
        default:''
    },
    categories:[{  
        type:ObjectId,
        ref:'Category',
        required:true
    }]
},{
    timestamps:true
})

//inbuilt node js package crypto can also be used to hash the password
userSchema.pre('save', async function(next) {
    const User = this
    
    const ifExists = await user.findOne({email:User.email})
    if(ifExists) {
        throw new Error('This email already exists!Try another one.')
    }
                    
    if(User.isModified('password')) {
        User.password = await bcrypt.hash(User.password , 8)
    }   

    next();
})

userSchema.methods.generateAuthToken = function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET,{expiresIn:'7d'})
    return token
}

userSchema.statics.findByCredentials = async (email,password) => {
    const User = await user.findOne({email})

    if(!User) {
        throw new Error('This email id is not registered!')
    }
    const isMatch = await bcrypt.compare(password,User.password)

    if(!isMatch) {
        throw new Error('Please enter the correct password!')
    }
    return User
}

const user = mongoose.model('User', userSchema)

module.exports = user
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs')
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const {emailParams,forgotemailParams} = require('../helper/email')
const shortId = require('shortid')
require('dotenv').config()

//ses config
AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION
})

const ses = new AWS.SES({apiVersion:'2010-12-01'})

const register = async (req,res) => {
   const {name,email,password,categories} = req.body

   //check if user already exists
   const user = await User.findOne({email})
   if(user){
       return res.status(400).json({error:'Email-id is already registered.'})
   }

   //generate jwt with user name email and pwd if user doesn't exist
   const token = jwt.sign({name,email,password,categories},process.env.JWT_ACCOUNT_ACTIVATION,{expiresIn:'10m'})

   const params = emailParams(email,token,name)

    const sendEmail = ses.sendEmail(params).promise()

    sendEmail.then(data => {
        res.json({
            message:`Activation Link has been sent to ${email}!`
        })
    }).catch(e => {
        res.status(400).json({
            error:'Enter a valid email address.' 
        })
    })
}

const activateAccount = async (req,res) => {

    const token = req.body.token
    
    //check to see if the token has expired
    jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION,function(err,data){
        if(err){
            res.status(401).json({
                error:'The Activation Link has expired. Please register again.'
            })
        }
    })

    const {name,email,password,categories} = jwt.decode(token)

    const username = shortId.generate()

    const newUser = await User({username,name,email,password,categories})
    try{
        await newUser.save()
        res.json({
            message:'Congratulations! Your account has been activated.'
        })
    }catch(e){
        res.status(400).json({
            error:'Error saving the user to database!'
        })
    }
}

const login = async (req,res) => {
    const {email,password} = req.body
    try{
    const user = await User.findByCredentials(email,password)
    const token = user.generateAuthToken()
    res.json({user,token})
    }catch(e){
        res.status(401).json({
            error:e.toString().split(':').slice(-1).toString()
        })
    }
}

const forgotPassword = async (req,res) => {
    const {email} = req.body

    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({error:'Email-id is not registered.'})
    }

    const token = jwt.sign({ name:user.name}, process.env.JWT_SECRET,{expiresIn:'10m'})

    await User.findOneAndUpdate({_id:user._id},{resetPasswordLink:token},{new:true})

    const params = forgotemailParams(email,token)

    const sendEmail = ses.sendEmail(params).promise()

    sendEmail.then(data => {
        res.json({
            message:`Password reset link has been sent to ${email}!Click on the link to reset password.`
        })
    }).catch(e => {
        res.status(400).json({
            error:'Enter a valid email address.' 
        })
    })
}

const resetPassword = async (req,res) => {
    const {token,newPassword} = req.body   
    
    //check to see if the token has expired
    jwt.verify(token,process.env.JWT_SECRET,function(err,data){
        if(err){
            return res.status(401).json({
                error:'The Reset Password Link has expired.Try Again.'
            })
        }
    })

    const user = await User.findOne({resetPasswordLink:token})

    if(!user){
        return res.status(400).json({
            error:'Invalid token!' 
        })
    }

    const id = user._id
    user.password = await bcrypt.hash(newPassword , 8)
    user.resetPasswordLink=''

    try{
        await User.findOneAndUpdate({_id:id},user,{new:true})
        res.json({
            message:'Your password has been reset.'
        })
    }catch(e){
        console.log(e)
        res.status(400).json({
            error:'Error resetting your password.'
        })
    }
}


//restrict access to somepages if not signedin
const requireSignIn = expressJwt({secret:process.env.JWT_SECRET,algorithms:['HS256']}) //is token is valid we will get response in req.user

const authMiddleware = async (req,res,next) => {
    const authUserId = req.user._id             //this will be available from the above requireSignIn function
    const user = await User.findOne({_id:authUserId})
    if(!user){
        return res.status(400).json({
            error:'User Not Found.'
        })
    }
    
    req.profile = user
    next();
}

const adminMiddleware = async (req,res,next) => {
    const authUserId = req.user._id
    const user = await User.findOne({_id:authUserId})
    if(!user){
        return res.status(400).json({
            error:'User Not Found.'
        })
    }

    if(user.role !== 'admin'){
        return res.status(401).json({
            error:'Admin resource. Access Denied.'
        })
    }

    req.profile = user
    next();
}

const canUpdateAndDelete = async (req,res,next) => {
    const{id} = req.params
    const data = await Link.findOne({_id:id})

    let authorize = data.postedBy._id.toString() === req.profile._id
    if(!authorize){
        return res.status(401).json({
            error:'Admin resource. Access Denied.'
        })
    }

    next()
}

module.exports = {
    register,
    activateAccount,
    login,
    requireSignIn,
    authMiddleware,
    adminMiddleware,
    forgotPassword,
    resetPassword,
    canUpdateAndDelete
}
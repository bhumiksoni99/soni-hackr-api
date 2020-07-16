const Category = require('../model/category')
const Link  = require('../model/link')
const User  = require('../model/user')
const bcrypt = require('bcryptjs')

const read = async (req,res) => {
    try{
    const links = await Link.find({postedBy:req.profile._id}).populate('postedBy','name').populate('category','name postedBy slug').sort({createdAt:-1})
    req.profile.password = undefined
     res.json({
        user: req.profile,
        links
        })
    }catch(e){
        res.status(400).json({
            error:'No links were found.'
        })
    }
}

const updateUser = async (req,res) => {
    const {name,password,categories} = req.body
    if(password && password.length < 6){
        return res.status(400).json({
            error:'Password must be atleast 6 characters long'
        })
    }
    let newPwd 
    const user = User.findById(req.profile._id)
    if(!password){
        newPwd = user.password
    }else{
        newPwd = await bcrypt.hash(password,8)
    }

    try{
        const updated = await User.findOneAndUpdate({_id:req.profile._id},{name,password:newPwd,categories},{new:true})
        updated.password = undefined
        res.json({
            updated,
            message:'Your Profile has been Updated!'
        })
    }catch(e){
         res.json(400).json({
            error:'User could not be updated.'
        })
    }
}


module.exports = {
    read,
    updateUser
}
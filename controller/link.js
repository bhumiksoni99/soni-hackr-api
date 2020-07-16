const Link = require('../model/link')
const User = require('../model/user')
const Category = require('../model/category')
const AWS = require('aws-sdk')
const slugify = require('slugify')
const {linkPublishedParams} = require('../helper/email')
require('dotenv').config()

//ses config
AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION
})
const ses = new AWS.SES({apiVersion:'2010-12-01'})


const createLink = async(req,res) => {
    const {title,url,categories,type,medium} = req.body
    const slug = slugify(title)
    const postedBy = req.profile._id

    const newLink = new Link({title,url,type,category:categories,medium,slug,postedBy})
    try{
        await newLink.save()
        res.json({message:'Link has been uploaded!'})

        //send mass email
        //find users which are interseted in category which this link has

        User.find({categories:{$in:categories}}).exec((err,users) => {
            if(err){
                throw new Error(err)
                console.log('Error')
            }

            Category.find({_id:{$in:categories}}).exec((err,result) => {
                let foundcategories = result

                for(let i=0;i<users.length;i++){

                    const params = linkPublishedParams(users[i].email,foundcategories,newLink)

                    const sendEmail = ses.sendEmail(params).promise()

                    sendEmail.then(data => {
                       console.log(data)
                       return
                    }).catch(e => {
                        console.log('Failure',e)
                        return
                    })
                }
            })
        })

    }catch(e){
        console.log(e)
        res.status(400).json({
            error:'Link could not be uploaded.'
        })
    }

}

const getLinks = async(req,res) => {

    let limit = req.body.limit?parseInt(req.body.limit):10
    let skip = req.body.skip ?parseInt(req.body.skip):0
    try{
        const data = await Link.find().populate('postedBy','_id name').populate('category','name slug').sort({creatdAt:-1}).limit(limit).skip(skip);
        res.json(data)
        }catch(e){
            res.status(400).json({error:'Links could not load.'})
        }
}

const getOneLink = async(req,res) => {
    const {id} = req.params
    try{
        const data = await Link.findOne({_id:id})
        res.json(data)
        }catch(e){
            res.status(400).json({error:'Links could not load.'})
        }
}

const clickCount  = async (req,res) => {
    const id = req.body.id
    try{
    const links = await Link.findByIdAndUpdate(id,{$inc:{clicks:1}},{new:true})
    res.json(links)
    }catch(e){
        res.status(400).json({
            error:'Could not be updated.'
        })
    }
}

const remove = async (req,res) => {
    const {id} = req.params
    try{
        await Link.findByIdAndDelete(id)
        res.json({
            message:'Link has been deleted.'
        })
    }catch(e){
        res.status(400).json({
            error:'Error deleting the link.'
        })
    }
}

const update = async(req,res) => {
    const {id} = req.params
    const {title,url,type,medium,categories} = req.body

    try{
        await Link.findByIdAndUpdate(id,{title,url,medium,type,category:categories})
        res.json({
            message:'Link has been updated.'
        })
    }catch(e){
        res.status(400).json({
            error:'Link cannot be updated.'
        })
    }
}

const trending = async(req,res) => {
    try{
    const links = await Link.find().populate('postedBy','name').populate('category','name').sort({clicks:-1}).limit(3)
    res.json(links)
    }catch(e){
        res.status(400).json({
            error:'No trending Links.'
        })
    }
}

const popularinCategory = async (req,res) => {
    const {slug} = req.params

    const category = await Category.findOne({slug})
    try{
    const popularLinks = await Link.find({category}).populate('postedBy','name').sort({clicks:-1}).limit(3)
    res.json(popularLinks)
    }catch(e){
        res.status(400).json({
            error:'No trending Links.'
        })
    }

}

module.exports = {
    createLink,
    getLinks,
    clickCount,
    remove,
    update,
    getOneLink,
    trending,
    popularinCategory
}

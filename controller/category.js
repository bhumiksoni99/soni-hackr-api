const Category = require('../model/category')
const Link = require('../model/link')
const slugify = require('slugify')
const formidable = require('formidable')    //for form data
const uuidv4 = require('uuid/v4')       //generate a unique 
const AWS = require('aws-sdk')
require('dotenv').config()
//const fs = require('fs')

//s3 config
const s3 = new AWS.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION
})

// const createCategory = (req,res) => {
//     let form = new formidable.IncomingForm()
//     form.parse(req,async (e,fields,files) => {
//         if(e){
//             return res.status(400).json({
//                 error:'Image could not be uploaded.'
//             })
//         }

//         const {name,content} = fields
//         const {image} = files
//         const postedBy = req.profile._id
//         const slug = slugify(name)

//         const category = await Category.findOne({name})
//             if(category){
//                 return res.status(400).json({
//                     error:'Category with this name already exists.'
//             })
//         }  

//         if(!image){
//             return res.status(400).json({
//                 error:'Image is mandatory.'
//             })
//         }

//         const newCategory = new Category({name,content,slug,postedBy})

//         //upload image to s3,will recieve a url from there and that url is saved to the database
//         const params = {
//             Bucket:'soni-reactnodeaws',
//             Key:`category/${uuidv4()}`,
//             Body:fs.readFileSync(image.path),
//             ACL:'public-read',
//             ContentType:'image/jpg'
//         }

//         s3.upload(params,(e,data) => {
//             if(e){
//                 return res.status(400).json({
//                     error:'Image could not be uploaded.'
//                 })
//             }
        
//             newCategory.image.url = data.Location
//             newCategory.image.key = data.Key
//             try{
//                 newCategory.save()
//                 res.json({
//                     message:`The category '${name}' has been created!`,
//                     newCategory
//                 })
//             }catch(e){
//                 res.status(400).json({
//                     error:'This category already exists.'
//                 })
//             }
//         })
//     })
// }

const createCategory = async (req,res) => {
    const {name,image,content} = req.body

    const category = await Category.findOne({name})
    if(category){
        return res.status(400).json({
                error:'Category with this name already exists.'
            })
        }  

    if(!image){
        return res.status(400).json({
            error:'Image is mandatory.'
        })
    }
    
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/,''),'base64')
    const type = image.split(';')[0].split('/')[1]
    const postedBy = req.profile._id
    const slug = slugify(name)

    const newCategory = new Category({name,content,slug,postedBy})

    //upload image to s3,will recieve a url from there and that url is saved to the database
    const params = {
        Bucket:'soni-reactnodeaws',
        Key:`category/${uuidv4()}.${type}`,
        Body:base64Data,
        ACL:'public-read',
        ContentEncoding:'base64',
        ContentType:`image/${type}`
    }

        s3.upload(params,(e,data) => {
            if(e){
                return res.status(400).json({
                    error:'Image could not be uploaded.'
                })
            }
        
            newCategory.image.url = data.Location
            newCategory.image.key = data.Key
            try{
                newCategory.save()
                res.json({
                    message:`The category '${name}' has been created!`,
                    newCategory
                })
            }catch(e){
                res.status(400).json({
                    error:'This category already exists.'
                })
            }
        })
}


const list = async (req,res) => {
    try{
    const data = await Category.find();
    res.json(data)
    }catch(e){
        res.status(400).json({error:'Categories could not load.'})
    }
}

const read = async(req,res) => {
    const {slug} = req.params;
    let limit = req.body.limit?parseInt(req.body.limit):10
    let skip = req.body.skip ?parseInt(req.body.skip):0
    let links
    try{
    const category = await Category.findOne({slug}).populate('postedBy','_id name username')       //since postedBy contains user we can use populate to get id name and username of the user
    try{
    links = await Link.find({category}).populate('postedBy','_id name username').populate('category','name')
                                                            .sort({createdAt:-1})
                                                            .limit(limit)           //no of links fetched initially
                                                            .skip(skip)
    }catch(e){
        console.log(e)
        res.status(400).json({error:'Links could not load.'})
    }
                                                            
    res.json({
        category,
        links
    })
}catch(e){
    res.status(400).json({
        error:'This category already exists.'
    })
}}


    const updateCategory = async (req,res) => {
        const {slug} = req.params
        const {name,image,content} = req.body

        try{
           const updated =  await Category.findOneAndUpdate({slug},{name,content},{new:true})
           if(image){
               //remove the existing image before updating new one
        const deleteParams = {
            Bucket:'soni-reactnodeaws',
            Key:`${updated.image.key}`
        }
        //delete existing from s3 bucket
        s3.deleteObject(deleteParams,(err,data) => {
            if(err){
                console.log('Delete Error',err)
            }
            console.log(data)  
        })

        const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/,''),'base64')
        const type = image.split(';')[0].split('/')[1]

        const params = {
            Bucket:'soni-reactnodeaws',
            Key:`category/${uuidv4()}.${type}`,
            Body:base64Data,
            ACL:'public-read',
            ContentEncoding:'base64',
            ContentType:`image/${type}`
        }

        s3.upload(params,(e,data) => {
            if(e){
                return res.status(400).json({
                    error:'Image could not be uploaded.'
                })
            }
        
            updated.image.url = data.Location
            updated.image.key = data.Key
        })
           }
            try{
                updated.save()
                res.json({
                    message:`The category '${name}' has been updated!`,
                    updated
                })
            }catch(e){
                return res.status(400).json({
                    error:'This category already exists.'
                })
            }
        }catch(e){
            res.status(400).json({error:'Could not find Category to Update.'})
        }
    }

    const remove = async (req,res) => {
        const {slug} = req.params
        try{
            const deleted = await Category.findOneAndDelete({slug})

            const deleteParams = {
                Bucket:'soni-reactnodeaws',
                Key:`${deleted.image.key}`
            }

            //delete existing from s3 bucket
            s3.deleteObject(deleteParams,(err,data) => {
                if(err){
                    console.log('Delete Error',err)
                }
                console.log(data)  
            })

            res.json({
                message:'The category has been deleted.'
            })
        }catch(e){
            console.log(e)
            res.status(400).json({
                error:'Category could not be deleted.'
            })
        }
    }

    const getCategory = async (req,res) => {
        const {slug} = req.params

        try{
            const category = await Category.findOne({slug})
            res.json(category)
        }catch(e){
            res.status(400).json({
                error:'Category could not be loaded.'
            })
        }
    }

module.exports = {
    updateCategory,
    createCategory,
    list,
    read,
    remove,
    getCategory
}
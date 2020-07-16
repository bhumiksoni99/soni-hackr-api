const express = require('express')
const router = express.Router()

const {createCategory,list,read,updateCategory,remove,getCategory} = require('../controller/category')
const {createCategoryValidator,updateCategoryValidator} = require('../validators/category')
const {requireSignIn,authMiddleware,adminMiddleware} = require('../controller/auth')
const {setupValidation} = require('../validators/index')

router.post('/api/category',createCategoryValidator,setupValidation,requireSignIn,adminMiddleware,createCategory)
router.get('/api/categories',list)
router.post('/api/category/:slug',read)         //this fetches assosictaed links as well
router.get('/api/one/category/:slug',getCategory)           //this only fectches the category info
router.put('/api/category/:slug',updateCategoryValidator,setupValidation,requireSignIn,adminMiddleware,updateCategory)
router.delete('/api/category/:slug',requireSignIn,adminMiddleware,remove)


module.exports = router
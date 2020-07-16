const express = require('express')
const router = express.Router()

const {createLink,getLinks,clickCount,remove,update,getOneLink,trending,popularinCategory} = require('../controller/link')
const {LinkCreateValidator,UpdateLinkValidator} = require('../validators/link')
const {requireSignIn,authMiddleware,adminMiddleware,canUpdateAndDelete} = require('../controller/auth')
const {setupValidation} = require('../validators/index')

router.post('/api/link',LinkCreateValidator,setupValidation,requireSignIn,authMiddleware,createLink)
router.post('/api/links',getLinks)
router.delete('/api/link/:id',requireSignIn,authMiddleware,canUpdateAndDelete,remove)
router.delete('/api/admin/link/:id',requireSignIn,adminMiddleware,remove)
router.put('/api/link/:id',UpdateLinkValidator,setupValidation,requireSignIn,authMiddleware,canUpdateAndDelete,update)
router.put('/api/admin/link/:id',UpdateLinkValidator,setupValidation,requireSignIn,adminMiddleware,update)
router.get('/api/link/one/:id',getOneLink)
router.get('/api/link/trending',trending)
router.get('/api/link/trending/:slug',popularinCategory)
router.put('/api/click-count',clickCount)

module.exports = router
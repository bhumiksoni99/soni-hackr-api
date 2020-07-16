const express = require('express')
const router = express.Router()

const {requireSignIn,authMiddleware,adminMiddleware} = require('../controller/auth')
const {userUpdateValidator} = require('../validators/auth')
const {setupValidation} = require('../validators/index')
const {read,updateUser} = require('../controller/user')

router.get('/api/user',requireSignIn,authMiddleware,read)
router.get('/api/admin',requireSignIn,adminMiddleware,read)
router.put('/api/user/update',userUpdateValidator,setupValidation,requireSignIn,authMiddleware,updateUser)


module.exports = router